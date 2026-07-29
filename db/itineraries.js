const { ObjectId } = require('mongodb');
const { getDatabase } = require('./connection');

function getItinerariesCollection() {
  return getDatabase().collection('itineraries');
}

async function saveItinerary(userId, itinerary) {
  const savedItinerary = {
    userId: new ObjectId(userId),
    tripName: itinerary.tripName,
    destination: itinerary.destination,
    durationDays: itinerary.durationDays,
    days: itinerary.days,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await getItinerariesCollection().insertOne(savedItinerary);

  return {
    userId: savedItinerary.userId,
    tripName: savedItinerary.tripName,
    destination: savedItinerary.destination,
    durationDays: savedItinerary.durationDays,
    days: savedItinerary.days,
    createdAt: savedItinerary.createdAt,
    updatedAt: savedItinerary.updatedAt,
    _id: result.insertedId
  };
}


async function findItinerariesByUser(userId) {
  const collection = getItinerariesCollection();

  const trips = await collection
    .find({ userId: new ObjectId(userId) })
    .toArray();

  return trips;
}

async function findItineraryById(itineraryId, userId) {
  return getItinerariesCollection().findOne({
    _id: new ObjectId(itineraryId),
    userId: new ObjectId(userId)
  });
}

async function deleteItinerary(itineraryId, userId) {
  return getItinerariesCollection().deleteOne({
    _id: new ObjectId(itineraryId),
    userId: new ObjectId(userId)
  });
}

module.exports = {
  saveItinerary,
  findItinerariesByUser,
  findItineraryById,
  deleteItinerary
};