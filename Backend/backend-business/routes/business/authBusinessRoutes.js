const express = require('express');
const passport = require('passport');
const router = express.Router();

const authBusinessController = require('../../controllers/authBusinessController');


router.post('/auth/register', authBusinessController.register);


router.post('/auth/login', authBusinessController.login);


router.get('/auth/google',
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        session: false 
    })
);

router.get('/auth/google/callback',
    passport.authenticate('google', { 
        session: false,
        failureRedirect: '/dishdash/auth/failure'
    }),
    authBusinessController.googleCallback
);

router.get('/auth/failure', authBusinessController.authFailure);

router.get('/auth/verify', authBusinessController.verifyToken);

module.exports = router;
