require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

/**
 * Script para crear usuarios Chef manualmente
 * Uso: node scripts/createChef.js
 */

async function createChef() {
    try {
        // Conectar a la base de datos
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://mrsproudd:mrsproudd@cluster0.ad7fs0q.mongodb.net/recipemanagementsystem?appName=Cluster0');
        console.log('✅ Connected to Database');

        // Datos del chef - MODIFICA ESTOS VALORES
        const chefData = {
            email: 'chef@dishdash.com',
            password: 'Chef123!',  // Cambiar por una contraseña segura
            name: 'Chef Principal',
            role: 'chef'
        };

        // Verificar si el chef ya existe
        const existingChef = await User.findOne({ email: chefData.email });
        if (existingChef) {
            console.log('❌ A user with this email already exists');
            process.exit(1);
        }

        // Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(chefData.password, salt);

        // Crear el chef
        const chef = await User.create({
            email: chefData.email,
            password: hashedPassword,
            name: chefData.name,
            role: 'chef'
        });

        console.log('✅ Chef created successfully!');
        console.log('📧 Email:', chef.email);
        console.log('👤 Name:', chef.name);
        console.log('🔑 Role:', chef.role);
        console.log('🆔 ID:', chef._id);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating chef:', error.message);
        process.exit(1);
    }
}

createChef();
