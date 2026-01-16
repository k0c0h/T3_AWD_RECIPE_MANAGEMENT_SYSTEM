const ScaledRecipe = require('../models/scaledRecipe');

exports.getScaledRecipes = async (req, res) => {
    try {
        const scaledRecipes = await ScaledRecipe.find({ isActive: true })
            .sort({ createdAt: -1 });

        res.json(scaledRecipes);
    } catch (error) {
        res.status(500).json({ message: "Error fetching scaled recipes", error: error.message });
    }
};

exports.getScaledRecipesByRecipeId = async (req, res) => {
    try {
        const scaledRecipes = await ScaledRecipe.find({ 
            recipeId: req.params.recipeId,
            isActive: true 
        }).sort({ createdAt: -1 });

        if (scaledRecipes.length === 0) {
            return res.status(404).json({ message: 'No scaled recipes found for this recipe' });
        }

        res.json(scaledRecipes);
    } catch (error) {
        res.status(500).json({ message: "Error fetching scaled recipes", error: error.message });
    }
};

exports.getScaledRecipeById = async (req, res) => {
    try {
        const scaledRecipe = await ScaledRecipe.findById(req.params.id);
        
        if (!scaledRecipe || !scaledRecipe.isActive) {
            return res.status(404).json({ message: 'Scaled recipe not found' });
        }

        res.json(scaledRecipe);
    } catch (error) {
        res.status(400).json({ message: "Invalid ID", error: error.message });
    }
};

exports.deleteScaledRecipe = async (req, res) => {
    try {
        const scaledRecipe = await ScaledRecipe.findById(req.params.id);
        
        if (!scaledRecipe) {
            return res.status(404).json({ message: 'Scaled recipe not found' });
        }

        scaledRecipe.isActive = false;
        scaledRecipe.deletedAt = new Date();
        await scaledRecipe.save();

        res.json({ message: 'Scaled recipe deactivated successfully', scaledRecipe });
    } catch (error) {
        res.status(500).json({ message: "Error deleting scaled recipe", error: error.message });
    }
};
