const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const axios = require('axios');
const passport = require('passport');

exports.register = async (req, res) => {
    try {
        const { email, password, name } = req.body;

      
        if (!email || !password || !name) {
            return res.status(400).json({ 
                message: 'Email, password, and name are required' 
            });
        }

   
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                message: 'User with this email already exists' 
            });
        }

      
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

      
        const user = await User.create({
            email,
            password: hashedPassword,
            name,
            role: 'client'
        });

 
        const token = jwt.sign(
            { 
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token: token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error registering user', 
            error: error.message 
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

     
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Email and password are required' 
            });
        }


        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                message: 'Invalid email or password' 
            });
        }

      
        if (!user.password) {
            return res.status(401).json({ 
                message: 'This account uses Google login. Please sign in with Google.' 
            });
        }

 
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                message: 'Invalid email or password' 
            });
        }

    
        user.lastLogin = new Date();
        await user.save();

 
        const token = jwt.sign(
            { 
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                picture: user.picture
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error logging in', 
            error: error.message 
        });
    }
};

exports.googleCallback = (req, res) => {
    try {
 
        const token = jwt.sign(
            { 
                id: req.user._id,
                email: req.user.email,
                name: req.user.name,
                role: req.user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

   
        const frontendURL = process.env.NODE_ENV === 'production' 
            ? (process.env.FRONTEND_URL_PROD || 'https://dishdashfrontend.onrender.com')
            : (process.env.FRONTEND_URL || 'http://localhost:5173');
        
    
        const userData = encodeURIComponent(JSON.stringify({
            _id: req.user._id.toString(),
            id: req.user._id.toString(),
            email: req.user.email,
            name: req.user.name,
            role: req.user.role,
            picture: req.user.picture
        }));

        const redirectURL = `${frontendURL}/auth/callback?token=${token}&user=${userData}`;
        
        console.log(' Google OAuth Success - Redirecting to:', redirectURL);
        
        res.redirect(redirectURL);
    } catch (error) {
        console.error(' Error en Google callback:', error);
        
        const frontendURL = process.env.NODE_ENV === 'production' 
            ? (process.env.FRONTEND_URL_PROD || 'https://dishdashfrontend.onrender.com')
            : (process.env.FRONTEND_URL || 'http://localhost:5173');
        
        res.redirect(`${frontendURL}/login?error=${encodeURIComponent(error.message)}`);
    }
};

exports.authFailure = (req, res) => {
    res.status(401).json({
        success: false,
        message: 'Authentication failed'
    });
};

exports.verifyToken = (req, res) => {
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
};

// ============================================
// GOOGLE CALENDAR LINKING
// ============================================

// Iniciar vinculación de Google Calendar
exports.initiateGoogleCalendarLink = (req, res, next) => {
    // El userId viene del JWT (req.user.id)
    const userId = req.user.id;
    
    // Iniciamos OAuth con la estrategia de calendar
    passport.authenticate('google-calendar-link', {
        scope: [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events',
            'profile',
            'email'
        ],
        accessType: 'offline',
        prompt: 'consent',
        state: userId, // Pasamos el userId en state para recuperarlo después
        session: false
    })(req, res, next);
};

// Callback de Google Calendar
exports.googleCalendarCallback = async (req, res) => {
    try {
        const userId = req.query.state; // Recuperamos el userId del state
        
        if (!userId) {
            throw new Error('User ID not found in state');
        }

        // Autenticamos para obtener los tokens
        passport.authenticate('google-calendar-link', { session: false }, async (err, calendarData) => {
            if (err || !calendarData) {
                console.error('❌ Error en Google Calendar callback:', err);
                const frontendURL = process.env.NODE_ENV === 'production'
                    ? (process.env.FRONTEND_URL_PROD || 'https://dishdashfrontend.onrender.com')
                    : (process.env.FRONTEND_URL || 'http://localhost:5173');
                
                return res.redirect(`${frontendURL}/calendar?google=error&message=${encodeURIComponent(err?.message || 'Authentication failed')}`);
            }

            try {
                // Actualizar usuario en la BD del backend-business
                const user = await User.findById(userId);
                
                if (!user) {
                    throw new Error('User not found');
                }

                if (user.role !== 'chef') {
                    throw new Error('Only chefs can link Google Calendar');
                }

                // Actualizar datos de Google Calendar
                user.googleCalendar = {
                    isLinked: true,
                    accessToken: calendarData.accessToken,
                    refreshToken: calendarData.refreshToken,
                    tokenExpiry: calendarData.tokenExpiry,
                    email: calendarData.email,
                    scope: calendarData.scope
                };

                await user.save();

                console.log('✅ Google Calendar vinculado exitosamente para:', user.email);

                // Redirigir al frontend con éxito
                const frontendURL = process.env.NODE_ENV === 'production'
                    ? (process.env.FRONTEND_URL_PROD || 'https://dishdashfrontend.onrender.com')
                    : (process.env.FRONTEND_URL || 'http://localhost:5173');
                
                res.redirect(`${frontendURL}/calendar?google=linked`);
            } catch (updateError) {
                console.error('❌ Error actualizando usuario:', updateError);
                const frontendURL = process.env.NODE_ENV === 'production'
                    ? (process.env.FRONTEND_URL_PROD || 'https://dishdashfrontend.onrender.com')
                    : (process.env.FRONTEND_URL || 'http://localhost:5173');
                
                res.redirect(`${frontendURL}/calendar?google=error&message=${encodeURIComponent(updateError.message)}`);
            }
        })(req, res);
    } catch (error) {
        console.error('❌ Error en Google Calendar callback:', error);
        const frontendURL = process.env.NODE_ENV === 'production'
            ? (process.env.FRONTEND_URL_PROD || 'https://dishdashfrontend.onrender.com')
            : (process.env.FRONTEND_URL || 'http://localhost:5173');
        
        res.redirect(`${frontendURL}/calendar?google=error&message=${encodeURIComponent(error.message)}`);
    }
};

// Verificar estado de vinculación
exports.checkGoogleCalendarStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            isLinked: user.googleCalendar?.isLinked || false,
            email: user.googleCalendar?.email || null,
            hasValidToken: user.googleCalendar?.tokenExpiry ? new Date(user.googleCalendar.tokenExpiry) > new Date() : false
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error checking calendar status', 
            error: error.message 
        });
    }
};

// Desvincular Google Calendar
exports.unlinkGoogleCalendar = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Limpiar datos de Google Calendar
        user.googleCalendar = {
            isLinked: false,
            accessToken: null,
            refreshToken: null,
            tokenExpiry: null,
            email: null,
            scope: null
        };

        await user.save();

        res.json({
            success: true,
            message: 'Google Calendar unlinked successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error unlinking calendar', 
            error: error.message 
        });
    }
};

// Refrescar token de Google (método interno para usar en otras funciones)
exports.refreshGoogleToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user || !user.googleCalendar?.refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await axios.post('https://oauth2.googleapis.com/token', {
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            refresh_token: user.googleCalendar.refreshToken,
            grant_type: 'refresh_token'
        });

        // Actualizar access token
        user.googleCalendar.accessToken = response.data.access_token;
        user.googleCalendar.tokenExpiry = new Date(Date.now() + response.data.expires_in * 1000);

        await user.save();

        return response.data.access_token;
    } catch (error) {
        console.error('❌ Error refreshing Google token:', error);
        throw error;
    }
};
