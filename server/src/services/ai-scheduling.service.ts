import {
  Timetable,
  TimetableSlot,
  Constraint,
  SchedulingSuggestion,
} from '../models/types';

export class AISchedulingService {
  /**
   * Generate AI-powered scheduling suggestions for a timetable
   */
  static generateSuggestions(
    timetable: Timetable,
    constraints: Constraint[],
    proposedSlot: Partial<TimetableSlot>
  ): SchedulingSuggestion[] {
    const suggestions: SchedulingSuggestion[] = [];

    // Get all possible time slots
    const possibleSlots = this.getPossibleSlots(timetable, proposedSlot);

    // Score each possible slot
    for (const slot of possibleSlots) {
      const score = this.calculateSlotScore(slot, timetable, constraints);
      const reasons = this.getScoreReasons(slot, timetable, constraints);
      const conflicts = this.detectConflicts(slot, timetable);

      suggestions.push({
        slot,
        score,
        reasons,
        conflicts,
      });
    }

    // Sort by score (highest first)
    return suggestions.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  /**
   * Get all possible slots for a given partial slot
   */
  private static getPossibleSlots(
    timetable: Timetable,
    proposedSlot: Partial<TimetableSlot>
  ): TimetableSlot[] {
    const slots: TimetableSlot[] = [];

    for (const day of timetable.days) {
      for (const period of timetable.periods) {
        slots.push({
          id: `slot_${Date.now()}_${Math.random()}`,
          timetableId: timetable.id,
          classId: proposedSlot.classId || '',
          subjectId: proposedSlot.subjectId || '',
          teacherId: proposedSlot.teacherId || '',
          day,
          periodId: period.id,
          room: proposedSlot.room,
        });
      }
    }

    return slots;
  }

  /**
   * Calculate a score for a given slot (0-100)
   */
  private static calculateSlotScore(
    slot: TimetableSlot,
    timetable: Timetable,
    constraints: Constraint[]
  ): number {
    let score = 100;

    // Check for conflicts
    const conflicts = this.detectConflicts(slot, timetable);
    score -= conflicts.length * 30;

    // Apply constraint penalties
    for (const constraint of constraints) {
      if (!constraint.isActive) continue;

      const penalty = this.evaluateConstraint(slot, constraint, timetable);
      if (constraint.priority === 'required') {
        score -= penalty * 20;
      } else if (constraint.priority === 'preferred') {
        score -= penalty * 10;
      } else {
        score -= penalty * 5;
      }
    }

    // Prefer morning slots slightly
    const period = timetable.periods.find((p) => p.id === slot.periodId);
    if (period && period.order <= 2) {
      score += 5;
    }

    // Prefer balanced distribution
    const teacherSlots = timetable.slots.filter(
      (s) => s.teacherId === slot.teacherId && s.day === slot.day
    );
    if (teacherSlots.length >= 4) {
      score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Detect conflicts for a proposed slot
   */
  private static detectConflicts(
    slot: TimetableSlot,
    timetable: Timetable
  ): string[] {
    const conflicts: string[] = [];

    for (const existingSlot of timetable.slots) {
      if (existingSlot.day === slot.day && existingSlot.periodId === slot.periodId) {
        if (existingSlot.teacherId === slot.teacherId) {
          conflicts.push(`Teacher already has a class at this time`);
        }
        if (existingSlot.classId === slot.classId) {
          conflicts.push(`Class already has a lesson at this time`);
        }
        if (existingSlot.room && slot.room && existingSlot.room === slot.room) {
          conflicts.push(`Room ${slot.room} is already occupied`);
        }
      }
    }

    return conflicts;
  }

  /**
   * Evaluate a constraint for a given slot
   */
  private static evaluateConstraint(
    slot: TimetableSlot,
    constraint: Constraint,
    timetable: Timetable
  ): number {
    let penalty = 0;

    switch (constraint.type) {
      case 'max_hours_per_day':
        if (constraint.config.teacherId === slot.teacherId) {
          const daySlots = timetable.slots.filter(
            (s) => s.teacherId === slot.teacherId && s.day === slot.day
          );
          if (daySlots.length >= (constraint.config.maxHours || 6)) {
            penalty = 1;
          }
        }
        break;

      case 'preferred_time':
        if (
          constraint.config.day !== slot.day ||
          constraint.config.periodId !== slot.periodId
        ) {
          penalty = 0.5;
        }
        break;

      case 'avoid_time':
        if (
          constraint.config.day === slot.day &&
          constraint.config.periodId === slot.periodId
        ) {
          penalty = 1;
        }
        break;

      case 'teacher_availability':
        if (constraint.config.teacherId === slot.teacherId) {
          if (
            constraint.config.day === slot.day &&
            constraint.config.periodId === slot.periodId
          ) {
            penalty = 1;
          }
        }
        break;
    }

    return penalty;
  }

  /**
   * Get human-readable reasons for the score
   */
  private static getScoreReasons(
    slot: TimetableSlot,
    timetable: Timetable,
    constraints: Constraint[]
  ): string[] {
    const reasons: string[] = [];

    const conflicts = this.detectConflicts(slot, timetable);
    if (conflicts.length === 0) {
      reasons.push('No conflicts detected');
    }

    const period = timetable.periods.find((p) => p.id === slot.periodId);
    if (period && period.order <= 2) {
      reasons.push('Preferred morning slot');
    }

    const teacherSlots = timetable.slots.filter(
      (s) => s.teacherId === slot.teacherId && s.day === slot.day
    );
    if (teacherSlots.length < 4) {
      reasons.push('Balanced teacher workload');
    }

    return reasons;
  }
}
