import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const shareApi = {
  // Get all shares for a user
  getShares: async () => {
    const response = await apiClient.get('/shares')
    return response.data
  },

  // Create a new share
  createShare: async (resumeId: string, config: any) => {
    const response = await apiClient.post('/shares/create', {
      resumeId,
      ...config,
    })
    return response.data
  },

  // Get share details (public)
  getShare: async (shareToken: string) => {
    const response = await apiClient.get(`/shares/${shareToken}`)
    return response.data
  },

  // Add comment to share
  addComment: async (shareToken: string, text: string, section: string) => {
    const response = await apiClient.post(`/shares/${shareToken}/comments`, {
      text,
      section,
    })
    return response.data
  },

  // Update share permissions
  updatePermissions: async (shareId: string, permissions: any) => {
    const response = await apiClient.put(`/shares/${shareId}/permissions`, {
      permissions,
    })
    return response.data
  },

  // Revoke share
  revokeShare: async (shareId: string) => {
    const response = await apiClient.delete(`/shares/${shareId}`)
    return response.data
  },

  // Get share analytics
  getAnalytics: async (shareId: string) => {
    const response = await apiClient.get(`/shares/${shareId}/analytics`)
    return response.data
  },

  // Mark comment as resolved
  resolveComment: async (shareId: string, commentId: string) => {
    const response = await apiClient.patch(`/shares/${shareId}/comments/${commentId}/resolve`)
    return response.data
  },
}

export default shareApi
