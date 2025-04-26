import type { Request, Response } from 'express';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';
import { deleteVowsByClergy, updateMultipleVowsPosition } from '../vow/controller';

import type { HydratedIClergy, LeanIClergy } from './model';
import type { InternationalizationType } from '../../utils/types';
import type { HydratedIVow, LeanIVow } from '../vow/model';

import { curateI18n } from '../../utils';

const { Clergy } = db;

const findClergies = async (): Promise<LeanIClergy[]> =>
  await new Promise((resolve, reject) => {
    Clergy.find()
      .lean()
      .populate<{ vows: LeanIVow[] }>({
        path: 'vows',
        select: '_id title clergy position i18n',
        options: { sort: { position: 'asc' } },
      })
      .then((res: LeanIClergy[]) => {
        resolve(res);
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const findCompleteClergyById = async (id: string): Promise<HydratedIClergy> =>
  await new Promise((resolve, reject) => {
    Clergy.findById(id)
      .populate<{ vows: HydratedIVow[] }>({
        path: 'vows',
        select: '_id title clergy position i18n',
        options: { sort: { position: 'asc' } },
      })
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

const findClergyById = async (id: string): Promise<LeanIClergy> =>
  await new Promise((resolve, reject) => {
    Clergy.findById(id)
      .lean()
      .populate<{ vows: LeanIVow[] }>({
        path: 'vows',
        select: '_id title clergy position i18n',
        options: { sort: { position: 'asc' } },
      })
      .then((res?: LeanIClergy | null) => {
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
    icon,
    i18n = null,
  }: {
    id?: string;
    title?: string;
    summary?: string;
    ruleBook?: string;
    icon?: string;
    i18n?: string | null;
  } = req.body;
  if (
    title === undefined ||
    summary === undefined ||
    ruleBook === undefined ||
    icon === undefined
  ) {
    res.status(400).send(gemInvalidField('Clergy'));

    return;
  }

  const clergy = new Clergy({
    title,
    summary,
    ruleBook,
    icon,
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
    icon = null,
    i18n,
  }: {
    id?: string;
    title: string | null;
    summary: string | null;
    ruleBook: string | null;
    icon: string | null;
    i18n: InternationalizationType | null;
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Clergy ID'));

    return;
  }
  findCompleteClergyById(id)
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
      if (icon !== null) {
        clergy.icon = icon;
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

const changeVowsOrder = (req: Request, res: Response): void => {
  const {
    id,
    order,
  }: {
    id?: string;
    order?: Array<{
      id: string;
      position: number;
    }>;
  } = req.body;
  if (id === undefined || order === undefined) {
    res.status(400).send(gemInvalidField('Clergy Vows Reordering'));

    return;
  }
  updateMultipleVowsPosition(order, (err) => {
    if (err !== null) {
      res.status(404).send(gemNotFound('Clergy Vows'));
    } else {
      res.send({ message: 'Clergy Vows were updated successfully!' });
    }
  });
};

const deleteClergyById = async (id?: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Clergy ID'));

      return;
    }
    deleteVowsByClergy(id)
      .then(() => {
        Clergy.findByIdAndDelete(id)
          .then(() => {
            resolve(true);
          })
          .catch((err: unknown) => {
            reject(gemServerError(err));
          });
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

export interface CuratedIClergyToSend {
  clergy: Omit<LeanIClergy, 'vows'> & {
    vows: Array<{
      vow: LeanIVow;
      i18n?: InternationalizationType;
    }>;
  };
  i18n?: InternationalizationType;
}

export const curateSingleClergy = (clergySent: LeanIClergy): CuratedIClergyToSend => ({
  clergy: {
    ...clergySent,
    vows: clergySent.vows.map((vow) => ({
      vow,
      i18n: curateI18n(vow.i18n),
    })),
  },
  i18n: curateI18n(clergySent.i18n),
});

const findSingle = (req: Request, res: Response): void => {
  const { clergyId } = req.query;
  if (clergyId === undefined || typeof clergyId !== 'string') {
    res.status(400).send(gemInvalidField('Clergy ID'));

    return;
  }
  findClergyById(clergyId)
    .then((clergy) => {
      res.send(curateSingleClergy(clergy));
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAllPromise = async (): Promise<CuratedIClergyToSend[]> =>
  await new Promise((resolve, reject) => {
    findClergies()
      .then((clergies) => {
        const curatedClergies: CuratedIClergyToSend[] = [];

        clergies.forEach((clergy) => {
          curatedClergies.push(curateSingleClergy(clergy));
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

export {
  create,
  deleteClergy,
  findAll,
  findAllPromise,
  findSingle,
  findClergyById,
  update,
  changeVowsOrder,
};
