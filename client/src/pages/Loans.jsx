import { useState, useEffect } from 'react';
import { loansAPI } from '../api';
import ConfirmModal from '../components/ConfirmModal';

export default function Loans() {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showPayment, setShowPayment] = useState(null);
    const [activeTab, setActiveTab] = useState('borrow');
    const [formData, setFormData] = useState({
        type: 'borrow',
        personName: '',
        amount: '',
        interestRate: '',
        dueDate: '',
        note: ''
    });
    const [paymentAmount, setPaymentAmount] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        loadLoans();
    }, []);

    const loadLoans = async () => {
        try {
            const data = await loansAPI.list();
            setLoans(data.loans);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await loansAPI.create({
                ...formData,
                amount: parseFloat(formData.amount),
                interestRate: parseFloat(formData.interestRate) || 0
            });
            setToast({ type: 'success', message: 'Tạo khoản vay thành công' });
            resetForm();
            loadLoans();
        } catch (err) {
            setToast({ type: 'error', message: err.message });
        }
    };

    const handlePayment = async (loanId) => {
        if (!paymentAmount) return;
        try {
            await loansAPI.payment(loanId, { amount: parseFloat(paymentAmount) });
            setToast({ type: 'success', message: 'Ghi nhận thanh toán thành công' });
            setShowPayment(null);
            setPaymentAmount('');
            loadLoans();
        } catch (err) {
            setToast({ type: 'error', message: err.message });
        }
    };

    const handleDelete = async (id) => {
        try {
            await loansAPI.delete(id);
            setToast({ type: 'success', message: 'Đã xóa' });
            loadLoans();
        } catch (err) {
            setToast({ type: 'error', message: err.message });
        }
    };

    const resetForm = () => {
        setFormData({ type: 'borrow', personName: '', amount: '', interestRate: '', dueDate: '', note: '' });
        setShowForm(false);
    };

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const formatAmount = (amount) => new Intl.NumberFormat('vi-VN').format(amount);

    const filteredLoans = loans.filter(l => l.type === activeTab);

    const totals = filteredLoans.reduce((acc, l) => ({
        total: acc.total + l.amount,
        remaining: acc.remaining + l.remainingAmount
    }), { total: 0, remaining: 0 });

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
                    <h1 className="page-title">Khoản vay</h1>
                    <p className="page-subtitle">Quản lý vay và cho vay</p>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'borrow' ? 'active' : ''}`}
                        onClick={() => setActiveTab('borrow')}
                    >
                        🔴 Đang vay ({loans.filter(l => l.type === 'borrow').length})
                    </button>
                    <button
                        className={`tab ${activeTab === 'lend' ? 'active' : ''}`}
                        onClick={() => setActiveTab('lend')}
                    >
                        🟢 Cho vay ({loans.filter(l => l.type === 'lend').length})
                    </button>
                </div>

                {/* Summary */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-label">Tổng</div>
                        <div className="stat-value">{formatAmount(totals.total)}đ</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Còn lại</div>
                        <div className="stat-value" style={{ color: 'var(--warning)' }}>
                            {formatAmount(totals.remaining)}đ
                        </div>
                    </div>
                </div>

                {/* Add Button */}
                <button
                    className="btn btn-primary btn-block"
                    style={{ marginBottom: '20px' }}
                    onClick={() => {
                        setFormData({ ...formData, type: activeTab });
                        setShowForm(true);
                    }}
                >
                    + Thêm khoản {activeTab === 'borrow' ? 'vay' : 'cho vay'}
                </button>

                {/* Loans List */}
                <div className="card">
                    {filteredLoans.length === 0 ? (
                        <div className="empty-state" style={{ padding: '30px' }}>
                            <p className="empty-text">Chưa có khoản vay nào</p>
                        </div>
                    ) : (
                        filteredLoans.map(loan => (
                            <div key={loan._id} className="transaction-item">
                                <div
                                    className="transaction-icon"
                                    style={{ background: loan.status === 'completed' ? 'var(--success)' : loan.status === 'overdue' ? 'var(--danger)' : 'var(--warning)' }}
                                >
                                    {loan.status === 'completed' ? '✓' : loan.type === 'borrow' ? '📥' : '📤'}
                                </div>
                                <div className="transaction-info">
                                    <div className="transaction-category">{loan.personName}</div>
                                    <div className="transaction-meta">
                                        <span>{loan.status === 'completed' ? 'Đã trả' : loan.status === 'overdue' ? 'Quá hạn' : 'Đang nợ'}</span>
                                        {loan.dueDate && <span>Hạn: {new Date(loan.dueDate).toLocaleDateString('vi-VN')}</span>}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div className="transaction-amount" style={{ color: loan.remainingAmount > 0 ? 'var(--warning)' : 'var(--success)' }}>
                                        {formatAmount(loan.remainingAmount)}đ
                                    </div>
                                    <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                                        / {formatAmount(loan.amount)}đ
                                    </div>
                                </div>
                                {loan.status !== 'completed' && (
                                    <button
                                        className="btn btn-secondary"
                                        style={{ padding: '8px 12px', marginLeft: '8px' }}
                                        onClick={() => setShowPayment(loan)}
                                    >
                                        💰
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Thêm khoản {formData.type === 'borrow' ? 'vay' : 'cho vay'}</h3>
                            <button className="modal-close" onClick={resetForm}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Tên người {formData.type === 'borrow' ? 'cho vay' : 'vay'}</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.personName}
                                    onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Số tiền</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Ngày đáo hạn (tùy chọn)</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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

            {/* Payment Modal */}
            {showPayment && (
                <div className="modal-overlay" onClick={() => setShowPayment(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Ghi nhận thanh toán</h3>
                            <button className="modal-close" onClick={() => setShowPayment(null)}>×</button>
                        </div>
                        <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                            Còn nợ: <strong>{formatAmount(showPayment.remainingAmount)}đ</strong>
                        </p>
                        <div className="form-group">
                            <label className="form-label">Số tiền thanh toán</label>
                            <input
                                type="number"
                                className="form-input"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                max={showPayment.remainingAmount}
                            />
                        </div>
                        <button
                            className="btn btn-primary btn-block"
                            onClick={() => handlePayment(showPayment._id)}
                        >
                            Xác nhận
                        </button>
                    </div>
                </div>
            )}

            {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}

            {/* Delete Confirm Modal */}
            <ConfirmModal
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={() => handleDelete(deletingId)}
                title="Xóa khoản vay"
                message="Bạn có chắc muốn xóa khoản vay này?"
                confirmText="Xóa"
                cancelText="Hủy"
                type="danger"
            />
        </div>
    );
}
