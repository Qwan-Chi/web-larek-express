import dotenv from 'dotenv';

dotenv.config();

const {
  PORT = '3000',
  DB_ADDRESS = 'mongodb://127.0.0.1:27017/weblarek',
  UPLOAD_PATH = 'images',
  UPLOAD_PATH_TEMP = 'temp',
  ORIGIN_ALLOW = 'http://localhost:5173',
  AUTH_REFRESH_TOKEN_EXPIRY = '7d',
  AUTH_ACCESS_TOKEN_EXPIRY = '1m',
  JWT_SECRET = 'super-strong-secret',
} = process.env;

export default {
  port: parseInt(PORT, 10),
  dbAddress: DB_ADDRESS,
  uploadPath: UPLOAD_PATH,
  uploadPathTemp: UPLOAD_PATH_TEMP,
  originAllow: ORIGIN_ALLOW,
  authRefreshTokenExpiry: AUTH_REFRESH_TOKEN_EXPIRY,
  authAccessTokenExpiry: AUTH_ACCESS_TOKEN_EXPIRY,
  jwtSecret: JWT_SECRET,
};
