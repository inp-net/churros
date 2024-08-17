import passport from 'passport';
import { Strategy as AnonymousStrategy } from 'passport-anonymous';

passport.use(new AnonymousStrategy());
