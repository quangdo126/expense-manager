import { useState, useEffect } from 'react';
import { categoriesAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import IconPicker from '../components/IconPicker';

export default function Categories() {
    const { isAdmin } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'expense',
        icon: '📝',
        keywords: '',
        color: '#6366f1'
    });
    const [toast, setToast] = useState(null);
    const [activeTab, setActiveTab] = useState('expense');

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await categoriesAPI.list();
            setCategories(data.categories);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...formData,
            keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k)
        };

        try {
            if (editingId) {
                await categoriesAPI.update(editingId, payload);
                setToast({ type: 'success', message: 'Đã cập nhật danh mục' });
            } else {
                await categoriesAPI.create(payload);
                setToast({ type: 'success', message: 'Đã tạo danh mục mới' });
            }

            resetForm();
            loadCategories();
        } catch (err) {
            setToast({ type: 'error', message: err.message });
        }
    };

    const handleEdit = (cat) => {
        setFormData({
            name: cat.name,
            type: cat.type,
            icon: cat.icon,
            keywords: cat.keywords?.join(', ') || '',
            color: cat.color
        });
        setEditingId(cat._id);
        setShowForm(true);
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Xóa danh mục "${name}"?`)) return;

        try {
            await categoriesAPI.delete(id);
            setToast({ type: 'success', message: 'Đã xóa danh mục' });
            loadCategories();
        } catch (err) {
            setToast({ type: 'error', message: err.message });
        }
    };

    const resetForm = () => {
        setFormData({ name: '', type: 'expense', icon: '📝', keywords: '', color: '#6366f1' });
        setEditingId(null);
        setShowForm(false);
    };

    // Clear toast
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const filteredCategories = categories.filter(c => c.type === activeTab);

    // 10 colors - 2 rows x 5 (default color first)
    const COLORS = [
        '#6366f1', '#ef4444', '#f97316', '#eab308', '#22c55e',
        '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
    ];

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
                    <h1 className="page-title">Danh mục</h1>
                    <p className="page-subtitle">Quản lý các loại thu chi</p>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'expense' ? 'active' : ''}`}
                        onClick={() => setActiveTab('expense')}
                    >
                        Chi tiêu ({categories.filter(c => c.type === 'expense').length})
                    </button>
                    <button
                        className={`tab ${activeTab === 'income' ? 'active' : ''}`}
                        onClick={() => setActiveTab('income')}
                    >
                        Thu nhập ({categories.filter(c => c.type === 'income').length})
                    </button>
                </div>

                {/* Add Button */}
                {isAdmin && (
                    <button
                        className="btn btn-primary btn-block"
                        style={{ marginBottom: '20px' }}
                        onClick={() => {
                            setFormData({ ...formData, type: activeTab });
                            setShowForm(true);
                        }}
                    >
                        + Thêm danh mục {activeTab === 'expense' ? 'chi' : 'thu'}
                    </button>
                )}

                {/* Categories List */}
                <div className="card">
                    {filteredCategories.length === 0 ? (
                        <div className="empty-state" style={{ padding: '30px' }}>
                            <p className="empty-text">Chưa có danh mục nào</p>
                        </div>
                    ) : (
                        filteredCategories.map(cat => (
                            <div
                                key={cat._id}
                                className="transaction-item"
                                style={{ borderLeft: `4px solid ${cat.color}` }}
                            >
                                <div
                                    className="transaction-icon"
                                    style={{ background: cat.color }}
                                >
                                    {cat.icon}
                                </div>
                                <div className="transaction-info">
                                    <div className="transaction-category">
                                        {cat.name}
                                        {cat.isDefault && (
                                            <span style={{
                                                fontSize: '0.625rem',
                                                background: 'var(--bg-tertiary)',
                                                padding: '2px 6px',
                                                borderRadius: 'var(--radius-full)',
                                                marginLeft: '8px',
                                                color: 'var(--text-muted)'
                                            }}>
                                                Mặc định
                                            </span>
                                        )}
                                    </div>
                                    <div className="transaction-meta">
                                        {cat.keywords?.length > 0 && (
                                            <span>{cat.keywords.slice(0, 3).join(', ')}</span>
                                        )}
                                    </div>
                                </div>

                                {isAdmin && (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            className="btn btn-ghost"
                                            onClick={() => handleEdit(cat)}
                                        >
                                            ✏️
                                        </button>
                                        {!cat.isSystemDefault && (
                                            <button
                                                className="btn btn-ghost"
                                                style={{ color: 'var(--danger)' }}
                                                onClick={() => handleDelete(cat._id, cat.name)}
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
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
                            <h3 className="modal-title">
                                {editingId ? 'Sửa danh mục' : 'Thêm danh mục'}
                            </h3>
                            <button className="modal-close" onClick={resetForm}>×</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Icon & Name */}
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'stretch' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowIconPicker(true)}
                                    style={{
                                        width: '52px',
                                        fontSize: '1.5rem',
                                        background: formData.color,
                                        borderRadius: 'var(--radius-md)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        border: 'none',
                                        flexShrink: 0
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
                                        placeholder="Tên danh mục"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Type - hidden for system default categories */}
                            {!editingId || !categories.find(c => c._id === editingId)?.isSystemDefault ? (
                                <div className="form-group">
                                    <label className="form-label">Loại</label>
                                    <div className="tabs">
                                        <button
                                            type="button"
                                            className={`tab ${formData.type === 'expense' ? 'active' : ''}`}
                                            onClick={() => setFormData({ ...formData, type: 'expense' })}
                                        >
                                            Chi tiêu
                                        </button>
                                        <button
                                            type="button"
                                            className={`tab ${formData.type === 'income' ? 'active' : ''}`}
                                            onClick={() => setFormData({ ...formData, type: 'income' })}
                                        >
                                            Thu nhập
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{
                                    padding: '12px',
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: '16px',
                                    fontSize: '0.75rem',
                                    color: 'var(--text-muted)'
                                }}>
                                    ℹ️ Danh mục hệ thống - Chỉ có thể thay đổi icon, màu sắc và từ khóa
                                </div>
                            )}

                            {/* Color */}
                            <div className="form-group">
                                <label className="form-label">Màu sắc</label>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(10, 1fr)',
                                    gap: '6px',
                                    width: '100%'
                                }}>
                                    {COLORS.map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, color })}
                                            style={{
                                                aspectRatio: '1',
                                                borderRadius: '50%',
                                                background: color,
                                                border: formData.color === color ? '3px solid white' : 'none',
                                                cursor: 'pointer',
                                                boxShadow: formData.color === color ? '0 0 0 2px var(--accent-primary)' : 'none'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Keywords */}
                            <div className="form-group">
                                <label className="form-label">Từ khóa (cách nhau bởi dấu phẩy)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.keywords}
                                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                                    placeholder="VD: xăng, đổ xăng, petrol"
                                />
                            </div>

                            <button type="submit" className="btn btn-primary btn-block">
                                {editingId ? 'Cập nhật' : 'Tạo danh mục'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Icon Picker */}
            {showIconPicker && (
                <IconPicker
                    value={formData.icon}
                    onChange={(icon) => setFormData({ ...formData, icon })}
                    onClose={() => setShowIconPicker(false)}
                />
            )}

            {/* Toast */}
            {toast && (
                <div className={`toast ${toast.type}`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
}
