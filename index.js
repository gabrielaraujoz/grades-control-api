const express = require('express');
const fs = require('fs').promises;
const winston = require('winston');
const gradesRouter = require('./routes/grades.js');
const app = express();
const port = 3000;

global.fileName = 'grades.json';

const { combine, timestamp, label, printf } = winston.format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

global.logger = winston.createLogger({
  level: 'silly',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'grades-control-api.log' }),
  ],
  format: combine(
    label({ label: 'grades-control-api' }),
    timestamp(),
    myFormat
  ),
});

// configurar que na instância será usado o express com json

app.use(express.json());
app.use('/grades', gradesRouter);

// método listen com promises

app.listen(port, async () => {
  try {
    await fs.readFile(global.fileName, 'utf8');
    logger.info(`Listening to port: ${port}`);
  } catch (err) {
    logger.error(err);
  }
});
