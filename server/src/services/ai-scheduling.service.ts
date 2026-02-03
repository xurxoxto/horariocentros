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

      case 'min_hours_per_day':
        if (constraint.config.teacherId === slot.teacherId) {
          const daySlots = timetable.slots.filter(
            (s) => s.teacherId === slot.teacherId && s.day === slot.day
          );
          if (daySlots.length < (constraint.config.minHours || 2)) {
            penalty = 0.5;
          }
        }
        break;

      case 'max_consecutive_hours':
        if (constraint.config.teacherId === slot.teacherId) {
          const consecutiveCount = this.countConsecutivePeriods(
            slot,
            timetable,
            'teacher'
          );
          if (consecutiveCount >= (constraint.config.maxConsecutive || 3)) {
            penalty = 1;
          }
        }
        break;

      case 'mandatory_break':
        if (constraint.config.teacherId === slot.teacherId) {
          const hasBreak = this.checkMandatoryBreak(slot, timetable, constraint);
          if (!hasBreak) {
            penalty = 1;
          }
        }
        break;

      case 'avoid_gaps':
        if (constraint.config.teacherId === slot.teacherId || constraint.config.classId === slot.classId) {
          const hasGaps = this.detectGaps(slot, timetable, constraint);
          if (hasGaps) {
            penalty = 0.7;
          }
        }
        break;

      case 'special_room_required':
        if (constraint.config.subjectId === slot.subjectId) {
          if (!slot.room || constraint.config.roomType) {
            penalty = 1;
          }
        }
        break;

      case 'pedagogical_continuity':
        if (constraint.config.classId === slot.classId) {
          const hasContinuity = this.checkPedagogicalContinuity(
            slot,
            timetable,
            constraint
          );
          if (!hasContinuity) {
            penalty = 0.6;
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

      case 'room_availability':
        if (constraint.config.roomId === slot.room) {
          if (
            constraint.config.day === slot.day &&
            constraint.config.periodId === slot.periodId
          ) {
            penalty = 1;
          }
        }
        break;

      case 'balanced_distribution':
        if (constraint.config.teacherId === slot.teacherId) {
          const distribution = this.calculateDistribution(slot, timetable);
          if (distribution > 0.7) {
            penalty = 0.5;
          }
        }
        break;
    }

    return penalty;
  }

  /**
   * Count consecutive periods for teacher or class
   */
  private static countConsecutivePeriods(
    slot: TimetableSlot,
    timetable: Timetable,
    type: 'teacher' | 'class'
  ): number {
    const daySlots = timetable.slots
      .filter((s) => {
        if (type === 'teacher') {
          return s.teacherId === slot.teacherId && s.day === slot.day;
        }
        return s.classId === slot.classId && s.day === slot.day;
      })
      .sort((a, b) => {
        const periodA = timetable.periods.find((p) => p.id === a.periodId);
        const periodB = timetable.periods.find((p) => p.id === b.periodId);
        return (periodA?.order || 0) - (periodB?.order || 0);
      });

    let maxConsecutive = 1;
    let currentConsecutive = 1;

    for (let i = 1; i < daySlots.length; i++) {
      const prevPeriod = timetable.periods.find((p) => p.id === daySlots[i - 1].periodId);
      const currPeriod = timetable.periods.find((p) => p.id === daySlots[i].periodId);

      if (prevPeriod && currPeriod && currPeriod.order === prevPeriod.order + 1) {
        currentConsecutive++;
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      } else {
        currentConsecutive = 1;
      }
    }

    return maxConsecutive;
  }

  /**
   * Check if mandatory break is respected
   */
  private static checkMandatoryBreak(
    slot: TimetableSlot,
    timetable: Timetable,
    constraint: Constraint
  ): boolean {
    const consecutive = this.countConsecutivePeriods(slot, timetable, 'teacher');
    const breakDuration = constraint.config.breakDuration || 1;
    return consecutive < (constraint.config.maxConsecutive || 4) || breakDuration > 0;
  }

  /**
   * Detect gaps in schedule
   */
  private static detectGaps(
    slot: TimetableSlot,
    timetable: Timetable,
    constraint: Constraint
  ): boolean {
    const entityId = constraint.config.teacherId || constraint.config.classId;
    const filterFn = constraint.config.teacherId
      ? (s: TimetableSlot) => s.teacherId === entityId && s.day === slot.day
      : (s: TimetableSlot) => s.classId === entityId && s.day === slot.day;

    const daySlots = timetable.slots
      .filter(filterFn)
      .sort((a, b) => {
        const periodA = timetable.periods.find((p) => p.id === a.periodId);
        const periodB = timetable.periods.find((p) => p.id === b.periodId);
        return (periodA?.order || 0) - (periodB?.order || 0);
      });

    for (let i = 1; i < daySlots.length; i++) {
      const prevPeriod = timetable.periods.find((p) => p.id === daySlots[i - 1].periodId);
      const currPeriod = timetable.periods.find((p) => p.id === daySlots[i].periodId);

      if (prevPeriod && currPeriod && currPeriod.order - prevPeriod.order > 1) {
        return true; // Gap detected
      }
    }

    return false;
  }

  /**
   * Check pedagogical continuity
   */
  private static checkPedagogicalContinuity(
    slot: TimetableSlot,
    timetable: Timetable,
    constraint: Constraint
  ): boolean {
    if (!constraint.config.pedagogicalSequence) {
      return true;
    }

    const classSlots = timetable.slots.filter((s) => s.classId === slot.classId);
    const sequence = constraint.config.pedagogicalSequence;

    // Check if subjects follow the specified order
    for (let i = 0; i < sequence.length - 1; i++) {
      const currentSubject = sequence[i];
      const nextSubject = sequence[i + 1];

      const currentSlot = classSlots.find((s) => s.subjectId === currentSubject);
      const nextSlot = classSlots.find((s) => s.subjectId === nextSubject);

      if (currentSlot && nextSlot) {
        const currentPeriod = timetable.periods.find((p) => p.id === currentSlot.periodId);
        const nextPeriod = timetable.periods.find((p) => p.id === nextSlot.periodId);

        if (currentPeriod && nextPeriod && nextPeriod.order < currentPeriod.order) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Calculate distribution balance (0 = perfect, 1 = very unbalanced)
   */
  private static calculateDistribution(
    slot: TimetableSlot,
    timetable: Timetable
  ): number {
    const slotsByDay: Record<string, number> = {};

    timetable.days.forEach((day) => {
      slotsByDay[day] = timetable.slots.filter(
        (s) => s.teacherId === slot.teacherId && s.day === day
      ).length;
    });

    const values = Object.values(slotsByDay);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;

    return Math.min(variance / 10, 1);
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
