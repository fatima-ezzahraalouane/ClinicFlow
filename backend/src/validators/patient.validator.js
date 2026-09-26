const { z } = require('zod');

// Used for both POST (create) and PUT (full update)
const patientSchema = z.object({
  fullName: z
    .string({ error: 'Le nom complet est requis' })
    .trim()
    .min(1, 'Le nom complet est requis')
    .max(150, 'Le nom complet ne doit pas dépasser 150 caractères'),
  cin: z
    .string({ error: 'Le CIN est requis' })
    .trim()
    .toUpperCase()
    .min(1, 'Le CIN est requis')
    .max(20, 'Le CIN ne doit pas dépasser 20 caractères'),
  phone: z
    .string({ error: 'Le téléphone est requis' })
    .trim()
    .min(1, 'Le téléphone est requis')
    .max(20, 'Le téléphone ne doit pas dépasser 20 caractères'),
  birthDate: z.iso.date({ error: 'La date de naissance doit être au format AAAA-MM-JJ' }), // 'YYYY-MM-DD'
  address: z
    .string({ error: "L'adresse doit être un texte" })
    .trim()
    .nullish()
    .transform((value) => value || null),
});

// GET /api/patients?search=&page=&limit= (query values arrive as strings)
const listPatientsQuerySchema = z.object({
  search: z
    .string({ error: 'La recherche doit être un texte' })
    .trim()
    .max(150, 'La recherche ne doit pas dépasser 150 caractères')
    .optional(),
  page: z.coerce
    .number({ error: 'La page doit être un nombre' })
    .int('La page doit être un nombre entier')
    .min(1, 'La page doit être supérieure ou égale à 1')
    .default(1),
  limit: z.coerce
    .number({ error: 'La limite doit être un nombre' })
    .int('La limite doit être un nombre entier')
    .min(1, 'La limite doit être comprise entre 1 et 100')
    .max(100, 'La limite doit être comprise entre 1 et 100')
    .default(10),
});

module.exports = { patientSchema, listPatientsQuerySchema };
