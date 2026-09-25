const { z } = require('zod');

const idParamSchema = z.object({
  id: z.uuid('Invalid id'),
});

module.exports = { idParamSchema };
