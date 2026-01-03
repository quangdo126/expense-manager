import { useState, useEffect } from 'react';
import { reportsAPI } from '../api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function Dashboard() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSummary();
    }, []);

    const loadSummary = async () => {
        try {
            const data = await reportsAPI.summary();
            setSummary(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatAmount = (amount) => {
        if (amount >= 1000000) {
            return (amount / 1000000).toFixed(1) + 'tr';
        }
        if (amount >= 1000) {
            return (amount / 1000).toFixed(0) + 'k';
        }
        return amount;
    };

    const formatFullAmount = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount);
    };

    // Prepare chart data
    const expenseByCategory = summary?.byCategory
        ?.filter(c => c.type === 'expense')
        ?.map(c => ({
            name: c.categoryName,
            value: c.total,
            color: c.categoryColor,
            icon: c.categoryIcon
        })) || [];

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
                    <h1 className="page-title">Tổng quan</h1>
                    <p className="page-subtitle">Tháng này</p>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card income">
                        <div className="stat-label">Thu nhập</div>
                        <div className="stat-value amount-income">
                            +{formatAmount(summary?.totals?.income || 0)}đ
                        </div>
                    </div>
                    <div className="stat-card expense">
                        <div className="stat-label">Chi tiêu</div>
                        <div className="stat-value amount-expense">
                            -{formatAmount(summary?.totals?.expense || 0)}đ
                        </div>
                    </div>
                </div>

                {/* Balance */}
                <div className="card" style={{ marginBottom: '20px', textAlign: 'center' }}>
                    <div className="stat-label">Số dư</div>
                    <div className={`stat-value ${summary?.totals?.balance >= 0 ? 'amount-income' : 'amount-expense'}`} style={{ fontSize: '2rem' }}>
                        {summary?.totals?.balance >= 0 ? '+' : ''}{formatFullAmount(summary?.totals?.balance || 0)}đ
                    </div>
                    <div style={{ marginTop: '8px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        {summary?.totals?.incomeCount || 0} khoản thu • {summary?.totals?.expenseCount || 0} khoản chi
                    </div>
                </div>

                {/* Expense by Category Chart */}
                {expenseByCategory.length > 0 && (
                    <div className="card" style={{ marginBottom: '20px' }}>
                        <h3 className="card-title">📊 Chi tiêu theo danh mục</h3>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={expenseByCategory}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {expenseByCategory.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => formatFullAmount(value) + 'đ'}
                                        contentStyle={{
                                            background: 'var(--bg-secondary)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Legend */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
                            {expenseByCategory.map((cat, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '0.75rem',
                                    color: 'var(--text-secondary)'
                                }}>
                                    <span style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        background: cat.color
                                    }}></span>
                                    {cat.icon} {cat.name}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Top Expenses by User */}
                <div className="card">
                    <h3 className="card-title">👥 Chi tiêu theo thành viên</h3>
                    {summary?.byUser?.filter(u => u.type === 'expense').map((user, i) => (
                        <div key={i} className="member-item">
                            <div className="member-avatar">
                                {user.displayName?.charAt(0).toUpperCase()}
                            </div>
                            <div className="member-info">
                                <div className="member-name">{user.displayName}</div>
                                <div className="member-role">{user.count} giao dịch</div>
                            </div>
                            <div className="amount amount-expense">
                                -{formatAmount(user.total)}đ
                            </div>
                        </div>
                    ))}
                    {!summary?.byUser?.length && (
                        <div className="empty-state" style={{ padding: '20px' }}>
                            <p className="empty-text">Chưa có dữ liệu</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
