import type { Request, Response } from 'express';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';

import type { HydratedIClergy } from './model';
import type { InternationalizationType } from '../../utils/types';

import { curateI18n } from '../../utils';

const { Clergy } = db;

const findClergies = async (): Promise<HydratedIClergy[]> =>
  await new Promise((resolve, reject) => {
    Clergy.find()
      .then((res: HydratedIClergy[]) => {
        resolve(res);
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const findClergyById = async (id: string): Promise<HydratedIClergy> =>
  await new Promise((resolve, reject) => {
    Clergy.findById(id)
      .then((res?: HydratedIClergy | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Clergy'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const create = (req: Request, res: Response): void => {
  const {
    title,
    summary,
    ruleBook,
    i18n = null,
  }: {
    id?: string;
    title?: string;
    summary?: string;
    ruleBook?: string;
    i18n?: string | null;
  } = req.body;
  if (title === undefined || summary === undefined || ruleBook === undefined) {
    res.status(400).send(gemInvalidField('Clergy'));

    return;
  }

  const clergy = new Clergy({
    title,
    summary,
    ruleBook,
  });

  if (i18n !== null) {
    clergy.i18n = JSON.stringify(i18n);
  }

  clergy
    .save()
    .then(() => {
      res.send(clergy);
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const update = (req: Request, res: Response): void => {
  const {
    id,
    title = null,
    summary = null,
    ruleBook = null,
    i18n,
  }: {
    id?: string;
    title: string | null;
    summary: string | null;
    ruleBook: string | null;
    i18n: InternationalizationType | null;
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Clergy ID'));

    return;
  }
  findClergyById(id)
    .then((clergy) => {
      if (title !== null) {
        clergy.title = title;
      }
      if (summary !== null) {
        clergy.summary = summary;
      }
      if (ruleBook !== null) {
        clergy.ruleBook = ruleBook;
      }

      if (i18n !== null) {
        const newIntl: InternationalizationType = {
          ...(clergy.i18n !== undefined && clergy.i18n !== '' ? JSON.parse(clergy.i18n) : {}),
        };

        Object.keys(i18n).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        clergy.i18n = JSON.stringify(newIntl);
      }

      clergy
        .save()
        .then(() => {
          res.send({
            message: 'Clergy was updated successfully!',
            clergy,
          });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Clergy'));
    });
};

const deleteClergyById = async (id?: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Clergy ID'));

      return;
    }
    Clergy.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const deleteClergy = (req: Request, res: Response): void => {
  const { id }: { id: string } = req.body;
  deleteClergyById(id)
    .then(() => {
      res.send({ message: 'Clergy was deleted successfully!' });
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

interface CuratedIClergy {
  i18n?: InternationalizationType;
  clergy: HydratedIClergy;
}

const findSingle = (req: Request, res: Response): void => {
  const { statId } = req.query;
  if (statId === undefined || typeof statId !== 'string') {
    res.status(400).send(gemInvalidField('Clergy ID'));

    return;
  }
  findClergyById(statId)
    .then((clergy) => {
      const sentObj = {
        clergy,
        i18n: curateI18n(clergy.i18n),
      };
      res.send(sentObj);
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAllPromise = async (): Promise<CuratedIClergy[]> =>
  await new Promise((resolve, reject) => {
    findClergies()
      .then((clergies) => {
        const curatedClergies: CuratedIClergy[] = [];

        clergies.forEach((clergy) => {
          curatedClergies.push({
            clergy,
            i18n: curateI18n(clergy.i18n),
          });
        });

        resolve(curatedClergies);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const findAll = (req: Request, res: Response): void => {
  findAllPromise()
    .then((clergies) => {
      res.send(clergies);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export { create, deleteClergy, findAll, findAllPromise, findSingle, findClergyById, update };
