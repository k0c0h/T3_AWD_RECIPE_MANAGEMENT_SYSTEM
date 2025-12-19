const express = require('express');
const router = express.Router();
const Recipe = require('../models/recipe');
const Ingredient = require('../models/ingredient');
const Units = require('../models/units');
const CostAnalysis = require('../models/costAnalysis');

async function getUnit(name) {
	return Units.findOne({ name });
}

async function toBase(value, unitName) {
	const u = await getUnit(unitName);
	if (!u) throw new Error('Unit not found');
	return value * u.toBase;
}

async function unitCostFromIngredient(ingredientDoc) {
	const pkgBase = await toBase(ingredientDoc.size, ingredientDoc.sizeUnit);
	return ingredientDoc.price / pkgBase;
}

async function computeLineCost(ingredientDoc, qty, unitName) {
	const uc = await unitCostFromIngredient(ingredientDoc);
	const qtyBase = await toBase(qty, unitName);
	return { unitCost: uc, totalCost: uc * qtyBase };
}

function indirectCosts(ingredientsCost) {
	return ingredientsCost * 0.25;
}

function suggestedPrice(costPerServing, ivaPercent = 0, servicePercent = 0) {
	const base = costPerServing * 3;
	const iva = base * (ivaPercent / 100);
	const service = base * (servicePercent / 100);
	return base + iva + service;
}
router.get('/costanalysis/recipe/:id/ingredients-options', async (req, res) => {
	const recipe = await Recipe.findById(req.params.id);
	if (!recipe) return res.status(404).json({ message: 'Not found' });
	const items = await Promise.all(recipe.ingredients.map(async (ing) => {
		const options = await Ingredient.find({ product: ing.ingredientName });
		return { ingredient: ing, options };
	}));
	res.json({ recipeId: recipe._id, name: recipe.name, servings: recipe.servings, items });
});

router.post('/costanalysis/calculate', async (req, res) => {
	const { recipeId, selectedIngredients, ivaPercent = 0, servicePercent = 0 } = req.body;
	const recipe = await Recipe.findById(recipeId);
	if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
	const lines = await Promise.all(selectedIngredients.map(async (sel) => {
		const doc = await Ingredient.findOne({ productId: sel.productId });
		const { unitCost, totalCost } = await computeLineCost(doc, sel.quantity, sel.unit);
		return { productId: sel.productId, name: doc.name, quantity: sel.quantity, unit: sel.unit, unitCost, totalCost };
	}));
	const ingredientsCost = lines.reduce((s, l) => s + l.totalCost, 0);
	const indCost = indirectCosts(ingredientsCost);
	const totalCost = ingredientsCost + indCost;
	const servings = recipe.servings || 1;
	const costPerServing = totalCost / servings;
	const base = costPerServing * 3;
	const ivaAmount = base * (ivaPercent / 100);
	const serviceAmount = base * (servicePercent / 100);
	const totalTaxes = ivaAmount + serviceAmount;
	const suggested = base + totalTaxes;
	res.json({ recipeId, recipeName: recipe.name, servings, lines, ingredientsCost, indirectCost: indCost, totalCost, costPerServing, taxes: { ivaPercent, servicePercent, ivaAmount, serviceAmount, totalTaxes }, suggestedPricePerServing: suggested });
});

router.post('/costanalysis', async (req, res) => {
	const body = req.body || {};
	const taxes = body.taxes || {};
	if (body.costPerServing && (taxes.ivaPercent || taxes.servicePercent)) {
		const base = body.costPerServing * 3;
		const ivaAmount = base * ((taxes.ivaPercent || 0) / 100);
		const serviceAmount = base * ((taxes.servicePercent || 0) / 100);
		taxes.ivaAmount = ivaAmount;
		taxes.serviceAmount = serviceAmount;
		taxes.totalTaxes = ivaAmount + serviceAmount;
		body.suggestedPricePerServing = base + taxes.totalTaxes;
	}
	body.taxes = taxes;
	const doc = new CostAnalysis(body);
	await doc.save();
	res.status(201).json(doc);
});

router.get('/costanalysis', async (req, res) => {
	const docs = await CostAnalysis.find();
	res.json(docs);
});

router.get('/costanalysis/:id', async (req, res) => {
	const doc = await CostAnalysis.findById(req.params.id);
	if (!doc) return res.status(404).json({ message: 'Not found' });
	res.json(doc);
});

router.put('/costanalysis/:id', async (req, res) => {
	const doc = await CostAnalysis.findByIdAndUpdate(req.params.id, req.body, { new: true });
	res.json(doc);
});

router.delete('/costanalysis/:id', async (req, res) => {
	await CostAnalysis.findByIdAndDelete(req.params.id);
	res.status(204).end();
});

module.exports = router;
