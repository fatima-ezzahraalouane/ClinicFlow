const { z } = require('zod');

const STATUSES = ['pending', 'confirmed', 'cancelled'];

const createAppointmentSchema = z.object({
  patientId: z.uuid('Invalid patient id'),
  appointmentDate: z.iso
    .datetime({ local: true })
    .refine((value) => !value.endsWith('Z'), 'Use local time without timezone'),
  reason: z.string().trim().min(1, 'Reason is required').max(255),
  notes: z
    .string()
    .trim()
    .nullish()
    .transform((value) => value || null),
});

// GET /api/appointments?date=&status=
const listAppointmentsQuerySchema = z.object({
  date: z.iso.date().optional(),
  status: z.enum(STATUSES).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(STATUSES),
});

module.exports = { createAppointmentSchema, listAppointmentsQuerySchema, updateStatusSchema };
