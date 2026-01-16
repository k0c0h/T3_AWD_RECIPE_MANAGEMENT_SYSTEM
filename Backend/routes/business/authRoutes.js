const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Ruta para iniciar el login con Google
router.get('/auth/google',
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        session: false 
    })
);

// Ruta de callback después del login con Google
router.get('/auth/google/callback',
    passport.authenticate('google', { 
        session: false,
        failureRedirect: '/dishdash/auth/failure'
    }),
    (req, res) => {
        // Generar JWT token
        const token = jwt.sign(
            { 
                id: req.user._id,
                email: req.user.email,
                name: req.user.name
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Enviar el token como respuesta JSON
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

// Ruta de fallo de autenticación
router.get('/auth/failure', (req, res) => {
    res.status(401).json({
        success: false,
        message: 'Authentication failed'
    });
});

// Ruta para verificar el token (opcional, para testing)
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