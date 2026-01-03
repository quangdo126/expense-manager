const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// API request helper
async function request(endpoint, options = {}) {
    const token = getToken();

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    };

    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra');
    }

    return data;
}

// Auth API
export const authAPI = {
    register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    join: (data) => request('/auth/join', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request('/auth/me'),
    changePassword: (data) => request('/auth/password', { method: 'PUT', body: JSON.stringify(data) }),
    updateAvatar: (avatar) => request('/auth/avatar', { method: 'PUT', body: JSON.stringify({ avatar }) }),
};

// Transactions API
export const transactionsAPI = {
    create: (data) => request('/transactions', { method: 'POST', body: JSON.stringify(data) }),
    list: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/transactions${query ? `?${query}` : ''}`);
    },
    get: (id) => request(`/transactions/${id}`),
    update: (id, data) => request(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/transactions/${id}`, { method: 'DELETE' }),
    parse: (input) => request('/transactions/parse', { method: 'POST', body: JSON.stringify({ input }) }),
};

// Categories API
export const categoriesAPI = {
    list: (type) => request(`/categories${type ? `?type=${type}` : ''}`),
    create: (data) => request('/categories', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/categories/${id}`, { method: 'DELETE' }),
};

// Family API
export const familyAPI = {
    get: () => request('/family'),
    update: (data) => request('/family', { method: 'PUT', body: JSON.stringify(data) }),
    regenerateCode: () => request('/family/regenerate-code', { method: 'POST' }),
    removeMember: (userId) => request(`/family/members/${userId}`, { method: 'DELETE' }),
    updateRole: (userId, role) => request(`/family/members/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
};

// Reports API
export const reportsAPI = {
    summary: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/reports/summary${query ? `?${query}` : ''}`);
    },
    daily: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/reports/daily${query ? `?${query}` : ''}`);
    },
    monthly: (year) => request(`/reports/monthly${year ? `?year=${year}` : ''}`),
};

// Push API
export const pushAPI = {
    getVapidKey: () => request('/push/vapid-key'),
    subscribe: (subscription) => request('/push/subscribe', { method: 'POST', body: JSON.stringify({ subscription }) }),
    unsubscribe: () => request('/push/unsubscribe', { method: 'DELETE' }),
};

// Loans API
export const loansAPI = {
    list: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/loans${query ? `?${query}` : ''}`);
    },
    create: (data) => request('/loans', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/loans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/loans/${id}`, { method: 'DELETE' }),
    payment: (id, data) => request(`/loans/${id}/payment`, { method: 'POST', body: JSON.stringify(data) }),
};

// Budgets API
export const budgetsAPI = {
    list: () => request('/budgets'),
    create: (data) => request('/budgets', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => request(`/budgets/${id}`, { method: 'DELETE' }),
};

// Goals API
export const goalsAPI = {
    list: (status) => request(`/goals${status ? `?status=${status}` : ''}`),
    create: (data) => request('/goals', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/goals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/goals/${id}`, { method: 'DELETE' }),
    contribute: (id, data) => request(`/goals/${id}/contribute`, { method: 'POST', body: JSON.stringify(data) }),
};

// Investments API
export const investmentsAPI = {
    list: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/investments${query ? `?${query}` : ''}`);
    },
    create: (data) => request('/investments', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/investments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/investments/${id}`, { method: 'DELETE' }),
};

// Recurring API
export const recurringAPI = {
    list: () => request('/recurring'),
    create: (data) => request('/recurring', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/recurring/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/recurring/${id}`, { method: 'DELETE' }),
    run: (id) => request(`/recurring/${id}/run`, { method: 'POST' }),
};

export default {
    auth: authAPI,
    transactions: transactionsAPI,
    categories: categoriesAPI,
    family: familyAPI,
    reports: reportsAPI,
    push: pushAPI,
    loans: loansAPI,
    budgets: budgetsAPI,
    goals: goalsAPI,
    investments: investmentsAPI,
    recurring: recurringAPI,
};

