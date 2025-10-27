require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const recipesRouter = require('./routes/recipes');
const quotesRouter = require('./routes/quotes');
const ingredientsRouter = require('./routes/ingredients');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/recipes', recipesRouter);
app.use('/api/quotes', quotesRouter);
app.use('/api/ingredients', ingredientsRouter);


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(' Connected to MongoDB Atlas'))
  .catch(err => console.error('Connection Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server in ${PORT}`));
