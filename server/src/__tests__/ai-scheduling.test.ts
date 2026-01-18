import { AISchedulingService } from '../services/ai-scheduling.service';
import { Timetable, Constraint, TimetableSlot } from '../models/types';

describe('AISchedulingService', () => {
  const mockTimetable: Timetable = {
    id: 'tt1',
    name: 'Test Timetable',
    schoolId: 'school1',
    academicYear: '2024',
    startDate: new Date('2024-09-01'),
    endDate: new Date('2024-12-31'),
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    periods: [
      { id: 'p1', name: 'Period 1', startTime: '08:00', endTime: '09:00', order: 1 },
      { id: 'p2', name: 'Period 2', startTime: '09:00', endTime: '10:00', order: 2 },
    ],
    classes: [],
    slots: [],
    createdBy: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockConstraints: Constraint[] = [
    {
      id: 'c1',
      timetableId: 'tt1',
      type: 'max_hours_per_day',
      priority: 'required',
      config: { teacherId: 't1', maxHours: 4 },
      isActive: true,
    },
  ];

  const proposedSlot: Partial<TimetableSlot> = {
    classId: 'class1',
    subjectId: 'subject1',
    teacherId: 't1',
  };

  test('should generate scheduling suggestions', () => {
    const suggestions = AISchedulingService.generateSuggestions(
      mockTimetable,
      mockConstraints,
      proposedSlot
    );

    expect(suggestions).toBeInstanceOf(Array);
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.length).toBeLessThanOrEqual(5);
  });

  test('suggestions should have required properties', () => {
    const suggestions = AISchedulingService.generateSuggestions(
      mockTimetable,
      mockConstraints,
      proposedSlot
    );

    suggestions.forEach((suggestion) => {
      expect(suggestion).toHaveProperty('slot');
      expect(suggestion).toHaveProperty('score');
      expect(suggestion).toHaveProperty('reasons');
      expect(suggestion).toHaveProperty('conflicts');
      expect(suggestion.score).toBeGreaterThanOrEqual(0);
      expect(suggestion.score).toBeLessThanOrEqual(100);
    });
  });

  test('suggestions should be sorted by score', () => {
    const suggestions = AISchedulingService.generateSuggestions(
      mockTimetable,
      mockConstraints,
      proposedSlot
    );

    for (let i = 1; i < suggestions.length; i++) {
      expect(suggestions[i - 1].score).toBeGreaterThanOrEqual(suggestions[i].score);
    }
  });
});
