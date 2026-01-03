import { useState, useEffect } from 'react';
import { transactionsAPI, categoriesAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';

export default function Transactions() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ type: '' });
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [editingTx, setEditingTx] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        loadTransactions();
    }, [filter, page]);

    const loadCategories = async () => {
        try {
            const data = await categoriesAPI.list();
            setCategories(data.categories);
        } catch (err) {
            console.error(err);
        }
    };

    const loadTransactions = async () => {
        setLoading(true);
        try {
            const params = { page, limit: 20 };
            if (filter.type) params.type = filter.type;

            const data = await transactionsAPI.list(params);
            setTransactions(data.transactions);
            setPagination(data.pagination);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await transactionsAPI.delete(id);
            setToast({ type: 'success', message: 'Đã xóa giao dịch' });
            loadTransactions();
        } catch (err) {
            setToast({ type: 'error', message: err.message });
        }
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('vi-VN', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit'
        });
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Clear toast
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // Group transactions by date
    const groupedTransactions = transactions.reduce((groups, tx) => {
        const date = new Date(tx.date).toDateString();
        if (!groups[date]) groups[date] = [];
        groups[date].push(tx);
        return groups;
    }, {});

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">Lịch sử giao dịch</h1>
                </div>

                {/* Filter Tabs */}
                <div className="tabs">
                    <button
                        className={`tab ${filter.type === '' ? 'active' : ''}`}
                        onClick={() => { setFilter({ type: '' }); setPage(1); }}
                    >
                        Tất cả
                    </button>
                    <button
                        className={`tab ${filter.type === 'expense' ? 'active' : ''}`}
                        onClick={() => { setFilter({ type: 'expense' }); setPage(1); }}
                    >
                        Chi tiêu
                    </button>
                    <button
                        className={`tab ${filter.type === 'income' ? 'active' : ''}`}
                        onClick={() => { setFilter({ type: 'income' }); setPage(1); }}
                    >
                        Thu nhập
                    </button>
                </div>

                {loading ? (
                    <div className="loading">
                        <div className="spinner"></div>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <p className="empty-text">Không có giao dịch nào</p>
                    </div>
                ) : (
                    <>
                        {Object.entries(groupedTransactions).map(([dateStr, txs]) => (
                            <div key={dateStr} style={{ marginBottom: '20px' }}>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--text-muted)',
                                    marginBottom: '10px',
                                    fontWeight: '600'
                                }}>
                                    {formatDate(dateStr)}
                                </div>

                                {txs.map(tx => (
                                    <div
                                        key={tx._id}
                                        className="transaction-item"
                                        onClick={() => setEditingTx(tx)}
                                        style={{ cursor: 'pointer' }}
                                    >
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
                                                <span>{formatTime(tx.date)}</span>
                                                {tx.description && <span>{tx.description}</span>}
                                            </div>
                                        </div>
                                        <div className={`transaction-amount amount-${tx.type}`}>
                                            {tx.type === 'expense' ? '-' : '+'}{formatAmount(tx.amount)}đ
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}

                        {/* Pagination */}
                        {pagination && pagination.pages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                                <button
                                    className="btn btn-secondary"
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                >
                                    Trước
                                </button>
                                <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: 'var(--text-secondary)'
                                }}>
                                    {page} / {pagination.pages}
                                </span>
                                <button
                                    className="btn btn-secondary"
                                    disabled={page === pagination.pages}
                                    onClick={() => setPage(p => p + 1)}
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Edit Modal */}
            {editingTx && (
                <div className="modal-overlay" onClick={() => setEditingTx(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Chi tiết giao dịch</h3>
                            <button className="modal-close" onClick={() => setEditingTx(null)}>×</button>
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <div style={{
                                fontSize: '3rem',
                                marginBottom: '12px'
                            }}>
                                {editingTx.categoryId?.icon || '📝'}
                            </div>
                            <div className={`amount amount-large amount-${editingTx.type}`}>
                                {editingTx.type === 'expense' ? '-' : '+'}{formatAmount(editingTx.amount)}đ
                            </div>
                            <div style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                                {editingTx.categoryId?.name}
                            </div>
                        </div>

                        <div style={{
                            background: 'var(--bg-tertiary)',
                            borderRadius: 'var(--radius-md)',
                            padding: '16px',
                            marginBottom: '20px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Người tạo</span>
                                <span>{editingTx.userId?.displayName}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Ngày</span>
                                <span>{new Date(editingTx.date).toLocaleDateString('vi-VN')}</span>
                            </div>
                            {editingTx.rawInput && (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Tin nhắn gốc</span>
                                    <span>"{editingTx.rawInput}"</span>
                                </div>
                            )}
                        </div>

                        {(editingTx.userId?._id === user?._id || user?.role === 'admin') && (
                            <button
                                className="btn btn-danger btn-block"
                                onClick={() => {
                                    setDeletingId(editingTx._id);
                                    setEditingTx(null);
                                }}
                            >
                                Xóa giao dịch
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className={`toast ${toast.type}`}>
                    {toast.message}
                </div>
            )}

            {/* Delete Confirm Modal */}
            <ConfirmModal
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={() => handleDelete(deletingId)}
                title="Xóa giao dịch"
                message="Bạn có chắc muốn xóa giao dịch này?"
                confirmText="Xóa"
                cancelText="Hủy"
                type="danger"
            />
        </div>
    );
}
