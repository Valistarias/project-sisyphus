import type { Request, Response } from 'express';
import type { HydratedDocument, Error } from 'mongoose';

import crypto from 'crypto';




import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';

import type { IUser } from '../user/model';
import type { IMailgunClient } from 'mailgun.js/Interfaces';

const { User, MailToken } = db;

const createToken = (req: Request, res: Response, mg: IMailgunClient): void => {
  const { mail = null } = req.body;
  if (mail === undefined) {
    res.status(400).send(gemInvalidField('mail'));
    return;
  }
  User.findOne({ mail })
    .then(async (user) => {
      if (user === undefined || user === null) {
        res.send({ message: 'Mail sent' });
      } else {
        const mailToken = new MailToken({
          userId: user._id,
          token: crypto.randomBytes(32).toString('hex'),
        });
        mailToken
          .save()
          .then(() => {
            const url = `http://localhost:3000/reset/password/${String(user._id)}/${
              mailToken.token
            }`;
            mg.messages
              .create('sandboxc0904a9e4c234e1d8f885c0c93a61e6f.mailgun.org', {
                from: 'Excited User <mailgun@sandboxc0904a9e4c234e1d8f885c0c93a61e6f.mailgun.org>',
                to: ['mallet.victor.france@gmail.com'],
                subject: 'Project Sisyphus - Forgotten Password',
                text: 'Click to change your password!',
                html: `Click <a href = '${url}'>here</a> to change your password.`,
              })
              .then((msg) => {
                res.send({ message: 'Mail sent' });
              })
              .catch((err: Error) => {
                res.status(500).send(gemServerError(err));
              });
          })
          .catch((err: Error) => {
            res.status(500).send(gemServerError(err));
          });
      }
    })
    .catch(() => {
      res.send({ message: 'Mail sent' });
    });
};

const verifyMailToken = async ({ userId, token }): Promise<HydratedDocument<IUser> | null> =>
  await new Promise((resolve, reject) => {
    if (userId === undefined || token === undefined) {
      resolve(null);
      return;
    }
    User.findById(userId)
      .then((user) => {
        if (user === undefined || user === null) {
          resolve(null);
        } else {
          MailToken.findOne({
            userId,
            token,
          })
            .then(() => {
              resolve(user);
            })
            .catch(() => {
              resolve(null);
            });
        }
      })
      .catch((err) => {
        reject(err);
      });
  });

const removeToken = async (req: Request): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const { userId, token } = req.body;
    verifyMailToken({ userId, token })
      .then((user) => {
        if (user !== undefined && user !== null) {
          MailToken.deleteMany({ userId })
            .then(() => {
              resolve(true);
            })
            .catch((err: Error) => {
              reject(err);
            });
        } else {
          reject(gemNotFound('Token'));
        }
      })
      .catch((err) => {
        reject(err);
      });
  });

const getUserMailByRequest = (req: Request, res: Response): void => {
  const { userId, token } = req.query;
  verifyMailToken({ userId, token })
    .then((user) => {
      if (user !== undefined && user !== null) {
        res.status(200).send(user.mail);
      } else {
        res.status(404).send(gemNotFound('Token'));
      }
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

export { createToken, verifyMailToken, removeToken, getUserMailByRequest };
