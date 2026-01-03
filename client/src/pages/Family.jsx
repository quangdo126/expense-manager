import { useState, useEffect } from 'react';
import { familyAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Family() {
    const { user, family, isAdmin, updateFamily } = useAuth();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [editing, setEditing] = useState(false);
    const [familyName, setFamilyName] = useState('');

    useEffect(() => {
        loadFamily();
    }, []);

    const loadFamily = async () => {
        try {
            const data = await familyAPI.get();
            setMembers(data.members);
            setFamilyName(data.family?.name || '');
            updateFamily(data.family);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateName = async () => {
        try {
            const data = await familyAPI.update({ name: familyName });
            updateFamily(data.family);
            setEditing(false);
            setToast({ type: 'success', message: 'Đã cập nhật tên gia đình' });
        } catch (err) {
            setToast({ type: 'error', message: err.message });
        }
    };

    const handleRegenerateCode = async () => {
        if (!confirm('Mã mời cũ sẽ hết hiệu lực. Tiếp tục?')) return;

        try {
            const data = await familyAPI.regenerateCode();
            updateFamily({ ...family, inviteCode: data.inviteCode });
            setToast({ type: 'success', message: 'Đã tạo mã mời mới' });
        } catch (err) {
            setToast({ type: 'error', message: err.message });
        }
    };

    const handleRemoveMember = async (userId, name) => {
        if (!confirm(`Xóa ${name} khỏi gia đình?`)) return;

        try {
            await familyAPI.removeMember(userId);
            setMembers(members.filter(m => m._id !== userId));
            setToast({ type: 'success', message: 'Đã xóa thành viên' });
        } catch (err) {
            setToast({ type: 'error', message: err.message });
        }
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(family?.inviteCode || '');
        setToast({ type: 'success', message: 'Đã sao chép mã mời' });
    };

    // Clear toast
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

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
                    <h1 className="page-title">Gia đình</h1>
                </div>

                {/* Family Name */}
                <div className="card" style={{ marginBottom: '20px' }}>
                    {editing ? (
                        <div>
                            <input
                                type="text"
                                className="form-input"
                                value={familyName}
                                onChange={(e) => setFamilyName(e.target.value)}
                                placeholder="Tên gia đình"
                            />
                            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                                <button className="btn btn-primary" onClick={handleUpdateName}>Lưu</button>
                                <button className="btn btn-ghost" onClick={() => setEditing(false)}>Hủy</button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                                    {family?.name}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {members.length} thành viên
                                </div>
                            </div>
                            {isAdmin && (
                                <button className="btn btn-ghost" onClick={() => setEditing(true)}>
                                    ✏️
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Invite Code (Admin only) */}
                {isAdmin && (
                    <div className="invite-code-box">
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            Mã mời gia đình
                        </div>
                        <div className="invite-code">{family?.inviteCode}</div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button className="btn btn-primary" onClick={handleCopyCode}>
                                📋 Sao chép
                            </button>
                            <button className="btn btn-secondary" onClick={handleRegenerateCode}>
                                🔄 Tạo mã mới
                            </button>
                        </div>
                    </div>
                )}

                {/* Members List */}
                <div className="card">
                    <h3 className="card-title">👥 Thành viên</h3>

                    {members.map(member => (
                        <div key={member._id} className="member-item">
                            <div className="member-avatar">
                                {member.displayName?.charAt(0).toUpperCase()}
                            </div>
                            <div className="member-info">
                                <div className="member-name">
                                    {member.displayName}
                                    {member._id === user?._id && (
                                        <span style={{
                                            fontSize: '0.625rem',
                                            background: 'var(--accent-primary)',
                                            padding: '2px 6px',
                                            borderRadius: 'var(--radius-full)',
                                            marginLeft: '8px'
                                        }}>
                                            Bạn
                                        </span>
                                    )}
                                </div>
                                <div className={`member-role ${member.role}`}>
                                    {member.role === 'admin' ? '👑 Quản trị viên' : 'Thành viên'}
                                </div>
                            </div>

                            {isAdmin && member._id !== user?._id && member.role !== 'admin' && (
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => handleRemoveMember(member._id, member.displayName)}
                                    style={{ color: 'var(--danger)' }}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
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
