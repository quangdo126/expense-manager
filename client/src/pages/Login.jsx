import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(username, password);
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
            <h1 className="auth-title">Gia Đình Thóc</h1>
            <p className="auth-subtitle">Đăng nhập để quản lý tài chính</p>

            <div className="auth-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Tên đăng nhập</label>
                        <input
                            type="text"
                            className="form-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Nhập tên đăng nhập"
                            required
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Mật khẩu</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nhập mật khẩu"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    {error && <p className="form-error">{error}</p>}

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={loading}
                    >
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>

                <p className="auth-switch">
                    Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
                </p>
                <p className="auth-switch" style={{ marginTop: '8px' }}>
                    Có mã mời? <Link to="/join">Tham gia gia đình</Link>
                </p>
            </div>
        </div>
    );
}
