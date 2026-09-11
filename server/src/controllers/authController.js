import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
const generateToken = (user) => {
    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_rfq_marketplace_2026';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            name: user.name,
            companyName: user.companyName,
            role: user.role,
        },
        secret,
        { expiresIn }
    );
};
export const register = async (req, res, next) => {
    try {
        const { email, password, name, companyName, role, phone } = req.body;
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'A user with this email already exists.',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                password: hashedPassword,
                name,
                companyName,
                role,
                phone: phone || null,
            },
            select: {
                id: true,
                email: true,
                name: true,
                companyName: true,
                role: true,
                phone: true,
                createdAt: true,
            },
        });
        const token = generateToken(user);
        res.status(201).json({
            success: true,
            message: 'Account created successfully.',
            data: { user, token },
        });
    } catch (error) {
        next(error);
    }
};
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }
        const token = generateToken(user);
        const safeUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            companyName: user.companyName,
            role: user.role,
            phone: user.phone,
        };
        res.status(200).json({
            success: true,
            message: 'Logged in successfully.',
            data: { user: safeUser, token },
        });
    } catch (error) {
        next(error);
    }
};
export const getMe = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                companyName: true,
                role: true,
                phone: true,
                createdAt: true,
            },
        });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        res.status(200).json({
            success: true,
            data: { user },
        });
    } catch (error) {
        next(error);
    }
};