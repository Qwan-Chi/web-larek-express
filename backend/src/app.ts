/* eslint-disable no-console */
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import cron from 'node-cron';
import { errors as celebrateErrors } from 'celebrate';
import config from './config';
import { requestLogger, errorLogger } from './middlewares/logger';
import errorHandler from './middlewares/error-handler';
import productRouter from './routes/product';
import orderRouter from './routes/order';
import authRouter from './routes/auth';
import uploadRouter from './routes/upload';

const app = express();

const imagesPath = path.join(__dirname, 'public', config.uploadPath);
const tempPath = path.join(__dirname, config.uploadPathTemp);

[imagesPath, tempPath].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

cron.schedule('0 0 * * *', () => {
  fs.readdir(tempPath, (err, files) => {
    if (err) return;
    files.forEach((file) => {
      const filePath = path.join(tempPath, file);
      fs.stat(filePath, (_statErr, stats) => {
        if (stats && Date.now() - stats.mtimeMs > 24 * 60 * 60 * 1000) {
          fs.unlink(filePath, () => {});
        }
      });
    });
  });
});

mongoose
  .connect(config.dbAddress)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

app.use(requestLogger);
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/product', productRouter);
app.use('/order', orderRouter);
app.use('/auth', authRouter);
app.use('/upload', uploadRouter);

app.use(errorLogger);
app.use(celebrateErrors());
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});

export default app;
