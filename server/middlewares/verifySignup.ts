import db from '../models';

import { type Request, type Response } from 'express';

const { ROLES, User } = db;

const checkDuplicateUsername = (req: Request, res: Response, next: () => void): void => {
  User.findOne({
    username: req.body.username
  })
    .then((user) => {
      if (user !== null) {
        res.status(400).send({ message: 'Failed! Username is already in use!' });
        return;
      }

      next();
    })
    .catch(() => {
      res.status(400).send({ message: 'Failed! Username is already in use!' });
    });
};

const checkRolesExisted = (req: Request, res: Response, next: () => void): void => {
  if (Array.isArray(req.body.roles)) {
    for (let i = 0; i < req.body.roles.length; i += 1) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(400).send({
          message: `Failed! Role ${req.body.roles[i]} does not exist!`
        });
        return;
      }
    }
    next();
  } else {
    next();
  }
};

export default {
  checkDuplicateUsername,
  checkRolesExisted
};
