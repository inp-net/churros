import { api } from '../express.js';

api.get('/auth/logout', (req, res, next) => {
  req.logout(function (error) {
    if (error) return next(error);

    res.redirect(process.env.OAUTH_LOGOUT_URL);
  });
});
