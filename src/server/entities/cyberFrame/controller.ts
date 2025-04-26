import type { Request, Response } from 'express';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';

import {
  createCharParamsByCyberFrame,
  deleteCharParamsByCyberFrame,
  replaceCharParamByCyberFrame,
} from './charParam/controller';
import {
  createStatsByCyberFrame,
  deleteStatsByCyberFrame,
  replaceStatByCyberFrame,
} from './stat/controller';

import type { InternationalizationType } from '../../utils/types';
import type {
  HydratedIRuleBook,
  ICyberFrameStat,
  LeanICyberFrame,
  IRuleBook,
  HydratedICyberFrame,
  HydratedICyberFrameStat,
  ICyberFrameCharParam,
  HydratedICyberFrameCharParam,
} from '../index';

import { curateI18n } from '../../utils';

const { CyberFrame } = db;

const findCyberFrames = async (): Promise<LeanICyberFrame[]> =>
  await new Promise((resolve, reject) => {
    CyberFrame.find()
      .lean()
      .populate<{ ruleBook: IRuleBook }>('ruleBook')
      .populate<{ stats: ICyberFrameStat[] }>({
        path: 'stats',
        select: '_id cyberFrame stat value',
      })
      .populate<{ charParams: ICyberFrameCharParam[] }>({
        path: 'charParams',
        select: '_id cyberFrame charParam value',
      })
      .then((res: LeanICyberFrame[]) => {
        resolve(res);
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const findCyberFrameById = async (id: string): Promise<LeanICyberFrame> =>
  await new Promise((resolve, reject) => {
    CyberFrame.findById(id)
      .lean()
      .populate<{ ruleBook: IRuleBook }>('ruleBook')
      .populate<{ stats: ICyberFrameStat[] }>({
        path: 'stats',
        select: '_id cyberFrame stat value',
      })
      .populate<{ charParams: ICyberFrameCharParam[] }>({
        path: 'charParams',
        select: '_id cyberFrame charParam value',
      })
      .then((res?: LeanICyberFrame | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('CyberFrame'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const findCompleteCyberFrameById = async (id: string): Promise<HydratedICyberFrame> =>
  await new Promise((resolve, reject) => {
    CyberFrame.findById(id)
      .populate<{ ruleBook: HydratedIRuleBook }>('ruleBook')
      .populate<{ stats: HydratedICyberFrameStat[] }>({
        path: 'stats',
        select: '_id cyberFrame stat value',
      })
      .populate<{ charParams: HydratedICyberFrameCharParam[] }>({
        path: 'charParams',
        select: '_id cyberFrame charParam value',
      })
      .then((res?: HydratedICyberFrame | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('CyberFrame'));
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
    i18n = null,
    ruleBook,
    stats,
    charParams,
  }: {
    title?: string;
    summary?: string;
    i18n: InternationalizationType | null;
    ruleBook?: string;
    stats: Array<{
      id: string;
      value: number;
    }>;
    charParams: Array<{
      id: string;
      value: number;
    }>;
  } = req.body;
  if (title === undefined || summary === undefined || ruleBook === undefined) {
    res.status(400).send(gemInvalidField('CyberFrame'));

    return;
  }

  const cyberFrame = new CyberFrame({
    title,
    summary,
    ruleBook,
  });

  if (i18n !== null) {
    cyberFrame.i18n = JSON.stringify(i18n);
  }

  cyberFrame
    .save()
    .then(() => {
      createStatsByCyberFrame({
        cyberFrameId: cyberFrame._id.toString(),
        stats,
      })
        .then(() => {
          createCharParamsByCyberFrame({
            cyberFrameId: cyberFrame._id.toString(),
            charParams,
          })
            .then(() => {
              res.send(cyberFrame);
            })
            .catch((err: unknown) => {
              res.status(500).send(gemServerError(err));
            });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
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
    stats,
    charParams,
  }: {
    id?: string;
    title: string | null;
    summary: string | null;
    ruleBook: string | null;
    i18n: InternationalizationType | null;
    stats: Array<{
      id: string;
      value: number;
    }>;
    charParams: Array<{
      id: string;
      value: number;
    }>;
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('CyberFrame ID'));

    return;
  }
  findCompleteCyberFrameById(id)
    .then((cyberFrame) => {
      if (title !== null) {
        cyberFrame.title = title;
      }
      if (summary !== null) {
        cyberFrame.summary = summary;
      }
      if (ruleBook !== null) {
        cyberFrame.ruleBook = ruleBook;
      }

      if (i18n !== null) {
        const newIntl: InternationalizationType = {
          ...(cyberFrame.i18n !== undefined && cyberFrame.i18n !== ''
            ? JSON.parse(cyberFrame.i18n)
            : {}),
        };

        Object.keys(i18n).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        cyberFrame.i18n = JSON.stringify(newIntl);
      }

      cyberFrame
        .save()
        .then(() => {
          replaceStatByCyberFrame({
            cyberFrameId: id,
            stats,
          })
            .then(() => {
              replaceCharParamByCyberFrame({
                cyberFrameId: id,
                charParams,
              })
                .then(() => {
                  res.send({
                    message: 'CyberFrame was updated successfully!',
                    cyberFrame,
                  });
                })
                .catch((err: unknown) => {
                  res.status(500).send(gemServerError(err));
                });
            })
            .catch((err: unknown) => {
              res.status(500).send(gemServerError(err));
            });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('CyberFrame'));
    });
};

const deleteCyberFrameById = async (id?: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('CyberFrame ID'));

      return;
    }
    deleteCharParamsByCyberFrame(id)
      .then(() => {
        deleteStatsByCyberFrame(id)
          .then(() => {
            CyberFrame.findByIdAndDelete(id)
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
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const deleteCyberFrame = (req: Request, res: Response): void => {
  const { id }: { id: string } = req.body;
  deleteCyberFrameById(id)
    .then(() => {
      res.send({ message: 'CyberFrame was deleted successfully!' });
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

export interface CuratedICyberFrameToSend {
  cyberFrame: LeanICyberFrame;
  i18n?: InternationalizationType;
}

const curateSingleCyberFrame = (cyberFrameSent: LeanICyberFrame): CuratedICyberFrameToSend => ({
  cyberFrame: cyberFrameSent,
  i18n: curateI18n(cyberFrameSent.i18n),
});

const findSingle = (req: Request, res: Response): void => {
  const { cyberFrameId } = req.query;
  if (cyberFrameId === undefined || typeof cyberFrameId !== 'string') {
    res.status(400).send(gemInvalidField('CyberFrame ID'));

    return;
  }
  findCyberFrameById(cyberFrameId)
    .then((cyberFrameSent) => {
      res.send(curateSingleCyberFrame(cyberFrameSent));
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAllPromise = async (): Promise<CuratedICyberFrameToSend[]> =>
  await new Promise((resolve, reject) => {
    findCyberFrames()
      .then((cyberFrames) => {
        const curatedCyberFrames: CuratedICyberFrameToSend[] = [];

        cyberFrames.forEach((cyberFrameSent) => {
          curatedCyberFrames.push(curateSingleCyberFrame(cyberFrameSent));
        });

        resolve(curatedCyberFrames);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const findAll = (req: Request, res: Response): void => {
  findAllPromise()
    .then((cyberFrames) => {
      res.send(cyberFrames);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  create,
  deleteCyberFrame,
  findAll,
  findAllPromise,
  findCyberFrameById,
  findSingle,
  update,
};
