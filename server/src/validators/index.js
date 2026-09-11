import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    companyName: z.string().min(2, 'Company name is required'),
    role: z.enum(['BUYER', 'SUPPLIER'], {
        errorMap: () => ({ message: 'Role must be either BUYER or SUPPLIER' }),
    }),
    phone: z.string().optional(),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const rfqSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    category: z.string().min(2, 'Category is required'),
    quantity: z.number().positive('Quantity must be greater than 0'),
    unit: z.string().min(1, 'Unit of measurement is required (e.g. Units, Tons, Pieces)'),
    deliveryLocation: z.string().min(2, 'Delivery location is required'),
    deadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid deadline date format',
    }),
    targetBudget: z.number().positive().optional().nullable(),
});

export const quotationSchema = z.object({
    price: z.number().positive('Quoted price must be greater than 0'),
    deliveryDays: z.number().int().positive('Delivery duration must be at least 1 day'),
    validUntil: z.string().optional().nullable(),
    notes: z.string().min(5, 'Please provide quotation notes/terms (at least 5 characters)'),
});

export const validate = (schema) => (req, res, next) => {
    try {
        req.body = schema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
            });
        }
        next(error);
    }
};