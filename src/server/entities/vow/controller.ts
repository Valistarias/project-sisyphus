import type { Request, Response } from 'express';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';

import type { HydratedIVow } from './model';
import type { InternationalizationType } from '../../utils/types';

import { curateI18n } from '../../utils';

const { Vow } = db;

const findVows = async (): Promise<HydratedIVow[]> =>
  await new Promise((resolve, reject) => {
    Vow.find()
      .then((res: HydratedIVow[]) => {
        if (res.length === 0) {
          reject(gemNotFound('Vows'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const findVowById = async (id: string): Promise<HydratedIVow> =>
  await new Promise((resolve, reject) => {
    Vow.findById(id)
      .then((res?: HydratedIVow | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Vow'));
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
    clergy,
    i18n = null,
  }: {
    id?: string;
    title?: string;
    summary?: string;
    clergy?: string;
    i18n?: string | null;
  } = req.body;
  if (title === undefined || summary === undefined || clergy === undefined) {
    res.status(400).send(gemInvalidField('Vow'));

    return;
  }

  const vow = new Vow({
    title,
    summary,
    clergy,
  });

  if (i18n !== null) {
    vow.i18n = JSON.stringify(i18n);
  }

  vow
    .save()
    .then(() => {
      res.send(vow);
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
    clergy = null,
    i18n,
  }: {
    id?: string;
    title: string | null;
    summary: string | null;
    clergy: string | null;
    i18n: InternationalizationType | null;
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Vow ID'));

    return;
  }
  findVowById(id)
    .then((vow) => {
      if (title !== null) {
        vow.title = title;
      }
      if (summary !== null) {
        vow.summary = summary;
      }
      if (clergy !== null) {
        vow.clergy = clergy;
      }

      if (i18n !== null) {
        const newIntl: InternationalizationType = {
          ...(vow.i18n !== undefined && vow.i18n !== '' ? JSON.parse(vow.i18n) : {}),
        };

        Object.keys(i18n).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        vow.i18n = JSON.stringify(newIntl);
      }

      vow
        .save()
        .then(() => {
          res.send({
            message: 'Vow was updated successfully!',
            vow,
          });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Vow'));
    });
};

const deleteVowById = async (id?: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Vow ID'));

      return;
    }
    Vow.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const deleteVow = (req: Request, res: Response): void => {
  const { id }: { id: string } = req.body;
  deleteVowById(id)
    .then(() => {
      res.send({ message: 'Vow was deleted successfully!' });
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

interface CuratedIVow {
  i18n?: InternationalizationType;
  vow: HydratedIVow;
}

const findSingle = (req: Request, res: Response): void => {
  const { statId } = req.query;
  if (statId === undefined || typeof statId !== 'string') {
    res.status(400).send(gemInvalidField('Vow ID'));

    return;
  }
  findVowById(statId)
    .then((vow) => {
      const sentObj = {
        vow,
        i18n: curateI18n(vow.i18n),
      };
      res.send(sentObj);
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findVows()
    .then((stats) => {
      const curatedVows: CuratedIVow[] = [];

      stats.forEach((vow) => {
        curatedVows.push({
          vow,
          i18n: curateI18n(vow.i18n),
        });
      });

      res.send(curatedVows);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export { create, deleteVow, findAll, findSingle, findVowById, update };
