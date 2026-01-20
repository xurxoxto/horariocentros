/**
 * Sistema completo de restricciones tipo FET
 * Basado en la funcionalidad de Free Timetabling Software
 */

export enum ConstraintType {
  // === RESTRICCIONES DE TIEMPO ===
  TIME_BASIC = 'time_basic',
  TIME_PREFERRED_STARTING_TIMES = 'time_preferred_starting_times',
  TIME_NOT_AVAILABLE = 'time_not_available',
  
  // === RESTRICCIONES DE PROFESORES ===
  TEACHER_MAX_HOURS_DAILY = 'teacher_max_hours_daily',
  TEACHER_MAX_HOURS_CONTINUOUSLY = 'teacher_max_hours_continuously',
  TEACHER_MAX_DAYS_PER_WEEK = 'teacher_max_days_per_week',
  TEACHER_MIN_HOURS_DAILY = 'teacher_min_hours_daily',
  TEACHER_MAX_GAPS_PER_DAY = 'teacher_max_gaps_per_day',
  TEACHER_MAX_GAPS_PER_WEEK = 'teacher_max_gaps_per_week',
  TEACHER_NOT_AVAILABLE_TIMES = 'teacher_not_available_times',
  
  // === RESTRICCIONES DE GRUPOS/ESTUDIANTES ===
  STUDENTS_MAX_HOURS_DAILY = 'students_max_hours_daily',
  STUDENTS_MAX_HOURS_CONTINUOUSLY = 'students_max_hours_continuously',
  STUDENTS_MIN_HOURS_DAILY = 'students_min_hours_daily',
  STUDENTS_MAX_GAPS_PER_DAY = 'students_max_gaps_per_day',
  STUDENTS_MAX_GAPS_PER_WEEK = 'students_max_gaps_per_week',
  STUDENTS_EARLY_MAX = 'students_early_max',
  STUDENTS_AFTERNOON_FREE = 'students_afternoon_free',
  
  // === RESTRICCIONES DE ACTIVIDADES ===
  ACTIVITY_PREFERRED_STARTING_TIMES = 'activity_preferred_starting_times',
  ACTIVITY_PREFERRED_TIME_SLOTS = 'activity_preferred_time_slots',
  ACTIVITY_PREFERRED_DAYS = 'activity_preferred_days',
  ACTIVITIES_SAME_STARTING_TIME = 'activities_same_starting_time',
  ACTIVITIES_NOT_OVERLAPPING = 'activities_not_overlapping',
  ACTIVITIES_CONSECUTIVE = 'activities_consecutive',
  ACTIVITIES_GROUPED = 'activities_grouped',
  ACTIVITIES_MIN_DAYS_BETWEEN = 'min_days_between_activities',
  ACTIVITIES_MAX_DAYS_BETWEEN = 'max_days_between_activities',
  
  // === RESTRICCIONES DE AULAS ===
  ROOM_NOT_AVAILABLE_TIMES = 'room_not_available_times',
  ACTIVITY_PREFERRED_ROOM = 'activity_preferred_room',
  ACTIVITY_PREFERRED_ROOMS = 'activity_preferred_rooms',
  
  // === RESTRICCIONES DE EDIFICIOS ===
  STUDENTS_MAX_BUILDING_CHANGES_PER_DAY = 'students_max_building_changes_per_day',
  TEACHERS_MAX_BUILDING_CHANGES_PER_DAY = 'teachers_max_building_changes_per_day',
  
  // === RESTRICCIONES AVANZADAS ===
  BREAK_TIMES = 'break_times',
  TEACHERS_MAX_HOURS_PER_ALL_AFTERNOONS = 'teachers_max_hours_per_all_afternoons',
  STUDENTS_SET_NOT_AVAILABLE_TIMES = 'students_set_not_available_times',
}

export enum ConstraintLevel {
  REQUIRED = 'required',      // Obligatoria (hard constraint)
  IMPORTANT = 'important',    // Importante (80-95% peso)
  PREFERRED = 'preferred',    // Preferida (50-79% peso)
  OPTIONAL = 'optional',      // Opcional (< 50% peso)
}

