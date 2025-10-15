   require('dotenv').config();
   const express = require('express');
   const mongoose = require('mongoose');
   const fileUpload = require('express-fileupload');
   const authRoutes = require('./routes/authRoutes');
   const transactionRoutes = require('./routes/transactionRoutes');

   const app = express();

   app.use(express.json());
   app.use(fileUpload());
   app.use('/api/auth', authRoutes);
   app.use('/api/transactions', transactionRoutes);

   mongoose.connect(process.env.MONGO_URI)
     .then(() => console.log('MongoDB connected'))
     .catch(err => console.error('MongoDB connection error:', err));

   const PORT = process.env.PORT || 5000;
   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
   