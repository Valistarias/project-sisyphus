import type { Request, Response } from 'express';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';

import type { HydratedIArcane } from './model';
import type { InternationalizationType } from '../../utils/types';

import { curateI18n } from '../../utils';

const { Arcane } = db;

const findArcanes = async (): Promise<HydratedIArcane[]> =>
  await new Promise((resolve, reject) => {
    Arcane.find()
      .sort({ number: 'asc' })
      .then((res: HydratedIArcane[]) => {
        if (res.length === 0) {
          reject(gemNotFound('Arcanes'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const findArcaneById = async (id: string): Promise<HydratedIArcane> =>
  await new Promise((resolve, reject) => {
    Arcane.findById(id)
      .then((res?: HydratedIArcane | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Arcane'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const create = (req: Request, res: Response): void => {
  const { title, summary, number, i18n = null } = req.body;
  if (title === undefined || summary === undefined || number === undefined) {
    res.status(400).send(gemInvalidField('Arcane'));

    return;
  }

  const arcane = new Arcane({
    title,
    summary,
    number,
  });

  if (i18n !== null) {
    arcane.i18n = JSON.stringify(i18n);
  }

  arcane
    .save()
    .then(() => {
      res.send(arcane);
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
    number = null,
    i18n,
  }: {
    id?: string;
    title: string | null;
    summary: string | null;
    i18n: InternationalizationType | null;
    number: number | null;
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Arcane ID'));

    return;
  }
  findArcaneById(id)
    .then((arcane) => {
      if (title !== null) {
        arcane.title = title;
      }
      if (summary !== null) {
        arcane.summary = summary;
      }
      if (number !== null) {
        arcane.number = number;
      }

      if (i18n !== null) {
        const newIntl: InternationalizationType = {
          ...(arcane.i18n !== undefined && arcane.i18n !== '' ? JSON.parse(arcane.i18n) : {}),
        };

        Object.keys(i18n).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        arcane.i18n = JSON.stringify(newIntl);
      }

      arcane
        .save()
        .then(() => {
          res.send({
            message: 'Arcane was updated successfully!',
            arcane,
          });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Arcane'));
    });
};

const deleteArcaneById = async (id?: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Arcane ID'));

      return;
    }
    Arcane.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const deleteArcane = (req: Request, res: Response): void => {
  const { id }: { id: string } = req.body;
  deleteArcaneById(id)
    .then(() => {
      res.send({ message: 'Arcane was deleted successfully!' });
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

interface CuratedIArcane {
  i18n?: InternationalizationType;
  arcane: HydratedIArcane;
}

const findSingle = (req: Request, res: Response): void => {
  const { arcaneId } = req.query;
  if (arcaneId === undefined || typeof arcaneId !== 'string') {
    res.status(400).send(gemInvalidField('Arcane ID'));

    return;
  }
  findArcaneById(arcaneId)
    .then((arcane) => {
      const sentObj = {
        arcane,
        i18n: curateI18n(arcane.i18n),
      };
      res.send(sentObj);
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findArcanes()
    .then((arcanes) => {
      const curatedArcanes: CuratedIArcane[] = [];

      arcanes.forEach((arcane) => {
        curatedArcanes.push({
          arcane,
          i18n: curateI18n(arcane.i18n),
        });
      });

      res.send(curatedArcanes);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export { create, deleteArcane, findAll, findArcaneById, findSingle, update };
