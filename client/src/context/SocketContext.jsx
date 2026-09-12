import {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const { token, user } = useAuth();

    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);

    const addNotification = (notif) => {
        setNotifications((prev) => [
            {
                id: Date.now() + Math.random(),
                time: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
                read: false,
                ...notif,
            },
            ...prev,
        ]);
    };

    useEffect(() => {
        if (!token || !user) {
            setSocket(null);
            return;
        }

        const serverUrl =
            import.meta.env.VITE_SERVER_URL;

        if (!serverUrl) {
            console.error(
                'VITE_SERVER_URL is not configured.'
            );
            return;
        }

        console.log(
            'Connecting Socket.IO to:',
            serverUrl
        );

        const newSocket = io(serverUrl, {
            auth: {
                token,
            },
            withCredentials: true,
        });

        newSocket.on('connect', () => {
            console.log(
                'Socket connected:',
                newSocket.id
            );
        });

        newSocket.on('connect_error', (error) => {
            console.error(
                'Socket connection error:',
                error.message
            );
        });

        newSocket.on('disconnect', (reason) => {
            console.log(
                'Socket disconnected:',
                reason
            );
        });

        newSocket.on('new_quotation', (data) => {
            console.log(
                'Realtime: new quotation received',
                data
            );

            addNotification({
                title: 'New Quotation Received! 💰',
                message:
                    data.message ||
                    'A supplier submitted a new quotation.',
                rfqId: data.rfqId,
                type: 'quote',
            });
        });

        newSocket.on(
            'quotation_status_updated',
            (data) => {
                console.log(
                    'Realtime: quotation status updated',
                    data
                );

                const isAccepted =
                    data.status === 'ACCEPTED';

                addNotification({
                    title: isAccepted
                        ? 'Quotation Accepted! 🎉'
                        : 'Quotation Rejected ⚠️',
                    message:
                        data.message ||
                        'Your quotation status has changed.',
                    rfqId: data.rfqId,
                    type: isAccepted
                        ? 'success'
                        : 'alert',
                });
            }
        );

        newSocket.on('rfq_created', (data) => {
            console.log(
                'Realtime: new RFQ created',
                data
            );

            addNotification({
                title: 'New RFQ Opportunity! 📦',
                message:
                    data.message ||
                    'A new RFQ has been posted.',
                rfqId: data.rfq?.id,
                type: 'rfq',
            });
        });

        newSocket.on('rfq_updated', (data) => {
            console.log(
                'Realtime: RFQ updated',
                data
            );
        });

        newSocket.on('rfq_deleted', (data) => {
            console.log(
                'Realtime: RFQ deleted',
                data
            );
        });

        setSocket(newSocket);

        return () => {
            console.log(
                'Cleaning up Socket.IO connection'
            );

            newSocket.removeAllListeners();
            newSocket.disconnect();
        };
    }, [token, user]);

    const markAllAsRead = () => {
        setNotifications((prev) =>
            prev.map((notification) => ({
                ...notification,
                read: true,
            }))
        );
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    const unreadCount = notifications.filter(
        (notification) => !notification.read
    ).length;

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

export const useSocket = () =>
    useContext(SocketContext) ?? {
        socket: null,
        notifications: [],
        unreadCount: 0,
        markAllAsRead: () => {},
        clearNotifications: () => {},
    };