import { Router, Request, Response } from 'express';

const router = Router();

// Mock data
const teachers: any[] = [];

router.get('/', (req: Request, res: Response) => {
  res.json({ success: true, data: teachers });
});

router.post('/', (req: Request, res: Response) => {
  const teacher = { id: String(teachers.length + 1), ...req.body };
  teachers.push(teacher);
  res.json({ success: true, data: teacher });
});

export default router;
