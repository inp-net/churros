import { prisma, storageRoot } from '#lib';
import { canSeeUserProfile } from '#permissions';
import express from 'express';
import helmet from 'helmet';
import path from 'node:path/posix';
import passport from 'passport';
import session from './auth/session.js';
import { api } from './express.js';

console.info(`Serving storage content from ${storageRoot()}`);
api.use(
  '/storage',
  // Another layer of protection against malicious uploads
  helmet.contentSecurityPolicy({ directives: { 'script-src': "'none'" } }),
  // express-session middleware
  session,
  // Passport middleware
  passport.initialize(),
  passport.session(),
  passport.authenticate(['bearer', 'cookie', 'anonymous'], { session: false }),
  async (req, res, next) => {
    // If the path matches a private-profile user's profile picture, make sure we are authenticated
    const userOfPicture = await prisma.user.findFirst({
      where: { pictureFile: path.relative('/', req.path), privateProfile: true },
    });

    console.log(req.user);

    if (userOfPicture && !canSeeUserProfile(req.user?.user, userOfPicture)) {
      res.status(403).send('Forbidden');
      return;
    }

    next();
  },
  express.static(storageRoot()),
);
