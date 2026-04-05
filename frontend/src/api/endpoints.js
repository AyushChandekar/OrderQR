import api from './axios'

// Auth
export const login = (data) => api.post('/auth/login', data)
export const signup = (data) => api.post('/auth/signup', data)

// Tables (admin — JWT scoped)
export const createTables = (data) => api.post('/tables', data)
export const getTables = () => api.get('/tables')

// Table info (public — customer)
export const getTableInfo = (tableId) => api.get(`/tables/${tableId}`)

// Menu Sections (admin — JWT scoped)
export const getSections = () => api.get('/menu/sections')
export const createSection = (data) => api.post('/menu/sections', data)
export const updateSection = (id, data) => api.put(`/menu/sections/${id}`, data)
export const deleteSection = (id) => api.delete(`/menu/sections/${id}`)

// Menu Sections (public — customer, by adminId)
export const getPublicSections = (adminId) => api.get(`/menu/sections/public?adminId=${adminId}`)

// Menu Items (admin — JWT scoped)
export const createMenuItem = (data) => api.post('/menu', data)
export const updateMenuItem = (id, data) => api.put(`/menu/${id}`, data)
export const deleteMenuItem = (id) => api.delete(`/menu/${id}`)

// Orders (customer — public, scoped by tableId in URL)
export const createRazorpayOrder = (tableId, data) => api.post(`/orders/create-razorpay-order/${tableId}`, data)
export const verifyPayment = (tableId, data) => api.post(`/orders/verify-payment/${tableId}`, data)

// Orders (admin — JWT scoped)
export const getOrders = () => api.get('/orders')
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status })
