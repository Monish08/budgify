const jwt = require('jsonwebtoken');

   module.exports = async (req, res, next) => {
     try {
       const token = req.header('Authorization')?.replace('Bearer ', '');
       if (!token) {
         console.log('No token provided in Authorization header');
         return res.status(401).json({ message: 'No token provided' });
       }
       console.log('Verifying token:', token); // Debug log
       const decoded = jwt.verify(token, process.env.JWT_SECRET);
       console.log('Decoded token:', decoded); // Debug log
       req.user = { id: decoded.id };
       next();
     } catch (error) {
       console.error('Auth middleware error:', error.message); // Debug log
       res.status(401).json({ message: 'Invalid token' });
     }
   };
   