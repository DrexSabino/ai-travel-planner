# TripBudd - AI Travel Planner

## External Resources Used

1. Google Gemini API:
https://ai.google.dev/

2. MongoDB Atlas:
https://www.mongodb.com/atlas

3. Express:
https://expressjs.com/

4. EJS:
https://ejs.co/

5. Google Fonts:
https://fonts.google.com/

6. Axios:
https://axios-http.com/

7. Codex for questions, explanations, and help fixing issues:
https://chatgpt.com/codex/

***

## How to Run the Project & Professor's Test Account 

Test account: 

Username: csci355
Email: csci355@gmail.com
Password: password1234

Running the project:

1. Clone or download the repository
2. Open the terminal inside the project folder
3. install the required packages: npm install
4. Create a .env file and add the required environment variables
5. Start the development server using the following as a developer-friendly way to start the server:
     rpm run dev
6. Open the app in the browser: http://localhost:3000

***
## Project Overview

TripBudd is a full-stack AI travel-planning web application. The purpose of the application is to help users create personalized travel itineraries based on their destination, trip duration, and interests.

The user enters information about their upcoming trip, and the application sends that information to Google's Gemini API. Gemini generates a day-by-day itinerary containing food recommendations and places the user can visit.

The generated itinerary separates food recommendations from attractions. Each day contains breakfast, lunch, dinner, and a possible sweet treat recommendation. The second section contains attractions and activities based on the user's interests.

Users can create an account, log in, generate itineraries, save itineraries to their account, view their saved trips, and delete trips they no longer need.

***

## Target Audience

The target audience for TripBudd is anyone who wants some assistance planning a trip.

The application could be helpful for those traveling who are unfamiliar with their destination or do not want to spend a large amount of time searching for restaurants and attractions individually.

***

## Features

1. User signup
2. User login and logout
3. Password hashing with a randomly generated salt
4. User sessions
5. AI-generated travel itineraries
6. Separate food and attraction recommendations
7. Breakfast, lunch, dinner, and sweet treat recommendations
8. Google Maps search links for recommended locations
9. Save generated itineraries
10. View a list of saved itineraries
11. View the complete details of a saved itinerary
12. Delete saved itineraries
13. MongoDB data persistence
14. Responsive design for smaller screens
15. Form validation and error messages

***

## Technical Overview

TripBudd was created using:

- Node.js for the server environment
- Express for routing and server functionality
- EJS for dynamic HTML templates
- CSS for the design and responsive layout
- MongoDB Atlas for user and itinerary storage
- Express Session for user login sessions
- Node's Crypto module for password hashing
- Axios for sending requests to Gemini
- Google Gemini API for itinerary generation

The frontend sends form data to the Express server. The server creates a prompt using the submitted information and sends it to Gemini.

Gemini returns the itinerary as JSON. The server parses the JSON into a JavaScript object and sends it to the EJS template for display.

***

## Gemini API

The application uses Google's Gemini API to generate the travel itinerary.

The prompt asks Gemini to return valid JSON containing:

- Trip name
- Destination
- Duration
- Individual trip days
- Food recommendations
- Places to visit
- Addresses
- Descriptions
- Google Maps search queries

Requesting JSON makes it easier for the server to parse the response and display each part of the itinerary in the correct section.

The Gemini API key is stored in an environment variable and is not included in the GitHub repository.

***

## Database

The application uses MongoDB Atlas and contains two main collections:

1. users
2. itineraries

## Database Schema

User Collection:

{
  _id: ObjectId,
  username: String,
  email: String,
  salt: String,
  passwordHash: String,
  createdAt: Date
}

Itineraries Collection:

{
  _id: ObjectId,
  userId: ObjectId,
  tripName: String,
  destination: String,
  durationDays: Number,
  days: Array,
  createdAt: Date,
  updatedAt: Date
}

***

## Future Plans

Due to time constraints and outside responsibilities, additional features were not able to be made. 
For the future:

1. A checklist that allows visitors to mark visited locations
2. Local event recommendations
3. More detailed profile information
4. Ability to upload picures for the locations visited and create a collage