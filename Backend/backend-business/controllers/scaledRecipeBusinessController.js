const Recipe = require('../models/recipe');
const Ingredient = require('../models/ingredient');
const Unit = require('../models/units');
const ScaledRecipe = require('../models/scaledRecipe');

async function convert(value, from, to, density = 1) {
    const fromUnit = await Unit.findOne({ name: from, isActive: true });
    const toUnit = await Unit.findOne({ name: to, isActive: true });

    if (!fromUnit || !toUnit) {
        throw new Error('Unit not found');
    }

    if (fromUnit.type === toUnit.type) {
        return (value * fromUnit.toBase) / toUnit.toBase;
    }

    if (fromUnit.type === 'weight' && toUnit.type === 'volume') {
        const grams = value * fromUnit.toBase;
        const ml = grams / density;
        return ml / toUnit.toBase;
    }

    if (fromUnit.type === 'volume' && toUnit.type === 'weight') {
        const ml = value * fromUnit.toBase;
        const grams = ml * density;
        return grams / toUnit.toBase;
    }

    throw new Error('Unsupported conversion');
}

exports.scaleRecipe = async (req, res) => {
    try {
        const { newServings, profitMargin } = req.body;

        if (!newServings || newServings <= 0) {
            return res.status(400).json({ message: 'Valid newServings is required' });
        }

        const recipe = await Recipe.findById(req.params.id);
        if (!recipe || !recipe.isActive) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        const scaleFactor = newServings / recipe.servings;
        const margin = profitMargin || 1.0;

        let totalCost = 0;
        const scaledIngredients = [];
        const suppliesCalculations = [];

        for (const ing of recipe.ingredients) {
            const ingredientData = await Ingredient.findOne({ productId: ing.productId });

            if (!ingredientData) {
                return res.status(400).json({
                    message: `Ingredient not found: ${ing.productId}`
                });
            }

            const scaledQuantity = ing.quantity * scaleFactor;

            let quantityInBaseUnit = scaledQuantity;
            
            try {
                if (ing.unit !== ingredientData.sizeUnit) {
                    quantityInBaseUnit = await convert(
                        scaledQuantity, 
                        ing.unit, 
                        ingredientData.sizeUnit, 
                        ingredientData.density
                    );
                }
            } catch (err) {
                console.warn(`Conversion failed for ${ingredientData.name}: ${err.message}`);
            }

            const ingredientCost = (quantityInBaseUnit / ingredientData.size) * ingredientData.price;
            totalCost += ingredientCost;

            const scaledIngredient = {
                ingredientName: ing.ingredientName,
                productId: ing.productId,
                originalQuantity: ing.quantity,
                originalUnit: ing.unit,
                scaledQuantity: parseFloat(scaledQuantity.toFixed(2)),
                scaledUnit: ing.unit,
                cost: parseFloat(ingredientCost.toFixed(2))
            };

            scaledIngredients.push(scaledIngredient);

            if (recipe.category.toLowerCase() === 'cocktails' || recipe.category.toLowerCase() === 'cocktail') {
                try {
                    let quantityNeeded = scaledQuantity;
                    
                    const unit = await Unit.findOne({ name: ing.unit, isActive: true });
                    
                    if (ing.unit !== ingredientData.sizeUnit) {
                        quantityNeeded = await convert(
                            scaledQuantity, 
                            ing.unit, 
                            ingredientData.sizeUnit, 
                            ingredientData.density
                        );
                    }

                    const packageSize = ingredientData.size;
                    const unitsNeeded = Math.ceil(quantityNeeded / packageSize);

                    if (quantityNeeded > 0) {
                        const category = ingredientData.category.toLowerCase();
                        let unitFieldName = 'unitsNeeded';
                        
                        if (category === 'licores') {
                            unitFieldName = 'licoresNeeded';
                        } else if (category === 'frutas') {
                            unitFieldName = 'frutasNeeded';
                        } else if (category === 'verduras') {
                            unitFieldName = 'verdurasNeeded';
                        } else if (category === 'lacteos') {
                            unitFieldName = 'lacteosNeeded';
                        } else if (category === 'bebidas') {
                            unitFieldName = 'bebidasNeeded';
                        }

                        suppliesCalculations.push({
                            ingredientName: ing.ingredientName,
                            category: ingredientData.category,
                            quantityNeeded: parseFloat(quantityNeeded.toFixed(2)),
                            unit: ingredientData.sizeUnit,
                            [unitFieldName]: unitsNeeded,
                            packageSize: packageSize,
                            packageUnit: ingredientData.sizeUnit
                        });
                    }
                } catch (err) {
                    console.warn(`Could not calculate units for ${ing.ingredientName}: ${err.message}`);
                }
            }
        }

        const costPerServing = totalCost / newServings;
        const pricePerServing = costPerServing * (1 + margin);
        const totalPrice = pricePerServing * newServings;
        const totalProfit = totalPrice - totalCost;
        const profitPerServing = totalProfit / newServings;

        const scaledRecipe = new ScaledRecipe({
            recipeId: recipe._id,
            recipeName: recipe.name,
            category: recipe.category,
            scaling: {
                originalServings: recipe.servings,
                newServings: newServings,
                scaleFactor: parseFloat(scaleFactor.toFixed(2))
            },
            ingredients: scaledIngredients,
            costs: {
                totalCost: parseFloat(totalCost.toFixed(2)),
                costPerServing: parseFloat(costPerServing.toFixed(2)),
                profitMargin: `${(margin * 100).toFixed(0)}%`,
                pricePerServing: parseFloat(pricePerServing.toFixed(2)),
                totalPrice: parseFloat(totalPrice.toFixed(2)),
                totalProfit: parseFloat(totalProfit.toFixed(2)),
                profitPerServing: parseFloat(profitPerServing.toFixed(2))
            },
            supplies: suppliesCalculations
        });

        const savedScaledRecipe = await scaledRecipe.save();

        res.status(201).json({
            message: 'Recipe scaled and saved successfully',
            scaledRecipe: savedScaledRecipe
        });

    } catch (error) {
        res.status(500).json({ message: "Error scaling recipe", error: error.message });
    }
};
