const { z } = require('zod');

const idParamSchema = z.object({
  id: z.uuid('Identifiant invalide'),
});

module.exports = { idParamSchema };
