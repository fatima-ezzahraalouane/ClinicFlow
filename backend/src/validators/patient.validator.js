const { z } = require('zod');

// Used for both POST (create) and PUT (full update)
const patientSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required').max(150),
  cin: z.string().trim().toUpperCase().min(1, 'CIN is required').max(20),
  phone: z.string().trim().min(1, 'Phone is required').max(20),
  birthDate: z.iso.date(), // 'YYYY-MM-DD'
  address: z
    .string()
    .trim()
    .nullish()
    .transform((value) => value || null),
});

// GET /api/patients?search=&page=&limit= (query values arrive as strings)
const listPatientsQuerySchema = z.object({
  search: z.string().trim().max(150).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

module.exports = { patientSchema, listPatientsQuerySchema };
