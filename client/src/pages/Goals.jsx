import { useState, useEffect } from 'react';
import { goalsAPI } from '../api';
import IconPicker from '../components/IconPicker';
import ConfirmModal from '../components/ConfirmModal';

export default function Goals() {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showContribute, setShowContribute] = useState(null);
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        targetAmount: '',
        deadline: '',
        icon: '🎯',
        color: '#6366f1'
    });
    const [contributeAmount, setContributeAmount] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        loadGoals();
    }, []);

    const loadGoals = async () => {
        try {
            const data = await goalsAPI.list();
            setGoals(data.goals);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await goalsAPI.create({
                ...formData,
                targetAmount: parseFloat(formData.targetAmount)
            });
            setToast({ type: 'success', message: 'Tạo mục tiêu thành công' });
            resetForm();
            loadGoals();
        } catch (err) {
            setToast({ type: 'error', message: err.message });
        }
    };

    const handleContribute = async (goalId) => {
        if (!contributeAmount) return;
        try {
            await goalsAPI.contribute(goalId, { amount: parseFloat(contributeAmount) });
            setToast({ type: 'success', message: 'Đã thêm tiền tiết kiệm' });
            setShowContribute(null);
            setContributeAmount('');
            loadGoals();
        } catch (err) {
            setToast({ type: 'error', message: err.message });
        }
    };

    const handleDelete = async (id) => {
        try {
            await goalsAPI.delete(id);
            setToast({ type: 'success', message: 'Đã xóa' });
            loadGoals();
        } catch (err) {
            setToast({ type: 'error', message: err.message });
        }
    };

    const resetForm = () => {
        setFormData({ name: '', targetAmount: '', deadline: '', icon: '🎯', color: '#6366f1' });
        setShowForm(false);
    };

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const formatAmount = (amount) => new Intl.NumberFormat('vi-VN').format(amount);

    const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'];

    const activeGoals = goals.filter(g => g.status === 'active');
    const completedGoals = goals.filter(g => g.status === 'completed');

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
                    <h1 className="page-title">Mục tiêu tiết kiệm</h1>
                    <p className="page-subtitle">Theo dõi tiến độ tiết kiệm</p>
                </div>

                <button
                    className="btn btn-primary btn-block"
                    style={{ marginBottom: '20px' }}
                    onClick={() => setShowForm(true)}
                >
                    + Tạo mục tiêu mới
                </button>

                {/* Active Goals */}
                {activeGoals.length > 0 && (
                    <>
                        <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                            Đang thực hiện ({activeGoals.length})
                        </h3>
                        {activeGoals.map(goal => {
                            const percent = (goal.currentAmount / goal.targetAmount) * 100;
                            return (
                                <div key={goal._id} className="card" style={{ marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                        <div
                                            style={{
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '12px',
                                                background: goal.color,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.5rem'
                                            }}
                                        >
                                            {goal.icon}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '600', fontSize: '1rem' }}>{goal.name}</div>
                                            {goal.deadline && (
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    Hạn: {new Date(goal.deadline).toLocaleDateString('vi-VN')}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            className="btn btn-primary"
                                            style={{ padding: '8px 16px' }}
                                            onClick={() => setShowContribute(goal)}
                                        >
                                            + Thêm
                                        </button>
                                    </div>

                                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                                            {formatAmount(goal.currentAmount)}
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                            / {formatAmount(goal.targetAmount)}
                                        </div>
                                    </div>

                                    {/* Progress */}
                                    <div style={{
                                        height: '12px',
                                        background: 'var(--bg-tertiary)',
                                        borderRadius: '6px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${Math.min(percent, 100)}%`,
                                            height: '100%',
                                            background: `linear-gradient(90deg, ${goal.color}, ${goal.color}dd)`,
                                            borderRadius: '6px',
                                            transition: 'width 0.3s ease'
                                        }} />
                                    </div>
                                    <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '0.875rem', fontWeight: '600' }}>
                                        {percent.toFixed(1)}%
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}

                {/* Completed Goals */}
                {completedGoals.length > 0 && (
                    <>
                        <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '12px', marginTop: '24px' }}>
                            ✅ Đã hoàn thành ({completedGoals.length})
                        </h3>
                        {completedGoals.map(goal => (
                            <div key={goal._id} className="transaction-item" style={{ opacity: 0.7 }}>
                                <div
                                    className="transaction-icon"
                                    style={{ background: 'var(--success)' }}
                                >
                                    ✓
                                </div>
                                <div className="transaction-info">
                                    <div className="transaction-category">{goal.name}</div>
                                    <div className="transaction-meta">
                                        <span>{formatAmount(goal.targetAmount)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {goals.length === 0 && (
                    <div className="card">
                        <div className="empty-state" style={{ padding: '30px' }}>
                            <div className="empty-icon">🎯</div>
                            <p className="empty-text">Chưa có mục tiêu nào</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Tạo mục tiêu</h3>
                            <button className="modal-close" onClick={resetForm}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowIconPicker(true)}
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        fontSize: '2rem',
                                        background: formData.color,
                                        borderRadius: 'var(--radius-md)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        border: 'none'
                                    }}
                                >
                                    {formData.icon}
                                </button>
                                <div style={{ flex: 1 }}>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Tên mục tiêu (VD: Mua xe)"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Số tiền mục tiêu</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.targetAmount}
                                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                                    placeholder="VD: 30000000"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Màu sắc</label>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {COLORS.map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, color })}
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                background: color,
                                                border: formData.color === color ? '3px solid white' : 'none',
                                                cursor: 'pointer'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Hạn hoàn thành (tùy chọn)</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-block">Tạo</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Contribute Modal */}
            {showContribute && (
                <div className="modal-overlay" onClick={() => setShowContribute(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Thêm tiền tiết kiệm</h3>
                            <button className="modal-close" onClick={() => setShowContribute(null)}>×</button>
                        </div>
                        <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                            {showContribute.name} - Còn thiếu: <strong>{formatAmount(showContribute.targetAmount - showContribute.currentAmount)}</strong>
                        </p>
                        <div className="form-group">
                            <label className="form-label">Số tiền</label>
                            <input
                                type="number"
                                className="form-input"
                                value={contributeAmount}
                                onChange={(e) => setContributeAmount(e.target.value)}
                            />
                        </div>
                        <button
                            className="btn btn-primary btn-block"
                            onClick={() => handleContribute(showContribute._id)}
                        >
                            Thêm
                        </button>
                    </div>
                </div>
            )}

            {showIconPicker && (
                <IconPicker
                    value={formData.icon}
                    onChange={(icon) => setFormData({ ...formData, icon })}
                    onClose={() => setShowIconPicker(false)}
                />
            )}

            {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}

            {/* Delete Confirm Modal */}
            <ConfirmModal
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={() => handleDelete(deletingId)}
                title="Xóa mục tiêu"
                message="Bạn có chắc muốn xóa mục tiêu này?"
                confirmText="Xóa"
                cancelText="Hủy"
                type="danger"
            />
        </div>
    );
}
