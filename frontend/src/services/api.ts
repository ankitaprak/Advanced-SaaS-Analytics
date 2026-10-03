import axios from 'axios'

import { getToken } from '../utils/authStorage'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = getToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token invalid/expired hone par
      localStorage.removeItem('analytics_token')
      localStorage.removeItem('analytics_user')
    }

    return Promise.reject(error)
  },
)

export default api