import { Router, Request, Response } from 'express';

const router = Router();

// Mock data
const studentGroups: any[] = [];

router.get('/', (req: Request, res: Response) => {
  res.json({ success: true, data: studentGroups });
});

router.post('/', (req: Request, res: Response) => {
  const group = { id: String(studentGroups.length + 1), ...req.body };
  studentGroups.push(group);
  res.json({ success: true, data: group });
});

export default router;
