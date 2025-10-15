   const express = require('express');
   const router = express.Router();
   const bcrypt = require('bcryptjs');
   const jwt = require('jsonwebtoken');
   const User = require('../models/User');

   router.post('/register', async (req, res) => {
     const { username, email, password } = req.body;
     try {
       if (!username || !email || !password) {
         return res.status(400).json({ message: 'All fields are required' });
       }
       if (typeof password !== 'string') {
         return res.status(400).json({ message: 'Password must be a string' });
       }
       const trimmedEmail = email.trim().toLowerCase();
       const trimmedPassword = password.trim();
       const existingUser = await User.findOne({ email: trimmedEmail });
       if (existingUser) {
         return res.status(400).json({ message: 'User already exists' });
       }
       const salt = await bcrypt.genSalt(10);
       const hashedPassword = await bcrypt.hash(trimmedPassword, salt);
       console.log('Registering user:', { email: trimmedEmail, hashedPassword }); // Debug log
       const user = new User({ username, email: trimmedEmail, password: hashedPassword });
       await user.save();
       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
       res.status(201).json({ token });
     } catch (error) {
       console.error('Register error:', error);
       res.status(500).json({ message: 'Server error' });
     }
   });

   router.post('/login', async (req, res) => {
     const { email, password } = req.body;
     try {
       if (!email || !password || typeof password !== 'string') {
         return res.status(400).json({ message: 'Email and password are required and must be strings' });
       }
       const trimmedEmail = email.trim().toLowerCase();
       const trimmedPassword = password.trim();
       console.log('Login attempt:', { email: trimmedEmail, password: trimmedPassword }); // Debug log
       const user = await User.findOne({ email: trimmedEmail });
       if (!user) {
         console.log('User not found:', trimmedEmail);
         return res.status(400).json({ message: 'Invalid credentials' });
       }
       const isMatch = await bcrypt.compare(trimmedPassword, user.password);
       console.log('Password match:', isMatch, 'Stored hash:', user.password); // Debug log
       if (!isMatch) {
         return res.status(400).json({ message: 'Invalid credentials' });
       }
       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
       res.json({ token });
     } catch (error) {
       console.error('Login error:', error);
       res.status(500).json({ message: 'Server error' });
     }
   });

   router.get('/me', async (req, res) => {
     try {
       const token = req.header('Authorization')?.replace('Bearer ', '');
       if (!token) {
         return res.status(401).json({ message: 'No token provided' });
       }
       const decoded = jwt.verify(token, process.env.JWT_SECRET);
       const user = await User.findById(decoded.id).select('-password');
       if (!user) {
         return res.status(401).json({ message: 'Invalid token' });
       }
       res.json(user);
     } catch (error) {
       console.error('Get user error:', error);
       res.status(401).json({ message: 'Invalid token' });
     }
   });

   module.exports = router;
   