import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const { token, user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (token && user) {
            const serverUrl = import.meta.env.VITE_SERVER_URL || 'https://rfq-marketplace-api-1e71.onrender.com';
            const newSocket = io(serverUrl, {
                auth: { token },
            });
            newSocket.on('new_quotation', (data) => {
                addNotification({
                    title: 'New Quotation Received! 💰',
                    message: data.message,
                    rfqId: data.rfqId,
                    type: 'quote',
                });
            });
            newSocket.on('quotation_status_updated', (data) => {
                const isAccepted = data.status === 'ACCEPTED';
                addNotification({
                    title: isAccepted ? 'Quotation Accepted! 🎉' : 'Quotation Rejected ⚠️',
                    message: data.message,
                    rfqId: data.rfqId,
                    type: isAccepted ? 'success' : 'alert',
                });
            });
            newSocket.on('rfq_created', (data) => {
                addNotification({
                    title: 'New RFQ Opportunity! 📦',
                    message: data.message,
                    rfqId: data.rfq?.id,
                    type: 'rfq',
                });
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        } else {
            setSocket(null);
        }
    }, [token, user]);

    const addNotification = (notif) => {
        setNotifications((prev) => [
            {
                id: Date.now() + Math.random(),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                read: false,
                ...notif,
            },
            ...prev,
        ]);
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <SocketContext.Provider
            value={{
                socket,
                notifications,
                unreadCount,
                markAllAsRead,
                clearNotifications,
            }}
        >
            {children}
        </SocketContext.Provider>
    );
};
export const useSocket = () => useContext(SocketContext) ?? {
    socket: null,
    notifications: [],
    unreadCount: 0,
    markAllAsRead: () => {},
    clearNotifications: () => {},
};