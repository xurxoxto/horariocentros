import { Router, Request, Response } from 'express';

const router = Router();

// Mock data
const rooms: any[] = [
  {
    id: '1',
    name: 'Room 101',
    building: 'Main Building',
    floor: 1,
    capacity: 30,
    type: 'classroom',
    equipment: ['projector', 'whiteboard'],
    available: true,
  },
  {
    id: '2',
    name: 'Science Lab 1',
    building: 'Science Block',
    floor: 2,
    capacity: 25,
    type: 'lab',
    equipment: ['microscopes', 'lab benches'],
    available: true,
  },
];

// Get all rooms
router.get('/', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rooms',
    });
  }
});

// Create room
router.post('/', (req: Request, res: Response) => {
  try {
    const room = {
      id: String(rooms.length + 1),
      ...req.body,
      available: true,
    };

    rooms.push(room);

    res.json({
      success: true,
      data: room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create room',
    });
  }
});

export default router;
