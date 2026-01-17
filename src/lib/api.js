/**
 * API Client for PayMe Backend
 * Base URL: /api (proxied to localhost:3001)
 * Authentication: Cookie-based (credentials: include)
 */

const BASE_URL = '/api';

/**
 * Generic request wrapper with error handling
 * @param {string} endpoint - API endpoint path
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<any>} Response data
 */
async function request(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined;
  }

  return response.json();
}

export const api = {
  // Authentication endpoints
  auth: {
    register: (username, password) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
    login: (username, password) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    me: () => request('/auth/me'),
  },

  // Month management
  months: {
    list: () => request('/months'),
    current: () => request('/months/current'),
    get: (id) => request(`/months/${id}`),
    close: (id) => request(`/months/${id}/close`, { method: 'POST' }),
    downloadPdf: async (id) => {
      const response = await fetch(`${BASE_URL}/months/${id}/pdf`, {
        credentials: 'include',
      });
      return response.blob();
    },
  },

  // Fixed expenses (recurring monthly)
  fixedExpenses: {
    list: () => request('/fixed-expenses'),
    create: (data) =>
      request('/fixed-expenses', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      request(`/fixed-expenses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) => request(`/fixed-expenses/${id}`, { method: 'DELETE' }),
  },

  // Budget categories
  categories: {
    list: () => request('/categories'),
    create: (data) =>
      request('/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      request(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) => request(`/categories/${id}`, { method: 'DELETE' }),
  },

  // Monthly budget allocations
  budgets: {
    list: (monthId) => request(`/months/${monthId}/budgets`),
    update: (monthId, budgetId, amount) =>
      request(`/months/${monthId}/budgets/${budgetId}`, {
        method: 'PUT',
        body: JSON.stringify({ allocated_amount: amount }),
      }),
  },

  // Income entries
  income: {
    list: (monthId) => request(`/months/${monthId}/income`),
    create: (monthId, data) =>
      request(`/months/${monthId}/income`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (monthId, incomeId, data) =>
      request(`/months/${monthId}/income/${incomeId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (monthId, incomeId) =>
      request(`/months/${monthId}/income/${incomeId}`, { method: 'DELETE' }),
  },

  // Spending items
  items: {
    list: (monthId) => request(`/months/${monthId}/items`),
    create: (monthId, data) =>
      request(`/months/${monthId}/items`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (monthId, itemId, data) =>
      request(`/months/${monthId}/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (monthId, itemId) =>
      request(`/months/${monthId}/items/${itemId}`, { method: 'DELETE' }),
  },

  // Statistics and trends
  stats: {
    get: () => request('/stats'),
  },

  // Current savings
  savings: {
    get: () => request('/savings'),
    update: (savings) =>
      request('/savings', {
        method: 'PUT',
        body: JSON.stringify({ savings }),
      }),
  },

  // Retirement savings
  retirementSavings: {
    get: () => request('/retirement-savings'),
    update: (retirement_savings) =>
      request('/retirement-savings', {
        method: 'PUT',
        body: JSON.stringify({ retirement_savings }),
      }),
  },
};

/**
 * Data Shape Documentation (JSDoc for IDE hints)
 *
 * @typedef {Object} UserExport
 * @property {number} version
 * @property {number} [savings]
 * @property {number} [retirement_savings]
 * @property {Array<{label: string, amount: number}>} fixed_expenses
 * @property {Array<{label: string, default_amount: number}>} categories
 * @property {Array<MonthExport>} months
 *
 * @typedef {Object} MonthExport
 * @property {number} year
 * @property {number} month
 * @property {boolean} is_closed
 * @property {Array<{label: string, amount: number}>} income_entries
 * @property {Array<{category_label: string, allocated_amount: number}>} budgets
 * @property {Array<{category_label: string, description: string, amount: number, spent_on: string}>} items
 *
 * @typedef {Object} Month
 * @property {number} id
 * @property {number} user_id
 * @property {number} year
 * @property {number} month
 * @property {boolean} is_closed
 * @property {string|null} closed_at
 *
 * @typedef {Object} FixedExpense
 * @property {number} id
 * @property {number} user_id
 * @property {string} label
 * @property {number} amount
 *
 * @typedef {Object} BudgetCategory
 * @property {number} id
 * @property {number} user_id
 * @property {string} label
 * @property {number} default_amount
 *
 * @typedef {Object} MonthlyBudget
 * @property {number} id
 * @property {number} month_id
 * @property {number} category_id
 * @property {number} allocated_amount
 *
 * @typedef {Object} MonthlyBudgetWithCategory
 * @property {number} id
 * @property {number} month_id
 * @property {number} category_id
 * @property {string} category_label
 * @property {number} allocated_amount
 * @property {number} spent_amount
 *
 * @typedef {Object} IncomeEntry
 * @property {number} id
 * @property {number} month_id
 * @property {string} label
 * @property {number} amount
 *
 * @typedef {Object} Item
 * @property {number} id
 * @property {number} month_id
 * @property {number} category_id
 * @property {string} description
 * @property {number} amount
 * @property {string} spent_on
 *
 * @typedef {Object} ItemWithCategory
 * @property {number} id
 * @property {number} month_id
 * @property {number} category_id
 * @property {string} category_label
 * @property {string} description
 * @property {number} amount
 * @property {string} spent_on
 *
 * @typedef {Object} MonthSummary
 * @property {Month} month
 * @property {IncomeEntry[]} income_entries
 * @property {FixedExpense[]} fixed_expenses
 * @property {MonthlyBudgetWithCategory[]} budgets
 * @property {ItemWithCategory[]} items
 * @property {number} total_income
 * @property {number} total_fixed
 * @property {number} total_budgeted
 * @property {number} total_spent
 * @property {number} remaining
 *
 * @typedef {Object} CategoryStats
 * @property {number} category_id
 * @property {string} category_label
 * @property {number} current_month_spent
 * @property {number} previous_month_spent
 * @property {number} change_amount
 * @property {number|null} change_percent
 *
 * @typedef {Object} MonthlyStats
 * @property {number} year
 * @property {number} month
 * @property {number} total_income
 * @property {number} total_spent
 * @property {number} total_fixed
 * @property {number} net
 *
 * @typedef {Object} StatsResponse
 * @property {CategoryStats[]} category_comparisons
 * @property {MonthlyStats[]} monthly_trends
 * @property {number} average_monthly_spending
 * @property {number} average_monthly_income
 */
