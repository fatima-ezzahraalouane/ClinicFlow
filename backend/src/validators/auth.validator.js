const { z } = require('zod');

const loginSchema = z.object({
  email: z
    .string({ error: "L'email est requis" })
    .trim()
    .toLowerCase()
    .max(255, "L'email ne doit pas dépasser 255 caractères")
    .email("L'email n'est pas valide"),
  password: z.string({ error: 'Le mot de passe est requis' }).min(1, 'Le mot de passe est requis'),
});

module.exports = { loginSchema };
