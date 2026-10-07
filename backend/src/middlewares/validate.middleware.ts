import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, ZodIssue } from 'zod';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue: ZodIssue) => ({
          field: issue.path.join('.'),
          message: issue.message
        }));

        res.status(400).json({
          error: 'Error de validación de datos',
          details: errorMessages
        });
        return;
      }

      res.status(500).json({ error: 'Error interno en la validación' });
      return;
    }
  };
};