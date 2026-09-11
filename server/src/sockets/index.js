import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';

let io = null;

export const initSocket = (httpServer, clientUrl) => {
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: clientUrl || 'http://localhost:5173',
            methods: ['GET', 'POST', 'PATCH'],
            credentials: true,
        },
    });
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next();
        }
        try {
            const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_rfq_marketplace_2026';
            const decoded = jwt.verify(token, secret);
            socket.data.user = decoded;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        const user = socket.data.user;
        if (user) {
            socket.join(`user_${user.id}`);
            socket.join(`role_${user.role}`);
        }
        socket.on('disconnect', () => { });
    });
    return io;
};
export const sendToUser = (userId, event, data) => {
    if (io) {
        io.to(`user_${userId}`).emit(event, data);
    }
};
export const broadcastRole = (role, event, data) => {
    if (io) {
        io.to(`role_${role}`).emit(event, data);
    }
};
export const broadcastAll = (event, data) => {
    if (io) {
        io.emit(event, data);
    }
};