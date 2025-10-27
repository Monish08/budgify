# Budgify

Budgify is a personal finance management application that helps users track income and expenses, import/export transactions via CSV, and gain actionable financial insights using Mistral AI. It features a React frontend and a Node.js/Express backend with MongoDB for data storage.

## Features
- **User Authentication**: Register and log in to manage personal transactions securely.
- **Transaction Management**: Add, edit, delete, and view transactions (income/expense) with details like category, amount, date, and recurrence.
- **CSV Import/Export**: Import transactions from a CSV file and export them as CSV or PDF.
- **AI-Powered Insights**: Generate financial insights using Mistral AI based on transaction data (e.g., net balance, spending trends).
- **Analytics**: View total income, expenses, net balance, category breakdown, and monthly trends.
- **Responsive UI**: Built with React and Tailwind CSS for a modern, user-friendly interface.

## Project Structure
```
Budgify/
├── frontend/                # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── contexts/       # AuthContext for user authentication
│   │   ├── pages/          # Home, Dashboard, etc.
│   │   └── ...
│   ├── .gitignore          # Ignores node_modules, .env, dist, etc.
│   ├── package.json
│   └── vite.config.js
├── backend/                # Node.js/Express backend
│   ├── routes/             # API routes (authRoutes.js, transactionRoutes.js)
│   ├── models/             # MongoDB schemas (User.js, Transaction.js)
│   ├── middleware/         # Authentication middleware
│   ├── .gitignore          # Ignores node_modules, .env, etc.
│   ├── index.js
│   └── package.json
├── .gitignore              # Root .gitignore for the entire project
└── README.md               # This file
```

## Prerequisites
- **Node.js** (v22.17.1 or later): Install from [nodejs.org](https://nodejs.org).
- **MongoDB Atlas**: Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
- **Mistral AI API Key**: Obtain from [console.mistral.ai](https://console.mistral.ai).
- **Git**: For version control.

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/budgify.git
cd budgify
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in `backend/`:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_random_secret_32_chars_long
   MISTRAL_API_KEY=your_mistral_api_key
   ```
   - Replace `MONGO_URI` with your MongoDB Atlas connection string.
   - Generate a secure `JWT_SECRET` (e.g., `openssl rand -hex 16`).
   - Get `MISTRAL_API_KEY` from Mistral AI’s console.
4. Start the backend:
   ```bash
   node index.js
   ```
   - Should log: `Server running on port 5000` and `MongoDB connected`.

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev -- --host
   ```
   - Access at `http://localhost:5173`.

### 4. Verify Setup
- Open `http://localhost:5173` in your browser.
- Register a new user or log in with test credentials (e.g., `test1@test.com`, password: `test1`).
- Ensure the backend is running at `http://localhost:5000`.

## Usage
1. **Register/Login**: Create an account or log in at `http://localhost:5173`.
2. **Add Transactions**: On the dashboard, add income or expense transactions manually.
3. **Import CSV**: Upload a CSV file with the format:
   ```csv
   type,category,amount,date,note,paymentMethod,recurring,recurrenceInterval
   Income,Salary,1000,14-10-2025,Monthly salary,Cash,TRUE,Monthly
   Expense,Food,50,14-10-2025,Groceries,Card,FALSE,
   ```
4. **Export Transactions**: Download transactions as CSV or PDF from the dashboard.
5. **View Analytics**: Check total income, expenses, and category breakdown.
6. **Get AI Insights**: Click “Get AI Insights” to receive Mistral AI-powered financial advice based on your transactions.

## API Endpoints
- **Auth**:
  - `POST /api/auth/register`: Register a new user.
  - `POST /api/auth/login`: Log in and receive a JWT token.
- **Transactions**:
  - `GET /api/transactions`: Fetch all transactions for the authenticated user.
  - `POST /api/transactions`: Create a new transaction.
  - `PUT /api/transactions/:id`: Update a transaction.
  - `DELETE /api/transactions/:id`: Delete a transaction.
  - `GET /api/transactions/analytics`: Get financial analytics.
  - `GET /api/transactions/export/csv`: Export transactions as CSV.
  - `GET /api/transactions/export/pdf`: Export transactions as PDF.
  - `GET /api/transactions/sample/csv`: Download a sample CSV.
  - `POST /api/transactions/import/csv`: Import transactions from CSV.
  - `GET /api/transactions/ai-insights`: Generate AI-powered financial insights.

## Security Notes
- **Do not commit `.env` files**: Ensure `.env` is listed in `frontend/.gitignore`, `backend/.gitignore`, and the root `.gitignore`.
- **Regenerate sensitive keys**: Update `MISTRAL_API_KEY`, `MONGO_URI`, and `JWT_SECRET` before deployment.
- **MongoDB Atlas**: Use a secure password and whitelist your IP in MongoDB Atlas.

## Troubleshooting
- **Login Errors**: Check backend logs for `Password match: false` and verify credentials.
- **CSV Import Errors**: Ensure CSV format matches the sample and `recurrenceInterval` is one of `Daily`, `Weekly`, `Monthly`, `Quarterly`, or `Yearly`.
- **AI Insights Errors**: Verify `MISTRAL_API_KEY` and check backend logs for `Mistral API error`.
- **MongoDB Connection**: Confirm `MONGO_URI` and network access in MongoDB Atlas.


