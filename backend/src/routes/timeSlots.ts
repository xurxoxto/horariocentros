import { Router, Request, Response } from 'express';

const router = Router();

// Mock time slots data
const timeSlots = [
  {
    id: '1',
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '09:00',
    duration: 60,
  },
  {
    id: '2',
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '10:00',
    duration: 60,
  },
  {
    id: '3',
    dayOfWeek: 1,
    startTime: '10:00',
    endTime: '11:00',
    duration: 60,
  },
  {
    id: '4',
    dayOfWeek: 1,
    startTime: '11:00',
    endTime: '12:00',
    duration: 60,
  },
  {
    id: '5',
    dayOfWeek: 1,
    startTime: '13:00',
    endTime: '14:00',
    duration: 60,
  },
];

router.get('/', (req: Request, res: Response) => {
  res.json({ success: true, data: timeSlots });
});

router.post('/', (req: Request, res: Response) => {
  const slot = { id: String(timeSlots.length + 1), ...req.body };
  timeSlots.push(slot);
  res.json({ success: true, data: slot });
});

export default router;
