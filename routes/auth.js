const express = require('express');
const crypto = require('crypto');
const router = express.Router();

//we will use a temporary array to store users for now
//all users disappear when the server restarts
let users = [];

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

router.post('/signup', function(req, res, next) {
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

    //normalize the email to lowercase to make comparizon easier
    const normalizedEmail = email.trim().toLowerCase();
    //we check if a user with the same email already exists
    const existingUser = users.find(user => user.email === normalizedEmail);
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
    hashPassword(password, salt, function(error, hashedPassword) {
        if(error) {
            return next(error);
        }

        //we create a new user object and store it in the users array
        const newUser = {
            id: crypto.randomUUID(),
            username: username,
            email: normalizedEmail,
            salt: salt,
            passwordHash: hashedPassword
        };

        users.push(newUser);

        console.log('New user created:', newUser);
        //we redirect the user to the login page after successful signup
        res.redirect('/login');
    });

});

router.get('/login', function(req, res) {
    res.render('login', {
        title: 'Login',
        errorMessage: null
    });
});

router.post('/login', function(req, res, next) {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = req.body.password;

    //find the user with the submitter email
    const user = users.find(function(currentUser) {
        return currentUser.email === email;
    });

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

        console.log(`${user.username} logged in successfully.`);

        res.send(`
            <h1>Welcome, ${user.username}!</h1>
            <p>You have successfully logged in.</p>
            <a href="/">return to Home</a> 
            `);
    });
});

module.exports = router;