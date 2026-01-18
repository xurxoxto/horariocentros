import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { Timetable, TimetableSlot } from '../models/types';

const router = Router();

// In-memory store (replace with database)
const timetables: Timetable[] = [];

router.get('/', authenticate, (req, res) => {
  res.json({ timetables });
});

router.get('/:id', authenticate, (req, res, next) => {
  const timetable = timetables.find((t) => t.id === req.params.id);
  if (!timetable) {
    return res.status(404).json({ error: 'Timetable not found' });
  }
  res.json({ timetable });
});

router.post('/', authenticate, (req, res, next) => {
  try {
    const timetable: Timetable = {
      id: `tt_${Date.now()}`,
      ...req.body,
      createdBy: (req as any).user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    timetables.push(timetable);
    res.status(201).json({ timetable });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, (req, res, next) => {
  try {
    const index = timetables.findIndex((t) => t.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Timetable not found' });
    }
    timetables[index] = {
      ...timetables[index],
      ...req.body,
      updatedAt: new Date(),
    };
    res.json({ timetable: timetables[index] });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, (req, res, next) => {
  const index = timetables.findIndex((t) => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Timetable not found' });
  }
  timetables.splice(index, 1);
  res.status(204).send();
});

export default router;
