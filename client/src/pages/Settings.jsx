import { useState, useEffect } from 'react';
import { authAPI, pushAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

export default function Settings() {
    const { user, logout } = useAuth();
    const { amountDisplay, setAmountDisplay } = useSettings();
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [pushEnabled, setPushEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        // Check if push is enabled
        if ('Notification' in window) {
            setPushEnabled(Notification.permission === 'granted');
        }
    }, []);

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setToast({ type: 'error', message: 'Mật khẩu mới không khớp' });
            return;
        }

        setLoading(true);
        try {
            await authAPI.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            setToast({ type: 'success', message: 'Đổi mật khẩu thành công' });
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setToast({ type: 'error', message: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePush = async () => {
        if (!('Notification' in window)) {
            setToast({ type: 'error', message: 'Trình duyệt không hỗ trợ thông báo' });
            return;
        }

        if (pushEnabled) {
            try {
                await pushAPI.unsubscribe();
                setPushEnabled(false);
                setToast({ type: 'success', message: 'Đã tắt thông báo' });
            } catch (err) {
                setToast({ type: 'error', message: err.message });
            }
        } else {
            try {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    setToast({ type: 'error', message: 'Bạn cần cấp quyền thông báo' });
                    return;
                }

                const { publicKey } = await pushAPI.getVapidKey();
                if (!publicKey) {
                    setToast({ type: 'error', message: 'Thông báo chưa được cấu hình' });
                    return;
                }

                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicKey)
                });

                await pushAPI.subscribe(subscription.toJSON());
                setPushEnabled(true);
                setToast({ type: 'success', message: 'Đã bật thông báo' });
            } catch (err) {
                console.error(err);
                setToast({ type: 'error', message: 'Không thể bật thông báo' });
            }
        }
    };

    const handleLogout = () => {
        if (confirm('Bạn có chắc muốn đăng xuất?')) {
            logout();
        }
    };

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 1024 * 1024) {
            setToast({ type: 'error', message: 'Ảnh quá lớn (tối đa 1MB)' });
            return;
        }

        if (!file.type.startsWith('image/')) {
            setToast({ type: 'error', message: 'Vui lòng chọn file ảnh' });
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxSize = 200;
                let { width, height } = img;

                if (width > height) {
                    if (width > maxSize) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width = (width * maxSize) / height;
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                setAvatarPreview(resizedDataUrl);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleAvatarUpload = async () => {
        if (!avatarPreview) return;

        setUploadLoading(true);
        try {
            await authAPI.updateAvatar(avatarPreview);
            setShowAvatarPicker(false);
            setAvatarPreview(null);
            setToast({ type: 'success', message: 'Đã cập nhật avatar' });
            window.location.reload();
        } catch (err) {
            setToast({ type: 'error', message: err.message });
        } finally {
            setUploadLoading(false);
        }
    };

    const isImageAvatar = user?.avatar?.startsWith('data:image');

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">Cài đặt</h1>
                </div>

                {/* User Info */}
                <div className="card" style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button
                            onClick={() => setShowAvatarPicker(true)}
                            style={{
                                width: '56px',
                                height: '56px',
                                background: isImageAvatar ? 'transparent' : 'var(--accent-primary)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: 'none',
                                cursor: 'pointer',
                                overflow: 'hidden',
                                padding: 0
                            }}
                        >
                            {isImageAvatar ? (
                                <img
                                    src={user.avatar}
                                    alt="Avatar"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <span style={{ fontSize: '1.5rem', color: 'white', fontWeight: '600' }}>
                                    {user?.displayName?.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </button>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>{user?.displayName}</div>
                            <div style={{ color: 'var(--text-muted)' }}>@{user?.username}</div>
                        </div>
                        <button className="btn btn-secondary" onClick={() => setShowAvatarPicker(true)}>
                            Đổi avatar
                        </button>
                    </div>
                </div>

                {/* Avatar Upload Modal */}
                {showAvatarPicker && (
                    <div className="modal-overlay" onClick={() => { setShowAvatarPicker(false); setAvatarPreview(null); }}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">Đổi ảnh đại diện</h3>
                                <button className="modal-close" onClick={() => { setShowAvatarPicker(false); setAvatarPreview(null); }}>×</button>
                            </div>

                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <div style={{
                                    width: '120px',
                                    height: '120px',
                                    borderRadius: '50%',
                                    background: 'var(--bg-tertiary)',
                                    margin: '0 auto',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : isImageAvatar ? (
                                        <img src={user.avatar} alt="Current" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ fontSize: '3rem', color: 'var(--text-muted)' }}>📷</span>
                                    )}
                                </div>
                            </div>

                            <label style={{
                                display: 'block',
                                width: '100%',
                                padding: '14px',
                                background: 'var(--bg-tertiary)',
                                borderRadius: 'var(--radius-md)',
                                textAlign: 'center',
                                cursor: 'pointer',
                                marginBottom: '12px'
                            }}>
                                <span style={{ color: 'var(--text-secondary)' }}>📁 Chọn ảnh từ thư viện</span>
                                <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                            </label>

                            {avatarPreview && (
                                <button className="btn btn-primary btn-block" onClick={handleAvatarUpload} disabled={uploadLoading}>
                                    {uploadLoading ? 'Đang lưu...' : 'Lưu avatar'}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Push Notifications */}
                <div className="card" style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontWeight: '600' }}>🔔 Thông báo đẩy</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Nhận thông báo khi có giao dịch mới
                            </div>
                        </div>
                        <button
                            className={`btn ${pushEnabled ? 'btn-success' : 'btn-secondary'}`}
                            onClick={handleTogglePush}
                        >
                            {pushEnabled ? 'Bật' : 'Tắt'}
                        </button>
                    </div>
                </div>

                {/* Amount Display */}
                <div className="card" style={{ marginBottom: '20px' }}>
                    <div style={{ fontWeight: '600', marginBottom: '12px' }}>💰 Hiển thị số tiền</div>
                    <div className="tabs">
                        <button
                            type="button"
                            className={`tab ${amountDisplay === 'full' ? 'active' : ''}`}
                            onClick={() => setAmountDisplay('full')}
                        >
                            Đầy đủ (1,000đ)
                        </button>
                        <button
                            type="button"
                            className={`tab ${amountDisplay === 'short' ? 'active' : ''}`}
                            onClick={() => setAmountDisplay('short')}
                        >
                            Viết tắt (1K, 1M)
                        </button>
                    </div>
                </div>

                {/* Change Password */}
                <div className="card" style={{ marginBottom: '20px' }}>
                    <h3 className="card-title">🔐 Đổi mật khẩu</h3>
                    <form onSubmit={handlePasswordChange}>
                        <div className="form-group">
                            <label className="form-label">Mật khẩu hiện tại</label>
                            <input
                                type="password"
                                className="form-input"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Mật khẩu mới</label>
                            <input
                                type="password"
                                className="form-input"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Xác nhận mật khẩu mới</label>
                            <input
                                type="password"
                                className="form-input"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                            {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                        </button>
                    </form>
                </div>

                {/* Logout */}
                <button className="btn btn-danger btn-block" onClick={handleLogout}>
                    Đăng xuất
                </button>

                {/* Footer */}
                <div style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    <p>Made with ❤️ by Ba Thóc</p>
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

// Helper function
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
