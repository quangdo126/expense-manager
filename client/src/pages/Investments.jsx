import { useState, useEffect } from 'react';
import { investmentsAPI } from '../api';

const INVESTMENT_TYPES = {
    stock: { label: 'Cổ phiếu', icon: '📈' },
    crypto: { label: 'Crypto', icon: '🪙' },
    gold: { label: 'Vàng', icon: '🥇' },
    savings: { label: 'Tiết kiệm', icon: '🏦' },
    realestate: { label: 'Bất động sản', icon: '🏠' },
    other: { label: 'Khác', icon: '💼' }
};

export default function Investments() {
    const [investments, setInvestments] = useState([]);
    const [totals, setTotals] = useState({});
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showUpdate, setShowUpdate] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'other',
        investedAmount: '',
        currentValue: '',
        note: ''
    });
    const [newValue, setNewValue] = useState('');
    const [toast, setToast] = useState(null);

    useEffect(() => {
        loadInvestments();
    }, []);

    const loadInvestments = async () => {
        try {
            const data = await investmentsAPI.list();
            setInvestments(data.investments);
            setTotals(data.totals);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await investmentsAPI.create({
                ...formData,
                investedAmount: parseFloat(formData.investedAmount),
                currentValue: parseFloat(formData.currentValue) || parseFloat(formData.investedAmount)
            });
            setToast({ type: 'success', message: 'Tạo khoản đầu tư thành công' });
            resetForm();
            loadInvestments();
        } catch (err) {
            setToast({ type: 'error', message: err.message });
        }
    };

    const handleUpdateValue = async (investmentId) => {
        if (!newValue) return;
        try {
            await investmentsAPI.update(investmentId, { currentValue: parseFloat(newValue) });
            setToast({ type: 'success', message: 'Đã cập nhật giá trị' });
            setShowUpdate(null);
            setNewValue('');
            loadInvestments();
        } catch (err) {
            setToast({ type: 'error', message: err.message });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Xóa khoản đầu tư này?')) return;
        try {
            await investmentsAPI.delete(id);
            setToast({ type: 'success', message: 'Đã xóa' });
            loadInvestments();
        } catch (err) {
            setToast({ type: 'error', message: err.message });
        }
    };

    const resetForm = () => {
        setFormData({ name: '', type: 'other', investedAmount: '', currentValue: '', note: '' });
        setShowForm(false);
    };

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const formatAmount = (amount) => new Intl.NumberFormat('vi-VN').format(amount);

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
                    <h1 className="page-title">Đầu tư</h1>
                    <p className="page-subtitle">Theo dõi các khoản đầu tư</p>
                </div>

                {/* Summary Cards */}
                <div className="stats-grid" style={{ marginBottom: '20px' }}>
                    <div className="stat-card">
                        <div className="stat-label">Tổng đầu tư</div>
                        <div className="stat-value">{formatAmount(totals.totalInvested || 0)}đ</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Giá trị hiện tại</div>
                        <div className="stat-value">{formatAmount(totals.totalValue || 0)}đ</div>
                    </div>
                    <div className="stat-card" style={{ gridColumn: 'span 2' }}>
                        <div className="stat-label">Lợi nhuận</div>
                        <div className="stat-value" style={{
                            color: (totals.totalProfit || 0) >= 0 ? 'var(--success)' : 'var(--danger)'
                        }}>
                            {(totals.totalProfit || 0) >= 0 ? '+' : ''}{formatAmount(totals.totalProfit || 0)}đ
                            <span style={{ fontSize: '0.875rem', marginLeft: '8px' }}>
                                ({totals.profitPercent || 0}%)
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    className="btn btn-primary btn-block"
                    style={{ marginBottom: '20px' }}
                    onClick={() => setShowForm(true)}
                >
                    + Thêm khoản đầu tư
                </button>

                {/* Investments List */}
                {investments.length === 0 ? (
                    <div className="card">
                        <div className="empty-state" style={{ padding: '30px' }}>
                            <div className="empty-icon">📊</div>
                            <p className="empty-text">Chưa có khoản đầu tư nào</p>
                        </div>
                    </div>
                ) : (
                    investments.map(inv => {
                        const profit = inv.currentValue - inv.investedAmount;
                        const profitPercent = inv.investedAmount > 0 ? (profit / inv.investedAmount * 100).toFixed(1) : 0;

                        return (
                            <div key={inv._id} className="card" style={{ marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '12px',
                                        background: profit >= 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.25rem'
                                    }}>
                                        {INVESTMENT_TYPES[inv.type]?.icon || '💼'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '600' }}>{inv.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {INVESTMENT_TYPES[inv.type]?.label} • Vốn: {formatAmount(inv.investedAmount)}đ
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: '600' }}>{formatAmount(inv.currentValue)}đ</div>
                                        <div style={{
                                            fontSize: '0.75rem',
                                            color: profit >= 0 ? 'var(--success)' : 'var(--danger)'
                                        }}>
                                            {profit >= 0 ? '+' : ''}{formatAmount(profit)}đ ({profitPercent}%)
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                    <button
                                        className="btn btn-secondary"
                                        style={{ flex: 1, padding: '8px' }}
                                        onClick={() => {
                                            setNewValue(inv.currentValue.toString());
                                            setShowUpdate(inv);
                                        }}
                                    >
                                        Cập nhật giá
                                    </button>
                                    <button
                                        className="btn btn-ghost"
                                        style={{ color: 'var(--danger)' }}
                                        onClick={() => handleDelete(inv._id)}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Thêm đầu tư</h3>
                            <button className="modal-close" onClick={resetForm}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Tên</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="VD: Cổ phiếu VNM"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Loại</label>
                                <select
                                    className="form-input"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    {Object.entries(INVESTMENT_TYPES).map(([key, { label, icon }]) => (
                                        <option key={key} value={key}>{icon} {label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Số tiền đầu tư</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.investedAmount}
                                    onChange={(e) => setFormData({ ...formData, investedAmount: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Giá trị hiện tại (tùy chọn)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.currentValue}
                                    onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                                    placeholder="Mặc định = số tiền đầu tư"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Ghi chú</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.note}
                                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-block">Tạo</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Update Value Modal */}
            {showUpdate && (
                <div className="modal-overlay" onClick={() => setShowUpdate(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Cập nhật giá trị</h3>
                            <button className="modal-close" onClick={() => setShowUpdate(null)}>×</button>
                        </div>
                        <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                            {showUpdate.name}
                        </p>
                        <div className="form-group">
                            <label className="form-label">Giá trị hiện tại</label>
                            <input
                                type="number"
                                className="form-input"
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                            />
                        </div>
                        <button
                            className="btn btn-primary btn-block"
                            onClick={() => handleUpdateValue(showUpdate._id)}
                        >
                            Cập nhật
                        </button>
                    </div>
                </div>
            )}

            {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
        </div>
    );
}