export interface BaseConstraint {
  id: string;
  type: ConstraintType;
  name: string;
  description?: string;
  level: ConstraintLevel;
  weight: number; // 0-100, peso de la restricción
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// === RESTRICCIONES DE TIEMPO ===

export interface TimeBasicConstraint extends BaseConstraint {
  type: ConstraintType.TIME_BASIC;
  daysPerWeek: number; // típicamente 5 o 6
  hoursPerDay: number; // típicamente 6-8
}

export interface TimeNotAvailableConstraint extends BaseConstraint {
  type: ConstraintType.TIME_NOT_AVAILABLE;
  day: string; // 'lunes', 'martes', etc.
  startHour: number; // 0-23
  duration: number; // horas
}

// === RESTRICCIONES DE PROFESORES ===

export interface TeacherMaxHoursDailyConstraint extends BaseConstraint {
  type: ConstraintType.TEACHER_MAX_HOURS_DAILY;
  teacherId: string;
  maxHours: number;
}

export interface TeacherMaxHoursContinuouslyConstraint extends BaseConstraint {
  type: ConstraintType.TEACHER_MAX_HOURS_CONTINUOUSLY;
  teacherId: string;
  maxHours: number;
}

export interface TeacherMaxGapsConstraint extends BaseConstraint {
  type: ConstraintType.TEACHER_MAX_GAPS_PER_DAY | ConstraintType.TEACHER_MAX_GAPS_PER_WEEK;
  teacherId: string;
  maxGaps: number;
}

export interface TeacherMinHoursDailyConstraint extends BaseConstraint {
  type: ConstraintType.TEACHER_MIN_HOURS_DAILY;
  teacherId: string;
  minHours: number;
  allowEmptyDays: boolean;
}

export interface TeacherNotAvailableConstraint extends BaseConstraint {
  type: ConstraintType.TEACHER_NOT_AVAILABLE_TIMES;
  teacherId: string;
  notAvailableTimes: Array<{
    day: string;
    startHour: number;
    endHour: number;
  }>;
}

// === RESTRICCIONES DE GRUPOS/ESTUDIANTES ===

export interface StudentsMaxHoursDailyConstraint extends BaseConstraint {
  type: ConstraintType.STUDENTS_MAX_HOURS_DAILY;
  groupId: string;
  maxHours: number;
}

export interface StudentsMaxHoursContinuouslyConstraint extends BaseConstraint {
  type: ConstraintType.STUDENTS_MAX_HOURS_CONTINUOUSLY;
  groupId: string;
  maxHours: number;
}

export interface StudentsMinHoursDailyConstraint extends BaseConstraint {
  type: ConstraintType.STUDENTS_MIN_HOURS_DAILY;
  groupId: string;
  minHours: number;
  allowEmptyDays: boolean;
}

export interface StudentsMaxGapsConstraint extends BaseConstraint {
  type: ConstraintType.STUDENTS_MAX_GAPS_PER_DAY | ConstraintType.STUDENTS_MAX_GAPS_PER_WEEK;
  groupId: string;
  maxGaps: number;
}

export interface StudentsEarlyMaxConstraint extends BaseConstraint {
  type: ConstraintType.STUDENTS_EARLY_MAX;
  groupId: string;
  maxHourStart: number; // ej: 8 para que no empiecen antes de las 8:00
}

// === RESTRICCIONES DE ACTIVIDADES ===

export interface ActivityPreferredTimesConstraint extends BaseConstraint {
  type: ConstraintType.ACTIVITY_PREFERRED_STARTING_TIMES | ConstraintType.ACTIVITY_PREFERRED_TIME_SLOTS;
  activityId: string;
  preferredTimes: Array<{
    day: string;
    startHour: number;
  }>;
}

export interface ActivityPreferredDaysConstraint extends BaseConstraint {
  type: ConstraintType.ACTIVITY_PREFERRED_DAYS;
  activityId: string;
  preferredDays: string[]; // ['lunes', 'miércoles', 'viernes']
}

export interface ActivitiesSameStartingTimeConstraint extends BaseConstraint {
  type: ConstraintType.ACTIVITIES_SAME_STARTING_TIME;
  activityIds: string[];
}

export interface ActivitiesNotOverlappingConstraint extends BaseConstraint {
  type: ConstraintType.ACTIVITIES_NOT_OVERLAPPING;
  activityIds: string[];
}

export interface ActivitiesConsecutiveConstraint extends BaseConstraint {
  type: ConstraintType.ACTIVITIES_CONSECUTIVE;
  activityIds: string[];
}

export interface ActivitiesMinDaysBetweenConstraint extends BaseConstraint {
  type: ConstraintType.ACTIVITIES_MIN_DAYS_BETWEEN;
  activityIds: string[];
  minDays: number;
}

// === RESTRICCIONES DE AULAS ===

export interface RoomNotAvailableConstraint extends BaseConstraint {
  type: ConstraintType.ROOM_NOT_AVAILABLE_TIMES;
  roomId: string;
  notAvailableTimes: Array<{
    day: string;
    startHour: number;
    endHour: number;
  }>;
}

export interface ActivityPreferredRoomConstraint extends BaseConstraint {
  type: ConstraintType.ACTIVITY_PREFERRED_ROOM | ConstraintType.ACTIVITY_PREFERRED_ROOMS;
  activityId: string;
  roomIds: string[]; // puede ser una o varias
}

// === RESTRICCIONES DE EDIFICIOS ===

export interface MaxBuildingChangesConstraint extends BaseConstraint {
  type: ConstraintType.STUDENTS_MAX_BUILDING_CHANGES_PER_DAY | ConstraintType.TEACHERS_MAX_BUILDING_CHANGES_PER_DAY;
  entityId: string; // teacherId o groupId
  maxChanges: number;
}

// === RESTRICCIONES ESPECIALES ===

export interface BreakTimesConstraint extends BaseConstraint {
  type: ConstraintType.BREAK_TIMES;
  breakTimes: Array<{
    day: string;
    startHour: number;
    duration: number; // minutos
  }>;
}

// Tipo unión de todas las restricciones
export type Constraint =
  | TimeBasicConstraint
  | TimeNotAvailableConstraint
  | TeacherMaxHoursDailyConstraint
  | TeacherMaxHoursContinuouslyConstraint
  | TeacherMaxGapsConstraint
  | TeacherMinHoursDailyConstraint
  | TeacherNotAvailableConstraint
  | StudentsMaxHoursDailyConstraint
  | StudentsMaxHoursContinuouslyConstraint
  | StudentsMinHoursDailyConstraint
  | StudentsMaxGapsConstraint
  | StudentsEarlyMaxConstraint
  | ActivityPreferredTimesConstraint
  | ActivityPreferredDaysConstraint
  | ActivitiesSameStartingTimeConstraint
  | ActivitiesNotOverlappingConstraint
  | ActivitiesConsecutiveConstraint
  | ActivitiesMinDaysBetweenConstraint
  | RoomNotAvailableConstraint
  | ActivityPreferredRoomConstraint
  | MaxBuildingChangesConstraint
  | BreakTimesConstraint;

// Validador de restricciones
export class ConstraintValidator {
  static validate(constraint: Constraint): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validaciones básicas
    if (!constraint.name || constraint.name.trim() === '') {
      errors.push('El nombre de la restricción es obligatorio');
    }

