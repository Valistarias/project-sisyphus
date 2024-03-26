import { type Request, type Response } from 'express';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';

import { type HydratedIStat } from './model';

const { Stat } = db;

const findStats = async (): Promise<HydratedIStat[]> =>
  await new Promise((resolve, reject) => {
    Stat.find()
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Stats'));
        } else {
          resolve(res as HydratedIStat[]);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const findStatById = async (id: string): Promise<HydratedIStat> =>
  await new Promise((resolve, reject) => {
    Stat.findById(id)
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Stat'));
        } else {
          resolve(res as HydratedIStat);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const { title, summary, short, i18n = null } = req.body;
  if (title === undefined || summary === undefined || short === undefined) {
    res.status(400).send(gemInvalidField('Stat'));
    return;
  }

  const stat = new Stat({
    title,
    summary,
    short,
  });

  if (i18n !== null) {
    stat.i18n = JSON.stringify(i18n);
  }

  stat
    .save()
    .then(() => {
      res.send(stat);
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

const update = (req: Request, res: Response): void => {
  const { id, title = null, summary = null, i18n, short = null } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Stat ID'));
    return;
  }
  findStatById(id as string)
    .then((stat) => {
      if (title !== null) {
        stat.title = title;
      }
      if (summary !== null) {
        stat.summary = summary;
      }
      if (short !== null) {
        stat.short = short;
      }

      if (i18n !== null) {
        const newIntl = {
          ...(stat.i18n !== null && stat.i18n !== undefined && stat.i18n !== ''
            ? JSON.parse(stat.i18n)
            : {}),
        };

        Object.keys(i18n as Record<string, any>).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        stat.i18n = JSON.stringify(newIntl);
      }

      stat
        .save()
        .then(() => {
          res.send({ message: 'Stat was updated successfully!', stat });
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Stat'));
    });
};

const deleteStatById = async (id: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Stat ID'));
      return;
    }
    Stat.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: Error) => {
        reject(gemServerError(err));
      });
  });

const deleteStat = (req: Request, res: Response): void => {
  const { id } = req.body;
  deleteStatById(id as string)
    .then(() => {
      res.send({ message: 'Stat was deleted successfully!' });
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

interface CuratedIStat {
  i18n: Record<string, any> | Record<string, unknown>;
  stat: HydratedIStat;
}

const curateStat = (stat: HydratedIStat): Record<string, any> => {
  if (stat.i18n === null || stat.i18n === '' || stat.i18n === undefined) {
    return {};
  }
  return JSON.parse(stat.i18n);
};

const findSingle = (req: Request, res: Response): void => {
  const { statId } = req.query;
  if (statId === undefined || typeof statId !== 'string') {
    res.status(400).send(gemInvalidField('Stat ID'));
    return;
  }
  findStatById(statId)
    .then((stat) => {
      const sentObj = {
        stat,
        i18n: curateStat(stat),
      };
      res.send(sentObj);
    })
    .catch((err: Error) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findStats()
    .then((stats) => {
      const curatedStats: CuratedIStat[] = [];

      stats.forEach((stat) => {
        curatedStats.push({
          stat,
          i18n: curateStat(stat),
        });
      });

      res.send(curatedStats);
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

export { create, deleteStat, findAll, findSingle, findStatById, update };
