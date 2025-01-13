import type { Request, Response } from 'express';

import db from '../models';
import { gemDuplicate, gemNotFound } from '../utils/globalErrorMessage';

const { ROLES, User } = db;

const checkDuplicateMail = (req: Request, res: Response, next: () => void): void => {
  const {
    mail
  }: {
    mail: string
  } = req.body;

  User.findOne({
    mail
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
  const {
    roles
  }: {
    roles: string[]
  } = req.body;

  if (Array.isArray(roles)) {
    for (const role of roles) {
      if (!ROLES.includes(role)) {
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
  checkRolesExisted
};
