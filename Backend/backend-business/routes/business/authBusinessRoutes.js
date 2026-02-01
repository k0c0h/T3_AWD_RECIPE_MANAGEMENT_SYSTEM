const express = require('express');
const passport = require('passport');
const router = express.Router();

const authBusinessController = require('../../controllers/authBusinessController');
const authenticateToken = require('../../middleware/auth');
const authorizeRoles = require('../../middleware/authorizeRoles');


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

// ============================================
// GOOGLE CALENDAR LINKING ROUTES
// ============================================

// Iniciar vinculación de Google Calendar (requiere JWT y rol chef)
// Acepta token por header o query parameter: ?token=xxx
router.get('/auth/google-calendar/link',
    authenticateToken,
    authorizeRoles('chef'),
    authBusinessController.initiateGoogleCalendarLink
);

// Callback de Google Calendar
router.get('/auth/google-calendar/callback',
    authBusinessController.googleCalendarCallback
);

// Verificar estado de vinculación
router.get('/auth/google-calendar/status',
    authenticateToken,
    authorizeRoles('chef'),
    authBusinessController.checkGoogleCalendarStatus
);

// Desvincular Google Calendar
router.delete('/auth/google-calendar/unlink',
    authenticateToken,
    authorizeRoles('chef'),
    authBusinessController.unlinkGoogleCalendar
);

module.exports = router;
