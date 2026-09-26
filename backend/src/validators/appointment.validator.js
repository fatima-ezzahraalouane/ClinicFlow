const { z } = require('zod');

const STATUSES = ['pending', 'confirmed', 'cancelled'];
const INVALID_STATUS = 'Statut invalide (valeurs acceptées : pending, confirmed, cancelled)';

const createAppointmentSchema = z.object({
  patientId: z.uuid('Identifiant de patient invalide'),
  appointmentDate: z.iso
    .datetime({ local: true, error: 'La date du rendez-vous doit être au format AAAA-MM-JJTHH:MM' })
    .refine((value) => !value.endsWith('Z'), "Utilisez l'heure locale, sans fuseau horaire"),
  reason: z
    .string({ error: 'Le motif est requis' })
    .trim()
    .min(1, 'Le motif est requis')
    .max(255, 'Le motif ne doit pas dépasser 255 caractères'),
  notes: z
    .string({ error: 'Les notes doivent être un texte' })
    .trim()
    .nullish()
    .transform((value) => value || null),
});

const listAppointmentsQuerySchema = z.object({
  date: z.iso.date({ error: 'La date doit être au format AAAA-MM-JJ' }).optional(),
  status: z.enum(STATUSES, { error: INVALID_STATUS }).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(STATUSES, { error: INVALID_STATUS }),
});

module.exports = { createAppointmentSchema, listAppointmentsQuerySchema, updateStatusSchema };
