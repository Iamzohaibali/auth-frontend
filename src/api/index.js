import api from './axios';

export const authAPI = {
  register:           (data) => api.post('/auth/register', data),
  login:              (data) => api.post('/auth/login', data),
  verify2FA:          (data) => api.post('/auth/verify-2fa', data),
  logout:             ()     => api.post('/auth/logout'),
  getMe:              ()     => api.get('/auth/me'),
  verifyEmail:        (token)=> api.get(`/auth/verify-email/${token}`),
  resendVerification: (email)=> api.post('/auth/resend-verification', { email }),
  forgotPassword:     (email)=> api.post('/auth/forgot-password', { email }),
  resetPassword:      (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  changePassword:     (data) => api.post('/auth/change-password', data),
  toggle2FA:          ()     => api.post('/auth/toggle-2fa'),
  getLoginHistory:    ()     => api.get('/auth/login-history'),
  refreshToken:       ()     => api.post('/auth/refresh-token'),
};

export const profileAPI = {
  getProfile:        ()      => api.get('/profile'),
  updateProfile:     (data)  => api.patch('/profile', data),
  uploadAvatar:      (formData) => api.post('/profile/avatar', formData),
  deleteAvatar:      ()      => api.delete('/profile/avatar'),
  requestEmailUpdate:(email) => api.post('/profile/email-change', { newEmail: email }),
  deleteAccount:     (password) => api.delete('/profile/account', { data: { password } }),
};

export const adminAPI = {
  getStats:        ()              => api.get('/admin/stats'),
  getAllUsers:      (params)        => api.get('/admin/users', { params }),
  getUserById:     (id)            => api.get(`/admin/users/${id}`),
  banUser:         (id, reason)    => api.patch(`/admin/users/${id}/ban`, { reason }),
  unbanUser:       (id)            => api.patch(`/admin/users/${id}/unban`),
  updateUserRole:  (id, role)      => api.patch(`/admin/users/${id}/role`, { role }),
  resetPassword:   (id, newPassword) => api.patch(`/admin/users/${id}/reset-password`, { newPassword }),
  deleteUser:      (id)            => api.delete(`/admin/users/${id}`),
};