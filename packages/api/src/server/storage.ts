import { storageRoot } from '#lib';
import express from 'express';
import helmet from 'helmet';
import { api } from './express.js';

console.info(`Serving storage content from ${process.env.STORAGE}`);
api.use(
  '/storage',
  // Another layer of protection against malicious uploads
  helmet.contentSecurityPolicy({ directives: { 'script-src': "'none'" } }),
  express.static(storageRoot()),
);
