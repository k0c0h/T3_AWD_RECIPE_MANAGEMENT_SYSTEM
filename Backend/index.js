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

const ingredientRoutes = require('./routes/ingredientRoutes');
app.use('/dishdash', ingredientRoutes);
const recipeRoutes = require('./routes/recipeRoutes');
app.use('/dishdash', recipeRoutes);

const unitsRoutes = require('./routes/unitsRoutes');
app.use('/dishdash', unitsRoutes);

const conversionsRoutes = require('./routes/conversionRoutes');
app.use('/dishdash', conversionsRoutes);

const scaledRecipeRoutes = require('./routes/scaledRecipeRoutes');
app.use('/dishdash', scaledRecipeRoutes);

const costAnalysisRoutes = require('./routes/costAnalysisRoutes');
app.use('/dishdash', costAnalysisRoutes);

// Root: list available URIs as JSON
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
			GET_recipe_ingredients_options: '/dishdash/costanalysis/recipe/:id/ingredients-options',
			POST_calculate: '/dishdash/costanalysis/calculate',
			POST: '/dishdash/costanalysis',
			GET: '/dishdash/costanalysis',
			GET_by_id: '/dishdash/costanalysis/:id',
			PUT: '/dishdash/costanalysis/:id',
			DELETE: '/dishdash/costanalysis/:id'
		}
	});
});

app.listen(port, () => console.log(`Server is running on port ${port}`));