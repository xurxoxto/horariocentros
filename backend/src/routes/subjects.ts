import { Router, Request, Response } from 'express';

const router = Router();

// Mock data
const subjects: any[] = [];

router.get('/', (req: Request, res: Response) => {
  res.json({ success: true, data: subjects });
});

router.post('/', (req: Request, res: Response) => {
  const subject = { id: String(subjects.length + 1), ...req.body };
  subjects.push(subject);
  res.json({ success: true, data: subject });
});

export default router;
