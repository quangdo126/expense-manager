import { useState, useEffect } from 'react';
import { recurringAPI, categoriesAPI } from '../api';
import ConfirmModal from '../components/ConfirmModal';
import CustomSelect from '../components/CustomSelect';
import { Icons } from '../components/Icons';

const FREQUENCY_LABELS = {
    daily: 'Hàng ngày',
    weekly: 'Hàng tuần',
    monthly: 'Hàng tháng',
    yearly: 'Hàng năm'
};

export default function Recurring() {
    const [recurring, setRecurring] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        categoryId: '',
        type: 'expense',
        amount: '',
        description: '',
        frequency: 'monthly',
        dayOfMonth: 1
    });
    const [deletingId, setDeletingId] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [recData, catData] = await Promise.all([
                recurringAPI.list(),
                categoriesAPI.list()
            ]);
            setRecurring(recData.recurring);
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
            await recurringAPI.create({
                ...formData,
                amount: parseFloat(formData.amount),
                dayOfMonth: parseInt(formData.dayOfMonth)
            });
            setToast({ type: 'success', message: 'Tạo giao dịch định kỳ thành công' });
            resetForm();
            loadData();
        } catch (err) {
            setToast({ type: 'error', message: err.message });
        }
    };

    const handleRun = async (id) => {
        try {
            await recurringAPI.run(id);
            setToast({ type: 'success', message: 'Đã tạo giao dịch' });
            loadData();
        } catch (err) {
            setToast({ type: 'error', message: err.message });
        }
    };

    const handleToggle = async (id, isActive) => {
        try {
            await recurringAPI.update(id, { isActive: !isActive });
            setToast({ type: 'success', message: isActive ? 'Đã tạm dừng' : 'Đã kích hoạt' });
            loadData();
        } catch (err) {
            setToast({ type: 'error', message: err.message });
        }
    };

    const handleDelete = async (id) => {
        try {
            await recurringAPI.delete(id);
            setToast({ type: 'success', message: 'Đã xóa' });
            loadData();
        } catch (err) {
            setToast({ type: 'error', message: err.message });
        }
    };

    const resetForm = () => {
        setFormData({
            categoryId: '',
            type: 'expense',
            amount: '',
            description: '',
            frequency: 'monthly',
            dayOfMonth: 1
        });
        setShowForm(false);
    };

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const formatAmount = (amount) => new Intl.NumberFormat('vi-VN').format(amount);

    const filteredCategories = categories.filter(c => c.type === formData.type);

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
                    <h1 className="page-title">Giao dịch định kỳ</h1>
                    <p className="page-subtitle">Tự động hóa các khoản thu chi thường xuyên</p>
                </div>

                <button
                    className="btn btn-primary btn-block"
                    style={{ marginBottom: '20px' }}
                    onClick={() => setShowForm(true)}
                >
                    + Thêm giao dịch định kỳ
                </button>

                {recurring.length === 0 ? (
                    <div className="card">
                        <div className="empty-state" style={{ padding: '30px' }}>
                            <div className="empty-icon">🔄</div>
                            <p className="empty-text">Chưa có giao dịch định kỳ</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                VD: Tiền điện, tiền nước, lương hàng tháng...
                            </p>
                        </div>
                    </div>
                ) : (
                    recurring.map(rec => (
                        <div
                            key={rec._id}
                            className="card"
                            style={{
                                marginBottom: '12px',
                                opacity: rec.isActive ? 1 : 0.6
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '12px',
                                    background: rec.categoryId?.color || 'var(--accent-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.25rem'
                                }}>
                                    {rec.categoryId?.icon || '🔄'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600' }}>
                                        {rec.description || rec.categoryId?.name}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {FREQUENCY_LABELS[rec.frequency]}
                                        {rec.frequency === 'monthly' && ` • Ngày ${rec.dayOfMonth}`}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{
                                        fontWeight: '600',
                                        color: rec.type === 'expense' ? 'var(--danger)' : 'var(--success)'
                                    }}>
                                        {rec.type === 'expense' ? '-' : '+'}{formatAmount(rec.amount)}đ
                                    </div>
                                    <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                                        Lần tới: {new Date(rec.nextRun).toLocaleDateString('vi-VN')}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center' }}>
                                <button
                                    className="btn btn-secondary"
                                    style={{ flex: 1, padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                    onClick={() => handleRun(rec._id)}
                                >
                                    <Icons.playCircle style={{ width: '16px', height: '16px' }} />
                                    Chạy ngay
                                </button>
                                <button
                                    className={`btn ${rec.isActive ? 'btn-secondary' : 'btn-primary'}`}
                                    style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    onClick={() => handleToggle(rec._id, rec.isActive)}
                                    title={rec.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                                >
                                    {rec.isActive ? (
                                        <><Icons.pause style={{ width: '14px', height: '14px' }} /> Dừng</>
                                    ) : (
                                        <><Icons.play style={{ width: '14px', height: '14px' }} /> Chạy</>
                                    )}
                                </button>
                                <button
                                    className="btn btn-ghost"
                                    style={{ color: 'var(--danger)', padding: '8px' }}
                                    onClick={() => setDeletingId(rec._id)}
                                    title="Xóa"
                                >
                                    <Icons.delete style={{ width: '18px', height: '18px' }} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Thêm giao dịch định kỳ</h3>
                            <button className="modal-close" onClick={resetForm}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Loại</label>
                                <div className="tabs">
                                    <button
                                        type="button"
                                        className={`tab ${formData.type === 'expense' ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, type: 'expense', categoryId: '' })}
                                    >
                                        Chi tiêu
                                    </button>
                                    <button
                                        type="button"
                                        className={`tab ${formData.type === 'income' ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, type: 'income', categoryId: '' })}
                                    >
                                        Thu nhập
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Danh mục</label>
                                <CustomSelect
                                    value={formData.categoryId}
                                    onChange={(val) => setFormData({ ...formData, categoryId: val })}
                                    options={filteredCategories.map(cat => ({ value: cat._id, label: `${cat.icon} ${cat.name}` }))}
                                    placeholder="Chọn danh mục..."
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Mô tả</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="VD: Tiền điện tháng"
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
                                <label className="form-label">Tần suất</label>
                                <CustomSelect
                                    value={formData.frequency}
                                    onChange={(val) => setFormData({ ...formData, frequency: val })}
                                    options={Object.entries(FREQUENCY_LABELS).map(([key, label]) => ({ value: key, label }))}
                                />
                            </div>

                            {formData.frequency === 'monthly' && (
                                <div className="form-group">
                                    <label className="form-label">Ngày trong tháng</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.dayOfMonth}
                                        onChange={(e) => setFormData({ ...formData, dayOfMonth: e.target.value })}
                                        min="1"
                                        max="31"
                                    />
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary btn-block">Tạo</button>
                        </form>
                    </div>
                </div>
            )}

            {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}

            {/* Delete Confirm Modal */}
            <ConfirmModal
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={() => handleDelete(deletingId)}
                title="Xóa giao dịch định kỳ"
                message="Bạn có chắc muốn xóa giao dịch định kỳ này?"
                confirmText="Xóa"
                cancelText="Hủy"
                type="danger"
            />
        </div>
    );
}
