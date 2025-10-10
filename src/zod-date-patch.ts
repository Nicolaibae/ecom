import { z } from 'zod';


(z as any).ZodDate.prototype.toJSON = function () {
  return { type: 'string', format: 'date-time' };
};