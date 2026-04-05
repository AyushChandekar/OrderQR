import { createContext, useContext, useState } from 'react'
import { login as loginApi, signup as signupApi } from '../api/endpoints'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem('admin')
    return stored ? JSON.parse(stored) : null
  })

  const login = async (username, password) => {
    const { data } = await loginApi({ username, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('admin', JSON.stringify(data))
    setAdmin(data)
    return data
  }

  const signupAdmin = async ({ username, password, restaurantName, email, phone }) => {
    const { data } = await signupApi({ username, password, restaurantName, email, phone })
    localStorage.setItem('token', data.token)
    localStorage.setItem('admin', JSON.stringify(data))
    setAdmin(data)
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('admin')
    setAdmin(null)
  }

  const isAuthenticated = !!admin

  return (
    <AuthContext.Provider value={{ admin, login, signupAdmin, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
