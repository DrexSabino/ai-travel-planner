
const {getDatabase} = require('./connection');

function getUsersCollection() {
    return getDatabase().collection('users');

}

async function findUserByEmail(email) {
    return getUsersCollection().findOne({ email: email.toLowerCase() });
}

async function findUserById(userId) {
  const { ObjectId } = require('mongodb');

  return getUsersCollection().findOne({
    _id: new ObjectId(userId)
  });
}


async function createUser(userData) {
  const user = {
    username: userData.username,
    email: userData.email.toLowerCase(),
    salt: userData.salt,
    passwordHash: userData.passwordHash,
    createdAt: new Date()
  };

    const result = await getUsersCollection().insertOne(user);

    return {
        username: user.username,
        email: user.email,
        passwordHash: user.passwordHash,
        salt: user.salt,
        _id: result.insertedId
    }
}
module.exports = {
    findUserByEmail,
    createUser,
    findUserById
};



