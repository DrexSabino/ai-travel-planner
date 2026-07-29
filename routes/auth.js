const express = require('express');
const crypto = require('crypto');
const { findUserByEmail, createUser } = require('../db/users');
const router = express.Router();

/* 
    Converts a password into a passowrd hash.
    password: the password entered by the user
    salt: the users randomly generated salt
    callback: the function that runs after hashing finishes

*/

function hashPassword(password, salt, callback) {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) throw err;

        const passordHash = derivedKey.toString('hex');
        
        callback(null, passordHash);


    });
}

router.get('/signup', function(req, res) {
    res.render('signup', {
        title: 'Create Account',
        errorMessage: null
    });
});

router.post('/signup', async function(req, res, next) {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    //here we check if all fields are filled
    if(!username || !email || !password) {
        return res.render('signup', {
            title: 'Create Account',
            errorMessage: 'All fields are required.'
        });
    }

    //we check if a user with the same email already exists
    const existingUser = await findUserByEmail(email);
    //if a user with the same email already exists, we return an error message and prompt the user to make an account
    if(existingUser) {
        return res.render('signup', {
            title: 'Create Account',
            errorMessage: 'A user with that email already exists.'
        });
    }

    //here we create a different random salt for the user
    const salt = crypto.randomBytes(64).toString('hex');

    //we hash the password with the salt and store it in the users
    hashPassword(password, salt, async function(error, hashedPassword) {
        if (error) {
            return next(error);
        }

        try {
            const newUser = {
            username: username,
            email: email.toLowerCase(),
            salt: salt,
            passwordHash: hashedPassword
            };

            await createUser(newUser);

            res.redirect('/login');
        } catch (error) {
            next(error);
        }
    });
});

router.get('/login', function(req, res) {
    res.render('login', {
        title: 'Login',
        errorMessage: null
    });
});

router.post('/login', async function(req, res, next) {
    const email = String(req.body.email || '');
    const password = req.body.password;
    const user = await findUserByEmail(email);


    //if the user does not exist, we return an error message
    if(!user) {
        return res.render('login', {
            title: 'Login',
            errorMessage: 'Incorrect email or password.'
        });
    }


    //we hash the entered password with the users salt and compare it to the stored password hash
    
    hashPassword(password, user.salt, function(error, enteredPasswordHash) {
        if(error) {
            return next(error);
        }

        //if the hashes do not match, we return an error message
        if(enteredPasswordHash !== user.passwordHash) {
            return res.render('login', {
                title: 'Login',
                errorMessage: 'Incorrect email or password.'
            });
        }

        //log the user in after the password matches
        req.session.user = {
            id: user._id.toString(),
            username: user.username,
            email: user.email
        };

        console.log(`${user.username} logged in successfully.`);

        const returnTo = req.session.returnTo || '/profile';
        res.redirect(returnTo);;
    });
});

router.get('/profile', function(req, res) {
    res.render('profile', {
        title: 'Profile',
        user: req.session.user || null,
        savedTrips: []
    });
});

router.post('/logout', function(req, res, next) {
  req.session.destroy(function(error) {
    if (error) {
      return next(error);
    }

    res.redirect('/login');
  });
});

module.exports = router;