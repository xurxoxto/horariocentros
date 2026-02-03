import { Router } from 'express';
import { Constraint, ConstraintValidator } from '../models/constraints';

const router = Router();

// Almacenamiento en memoria (en producción usaría SQLite)
const constraints: Constraint[] = [];

// GET todas las restricciones
router.get('/', (req, res) => {
  const { timetableId } = req.query;
  let filtered = constraints;
  
  if (timetableId) {
    filtered = constraints.filter((c: any) => c.timetableId === timetableId);
  }
  
  res.json({ constraints: filtered, total: filtered.length });
});

// GET restricción por ID
router.get('/:id', (req, res) => {
  const constraint = constraints.find((c) => c.id === req.params.id);
  if (!constraint) {
    return res.status(404).json({ error: 'Restricción no encontrada' });
  }
  res.json({ constraint });
});

// POST crear nueva restricción
router.post('/', (req, res) => {
  const constraint: Constraint = {
    id: `const_${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...req.body,
  } as Constraint;
  
  // Validar restricción
  const validation = ConstraintValidator.validate(constraint);
  if (!validation.valid) {
    return res.status(400).json({ 
      error: 'Restricción inválida', 
      errors: validation.errors 
    });
  }
  
  constraints.push(constraint);
  res.status(201).json({ constraint });
});

// POST validar múltiples restricciones
router.post('/validate', (req, res) => {
  const { constraints: constraintsToValidate } = req.body;
  
  if (!Array.isArray(constraintsToValidate)) {
    return res.status(400).json({ error: 'Se esperaba un array de restricciones' });
  }
  
  const conflicts = ConstraintValidator.checkConflicts(constraintsToValidate);
  const validations = constraintsToValidate.map((c: Constraint) => ({
    id: c.id,
    ...ConstraintValidator.validate(c),
  }));
  
  res.json({ 
    validations, 
    conflicts: conflicts.conflicts,
    hasErrors: validations.some((v) => !v.valid),
    hasConflicts: conflicts.conflicts.length > 0,
  });
});

// PUT actualizar restricción
router.put('/:id', (req, res) => {
  const index = constraints.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Restricción no encontrada' });
  }
  
  const updatedConstraint: Constraint = {
    ...constraints[index],
    ...req.body,
    updatedAt: new Date(),
  } as Constraint;
  
  // Validar restricción actualizada
  const validation = ConstraintValidator.validate(updatedConstraint);
  if (!validation.valid) {
    return res.status(400).json({ 
      error: 'Restricción inválida', 
      errors: validation.errors 
    });
  }
  
  constraints[index] = updatedConstraint;
  res.json({ constraint: constraints[index] });
});

// DELETE eliminar restricción
router.delete('/:id', (req, res) => {
  const index = constraints.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Restricción no encontrada' });
  }
  constraints.splice(index, 1);
  res.status(204).send();
});

export default router;
