import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        displayName: '',
        familyName: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register(formData);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-logo">💰</div>
            <h1 className="auth-title">Tạo tài khoản mới</h1>
            <p className="auth-subtitle">Đăng ký và tạo nhóm gia đình</p>

            <div className="auth-card">
                <form onSubmit={handleSubmit}>
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
                        <label className="form-label">Tên gia đình</label>
                        <input
                            type="text"
                            name="familyName"
                            className="form-input"
                            value={formData.familyName}
                            onChange={handleChange}
                            placeholder="VD: Gia đình Nguyễn"
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
                        {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                    </button>
                </form>

                <p className="auth-switch">
                    Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                </p>
            </div>
        </div>
    );
}
