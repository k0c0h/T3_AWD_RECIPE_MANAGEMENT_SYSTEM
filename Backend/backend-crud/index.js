require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3008;
const path = require('path');

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://mrsproudd:mrsproudd@cluster0.ad7fs0q.mongodb.net/recipemanagementsystem?appName=Cluster0');
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('BACKEND CRUD - Connected to Database'));

app.use(cors({
    origin: ['http://localhost:5173', 'https://dishdashfrontend.onrender.com'],
    credentials: true
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());

const passport = require('./config/passport');
app.use(passport.initialize());

const authenticateToken = require('./middleware/auth');
const authorizeRoles = require('./middleware/authorizeRoles');

// ============================================
// CRUD ROUTES 
// ============================================

const userCrudRoutes = require('./routes/crud/userCrudRoutes');
app.use('/dishdash', authenticateToken, authorizeRoles('chef'), userCrudRoutes);

const ingredientRoutes = require('./routes/crud/ingredientCrudRoutes');
app.use('/dishdash', authenticateToken, authorizeRoles('chef'), ingredientRoutes);

const unitsRoutes = require('./routes/crud/unitsCrudRoutes');
app.use('/dishdash', authenticateToken, authorizeRoles('chef'), unitsRoutes);

const conversionCrudRoutes = require('./routes/crud/conversionCrudRoutes');
app.use('/dishdash', authenticateToken, authorizeRoles('chef'), conversionCrudRoutes);

const scaledRecipeCrudRoutes = require('./routes/crud/scaledRecipeCrudRoutes');
app.use('/dishdash', authenticateToken, authorizeRoles('chef'), scaledRecipeCrudRoutes);

const costAnalysisCrudRoutes = require('./routes/crud/costAnalysisCrudRoutes');
app.use('/dishdash', authenticateToken, authorizeRoles('chef'), costAnalysisCrudRoutes);

const calendarCrudRoutes = require('./routes/crud/calendarCrudRoutes');
app.use('/dishdash', authenticateToken, authorizeRoles('chef'), calendarCrudRoutes);

const calendarMeetingRoutes = require('./routes/crud/calendarRoutes');
app.use('/dishdash', authenticateToken, authorizeRoles('chef'), calendarMeetingRoutes);

const recipeCrudRoutes = require('./routes/crud/recipeCrudRoutes');
app.use('/dishdash', authenticateToken, recipeCrudRoutes);

const quotationCrudRoutes = require('./routes/crud/quotationCrudRoutes');
app.use('/dishdash', authenticateToken, quotationCrudRoutes);

// ============================================
// API Documentation
// ============================================
app.get('/', (req, res) => {
    res.json({
        message: 'BACKEND CRUD - Recipe Management System',
        description: 'This backend handles all CRUD operations (Create, Read, Update, Delete)',
        port: port,
        database: 'MongoDB',
        endpoints: {
            ingredients: {
                getAll: 'GET /dishdash/ingredients',
                getByCategory: 'GET /dishdash/ingredients/category/:category',
                getById: 'GET /dishdash/ingredients/:productId',
                create: 'POST /dishdash/ingredient',
                update: 'PUT /dishdash/ingredient/:productId',
                delete: 'DELETE /dishdash/ingredient/:productId'
            },
            recipes: {
                getAll: 'GET /dishdash/recipes',
                getById: 'GET /dishdash/recipes/:id',
                update: 'PUT /dishdash/recipes/:id',
                delete: 'DELETE /dishdash/recipe/:id'
            },
            quotations: {
                getAll: 'GET /dishdash/quotations',
                getById: 'GET /dishdash/quotations/:id',
                create: 'POST /dishdash/quotations',
                update: 'PUT /dishdash/quotations/:id',
                delete: 'DELETE /dishdash/quotations/:id'
            }
        }
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

app.listen(port, () => {
    console.log(`\n========================================`);
    console.log(`BACKEND CRUD - Server running on port ${port}`);
    console.log(`========================================\n`);
});
