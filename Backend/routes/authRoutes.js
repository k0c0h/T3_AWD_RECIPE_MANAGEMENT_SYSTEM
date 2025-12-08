const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();


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
    (req, res) => {

        const token = jwt.sign(
            { 
                id: req.user._id,
                email: req.user.email,
                name: req.user.name
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );


        res.json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                id: req.user._id,
                email: req.user.email,
                name: req.user.name,
                picture: req.user.picture
            }
        });
    }
);


router.get('/auth/failure', (req, res) => {
    res.status(401).json({
        success: false,
        message: 'Authentication failed'
    });
});


router.get('/auth/verify', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ 
            valid: true,
            user: decoded
        });
    } catch (error) {
        res.status(401).json({ 
            valid: false,
            message: 'Invalid token'
        });
    }
});

module.exports = router;
