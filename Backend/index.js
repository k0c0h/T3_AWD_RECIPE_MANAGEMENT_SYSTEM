require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3007;

mongoose.connect(process.env.MONGODB_URI ||'mongodb+srv://mrsproudd:mrsproudd@cluster0.ad7fs0q.mongodb.net/recipemanagementsystem?appName=Cluster0');
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));

app.use(express.json());

const passport = require('./config/passport');
app.use(passport.initialize());

const authRoutes = require('./routes/authRoutes');
app.use('/dishdash', authRoutes);

const ingredientRoutes = require('./routes/crud/ingredientCrudRoutes');
app.use('/dishdash', ingredientRoutes);

const recipeRoutes = require('./routes/recipeRoutes');
app.use('/dishdash', recipeRoutes);

const unitsRoutes = require('./routes/unitsRoutes');
app.use('/dishdash', unitsRoutes);

const conversionCrudRoutes = require('./routes/crud/conversionCrudRoutes');
app.use('/dishdash', conversionCrudRoutes);

const conversionBusinessRoutes = require('./routes/business/conversionBusinessRoutes');
app.use('/dishdash', conversionBusinessRoutes);

const scaledRecipeRoutes = require('./routes/scaledRecipeRoutes');
app.use('/dishdash', scaledRecipeRoutes);

const costAnalysisCrudRoutes = require('./routes/crud/costAnalysisCrudRoutes');
app.use('/dishdash', costAnalysisCrudRoutes);

const costAnalysisBusinessRoutes = require('./routes/business/costAnalysisBusinessRoutes');
app.use('/dishdash', costAnalysisBusinessRoutes);

const quotationCrudRoutes = require('./routes/crud/quotationCrudRoutes');
app.use('/dishdash', quotationCrudRoutes);

const quotationBusinessRoutes = require('./routes/business/quotationBusinessRoutes');
app.use('/dishdash', quotationBusinessRoutes);

const calendarCrudRoutes = require('./routes/crud/calendarCrudRoutes');
app.use('/dishdash', calendarCrudRoutes);

const calendarBusinessRoutes = require('./routes/business/calendarBusinessRoutes');
app.use('/dishdash', calendarBusinessRoutes);

const calendarMeetingRoutes = require('./routes/calendar');
app.use('/dishdash', calendarMeetingRoutes);



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