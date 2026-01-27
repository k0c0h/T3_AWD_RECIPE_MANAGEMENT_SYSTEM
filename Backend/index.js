require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3007;
const path = require('path');


mongoose.connect(process.env.MONGODB_URI ||'mongodb+srv://mrsproudd:mrsproudd@cluster0.ad7fs0q.mongodb.net/recipemanagementsystem?appName=Cluster0');
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));

// Configurar CORS
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


const authBusinessRoutes = require('./routes/business/authBusinessRoutes');
app.use('/dishdash', authBusinessRoutes);


const userCrudRoutes = require('./routes/crud/userCrudRoutes');
app.use('/dishdash', authenticateToken, authorizeRoles('chef'), userCrudRoutes);

const ingredientRoutes = require('./routes/crud/ingredientCrudRoutes');
app.use('/dishdash', authenticateToken, authorizeRoles('chef'), ingredientRoutes);

const unitsRoutes = require('./routes/crud/unitsCrudRoutes');
app.use('/dishdash', authenticateToken, authorizeRoles('chef'), unitsRoutes);

const conversionCrudRoutes = require('./routes/crud/conversionCrudRoutes');
app.use('/dishdash', authenticateToken, authorizeRoles('chef'), conversionCrudRoutes);

const conversionBusinessRoutes = require('./routes/business/conversionBusinessRoutes');
app.use('/dishdash', authenticateToken, authorizeRoles('chef'), conversionBusinessRoutes);

const scaledRecipeCrudRoutes = require('./routes/crud/scaledRecipeCrudRoutes');
app.use('/dishdash', authenticateToken, authorizeRoles('chef'), scaledRecipeCrudRoutes);

const scaledRecipeBusinessRoutes = require('./routes/business/scaledRecipeBusinessRoutes');
app.use('/dishdash', authenticateToken, authorizeRoles('chef'), scaledRecipeBusinessRoutes);

const costAnalysisCrudRoutes = require('./routes/crud/costAnalysisCrudRoutes');
app.use('/dishdash', authenticateToken, authorizeRoles('chef'), costAnalysisCrudRoutes);

const costAnalysisBusinessRoutes = require('./routes/business/costAnalysisBusinessRoutes');
app.use('/dishdash', authenticateToken, authorizeRoles('chef'), costAnalysisBusinessRoutes);

const calendarCrudRoutes = require('./routes/crud/calendarCrudRoutes');
app.use('/dishdash', authenticateToken, authorizeRoles('chef'), calendarCrudRoutes);

const calendarBusinessRoutes = require('./routes/business/calendarBusinessRoutes');
app.use('/dishdash', authenticateToken, authorizeRoles('chef'), calendarBusinessRoutes);

const calendarMeetingRoutes = require('./routes/crud/calendarRoutes');
app.use('/dishdash', authenticateToken, authorizeRoles('chef'), calendarMeetingRoutes);


const recipeCrudRoutes = require('./routes/crud/recipeCrudRoutes');
app.use('/dishdash', authenticateToken, recipeCrudRoutes);

const recipeBusinessRoutes = require('./routes/business/recipeBusinessRoutes');
app.use('/dishdash', authenticateToken, recipeBusinessRoutes);


const quotationCrudRoutes = require('./routes/crud/quotationCrudRoutes');
app.use('/dishdash', authenticateToken, quotationCrudRoutes);

const quotationBusinessRoutes = require('./routes/business/quotationBusinessRoutes');
app.use('/dishdash', authenticateToken, quotationBusinessRoutes);



app.get('/', (req, res) => {
	res.json({
		ingredients: {
			GET: '/dishdash/ingredients',
			GET_by_category: '/dishdash/ingredients/category/:category',
			GET_by_productId: '/dishdash/ingredients/:productId',
			GET_by_name: '/dishdash/ingredients/name/:name',
			POST: '/dishdash/ingredient',
			PUT: '/dishdash/ingredient/:productId',
			DELETE: '/dishdash/ingredient/:productId',
			PATCH_restore: '/dishdash/ingredient/:productId/restore'
		},
		recipes: {
			GET: '/dishdash/recipes',
			GET_by_category: '/dishdash/recipes/category/:category',
			GET_by_name: '/dishdash/recipes/name/:name',
			GET_by_id: '/dishdash/recipes/:id',
			POST: '/dishdash/recipe',
			PUT: '/dishdash/recipe/:id',
			DELETE: '/dishdash/recipe/:id',
			DELETE_force: '/dishdash/recipe/:id/force',
			PATCH_restore: '/dishdash/recipe/:id/restore'
		},
		units: {
			GET: '/dishdash/units',
			GET_all: '/dishdash/unitsall'
		},
		conversions: {
			GET: '/dishdash/conversions',
			PATCH: '/dishdash/conversion/:id',
			DELETE: '/dishdash/conversion/:id',
			POST_convert: '/dishdash/conversion',
			POST_kitchen: '/dishdash/conversion/kitchen'
		},
		scaledRecipes: {
			GET: '/dishdash/scaled-recipes',
			GET_by_recipe: '/dishdash/scaled-recipes/recipe/:recipeId',
			GET_by_id: '/dishdash/scaled-recipes/:id',
			POST_scale: '/dishdash/recipe/:id/scale',
			DELETE: '/dishdash/scaled-recipes/:id'
		},
		auth: {
			GET_google: '/dishdash/auth/google',
			GET_google_callback: '/dishdash/auth/google/callback',
			GET_failure: '/dishdash/auth/failure',
			GET_verify: '/dishdash/auth/verify'
		},
		users: {
			GET: '/dishdash/users',
			GET_by_email: '/dishdash/users/email/:email',
			GET_by_id: '/dishdash/users/:id',
			PUT: '/dishdash/users/:id',
			DELETE: '/dishdash/users/:id'
		},
		costanalysis: {
			POST_calculate: '/dishdash/costanalysis/calculate',
			GET_recipe_ingredients_options: '/dishdash/costanalysis/recipe/:id/ingredients-options',
			POST: '/dishdash/costanalysis',
			GET: '/dishdash/costanalysis',
			GET_by_id: '/dishdash/costanalysis/:id',
			PUT: '/dishdash/costanalysis/:id',
			DELETE: '/dishdash/costanalysis/:id'
		},
		quotations: {
			POST_client_request: '/dishdash/quotations/client-request',
			POST_chef_calculate: '/dishdash/quotations/chef-calculate',
			POST_chef_quotation: '/dishdash/quotations/chef-quotation',
			GET: '/dishdash/quotations',
			GET_by_id: '/dishdash/quotations/:id',
			PUT: '/dishdash/quotations/:id',
			PATCH_status: '/dishdash/quotations/:id/status',
			DELETE: '/dishdash/quotations/:id'
		},
		calendar: {
			POST :   '/dishdash/calendar/events',
			GET   :  '/dishdash/calendar/events',
			GET    : '/dishdash/calendar/events/:id',
			PUT     :'/dishdash/calendar/events/:id',
			DELETE : '/dishdash/calendar/events/:id',
			GET     :'/dishdash/calendar/events/quotation/:quotationId',
			GET     :'/dishdash/calendar/events/recipe/:recipeId',
			PATCH   :'/dishdash/calendar/events/:id/complete',
			GET     :'/dishdash/calendar/events/upcoming',
			GET     :'/dishdash/calendar/timeline/:quotationId',
			POST    :'/dishdash/calendar/events/create-from-quotation/:id',
			POST    :'/dishdash/calendar/meeting'
		}
	});
});

app.listen(port, () => console.log(`Server is running on port ${port}`));