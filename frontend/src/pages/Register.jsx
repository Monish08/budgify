import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';

function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Registering:', { username, email, password });
      await register(username, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 p-6">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center">Register</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4 bg-red-100 dark:bg-red-900/50">
              <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-gray-700 dark:text-gray-300 pb-1">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="border-indigo-300 dark:border-indigo-700 focus:ring-indigo-500"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 pb-1">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="border-indigo-300 dark:border-indigo-700 focus:ring-indigo-500"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 pb-1">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="border-indigo-300 dark:border-indigo-700 focus:ring-indigo-500"
              />
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-300">
              Register
            </Button>
          </form>
          <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <a href="/" className="text-indigo-600 dark:text-indigo-400 hover:underline">Login</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default Register;
