const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().max(255).email(),
  password: z.string().min(1, 'Password is required'),
});

module.exports = { loginSchema };
