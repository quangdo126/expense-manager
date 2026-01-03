import { useState, useEffect } from 'react';
import { reportsAPI } from '../api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, Legend
} from 'recharts';

export default function Reports() {
    const [mainTab, setMainTab] = useState('thisMonth'); // thisMonth, custom
    const [customPreset, setCustomPreset] = useState('month'); // month, year, range
    const [dailyData, setDailyData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    useEffect(() => {
        if (mainTab === 'thisMonth') {
            loadThisMonth();
        } else if (customPreset === 'month') {
            loadSelectedMonth();
        } else if (customPreset === 'year') {
            loadYear();
        }
    }, [mainTab, customPreset, selectedYear, selectedMonth]);

    // Auto-load when date range changes
    useEffect(() => {
        if (mainTab === 'custom' && customPreset === 'range' && dateFrom && dateTo) {
            loadCustomRange();
        }
    }, [dateFrom, dateTo]);

    const loadThisMonth = async () => {
        setLoading(true);
        try {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const data = await reportsAPI.daily({
                startDate: startOfMonth.toISOString().split('T')[0],
                endDate: now.toISOString().split('T')[0]
            });
            setDailyData(data.dailyData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadSelectedMonth = async () => {
        setLoading(true);
        try {
            const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
            const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
            const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${lastDay}`;
            const data = await reportsAPI.daily({ startDate, endDate });
            setDailyData(data.dailyData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadYear = async () => {
        setLoading(true);
        try {
            const data = await reportsAPI.monthly(selectedYear);
            setMonthlyData(data.monthlyData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadCustomRange = async () => {
        if (!dateFrom || !dateTo) return;
        setLoading(true);
        try {
            const data = await reportsAPI.daily({ startDate: dateFrom, endDate: dateTo });
            setDailyData(data.dailyData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatAmount = (value) => {
        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'tr';
        if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
        return value;
    };

    const formatFullAmount = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
    };

    const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    const monthFullNames = [
        'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];

    const isYearlyView = mainTab === 'custom' && customPreset === 'year';
    const chartData = isYearlyView
        ? monthlyData.map((d, i) => ({ ...d, name: monthNames[i] }))
        : dailyData.map(d => ({
            ...d,
            name: new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
        }));

    const totals = isYearlyView
        ? monthlyData.reduce((acc, m) => ({
            income: acc.income + m.income,
            expense: acc.expense + m.expense
        }), { income: 0, expense: 0 })
        : dailyData.reduce((acc, d) => ({
            income: acc.income + d.income,
            expense: acc.expense + d.expense
        }), { income: 0, expense: 0 });

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">Báo cáo</h1>
                </div>

                {/* Main Tabs */}
                <div className="tabs" style={{ marginBottom: '12px' }}>
                    <button
                        className={`tab ${mainTab === 'thisMonth' ? 'active' : ''}`}
                        onClick={() => setMainTab('thisMonth')}
                    >
                        Tháng này
                    </button>
                    <button
                        className={`tab ${mainTab === 'custom' ? 'active' : ''}`}
                        onClick={() => setMainTab('custom')}
                    >
                        Tùy chỉnh
                    </button>
                </div>

                {/* Custom Presets */}
                {mainTab === 'custom' && (
                    <div className="card" style={{ marginBottom: '16px', padding: '12px' }}>
                        {/* Preset buttons */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                            <button
                                className={`btn ${customPreset === 'month' ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ flex: 1, padding: '8px' }}
                                onClick={() => setCustomPreset('month')}
                            >
                                Theo tháng
                            </button>
                            <button
                                className={`btn ${customPreset === 'year' ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ flex: 1, padding: '8px' }}
                                onClick={() => setCustomPreset('year')}
                            >
                                Theo năm
                            </button>
                            <button
                                className={`btn ${customPreset === 'range' ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ flex: 1, padding: '8px' }}
                                onClick={() => setCustomPreset('range')}
                            >
                                Khoảng TG
                            </button>
                        </div>

                        {/* Month selector */}
                        {customPreset === 'month' && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <select
                                    className="form-input"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                    style={{ flex: 1 }}
                                >
                                    {monthFullNames.map((name, idx) => (
                                        <option key={idx} value={idx + 1}>{name}</option>
                                    ))}
                                </select>
                                <select
                                    className="form-input"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    style={{ flex: 1 }}
                                >
                                    {[...Array(5)].map((_, i) => {
                                        const y = new Date().getFullYear() - i;
                                        return <option key={y} value={y}>{y}</option>;
                                    })}
                                </select>
                            </div>
                        )}

                        {/* Year selector */}
                        {customPreset === 'year' && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <select
                                    className="form-input"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    style={{ flex: 1 }}
                                >
                                    {Array.from({ length: new Date().getFullYear() - 2019 }, (_, i) => {
                                        const y = new Date().getFullYear() - i;
                                        return <option key={y} value={y}>{y}</option>;
                                    })}
                                </select>
                            </div>
                        )}

                        {/* Date range selector */}
                        {customPreset === 'range' && (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    style={{ flex: 1, minWidth: 0 }}
                                />
                                <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>→</span>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    style={{ flex: 1, minWidth: 0 }}
                                />
                            </div>
                        )}
                    </div>
                )}

                {loading ? (
                    <div className="loading">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <>
                        {/* Summary Stats */}
                        <div className="stats-grid">
                            <div className="stat-card income">
                                <div className="stat-label">Tổng thu</div>
                                <div className="stat-value amount-income">
                                    +{formatAmount(totals.income)}đ
                                </div>
                            </div>
                            <div className="stat-card expense">
                                <div className="stat-label">Tổng chi</div>
                                <div className="stat-value amount-expense">
                                    -{formatAmount(totals.expense)}đ
                                </div>
                            </div>
                        </div>

                        {/* Balance Card */}
                        <div className="card" style={{ marginBottom: '20px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Số dư</div>
                            <div style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: totals.income - totals.expense >= 0 ? 'var(--success)' : 'var(--danger)'
                            }}>
                                {totals.income - totals.expense >= 0 ? '+' : ''}{formatFullAmount(totals.income - totals.expense)}
                            </div>
                        </div>

                        {/* Bar Chart */}
                        {chartData.length > 0 && (
                            <div className="card" style={{ marginBottom: '20px' }}>
                                <h3 className="card-title">📊 Biểu đồ thu chi</h3>
                                <div className="chart-container" style={{ height: '300px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                            <XAxis
                                                dataKey="name"
                                                stroke="var(--text-muted)"
                                                fontSize={11}
                                                interval={chartData.length > 15 ? Math.floor(chartData.length / 10) : 0}
                                            />
                                            <YAxis
                                                stroke="var(--text-muted)"
                                                fontSize={11}
                                                tickFormatter={formatAmount}
                                            />
                                            <Tooltip
                                                formatter={(value) => formatFullAmount(value)}
                                                contentStyle={{
                                                    background: 'var(--bg-secondary)',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    color: 'var(--text-primary)'
                                                }}
                                            />
                                            <Legend />
                                            <Bar dataKey="income" name="Thu nhập" fill="#10b981" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="expense" name="Chi tiêu" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Balance Trend */}
                        {chartData.length > 0 && (
                            <div className="card">
                                <h3 className="card-title">📈 Xu hướng số dư</h3>
                                <div className="chart-container" style={{ height: '250px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                            <XAxis
                                                dataKey="name"
                                                stroke="var(--text-muted)"
                                                fontSize={11}
                                                interval={chartData.length > 15 ? Math.floor(chartData.length / 10) : 0}
                                            />
                                            <YAxis
                                                stroke="var(--text-muted)"
                                                fontSize={11}
                                                tickFormatter={formatAmount}
                                            />
                                            <Tooltip
                                                formatter={(value) => formatFullAmount(value)}
                                                contentStyle={{
                                                    background: 'var(--bg-secondary)',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    color: 'var(--text-primary)'
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="balance"
                                                name="Số dư"
                                                stroke="#6366f1"
                                                strokeWidth={2}
                                                dot={{ fill: '#6366f1', strokeWidth: 0, r: 3 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {chartData.length === 0 && (
                            <div className="card">
                                <div className="empty-state" style={{ padding: '30px' }}>
                                    <div className="empty-icon">📊</div>
                                    <p className="empty-text">Chưa có dữ liệu trong khoảng thời gian này</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
