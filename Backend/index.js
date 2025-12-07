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

const ingredientRoutes = require('./routes/ingredientRoutes');
app.use('/dishdash', ingredientRoutes);

app.listen(port, () => console.log(`Server is running on port ${port}`));