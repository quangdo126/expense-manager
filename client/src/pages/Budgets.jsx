import { useState, useEffect } from 'react';
import { budgetsAPI, categoriesAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Budgets() {
    const { isAdmin } = useAuth();
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        categoryId: '',
        amount: '',
        period: 'monthly',
        alertThreshold: 80
    });
    const [toast, setToast] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [budgetData, catData] = await Promise.all([
                budgetsAPI.list(),
                categoriesAPI.list('expense')
            ]);
            setBudgets(budgetData.budgets);
            setCategories(catData.categories);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await budgetsAPI.create({
                ...formData,
                amount: parseFloat(formData.amount),
                alertThreshold: parseInt(formData.alertThreshold)
            });
            setToast({ type: 'success', message: 'Đã lưu ngân sách' });
            setShowForm(false);
            setFormData({ categoryId: '', amount: '', period: 'monthly', alertThreshold: 80 });
            loadData();
        } catch (err) {
            setToast({ type: 'error', message: err.message });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Xóa ngân sách này?')) return;
        try {
            await budgetsAPI.delete(id);
            setToast({ type: 'success', message: 'Đã xóa' });
            loadData();
        } catch (err) {
            setToast({ type: 'error', message: err.message });
        }
    };

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const formatAmount = (amount) => new Intl.NumberFormat('vi-VN').format(amount);

    // Filter categories that don't have budgets yet
    const availableCategories = categories.filter(
        c => !budgets.some(b => b.categoryId?._id === c._id)
    );

    if (loading) {
        return (
            <div className="page">
                <div className="container">
                    <div className="loading" style={{ paddingTop: '100px' }}>
                        <div className="spinner"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">Ngân sách</h1>
                    <p className="page-subtitle">Đặt giới hạn chi tiêu theo danh mục</p>
                </div>

                {/* Add Button */}
                {isAdmin && availableCategories.length > 0 && (
                    <button
                        className="btn btn-primary btn-block"
                        style={{ marginBottom: '20px' }}
                        onClick={() => setShowForm(true)}
                    >
                        + Thêm ngân sách
                    </button>
                )}

                {/* Budgets List */}
                {budgets.length === 0 ? (
                    <div className="card">
                        <div className="empty-state" style={{ padding: '30px' }}>
                            <div className="empty-icon">📊</div>
                            <p className="empty-text">Chưa có ngân sách nào</p>
                        </div>
                    </div>
                ) : (
                    budgets.map(budget => (
                        <div key={budget._id} className="card" style={{ marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                <div
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: budget.categoryId?.color || 'var(--accent-primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.25rem'
                                    }}
                                >
                                    {budget.categoryId?.icon || '📝'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600' }}>{budget.categoryId?.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {budget.period === 'monthly' ? 'Hàng tháng' : 'Hàng tuần'}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: '600' }}>{formatAmount(budget.spent || 0)}đ</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        / {formatAmount(budget.amount)}đ
                                    </div>
                                </div>
                                {isAdmin && (
                                    <button
                                        className="btn btn-ghost"
                                        style={{ color: 'var(--danger)' }}
                                        onClick={() => handleDelete(budget._id)}
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>

                            {/* Progress Bar */}
                            <div style={{
                                height: '8px',
                                background: 'var(--bg-tertiary)',
                                borderRadius: '4px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: `${Math.min(budget.percent || 0, 100)}%`,
                                    height: '100%',
                                    background: budget.isOverBudget
                                        ? 'var(--danger)'
                                        : budget.isNearLimit
                                            ? 'var(--warning)'
                                            : 'var(--success)',
                                    borderRadius: '4px',
                                    transition: 'width 0.3s ease'
                                }} />
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginTop: '8px',
                                fontSize: '0.75rem'
                            }}>
                                <span style={{
                                    color: budget.isOverBudget ? 'var(--danger)' : budget.isNearLimit ? 'var(--warning)' : 'var(--text-muted)'
                                }}>
                                    {budget.percent || 0}%
                                </span>
                                <span style={{ color: 'var(--text-muted)' }}>
                                    Còn: {formatAmount(Math.max(0, budget.amount - (budget.spent || 0)))}đ
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Thêm ngân sách</h3>
                            <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Danh mục</label>
                                <select
                                    className="form-input"
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    required
                                >
                                    <option value="">Chọn danh mục...</option>
                                    {availableCategories.map(cat => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.icon} {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Số tiền ngân sách</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="VD: 2000000"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Chu kỳ</label>
                                <div className="tabs">
                                    <button
                                        type="button"
                                        className={`tab ${formData.period === 'monthly' ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, period: 'monthly' })}
                                    >
                                        Hàng tháng
                                    </button>
                                    <button
                                        type="button"
                                        className={`tab ${formData.period === 'weekly' ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, period: 'weekly' })}
                                    >
                                        Hàng tuần
                                    </button>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary btn-block">Lưu</button>
                        </form>
                    </div>
                </div>
            )}

            {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
        </div>
    );
}
