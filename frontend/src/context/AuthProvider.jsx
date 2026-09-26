import { useState } from 'react';
import { request, setAuthToken } from '../api/client';
import { AuthContext } from './AuthContext';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  async function login(email, password) {
    const data = await request('/api/auth/login', { method: 'POST', body: { email, password } });
    setAuthToken(data.token);
    setUser(data.user);
  }

  function logout() {
    setAuthToken(null);
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}
