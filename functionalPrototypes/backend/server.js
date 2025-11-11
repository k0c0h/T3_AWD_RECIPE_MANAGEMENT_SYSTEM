require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const recipesRouter = require('./routes/recipes');
const quotesRouter = require('./routes/quotes');
const ingredientsRouter = require('./routes/ingredients');
const clientRoutes = require('./routes/clients');


const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/recipes', recipesRouter);
app.use('/api/quotes', quotesRouter);
app.use('/api/ingredients', ingredientsRouter);
app.use('/api/clients', clientRoutes);


app.use(express.static(path.join(__dirname, '../')));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(' Connected to MongoDB Atlas'))
  .catch(err => console.error(' Connection Error:', err));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'index.html'));
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
