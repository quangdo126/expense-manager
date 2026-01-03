import { useState, useEffect } from 'react';
import { transactionsAPI, categoriesAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const { user, family } = useAuth();
    const [input, setInput] = useState('');
    const [preview, setPreview] = useState(null);
    const [categories, setCategories] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Load initial data
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [catData, txData] = await Promise.all([
                categoriesAPI.list(),
                transactionsAPI.list({ limit: 5 })
            ]);
            setCategories(catData.categories);
            setRecentTransactions(txData.transactions);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Parse input as user types
    useEffect(() => {
        const timer = setTimeout(() => {
            if (input.trim()) {
                parseInput(input);
            } else {
                setPreview(null);
                setSelectedCategory(null);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [input]);

    const parseInput = async (text) => {
        try {
            const result = await transactionsAPI.parse(text);
            setPreview(result);
            setSelectedCategory(result.category);
        } catch (err) {
            setPreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!preview || !selectedCategory) return;

        setSubmitting(true);
        try {
            await transactionsAPI.create({
                input,
                categoryId: selectedCategory._id
            });

            setToast({ type: 'success', message: 'Đã thêm giao dịch!' });
            setInput('');
            setPreview(null);
            setSelectedCategory(null);

            // Reload transactions
            const txData = await transactionsAPI.list({ limit: 5 });
            setRecentTransactions(txData.transactions);
        } catch (err) {
            setToast({ type: 'error', message: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    // Clear toast after 3s
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit'
        });
    };

    return (
        <div className="page">
            <div className="container">
                {/* Header */}
                <div className="page-header">
                    <h1 className="page-title">Xin chào, {user?.displayName}!</h1>
                    <p className="page-subtitle">{family?.name}</p>
                </div>

                {/* Chat Input */}
                <div className="card" style={{ marginBottom: '20px' }}>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            className="form-input form-input-large"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder='Nhập "xăng 50k" hoặc "siêu thị 1tr2"'
                            autoFocus
                        />

                        {/* Preview */}
                        {preview && (
                            <div style={{ marginTop: '20px' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '16px'
                                }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>
                                        {preview.type === 'expense' ? 'Chi tiêu' : 'Thu nhập'}
                                    </span>
                                    <span className={`amount amount-large amount-${preview.type}`}>
                                        {preview.type === 'expense' ? '-' : '+'}{formatAmount(preview.amount)}
                                    </span>
                                </div>

                                {/* Category Selection */}
                                <p style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--text-muted)',
                                    marginBottom: '8px'
                                }}>
                                    Chọn danh mục:
                                </p>
                                <div className="category-grid">
                                    {preview.allCategories?.map(cat => (
                                        <button
                                            key={cat._id}
                                            type="button"
                                            className={`category-option ${selectedCategory?._id === cat._id ? 'selected' : ''}`}
                                            onClick={() => setSelectedCategory(cat)}
                                        >
                                            <span className="category-option-icon">{cat.icon}</span>
                                            <span className="category-option-name">{cat.name}</span>
                                        </button>
                                    ))}
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-block"
                                    style={{ marginTop: '20px' }}
                                    disabled={submitting || !selectedCategory}
                                >
                                    {submitting ? 'Đang lưu...' : 'Xác nhận'}
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                {/* Recent Transactions */}
                <div className="card">
                    <h3 className="card-title">📋 Giao dịch gần đây</h3>

                    {loading ? (
                        <div className="loading">
                            <div className="spinner"></div>
                        </div>
                    ) : recentTransactions.length === 0 ? (
                        <div className="empty-state" style={{ padding: '30px' }}>
                            <p className="empty-text">Chưa có giao dịch nào</p>
                        </div>
                    ) : (
                        recentTransactions.map(tx => (
                            <div key={tx._id} className="transaction-item">
                                <div
                                    className="transaction-icon"
                                    style={{ background: tx.categoryId?.color || 'var(--accent-primary)' }}
                                >
                                    {tx.categoryId?.icon || '📝'}
                                </div>
                                <div className="transaction-info">
                                    <div className="transaction-category">
                                        {tx.categoryId?.name || 'Khác'}
                                    </div>
                                    <div className="transaction-meta">
                                        <span>{tx.userId?.displayName}</span>
                                        <span>{formatDate(tx.date)}</span>
                                    </div>
                                </div>
                                <div className={`transaction-amount amount-${tx.type}`}>
                                    {tx.type === 'expense' ? '-' : '+'}{formatAmount(tx.amount)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className={`toast ${toast.type}`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
}
