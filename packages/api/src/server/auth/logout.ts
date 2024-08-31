import { api } from '../express.js';
import { AUTHED_VIA_COOKIE_NAME } from './constants.js';

api.get('/auth/logout', (req, res, next) => {
  req.logout(function (error) {
    if (error) return next(error);

    res.cookie(AUTHED_VIA_COOKIE_NAME, '', { httpOnly: false, secure: false });
    res.redirect(process.env.PUBLIC_OAUTH_LOGOUT_URL);
  });
});

api.post('/auth/logout', (req, res, next) => {
  req.logout(function (error) {
    if (error) return next(error);
    res.status(200).json({ message: 'Logged out' });
  });
});