    if (constraint.weight < 0 || constraint.weight > 100) {
      errors.push('El peso debe estar entre 0 y 100');
    }

    // Validaciones específicas por tipo
    switch (constraint.type) {
      case ConstraintType.TIME_BASIC:
        if (constraint.daysPerWeek < 1 || constraint.daysPerWeek > 7) {
          errors.push('Días por semana debe estar entre 1 y 7');
        }
        if (constraint.hoursPerDay < 1 || constraint.hoursPerDay > 24) {
          errors.push('Horas por día debe estar entre 1 y 24');
        }
        break;

      case ConstraintType.TEACHER_MAX_HOURS_DAILY:
      case ConstraintType.STUDENTS_MAX_HOURS_DAILY:
        if (constraint.maxHours < 1 || constraint.maxHours > 24) {
          errors.push('Máximo de horas debe estar entre 1 y 24');
        }
        break;

      case ConstraintType.TEACHER_MAX_GAPS_PER_DAY:
      case ConstraintType.STUDENTS_MAX_GAPS_PER_DAY:
        if (constraint.maxGaps < 0) {
          errors.push('Máximo de huecos no puede ser negativo');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static checkConflicts(constraints: Constraint[]): { conflicts: Array<{ constraint1: string; constraint2: string; reason: string }> } {
    const conflicts: Array<{ constraint1: string; constraint2: string; reason: string }> = [];

    // Detectar conflictos entre restricciones
    for (let i = 0; i < constraints.length; i++) {
      for (let j = i + 1; j < constraints.length; j++) {
        const c1 = constraints[i];
        const c2 = constraints[j];

        // Ejemplo: max horas diarias < min horas diarias
        if (
          c1.type === ConstraintType.TEACHER_MAX_HOURS_DAILY &&
          c2.type === ConstraintType.TEACHER_MIN_HOURS_DAILY &&
          'teacherId' in c1 && 'teacherId' in c2 &&
          c1.teacherId === c2.teacherId &&
          'maxHours' in c1 && 'minHours' in c2 &&
          c1.maxHours < c2.minHours
        ) {
          conflicts.push({
            constraint1: c1.id,
            constraint2: c2.id,
            reason: 'Máximo de horas diarias es menor que el mínimo',
          });
        }
      }
    }

    return { conflicts };
  }
}
