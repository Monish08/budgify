   import { useState, useContext } from 'react';
   import { AuthContext } from '../context/AuthContext';
   import { useNavigate, Link } from 'react-router-dom';
   import { Input } from '../components/ui/input';
   import { Button } from '../components/ui/button';
   import { Alert, AlertDescription } from '../components/ui/alert';

   function Home() {
     const { login } = useContext(AuthContext);
     const navigate = useNavigate();
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [error, setError] = useState('');

     const handleLogin = async (e) => {
       e.preventDefault();
       try {
         console.log('Login input:', { email: email.trim().toLowerCase(), password: password.trim() }); // Debug log
         await login(email.trim().toLowerCase(), password.trim());
         setError('');
         navigate('/dashboard');
       } catch (err) {
         console.error('Login error:', err);
         setError(err.message || 'Login failed');
       }
     };

     return (
       <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 p-6 flex items-center justify-center">
         <div className="max-w-md w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-8 rounded-lg shadow-2xl">
           <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-6">Login</h1>
           {error && (
             <Alert variant="destructive" className="mb-4">
               <AlertDescription>{error}</AlertDescription>
             </Alert>
           )}
           <form onSubmit={handleLogin} className="space-y-4">
             <div>
               <Input
                 type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 placeholder="Email"
                 className="border-indigo-300 dark:border-indigo-700 focus:ring-indigo-500"
               />
             </div>
             <div>
               <Input
                 type="password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 placeholder="Password"
                 className="border-indigo-300 dark:border-indigo-700 focus:ring-indigo-500"
               />
             </div>
             <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-300">
               Login
             </Button>
           </form>
           <p className="mt-4 text-center text-gray-700 dark:text-gray-300">
             Don't have an account? <Link to="/register" className="text-indigo-600 dark:text-indigo-400 hover:underline">Register</Link>
           </p>
         </div>
       </div>
     );
   }

   export default Home;
   