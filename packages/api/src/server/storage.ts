import { inDevelopment } from '#lib';
import express from 'express';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { api } from './express.js';

console.info(`Serving storage content from ${process.env.STORAGE}`);
api.use(
  '/storage',
  // Another layer of protection against malicious uploads
  helmet.contentSecurityPolicy({ directives: { 'script-src': "'none'" } }),
  express.static(
    inDevelopment()
      ? path.join(path.dirname(new URL(import.meta.url).pathname), '../../storage')
      : fileURLToPath(new URL(process.env.STORAGE)),
  ),
);
