// app.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/money_tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Create Expense schema
const expenseSchema = new mongoose.Schema({
  description: String,
  amount: Number,
  date: { type: Date, default: Date.now },
  category: String,
  recurring: { type: Boolean, default: false },
  frequency: String,
  notes: String,
});

const Expense = mongoose.model('Expense', expenseSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// API to get all expenses
app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// API to add an expense
app.post('/api/expenses', async (req, res) => {
  try {
    console.log('Received data:', req.body);

    const { description, amount, category, recurring, frequency, notes } = req.body;

    if (!description || !amount) {
      return res.status(400).json({ message: "Description and amount are required." });
    }

    const expense = new Expense({
      description,
      amount,
      category,
      recurring: recurring === 'true',
      frequency,
      notes,
    });

    const newExpense = await expense.save();
    console.log('Expense added successfully:', newExpense);

    res.status(201).json({ message: "Expense added successfully", expense: newExpense });
  } catch (err) {
    console.error('Failed to add expense to the database:', err.message);
    res.status(500).json({ message: "Failed to add expense to the database", error: err.message });
  }
});

// API to get expenses by category
app.get('/api/expenses/category/:category', async (req, res) => {
  const category = req.params.category;

  try {
    const expenses = await Expense.find({ category });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// API to get recurring expenses
app.get('/api/expenses/recurring', async (req, res) => {
  try {
    const recurringExpenses = await Expense.find({ recurring: true });
    res.json(recurringExpenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
