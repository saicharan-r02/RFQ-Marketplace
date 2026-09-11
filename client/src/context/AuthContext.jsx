import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchCurrentUser = async () => {
            if (token) {
                try {
                    const res = await API.get('/auth/me');
                    setUser(res.data.data.user);
                } catch (err) {
                    console.error('Session expired or invalid token');
                    logout();
                }
            }
            setLoading(false);
        };

        fetchCurrentUser();
    }, [token]);

    const login = async (email, password) => {
        const res = await API.post('/auth/login', { email, password });
        const { token: receivedToken, user: receivedUser } = res.data.data;
        localStorage.setItem('token', receivedToken);
        setToken(receivedToken);
        setUser(receivedUser);
        return receivedUser;
    };

    const register = async (userData) => {
        const res = await API.post('/auth/register', userData);
        const { token: receivedToken, user: receivedUser } = res.data.data;
        localStorage.setItem('token', receivedToken);
        setToken(receivedToken);
        setUser(receivedUser);
        return receivedUser;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                role: user?.role,
                login,
                register,
                logout,
                loading,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
export const useAuth = () => useContext(AuthContext);