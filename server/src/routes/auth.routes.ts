import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// In-memory user store (replace with database in production)
const users: any[] = [];

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['admin', 'teacher', 'student']),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = users.find((u) => u.email === data.email);
    if (existingUser) {
      throw new AppError(400, 'User already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = {
      id: `user_${Date.now()}`,
      email: data.email,
      name: data.name,
      role: data.role,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.push(user);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = users.find((u) => u.email === data.email);
    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw new AppError(401, 'Invalid credentials');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
