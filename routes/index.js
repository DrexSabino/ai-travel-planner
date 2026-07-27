var express = require('express');
var router = express.Router();
var axios = require('axios');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { 
    title: 'Home' 
  });
});

router.get('/plan-trip', function(req, res) {
  res.render('plan-trip', { 
    title: 'Plan a Trip',
    itinerary: null,
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
    
    For each activity you suggest include the following:
    - A Suggested time
    - The location name and address
    - A brief description of it
    - A Google Maps Seach query for the location
    
    Keep the itinerary concise and easy to read. Ensure it is realistic and do not over overload the traveler 
    with too many activities in a single day. Include a mix of activities that cater to the traveler's interests. 
    Make sure to include a variety of activities, such as sightseeing, dining, and cultural experiences. Avoid suggesting 
    activities that are too far apart geographically to minimize travel time.

    Do not include Markdown, code fences, commentary, or text outside the JSON.

    Ensure to only return valid JSON using exactly the following structure:

    {
      "tripName": "string",
      "destination": "string",
      "durationDays": number,
      "days": [
        {
          "day": number,
          "theme": "string",
          "activities": [
            {
              "time": "string",
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
    ]
  };

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

router.get('/saved-trips', function(req, res) {
  res.render('saved-trips', { 
    title: 'Saved Trips' 
  });
});


module.exports = router;
