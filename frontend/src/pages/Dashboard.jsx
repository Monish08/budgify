import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Download, Trash2, Edit } from 'lucide-react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

function Dashboard() {
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    categoryBreakdown: {},
    monthlyTrends: {},
  });
  const [insights, setInsights] = useState('');
  const [type, setType] = useState('Income');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [recurrenceInterval, setRecurrenceInterval] = useState('');
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const categories = [
    'Food', 'Rent', 'Salary', 'Transport', 'Entertainment', 'Utilities',
    'Freelance', 'Gift', 'Health', 'Shopping', 'Investment', 'Bonus', 'Subscriptions', 'Other'
  ];
  const paymentMethods = ['Cash', 'Card', 'UPI', 'Online'];

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    } else if (user) {
      fetchTransactions();
      fetchAnalytics();
    }
  }, [user, loading, navigate]);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        logout();
        navigate('/');
        return;
      }
      const response = await axios.get('/api/transactions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(response.data);
      setError('');
    } catch (err) {
      console.error('Fetch transactions error:', err.response?.data || err);
      const message = err.response?.status === 401 ? 'Session expired. Please log in again.' : (err.response?.data?.message || 'Failed to load transactions');
      setError(message);
      if (err.response?.status === 401) {
        logout();
        navigate('/');
      }
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        logout();
        navigate('/');
        return;
      }
      const response = await axios.get('/api/transactions/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalytics(response.data);
      setError('');
    } catch (err) {
      console.error('Fetch analytics error:', err.response?.data || err);
      const message = err.response?.status === 401 ? 'Session expired. Please log in again.' : (err.response?.data?.message || 'Failed to load analytics');
      setError(message);
      if (err.response?.status === 401) {
        logout();
        navigate('/');
      }
    }
  };

  const fetchInsights = async () => {
  console.log('Fetching AI insights...');
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please log in again.');
      logout();
      navigate('/');
      return;
    }
    console.log('Sending request to /api/transactions/ai-insights with token:', token);
    const response = await axios.get('/api/transactions/ai-insights', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('AI insights response:', response.data);
    setInsights(response.data.insights);
    setError('');
  } catch (err) {
    console.error('Fetch AI insights error:', err.response?.data || err);
    const message = err.response?.status === 401 ? 'Session expired. Please log in again.' : (err.response?.data?.message || 'Failed to generate AI insights');
    setError(message);
    if (err.response?.status === 401) {
      logout();
      navigate('/');
    }
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Format date as DD-MM-YYYY
    let formattedDate = date;
    if (date) {
      const [year, month, day] = date.split('-');
      formattedDate = `${day}-${month}-${year}`;
    }
    const payload = {
      type,
      category,
      amount: parseFloat(amount),
      date: formattedDate,
      note,
      paymentMethod,
      recurring,
      recurrenceInterval: recurring ? recurrenceInterval : '',
    };
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        logout();
        navigate('/');
        return;
      }
      if (editId) {
        await axios.put(`/api/transactions/${editId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('/api/transactions', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchTransactions();
      fetchAnalytics();
      resetForm();
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Transaction error:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to save transaction');
    }
  };

  const handleEdit = (transaction) => {
    setType(transaction.type);
    setCategory(transaction.category);
    setAmount(transaction.amount);
    // Convert ISO date to YYYY-MM-DD for input
    setDate(new Date(transaction.date).toISOString().split('T')[0]);
    setNote(transaction.note || '');
    setPaymentMethod(transaction.paymentMethod || '');
    setRecurring(transaction.recurring || false);
    setRecurrenceInterval(transaction.recurrenceInterval || '');
    setEditId(transaction._id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        logout();
        navigate('/');
        return;
      }
      await axios.delete(`/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTransactions();
      fetchAnalytics();
    } catch (err) {
      console.error('Delete error:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to delete transaction');
    }
  };

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        logout();
        navigate('/');
        return;
      }
      const response = await axios.get('/api/transactions/export/csv', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = new Blob([response.data], { type: 'text/csv' });
      saveAs(blob, 'transactions.csv');
      setError('');
    } catch (err) {
      console.error('Export CSV error:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to export CSV');
    }
  };

  const handleExportPDF = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        logout();
        navigate('/');
        return;
      }
      const response = await axios.get('/api/transactions/export/pdf', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      saveAs(response.data, 'transactions.pdf');
      setError('');
    } catch (err) {
      console.error('Export PDF error:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to export PDF');
    }
  };

  const handleImportCSV = async (event) => {
    const file = event.target.files[0];
    console.log('Selected file:', file);
    if (!file) {
      setError('No file selected for import');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        logout();
        navigate('/');
        return;
      }
      const response = await fetch('/api/transactions/import/csv', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await response.json();
      console.log('Import response:', data);
      if (!response.ok) throw new Error(data.message || 'Failed to import CSV');
      fetchTransactions();
      fetchAnalytics();
      setError('');
    } catch (error) {
      console.error('Import error:', error.message);
      setError(error.message || 'Failed to import CSV');
    }
  };

  const handleSampleCSV = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        logout();
        navigate('/');
        return;
      }
      const response = await axios.get('/api/transactions/sample/csv', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = new Blob([response.data], { type: 'text/csv' });
      saveAs(blob, 'sample_transactions.csv');
      setError('');
    } catch (err) {
      console.error('Sample CSV error:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to download sample CSV');
    }
  };

  const resetForm = () => {
    setType('Income');
    setCategory('');
    setAmount('');
    setDate('');
    setNote('');
    setPaymentMethod('');
    setRecurring(false);
    setRecurrenceInterval('');
    setEditId(null);
    setError('');
  };

  const lineChartData = {
    labels: Object.keys(analytics.monthlyTrends).sort(),
    datasets: [
      {
        label: 'Income',
        data: Object.keys(analytics.monthlyTrends).sort().map((month) => analytics.monthlyTrends[month].income),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        fill: true,
      },
      {
        label: 'Expenses',
        data: Object.keys(analytics.monthlyTrends).sort().map((month) => analytics.monthlyTrends[month].expenses),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        fill: true,
      },
    ],
  };

  const pieChartData = {
    labels: ['Income', 'Expense'],
    datasets: [
      {
        data: [analytics.totalIncome, analytics.totalExpenses],
        backgroundColor: ['#10b981', '#ef4444'],
        borderColor: ['#065f46', '#991b1b'],
      },
    ],
  };

  const barChartData = {
    labels: Object.keys(analytics.categoryBreakdown),
    datasets: [
      {
        label: 'Spending by Category',
        data: Object.values(analytics.categoryBreakdown),
        backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'],
        borderColor: ['#4f46e5', '#065f46', '#b45309', '#991b1b', '#6d28d9', '#be185d', '#0f766e', '#c2410c'],
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-900 dark:text-gray-100">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 p-6 transition-all duration-500">
      <Card className="max-w-6xl mx-auto shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600">
            Welcome, {user?.username}
          </CardTitle>
          <Button onClick={logout} variant="outline" className="border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors duration-300">
            Logout
          </Button>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6 bg-red-100 dark:bg-red-900/50">
              <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
            </Alert>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()} className="bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-300">
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md">
              <DialogHeader>
                <DialogTitle className="text-2xl text-gray-900 dark:text-gray-100">
                  {editId ? 'Edit Transaction' : 'Add Transaction'}
                </DialogTitle>
                <DialogDescription>
                  {editId ? 'Update the transaction details below.' : 'Enter the transaction details to add a new entry.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="text-gray-700 dark:text-gray-300 pb-1">Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="border-indigo-300 dark:border-indigo-700 focus:ring-indigo-500">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Income">Income</SelectItem>
                      <SelectItem value="Expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-700 dark:text-gray-300 pb-1">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="border-indigo-300 dark:border-indigo-700 focus:ring-indigo-500">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-700 dark:text-gray-300 pb-1">Amount</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount"
                    className="border-indigo-300 dark:border-indigo-700 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 dark:text-gray-300 pb-1">Date</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="border-indigo-300 dark:border-indigo-700 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 dark:text-gray-300 pb-1">Note</Label>
                  <Input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Note"
                    className="border-indigo-300 dark:border-indigo-700 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 dark:text-gray-300 pb-1">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="border-indigo-300 dark:border-indigo-700 focus:ring-indigo-500">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method} value={method}>{method}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Recurring</Label>
                  <input
                    type="checkbox"
                    checked={recurring}
                    onChange={(e) => setRecurring(e.target.checked)}
                    className="ml-2 accent-indigo-600 dark:accent-indigo-500"
                  />
                </div>
                {recurring && (
                  <div>
                    <Label className="text-gray-700 dark:text-gray-300 pb-1">Recurrence Interval</Label>
                    <Select value={recurrenceInterval} onValueChange={setRecurrenceInterval}>
                      <SelectTrigger className="border-indigo-300 dark:border-indigo-700 focus:ring-indigo-500">
                        <SelectValue placeholder="Select interval" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Daily">Daily</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white w-full transition-colors duration-300">
                  {editId ? 'Update' : 'Add'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <div className="mt-6 space-y-6">
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleExportCSV} className="bg-teal-600 hover:bg-teal-700 text-white transition-colors duration-300">
                Export CSV
              </Button>
              <Button onClick={handleExportPDF} className="bg-pink-600 hover:bg-pink-700 text-white transition-colors duration-300">
                Export PDF
              </Button>
              <Button onClick={handleSampleCSV} className="bg-amber-500 hover:bg-amber-600 dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-gray-900 transition-colors duration-300">
                <Download className="mr-2 h-4 w-4" /> Sample CSV
              </Button>
              <div>
                <Label htmlFor="import-csv" className="text-gray-700 dark:text-gray-300">Import CSV</Label>
                <Input id="import-csv" type="file" accept=".csv" onChange={handleImportCSV} className="border-indigo-300 dark:border-indigo-700 focus:ring-indigo-500" />
              </div>
              <Button onClick={fetchInsights} className="bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-300">
                Get AI Insights
              </Button>
            </div>
            {insights && (
              <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-gray-100">AI Financial Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{insights}</p>
                </CardContent>
              </Card>
            )}
            <Tabs defaultValue="table" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-lg">
              <TabsList className="bg-indigo-100 dark:bg-indigo-900/50">
                <TabsTrigger value="table" className="text-gray-900 dark:text-gray-100 data-[state=active]:bg-indigo-200 dark:data-[state=active]:bg-indigo-700 transition-colors duration-200">Table</TabsTrigger>
                <TabsTrigger value="charts" className="text-gray-900 dark:text-gray-100 data-[state=active]:bg-indigo-200 dark:data-[state=active]:bg-indigo-700 transition-colors duration-200">Charts</TabsTrigger>
                <TabsTrigger value="analytics" className="text-gray-900 dark:text-gray-100 data-[state=active]:bg-indigo-200 dark:data-[state=active]:bg-indigo-700 transition-colors duration-200">Analytics</TabsTrigger>
              </TabsList>
              <TabsContent value="table" className="p-4">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-indigo-50 dark:bg-indigo-900/50">
                      <TableHead className="text-gray-900 dark:text-gray-100">Type</TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-100">Category</TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-100">Amount</TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-100">Date</TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-100">Note</TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-100">Payment Method</TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-100">Recurring</TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-100">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((t) => (
                      <TableRow key={t._id} className="hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors duration-200">
                        <TableCell className="text-gray-900 dark:text-gray-100">{t.type}</TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">{t.category}</TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">{t.amount}</TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">{new Date(t.date).toLocaleDateString('en-GB')}</TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">{t.note}</TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">{t.paymentMethod}</TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">{t.recurring ? t.recurrenceInterval : 'No'}</TableCell>
                        <TableCell>
                          <Button variant="ghost" onClick={() => handleEdit(t)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" onClick={() => handleDelete(t._id)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="charts" className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-gray-900 dark:text-gray-100">Monthly Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Line data={lineChartData} options={{ responsive: true, plugins: { legend: { labels: { color: '#1f2937' } } } }} />
                    </CardContent>
                  </Card>
                  <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-gray-900 dark:text-gray-100">Income vs Expense</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Pie data={pieChartData} options={{ responsive: true, plugins: { legend: { labels: { color: '#1f2937' } } } }} />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="analytics" className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card className="bg-teal-100 dark:bg-teal-900/50">
                    <CardHeader>
                      <CardTitle className="text-teal-800 dark:text-teal-200">Total Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-teal-900 dark:text-teal-100">₹{analytics.totalIncome.toFixed(2)}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-red-100 dark:bg-red-900/50">
                    <CardHeader>
                      <CardTitle className="text-red-800 dark:text-red-200">Total Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-red-900 dark:text-red-100">₹{analytics.totalExpenses.toFixed(2)}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-indigo-100 dark:bg-indigo-900/50">
                    <CardHeader>
                      <CardTitle className="text-indigo-800 dark:text-indigo-200">Net Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">₹{analytics.netBalance.toFixed(2)}</p>
                    </CardContent>
                  </Card>
                </div>
                <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-gray-100">Spending by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Bar data={barChartData} options={{ responsive: true, plugins: { legend: { labels: { color: '#1f2937' } } } }} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;