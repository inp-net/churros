import { storageRoot } from '#lib';
import express from 'express';
import helmet from 'helmet';
import { api } from './express.js';

console.info(`Serving storage content from ${storageRoot()}`);
api.use(
  '/storage',
  // Another layer of protection against malicious uploads
  helmet.contentSecurityPolicy({ directives: { 'script-src': "'none'" } }),
  // TODO Add X-Robots-Tag: noindex for everything except groups, student associatoins, majors and schools
  // See https://developers.google.com/search/docs/crawling-indexing/block-indexing#:~:text=(...)-,X%2DRobots%2DTag:%20noindex,-(...)
  express.static(storageRoot()),
);
