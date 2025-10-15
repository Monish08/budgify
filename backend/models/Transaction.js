   const mongoose = require('mongoose');

   const transactionSchema = new mongoose.Schema({
     userId: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User',
       required: true
     },
     type: {
       type: String,
       required: true,
       enum: ['Income', 'Expense']
     },
     category: {
       type: String,
       required: true
     },
     amount: {
       type: Number,
       required: true
     },
     date: {
       type: Date,
       required: true
     },
     note: {
       type: String
     },
     paymentMethod: {
       type: String
     },
     recurring: {
       type: Boolean,
       default: false
     },
     recurrenceInterval: {
       type: String,
       enum: ['Daily', 'Weekly', 'Monthly','Quarterly', 'Yearly','']
     }
   });

   module.exports = mongoose.model('Transaction', transactionSchema);
   