import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Import routes
import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';
import categoryRoutes from './routes/categories.js';
import familyRoutes from './routes/family.js';
import reportRoutes from './routes/reports.js';
import pushRoutes from './routes/push.js';
import loanRoutes from './routes/loans.js';
import budgetRoutes from './routes/budgets.js';
import goalRoutes from './routes/goals.js';
import investmentRoutes from './routes/investments.js';
import recurringRoutes from './routes/recurring.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/recurring', recurringRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Không tìm thấy API endpoint' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Lỗi server nội bộ' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
