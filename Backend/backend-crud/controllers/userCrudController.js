const User = require('../models/user');

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user);
    } catch (error) {
        res.status(400).json({ message: "Invalid ID", error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const allowedFields = ["name", "picture", "isActive"];
        const payload = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) payload[field] = req.body[field];
        }

        const updated = await User.findByIdAndUpdate(
            req.params.id,
            payload,
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: "User not found" });

        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: "Error updating user", error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const deleted = await User.findByIdAndDelete(req.params.id);

        if (!deleted) return res.status(404).json({ message: "User not found" });

        res.json({ message: 'User deleted', deleted });
    } catch (error) {
        res.status(400).json({ message: "Invalid ID", error: error.message });
    }
};

exports.getUserByEmail = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user);
    } catch (error) {
        res.status(400).json({ message: "Error finding user", error: error.message });
    }
};
