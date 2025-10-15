const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/authMiddleware');
const { parse } = require('csv-parse');
const { Readable } = require('stream');
const PDFDocument = require('pdfkit');
const axios = require('axios'); // Added axios import

// GET /api/transactions - Fetch all transactions for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.log('No user ID in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }
    console.log('Fetching transactions for user:', req.user.id);
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/transactions - Create a new transaction
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.log('No user ID in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const { type, category, amount, date, note, paymentMethod, recurring, recurrenceInterval } = req.body;
    if (!type || !category || !amount || !date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    let parsedDate;
    if (typeof date === 'string') {
      if (date.match(/^\d{2}-\d{2}-\d{4}$/)) {
        const [day, month, year] = date.split('-');
        parsedDate = new Date(`${year}-${month}-${day}`);
      } else {
        parsedDate = new Date(date);
      }
    } else {
      parsedDate = new Date(date);
    }
    if (isNaN(parsedDate.getTime())) {
      console.log('Invalid date provided:', date);
      return res.status(400).json({ message: 'Invalid date format. Use DD-MM-YYYY or ISO format.' });
    }
    const normalizedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    if (!['Income', 'Expense'].includes(normalizedType)) {
      console.log('Invalid type provided:', type);
      return res.status(400).json({ message: 'Invalid type. Must be Income or Expense.' });
    }
    console.log('Creating transaction for user:', req.user.id, { type: normalizedType, category, amount, date: parsedDate });
    const transaction = new Transaction({
      userId: req.user.id,
      type: normalizedType,
      category,
      amount,
      date: parsedDate,
      note,
      paymentMethod,
      recurring,
      recurrenceInterval
    });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/transactions/:id - Update a transaction
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.log('No user ID in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const { type, category, amount, date, note, paymentMethod, recurring, recurrenceInterval } = req.body;
    let parsedDate;
    if (typeof date === 'string') {
      if (date.match(/^\d{2}-\d{2}-\d{4}$/)) {
        const [day, month, year] = date.split('-');
        parsedDate = new Date(`${year}-${month}-${day}`);
      } else {
        parsedDate = new Date(date);
      }
    } else {
      parsedDate = new Date(date);
    }
    if (isNaN(parsedDate.getTime())) {
      console.log('Invalid date provided:', date);
      return res.status(400).json({ message: 'Invalid date format. Use DD-MM-YYYY or ISO format.' });
    }
    const normalizedType = type ? type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() : undefined;
    if (normalizedType && !['Income', 'Expense'].includes(normalizedType)) {
      console.log('Invalid type provided:', type);
      return res.status(400).json({ message: 'Invalid type. Must be Income or Expense.' });
    }
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user.id });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    Object.assign(transaction, {
      type: normalizedType || transaction.type,
      category: category || transaction.category,
      amount: amount !== undefined ? amount : transaction.amount,
      date: parsedDate || transaction.date,
      note: note !== undefined ? note : transaction.note,
      paymentMethod: paymentMethod !== undefined ? paymentMethod : transaction.paymentMethod,
      recurring: recurring !== undefined ? recurring : transaction.recurring,
      recurrenceInterval: recurrenceInterval !== undefined ? recurrenceInterval : transaction.recurrenceInterval
    });
    await transaction.save();
    res.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/transactions/:id - Delete a transaction
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.log('No user ID in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error('Error deleting transaction:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/transactions/analytics - Fetch analytics data
router.get('/analytics', authMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.log('No user ID in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const transactions = await Transaction.find({ userId: req.user.id });
    const totalIncome = transactions
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const categoryBreakdown = transactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
    const monthlyTrends = transactions.reduce((acc, t) => {
      const month = new Date(t.date).toLocaleString('en-US', { month: 'long', year: 'numeric' });
      acc[month] = acc[month] || { income: 0, expenses: 0 };
      acc[month][t.type.toLowerCase()] += t.amount;
      return acc;
    }, {});
    res.json({
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      categoryBreakdown,
      monthlyTrends
    });
  } catch (error) {
    console.error('Error fetching analytics:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/transactions/export/csv - Export transactions as CSV
router.get('/export/csv', authMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.log('No user ID in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const transactions = await Transaction.find({ userId: req.user.id });
    const csv = [
      'type,category,amount,date,note,paymentMethod,recurring,recurrenceInterval',
      ...transactions.map(t =>
        `${t.type},${t.category},${t.amount},${new Date(t.date).toLocaleDateString('en-GB')},${t.note || ''},${t.paymentMethod || ''},${t.recurring},${t.recurrenceInterval || ''}`
      )
    ].join('\n');
    res.header('Content-Type', 'text/csv');
    res.attachment('transactions.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting CSV:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/transactions/export/pdf - Export transactions as PDF
router.get('/export/pdf', authMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.log('No user ID in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ date: -1 });
    const doc = new PDFDocument();
    res.header('Content-Type', 'application/pdf');
    res.attachment('transactions.pdf');
    doc.pipe(res);
    doc.fontSize(20).text('Transaction Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12);
    transactions.forEach((t, index) => {
      doc.text(`Transaction ${index + 1}:`);
      doc.text(`Type: ${t.type}`);
      doc.text(`Category: ${t.category}`);
      doc.text(`Amount: ₹${t.amount}`);
      doc.text(`Date: ${new Date(t.date).toLocaleDateString('en-GB')}`);
      doc.text(`Note: ${t.note || 'N/A'}`);
      doc.text(`Payment Method: ${t.paymentMethod || 'N/A'}`);
      doc.text(`Recurring: ${t.recurring ? 'Yes' : 'No'}`);
      doc.text(`Recurrence Interval: ${t.recurrenceInterval || 'N/A'}`);
      doc.moveDown();
    });
    doc.end();
  } catch (error) {
    console.error('Error exporting PDF:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/transactions/sample/csv - Download sample CSV
router.get('/sample/csv', authMiddleware, async (req, res) => {
  try {
    const sample = [
      'type,category,amount,date,note,paymentMethod,recurring,recurrenceInterval',
      'Income,Salary,1000,14-10-2025,Monthly salary,Cash,TRUE,Monthly',
      'Expense,Food,50,14-10-2025,Groceries,Card,FALSE,'
    ].join('\n');
    res.header('Content-Type', 'text/csv');
    res.attachment('sample_transactions.csv');
    res.send(sample);
  } catch (error) {
    console.error('Error generating sample CSV:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/transactions/import/csv - Import transactions from CSV
router.post('/import/csv', authMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.log('No user ID in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }
    if (!req.files || !req.files.file) {
      console.log('No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const file = req.files.file;
    if (!file.mimetype.includes('csv')) {
      console.log('Invalid file type:', file.mimetype);
      return res.status(400).json({ message: 'Invalid file type, CSV required' });
    }
    console.log('Processing CSV for user:', req.user.id);
    const parser = parse({ columns: true, trim: true, skip_empty_lines: true });
    const transactions = [];
    const stream = Readable.from(file.data);
    stream.pipe(parser);
    parser.on('data', (row) => {
      // Validate date
      if (!row.date) {
        console.log('Missing date in CSV row:', row);
        return; // Skip rows with missing date
      }
      let parsedDate;
      if (typeof row.date === 'string' && row.date.match(/^\d{2}-\d{2}-\d{4}$/)) {
        const [day, month, year] = row.date.split('-');
        parsedDate = new Date(`${year}-${month}-${day}`);
      } else {
        parsedDate = new Date(row.date);
      }
      if (isNaN(parsedDate.getTime())) {
        console.log('Invalid date in CSV row:', row.date);
        return;
      }
      const normalizedType = row.type ? row.type.charAt(0).toUpperCase() + row.type.slice(1).toLowerCase() : '';
      if (!['Income', 'Expense'].includes(normalizedType)) {
        console.log('Invalid type in CSV row:', row.type);
        return;
      }
      transactions.push({
        userId: req.user.id,
        type: normalizedType,
        category: row.category || '',
        amount: parseFloat(row.amount) || 0,
        date: parsedDate,
        note: row.note || '',
        paymentMethod: row.paymentMethod || '',
        recurring: row.recurring === 'TRUE',
        recurrenceInterval: row.recurrenceInterval || ''
      });
    });
    parser.on('end', async () => {
      try {
        if (transactions.length === 0) {
          console.log('No valid transactions to import');
          return res.status(400).json({ message: 'No valid transactions in CSV' });
        }
        await Transaction.insertMany(transactions);
        res.json({ message: 'CSV imported successfully' });
      } catch (error) {
        console.error('Error importing CSV:', error.message);
        res.status(500).json({ message: 'Error importing CSV' });
      }
    });
    parser.on('error', (error) => {
      console.error('CSV parsing error:', error.message);
      res.status(400).json({ message: 'Error parsing CSV' });
    });
  } catch (error) {
    console.error('Error importing CSV:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/transactions/ai-insights - Generate AI-powered financial insights
router.get('/ai-insights', authMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.log('No user ID in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }
    console.log('Fetching AI insights for user:', req.user.id);
    const transactions = await Transaction.find({ userId: req.user.id });
    if (!transactions.length) {
      return res.json({ insights: 'No transactions found. Add some transactions to get insights.' });
    }
    const totalIncome = transactions
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalIncome - totalExpenses;
    const categoryBreakdown = transactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
    const highestCategory = Object.entries(categoryBreakdown)
      .reduce((max, [cat, amt]) => (amt > max.amount ? { category: cat, amount: amt } : max), { category: '', amount: 0 });
    
    const prompt = `Analyze this financial data and provide a concise, positive insight:
    - Total Income: ₹${totalIncome.toFixed(2)}
    - Total Expenses: ₹${totalExpenses.toFixed(2)}
    - Net Balance: ₹${netBalance.toFixed(2)}
    - Highest Spending Category: ${highestCategory.category} (₹${highestCategory.amount.toFixed(2)})
    - Transactions: ${JSON.stringify(transactions.slice(0, 10))}
    Make it encouraging and actionable, 1-2 sentences.`;

    try {
      const mistralResponse = await axios.post(
        'https://api.mistral.ai/v1/chat/completions',
        {
          model: 'open-mistral-7b', // Free-tier model
          messages: [
            { role: 'system', content: 'You are a helpful financial advisor. Provide concise, positive insights based on the data.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 150,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const insights = mistralResponse.data.choices[0].message.content.trim();
      res.json({ insights });
    } catch (apiError) {
      console.error('Mistral API error:', apiError.response?.data || apiError.message);
      const insights = `Spending is ${netBalance >= 0 ? 'good' : 'concerning'}: Net balance ₹${netBalance.toFixed(2)} is ${
        netBalance >= 0 ? 'positive' : 'negative'
      }. ${highestCategory.category} spending (₹${highestCategory.amount.toFixed(2)}) is the highest.`;
      res.json({ insights });
    }
  } catch (error) {
    console.error('Error generating AI insights:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      res.status(500).json({ message: 'Invalid Mistral API key' });
    } else if (error.response?.status === 429) {
      res.status(500).json({ message: 'Rate limit exceeded. Try again later.' });
    } else {
      res.status(500).json({ message: 'Failed to generate AI insights' });
    }
  }
});

module.exports = router;