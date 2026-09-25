const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const authRoutes = require('./routes/auth.routes');
const patientRoutes = require('./routes/patient.routes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors({ origin: config.clientUrl }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
