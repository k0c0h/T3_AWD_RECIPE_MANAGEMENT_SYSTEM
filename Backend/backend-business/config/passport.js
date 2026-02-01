const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.NODE_ENV === 'production' 
                ? 'https://recipemanagementbusiness.onrender.com/dishdash/auth/google/callback'
                : 'http://localhost:3007/dishdash/auth/google/callback'
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    
                    user.lastLogin = new Date();
                    await user.save();
                    return done(null, user);
                }

                
                user = await User.create({
                    googleId: profile.id,
                    email: profile.emails[0].value,
                    name: profile.displayName,
                    picture: profile.photos[0]?.value,
                    role: 'client',
                    isActive: true,
                    lastLogin: new Date()
                });

                done(null, user);
            } catch (error) {
                done(error, null);
            }
        }
    )
);

// Estrategia para vinculación de Google Calendar (solo tokens, no crea/loguea usuarios)
passport.use('google-calendar-link',
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.NODE_ENV === 'production'
                ? 'https://recipemanagementbusiness.onrender.com/dishdash/auth/google-calendar/callback'
                : 'http://localhost:3007/dishdash/auth/google-calendar/callback',
            passReqToCallback: true
        },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                // Solo retornamos los tokens y el perfil, NO creamos/actualizamos usuario aquí
                const calendarData = {
                    accessToken,
                    refreshToken,
                    email: profile.emails[0].value,
                    tokenExpiry: new Date(Date.now() + 3600 * 1000), // 1 hora
                    scope: req.query.scope || ''
                };
                
                done(null, calendarData);
            } catch (error) {
                done(error, null);
            }
        }
    )
);

module.exports = passport;
