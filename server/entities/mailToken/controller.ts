import crypto from 'crypto';
import db from '../../models';

import { type Request, type Response } from 'express';
import { type IMailgunClient } from 'mailgun.js/Interfaces';
import { type IMailToken } from './model';
import { type HydratedDocument, type Error } from 'mongoose';

import { gM404 } from '../../utils/globalMessage';

const { User, MailToken } = db;

const createToken = (req: Request, res: Response, mg: IMailgunClient): void => {
  const {
    mail = null
  } = req.body;
  if (mail === undefined) {
    res.status(418).send({ message: 'User mail Not found.' });
    return;
  }
  User.findOne({ mail })
    .then(async (user) => {
      if (user === undefined || user === null) {
        res.send({ message: 'Mail sent' });
      } else {
        const mailToken = new MailToken({
          userId: user._id,
          token: crypto.randomBytes(32).toString('hex')
        });
        mailToken
          .save()
          .then(() => {
            const url = `http://localhost:3000/forgot/${String(user._id)}/${mailToken.token}`;
            mg.messages.create('sandboxc0904a9e4c234e1d8f885c0c93a61e6f.mailgun.org', {
              from: 'Excited User <mailgun@sandboxc0904a9e4c234e1d8f885c0c93a61e6f.mailgun.org>',
              to: ['mallet.victor.france@gmail.com'],
              subject: 'Project Sisyphus - Forgotten Password',
              text: 'Click to change your password!',
              html: `Click <a href = '${url}'>here</a> to change your password.`
            })
              .then(msg => {
                res.send({ message: 'Mail sent' });
              })
              .catch((err: Error) => {
                res.status(418).send({ message: err });
              });
          })
          .catch((err: Error) => {
            res.status(418).send({ message: err });
          });
      }
    })
    .catch(() => {
      res.send({ message: 'Mail sent' });
    });
};

const verifyToken = async ({
  userId,
  token
}): Promise<HydratedDocument<IMailToken> | null> => await new Promise((resolve) => {
  if (userId === undefined || token === undefined) {
    resolve(null);
    return;
  }
  User.findById(userId)
    .then(async (user) => {
      if (user === undefined || user === null) {
        resolve(null);
      } else {
        MailToken.findOne({
          userId,
          token
        })
          .then((token) => {
            resolve(token);
          })
          .catch(() => {
            resolve(null);
          });
      }
    })
    .catch(() => {
      resolve(null);
    });
});

const checkToken = (req: Request, res: Response, mg: IMailgunClient): void => {
  const {
    userId,
    token
  } = req.body;
  verifyToken({ userId, token })
    .then((token) => {
      if (token === null) {
        res.status(404).send({ message: { message: gM404('Token') } });
      } else {
        token.delete()
          .then(() => {
            res.send({ message: 'Ok' });
          })
          .catch((err: Error) => {
            res.status(418).send(err);
          });
      }
      // res.send({ message: 'Ok' });
    })
    .catch(() => {
      res.status(404).send({ message: { message: gM404('Token') } });
    });
};

export {
  createToken,
  checkToken,
  removeToken
};
