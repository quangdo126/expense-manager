import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Join() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        displayName: '',
        inviteCode: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { join } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        let value = e.target.value;
        if (e.target.name === 'inviteCode') {
            value = value.toUpperCase();
        }
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await join(formData);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-logo">👨‍👩‍👧‍👦</div>
            <h1 className="auth-title">Tham gia gia đình</h1>
            <p className="auth-subtitle">Sử dụng mã mời để tham gia</p>

            <div className="auth-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Mã mời</label>
                        <input
                            type="text"
                            name="inviteCode"
                            className="form-input form-input-large"
                            value={formData.inviteCode}
                            onChange={handleChange}
                            placeholder="XXXXXX"
                            maxLength={6}
                            required
                            style={{ letterSpacing: '4px', textTransform: 'uppercase' }}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Tên hiển thị</label>
                        <input
                            type="text"
                            name="displayName"
                            className="form-input"
                            value={formData.displayName}
                            onChange={handleChange}
                            placeholder="VD: Ba, Mẹ, Con..."
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Tên đăng nhập</label>
                        <input
                            type="text"
                            name="username"
                            className="form-input"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Dùng để đăng nhập"
                            required
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Mật khẩu</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Ít nhất 6 ký tự"
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    {error && <p className="form-error">{error}</p>}

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={loading}
                    >
                        {loading ? 'Đang tham gia...' : 'Tham gia'}
                    </button>
                </form>

                <p className="auth-switch">
                    Chưa có mã mời? <Link to="/register">Tạo gia đình mới</Link>
                </p>
            </div>
        </div>
    );
}
