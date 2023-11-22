import { type Request, type Response } from 'express';

import db from '../models';
import { gemDuplicate, gemNotFound } from '../utils/globalErrorMessage';

const { ROLES, User } = db;

const checkDuplicateMail = (req: Request, res: Response, next: () => void): void => {
  User.findOne({
    mail: req.body.mail,
  })
    .then((user) => {
      if (user !== null) {
        res.status(400).send(gemDuplicate('mail'));
        return;
      }

      next();
    })
    .catch(() => {
      res.status(400).send(gemDuplicate('mail'));
    });
};

const checkRolesExisted = (req: Request, res: Response, next: () => void): void => {
  if (Array.isArray(req.body.roles)) {
    for (let i = 0; i < req.body.roles.length; i += 1) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(404).send(gemNotFound('Role'));
        return;
      }
    }
    next();
  } else {
    next();
  }
};

export default {
  checkDuplicateMail,
  checkRolesExisted,
};
