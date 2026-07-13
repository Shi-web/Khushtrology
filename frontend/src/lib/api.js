import axios from 'axios'
import { supabase } from './supabase'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
})

api.interceptors.request.use(async config => {
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`
    }
  }
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    console.error('[API]', err.response?.status, err.response?.data)
    return Promise.reject(err)
  }
)

export default api
