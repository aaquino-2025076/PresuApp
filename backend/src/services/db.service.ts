import fs from 'fs/promises';
import path from 'path';
import { UserConfig } from '../types/budget.types.js';

const DB_PATH = path.resolve(process.cwd(), 'data/db.json');

export class DbService {
  static async read(): Promise<UserConfig> {
    try {
      const data = await fs.readFile(DB_PATH, 'utf-8');
      return JSON.parse(data) as UserConfig;
    } catch (error) {
      console.error('Error leyendo la base de datos JSON:', error);
      throw new Error('No se pudo leer la base de datos.');
    }
  }

  static async write(data: UserConfig): Promise<void> {
    try {
      await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error escribiendo en la base de datos JSON:', error);
      throw new Error('No se pudo guardar la información.');
    }
  }
}