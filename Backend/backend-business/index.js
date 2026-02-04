require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3007;
const path = require('path');

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://mrsproudd:mrsproudd@cluster0.ad7fs0q.mongodb.net/recipemanagementsystem?appName=Cluster0');
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('BACKEND BUSINESS - Connected to Database'));

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
// AUTH ROUTES (Business Logic)
// ============================================
const authBusinessRoutes = require('./routes/business/authBusinessRoutes');
app.use('/dishdash', authBusinessRoutes);

// ============================================
// BUSINESS RULES ROUTES 
// ============================================

const recipeBusinessRoutes = require('./routes/business/recipeBusinessRoutes');
app.use('/dishdash', authenticateToken, recipeBusinessRoutes);

const quotationBusinessRoutes = require('./routes/business/quotationBusinessRoutes');
app.use('/dishdash', authenticateToken, quotationBusinessRoutes);

const costAnalysisBusinessRoutes = require('./routes/business/costAnalysisBusinessRoutes');
app.use('/dishdash', authenticateToken, authorizeRoles('chef'), costAnalysisBusinessRoutes);

const conversionBusinessRoutes = require('./routes/business/conversionBusinessRoutes');
app.use('/dishdash', authenticateToken, authorizeRoles('chef'), conversionBusinessRoutes);

const scaledRecipeBusinessRoutes = require('./routes/business/scaledRecipeBusinessRoutes');
app.use('/dishdash', authenticateToken, authorizeRoles('chef'), scaledRecipeBusinessRoutes);

const calendarBusinessRoutes = require('./routes/business/calendarBusinessRoutes');
app.use('/dishdash', authenticateToken, authorizeRoles('chef'), calendarBusinessRoutes);

const unitBusinessRoutes = require('./routes/business/unitBusinessRoutes');
app.use('/dishdash', authenticateToken, authorizeRoles('chef'), unitBusinessRoutes);

// ============================================
// API Documentation
// ============================================
app.get('/', (req, res) => {
    res.json({
        message: 'BACKEND BUSINESS - Recipe Management System',
        description: 'This backend handles all Business Logic (calculations, transformations, complex operations)',
        port: port,
        database: 'MongoDB',
        endpoints: {
            auth: {
                register: 'POST /dishdash/auth/register',
                login: 'POST /dishdash/auth/login',
                verify: 'GET /dishdash/auth/verify'
            },
            recipes: {
                calculateCosts: 'POST /dishdash/recipe/:id/calculate-costs',
                recalculateCosts: 'PUT /dishdash/recipe/:id/recalculate-costs',
                searchByCategory: 'GET /dishdash/recipes/category/:category',
                searchByName: 'GET /dishdash/recipes/name/:name'
            },
            quotations: {
                estimateClientRequest: 'POST /dishdash/quotations/client-request/estimate',
                calculateChefQuotation: 'POST /dishdash/quotations/chef-calculate',
                approveAndSchedule: 'PATCH /dishdash/quotations/:id/approve-and-schedule'
            },
            costAnalysis: {
                calculateAndSave: 'POST /dishdash/costanalysis/calculate-and-save',
                recalculate: 'PUT /dishdash/costanalysis/:id/recalculate',
                calculateIngredients: 'POST /dishdash/costanalysis/calculate/ingredients-cost',
                calculateProduct: 'POST /dishdash/costanalysis/calculate/product-cost',
                calculateTaxes: 'POST /dishdash/costanalysis/calculate/taxes'
            },
            conversions: {
                convert: 'POST /dishdash/conversion',
                kitchenConversion: 'POST /dishdash/conversion/kitchen'
            },
            scaledRecipes: {
                scale: 'POST /dishdash/recipe/:id/scale'
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
    console.log(`BACKEND BUSINESS - Server running on port ${port}`);
    console.log(`========================================\n`);
});
