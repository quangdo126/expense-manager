import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Icons } from './Icons';

export default function Layout() {
    const navigate = useNavigate();
    const [showMore, setShowMore] = useState(false);

    const moreItems = [
        { path: '/categories', icon: Icons.category, label: 'Danh mục' },
        { path: '/budgets', icon: Icons.budget, label: 'Ngân sách' },
        { path: '/loans', icon: Icons.loan, label: 'Khoản vay' },
        { path: '/goals', icon: Icons.goal, label: 'Mục tiêu' },
        { path: '/investments', icon: Icons.investment, label: 'Đầu tư' },
        { path: '/reports', icon: Icons.report, label: 'Báo cáo' },
        { path: '/family', icon: Icons.family, label: 'Gia đình' },
        { path: '/settings', icon: Icons.settings, label: 'Cài đặt' },
    ];

    const iconStyle = { width: 24, height: 24 };
    const moreIconStyle = { width: 28, height: 28, marginBottom: 4 };

    return (
        <>
            <Outlet />

            <nav className="bottom-nav">
                <div className="bottom-nav-inner">
                    <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <span className="nav-icon"><Icons.dashboard style={iconStyle} /></span>
                        <span className="nav-label">Tổng quan</span>
                    </NavLink>

                    <NavLink to="/transactions" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <span className="nav-icon"><Icons.history style={iconStyle} /></span>
                        <span className="nav-label">Lịch sử</span>
                    </NavLink>

                    <button className="nav-add-btn" onClick={() => navigate('/')}>
                        <Icons.plus style={{ width: 28, height: 28 }} />
                    </button>

                    <NavLink to="/recurring" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <span className="nav-icon"><Icons.recurring style={iconStyle} /></span>
                        <span className="nav-label">Định kỳ</span>
                    </NavLink>

                    <button
                        className={`nav-item ${showMore ? 'active' : ''}`}
                        onClick={() => setShowMore(!showMore)}
                    >
                        <span className="nav-icon"><Icons.menu style={iconStyle} /></span>
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
                                    <item.icon style={moreIconStyle} />
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
