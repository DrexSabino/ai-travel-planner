var express = require('express');
var router = express.Router();
var axios = require('axios'); 
const { saveItinerary, findItinerariesByUser, findItineraryById, deleteItinerary } = require('../db/itineraries');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { 
    title: 'Home' 
  });
});

router.get('/plan-trip', function(req, res) {
  res.render('plan-trip', { 
    title: 'Plan a Trip',
    itinerary: req.session.generatedItinerary || null,
    errorMessage: null,
    formData: null
  });
}); 

router.post('/plan-trip', async function(req, res) {
  const { destination, duration, interests } = req.body;

  if(!destination || !duration || !interests) {
    return res.status(400).render('plan-trip', {
      title: 'Plan a Trip',
      itinerary: null,
      errorMessage: 'Please fill in all fields.',
      formData: {
        destination: destination,
        duration: duration,
        interests: interests
      }
    });
  }

  const baseURL = 'https://generativelanguage.googleapis.com';
  const endpoint = '/v1beta/models/gemini-flash-latest:generateContent';

  const prompt = `
    Create a detailed ${duration}-day travel itinerary for ${destination}.
    
    The traveler is interested in: ${interests}.
    
    Organize the itinerary day by day.
    Do not create a timed schedule and do not include timestamps.

    For each day, provide two separate sections:

    1. foodPlaces:
      - Exactly one breakfast recommendation.
      - Exactly one lunch recommendation.
      - Exactly one dinner recommendation.
      - One optional bakery, dessert shop, café, or other local sweet treat.
      - Do not recommend the same food business more than once during the trip unless the trip destination is a 
        small town with limited options.

    2. placesToVisit:
      - Recommend realistic attractions or activities for that day.
      - Group places that are reasonably close together.
      - Do not include restaurants in placesToVisit.
      - Do not include timestamps or suggested visit times.

    Every day must have different breakfast, lunch, and dinner businesses.
    Prefer local businesses over large national chains. f the user asks for parks, add theme parks as well as 
    traditional parks. to cater to the traveler's interests. If the user asks for museums, include art museums, 
    history museums, and science museums. If the user asks for nightlife, include bars, clubs, and live music venues. 
    If the user asks for shopping, include local markets, boutiques, and shopping districts. Feel free to add things 
    that the user may not have thought of that would be of interest to them. If the user asks for beaches, include both 
    popular and hidden beaches. If the user asks for hiking, include both easy and challenging trails. If the user asks 
    for cultural experiences, include local festivals, performances, and workshops. If the user asks for outdoor activities, 
    include kayaking, paddleboarding, and zip-lining. If the user asks for historical sites, include landmarks, monuments, 
    and heritage sites. If the user asks for family-friendly activities, include zoos, aquariums, and amusement parks. If 
    the user asks for romantic activities, include scenic viewpoints, sunset cruises, and couples' spa treatments. If the 
    user asks for adventure activities, include rock climbing, bungee jumping, and paragliding.
    
    Keep the itinerary concise and easy to read. Ensure it is realistic and do not over overload the traveler 
    with too many activities in a single day. Include a mix of activities that cater to the traveler's interests. 
    Avoid suggesting activities that are too far apart geographically to minimize travel time.

    Do not include Markdown, code fences, commentary, or text outside the JSON.

    Ensure to only return valid JSON using exactly the following structure:

    {
      "tripName": "string",
      "destination": "string",
      "durationDays": 3,
      "days": [
        {
          "day": 1,
          "theme": "string",
          "foodPlaces": [
            {
              "mealType": "Breakfast",
              "locationName": "string",
              "address": "string",
              "description": "string",
              "searchQuery": "string"
            },
            {
              "mealType": "Lunch",
              "locationName": "string",
              "address": "string",
              "description": "string",
              "searchQuery": "string"
            },
            {
              "mealType": "Dinner",
              "locationName": "string",
              "address": "string",
              "description": "string",
              "searchQuery": "string"
            },
            {
              "mealType": "Sweet Treat",
              "locationName": "string",
              "address": "string",
              "description": "string",
              "searchQuery": "string"
            }
          ],
          "placesToVisit": [
            {
              "locationName": "string",
              "address": "string",
              "description": "string",
              "searchQuery": "string"
            }
          ]
        }
      ]
    }
  }`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: 'application/json',
    }
  };

  // Set the headers for the request, including the API key from the environment variables
  const config = {
    headers: {
      'content-type': 'application/json',
      'X-goog-api-key': process.env.GEMINI_API_KEY
    }
  };

  // Send the request to the Gemini API
  try {
    const response = await axios.post(baseURL + endpoint, requestBody, config);

    const itineraryText = response.data.candidates[0].content.parts[0].text;

    // Parse the generated itinerary text into a JavaScript object
    const itinerary = JSON.parse(itineraryText);
    req.session.generatedItinerary = itinerary;

    // Render the plan-trip page with the generated itinerary
    res.render('plan-trip', {
      title: 'Plan a Trip',
      itinerary: itinerary,
      errorMessage: null,
      formData: {
        destination: destination,
        duration: duration,
        interests: interests
      }
    });

    //handle any errors that occur during the request to the Gemini API
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    res.status(500).render('plan-trip', {
      title: 'Plan a Trip',
      itinerary: null,
      errorMessage: 'An error occurred while generating the itinerary. Please try again.',
      formData: {
        destination: destination,
        duration: duration,
        interests: interests
      }
    });
  }

});

router.get('/saved-trips', async function(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  try {
    const userId = req.session.user.id;
    const savedTrips = await findItinerariesByUser(userId);

    res.render('saved-trips', {
      title: 'Saved Trips',
      savedTrips: savedTrips
    });
  } catch (error) {
    next(error);
  }
});

//here we handle the saving of a generated itinerary to the database for the logged-in user
router.post('/save-trip', async function(req, res, next) {
  if (!req.session.user) {
    req.session.returnTo = '/plan-trip';
    return res.redirect('/login');
  }

  if (!req.session.generatedItinerary) {
    return res.redirect('/plan-trip');
  }

  //here we save the generated itinerary to the database for the logged-in user
  try {
    const userId = req.session.user.id;
    const itinerary = req.session.generatedItinerary;

    await saveItinerary(userId, itinerary);

    req.session.generatedItinerary = null;

    res.redirect('/saved-trips');
  } catch (error) {
    next(error);
  }
});

//here we handle the viewing of a saved itinerary for the logged-in user
router.get('/saved-trips/:tripId', async function(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  try {
    const tripId = req.params.tripId;
    const userId = req.session.user.id;

    const itinerary = await findItineraryById(tripId, userId);

    if (!itinerary) {
      return res.status(404).send('Trip not found.');
    }

    res.render('saved-trip-details', {
      title: itinerary.tripName,
      itinerary: itinerary
    });
  } catch (error) {
    next(error);
  }
});

router.post('/saved-trips/:tripId/delete', async function(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  try {
    const tripId = req.params.tripId;
    const userId = req.session.user.id;

    const result = await deleteItinerary(tripId, userId);

    if (result.deletedCount === 0) {
      return res.status(404).send('Trip not found.');
    }

    res.redirect('/saved-trips');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
