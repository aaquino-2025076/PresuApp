import { z } from 'zod';

// 1. Esquema para Configuración de Usuario
export const userConfigSchema = z.object({
  payFrequency: z.enum(['quincenal', 'mensual'], {
    message: "La frecuencia debe ser 'quincenal' o 'mensual'"
  }),
  baseSalary: z.number({ message: 'El salario base debe ser numérico' })
    .min(0, 'El salario base no puede ser negativo'),
  initialSavings: z.number({ message: 'El ahorro inicial debe ser numérico' })
    .min(0, 'El ahorro inicial no puede ser negativo'),
  balanceThreshold: z.number({ message: 'El umbral debe ser numérico' })
    .min(0, 'El umbral de saldo no puede ser negativo')
    .optional(),
  balance_threshold: z.number().min(0).optional()
});

// 2. Esquema para Ingresos Extras
export const createIncomeSchema = z.object({
  description: z.string().min(2, 'La descripción debe tener al menos 2 caracteres'),
  amount: z.number({ message: 'El monto debe ser numérico' })
    .positive('El monto del ingreso debe ser mayor a 0'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
});

// 3. Esquema para Gastos (Fijos y Diarios)
export const createExpenseSchema = z.object({
  description: z.string().min(2, 'La descripción debe tener al menos 2 caracteres'),
  amount: z.number({ message: 'El monto debe ser numérico' })
    .positive('El monto del gasto debe ser mayor a 0'),
  type: z.enum(['fixed', 'daily'], {
    message: "El tipo de gasto debe ser 'fixed' o 'daily'"
  }),
  category: z.enum([
    'Comida', 
    'Transporte', 
    'Ocio', 
    'Salud', 
    'Educación', 
    'Servicios', 
    'Otros'
  ]).optional(),
  frequency: z.enum(['semanal', 'quincenal', 'mensual', 'anual']).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
});

// 4. Esquema para Meta de Ahorro
export const updateGoalSchema = z.object({
  targetAmount: z.number({ message: 'El monto objetivo debe ser numérico' })
    .min(0, 'La meta de ahorro no puede ser negativa'),
  period: z.enum(['diario', 'semanal', 'quincenal', 'mensual', 'anual'], {
    message: 'Periodo de ahorro no válido'
  })
});