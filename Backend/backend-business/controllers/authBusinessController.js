const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

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
