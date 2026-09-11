import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { initSocket } from './sockets/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import rfqRoutes from './routes/rfqRoutes.js';
import quotationRoutes from './routes/quotationRoutes.js';
dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
initSocket(server, CLIENT_URL);

app.use(cors({ origin: CLIENT_URL, credentials: true, }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'B2B RFQ Marketplace API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/rfqs', rfqRoutes);
app.use('/api/quotations', quotationRoutes);
app.use(errorHandler);

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`Accepting requests from: ${CLIENT_URL}`);
});