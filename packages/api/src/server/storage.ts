import express from 'express';
import { fileURLToPath } from 'node:url';
import { api } from './express.js';
import helmet from 'helmet';

api.use(
  '/storage',
  // Another layer of protection against malicious uploads
  helmet.contentSecurityPolicy({ directives: { 'script-src': "'none'" } }),
  express.static(fileURLToPath(new URL(process.env.STORAGE))),
);
