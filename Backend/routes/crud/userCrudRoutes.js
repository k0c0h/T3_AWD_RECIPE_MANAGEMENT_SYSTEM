const express = require('express');
const router = express.Router();

const userController = require('../../controllers/userCrudController');

router.get('/users', userController.getUsers);
router.get('/users/email/:email', userController.getUserByEmail);
router.get('/users/:id', userController.getUserById);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

module.exports = router;
