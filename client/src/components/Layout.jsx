import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

export default function Layout() {
    const navigate = useNavigate();
    const [showMore, setShowMore] = useState(false);

    const moreItems = [
        { path: '/categories', icon: '🏷️', label: 'Danh mục' },
        { path: '/budgets', icon: '📊', label: 'Ngân sách' },
        { path: '/loans', icon: '💳', label: 'Khoản vay' },
        { path: '/goals', icon: '🎯', label: 'Mục tiêu' },
        { path: '/investments', icon: '📈', label: 'Đầu tư' },
        { path: '/reports', icon: '📋', label: 'Báo cáo' },
        { path: '/family', icon: '👨‍👩‍👧', label: 'Gia đình' },
        { path: '/settings', icon: '⚙️', label: 'Cài đặt' },
    ];

    return (
        <>
            <Outlet />

            <nav className="bottom-nav">
                <div className="bottom-nav-inner">
                    <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <span className="nav-icon">📊</span>
                        <span className="nav-label">Tổng quan</span>
                    </NavLink>

                    <NavLink to="/transactions" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <span className="nav-icon">📋</span>
                        <span className="nav-label">Lịch sử</span>
                    </NavLink>

                    <button className="nav-add-btn" onClick={() => navigate('/')}>
                        +
                    </button>

                    <NavLink to="/recurring" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <span className="nav-icon">🔄</span>
                        <span className="nav-label">Định kỳ</span>
                    </NavLink>

                    <button
                        className={`nav-item ${showMore ? 'active' : ''}`}
                        onClick={() => setShowMore(!showMore)}
                    >
                        <span className="nav-icon">☰</span>
                        <span className="nav-label">Thêm</span>
                    </button>
                </div>
            </nav>

            {/* More Menu */}
            {showMore && (
                <>
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.5)',
                            zIndex: 1000
                        }}
                        onClick={() => setShowMore(false)}
                    />
                    <div style={{
                        position: 'fixed',
                        bottom: '80px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 'calc(100% - 32px)',
                        maxWidth: '400px',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '16px',
                        zIndex: 1001,
                        boxShadow: '0 -4px 20px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '8px'
                        }}>
                            {moreItems.map(item => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setShowMore(false)}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        padding: '12px 8px',
                                        borderRadius: 'var(--radius-md)',
                                        background: 'var(--bg-tertiary)',
                                        textDecoration: 'none',
                                        color: 'var(--text-primary)',
                                        transition: 'var(--transition-fast)'
                                    }}
                                >
                                    <span style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{item.icon}</span>
                                    <span style={{ fontSize: '0.625rem', textAlign: 'center' }}>{item.label}</span>
                                </NavLink>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

