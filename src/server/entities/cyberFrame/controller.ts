import type {
  Request, Response
} from 'express';
import type {
  FlattenMaps, HydratedDocument, ObjectId
} from 'mongoose';

import db from '../../models';
import {
  gemInvalidField, gemNotFound, gemServerError
} from '../../utils/globalErrorMessage';
import {
  createGeneralForCyberFrameId,
  deleteCyberFrameBranchesByCyberFrameId,
  type CuratedIntICyberFrameBranch
} from '../cyberFrameBranch/controller';

import type { InternationalizationType } from '../../utils/types';
import type {
  HydratedICyberFrameBranch, IRuleBook
} from '../index';
import type {
  HydratedICyberFrame, LeanICyberFrame
} from './model';

import { curateI18n } from '../../utils';

const { CyberFrame } = db;

const findCyberFrames = async (): Promise<LeanICyberFrame[]> =>
  await new Promise((resolve, reject) => {
    CyberFrame.find()
      .lean()
      .populate<{ ruleBook: HydratedDocument<IRuleBook> }>('ruleBook')
      .populate<{ branches: HydratedICyberFrameBranch[] }>({
        path: 'branches',
        select: '_id title cyberFrame summary i18n',
        populate: {
          path: 'nodes',
          select:
            '_id title summary icon i18n rank quote cyberFrameBranch effects actions skillBonuses skillBonuses statBonuses charParamBonuses',
          populate: [
            'effects',
            'actions',
            'skillBonuses',
            'skillBonuses',
            'statBonuses',
            'charParamBonuses'
          ]
        }
      })
      .then((res?: LeanICyberFrame[] | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('CyberFrames'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });

const findCyberFrameById = async (id: string): Promise<HydratedICyberFrame> =>
  await new Promise((resolve, reject) => {
    CyberFrame.findById(id)
      .populate<{ ruleBook: IRuleBook }>('ruleBook')
      .populate<{ branches: HydratedICyberFrameBranch[] }>({
        path: 'branches',
        select: '_id title cyberFrame summary i18n',
        populate: {
          path: 'nodes',
          select:
            '_id title summary icon i18n rank quote cyberFrameBranch effects actions skillBonuses skillBonuses statBonuses charParamBonuses',
          populate: [
            'effects',
            'actions',
            'skillBonuses',
            'skillBonuses',
            'statBonuses',
            'charParamBonuses'
          ]
        }
      })
      .then((res?: HydratedICyberFrame | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('CyberFrame'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const {
    title, summary, i18n = null, ruleBook
  } = req.body;
  if (title === undefined || summary === undefined || ruleBook === undefined) {
    res.status(400).send(gemInvalidField('CyberFrame'));

    return;
  }

  const cyberFrame = new CyberFrame({
    title,
    summary,
    ruleBook
  });

  if (i18n !== null) {
    cyberFrame.i18n = JSON.stringify(i18n);
  }

  cyberFrame
    .save()
    .then(() => {
      createGeneralForCyberFrameId(String(cyberFrame._id))
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
};

const update = (req: Request, res: Response): void => {
  const {
    id, title = null, summary = null, ruleBook = null, i18n
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('CyberFrame ID'));

    return;
  }
  findCyberFrameById(id as string)
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
        const newIntl: InternationalizationType = { ...(cyberFrame.i18n !== null && cyberFrame.i18n !== undefined && cyberFrame.i18n !== ''
          ? JSON.parse(cyberFrame.i18n)
          : {}) };

        Object.keys(i18n).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        cyberFrame.i18n = JSON.stringify(newIntl);
      }

      cyberFrame
        .save()
        .then(() => {
          res.send({
            message: 'CyberFrame was updated successfully!', cyberFrame
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
    deleteCyberFrameBranchesByCyberFrameId(id)
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

interface CuratedICyberFrame extends Omit<LeanICyberFrame, 'branches'> {
  branches: CuratedIntICyberFrameBranch[]
}

interface CuratedIntICyberFrame {
  i18n?: InternationalizationType
  cyberFrame: CuratedICyberFrame
}

const findSingle = (req: Request, res: Response): void => {
  const { cyberFrameId } = req.query;
  if (cyberFrameId === undefined || typeof cyberFrameId !== 'string') {
    res.status(400).send(gemInvalidField('CyberFrame ID'));

    return;
  }
  findCyberFrameById(cyberFrameId)
    .then((cyberFrameSent) => {
      const cyberFrame: FlattenMaps<HydratedICyberFrame & { _id: ObjectId }>
        = cyberFrameSent.toJSON();
      const cleanCyberFrame = {
        ...cyberFrame,
        branches: cyberFrame.branches.map((cyberFrameBranch) => {
          const cleanCyberFrameBranch = {
            ...cyberFrameBranch,
            nodes:
              cyberFrameBranch.nodes !== undefined
                ? cyberFrameBranch.nodes.map(node => ({
                    node,
                    i18n: curateI18n(node.i18n)
                  }))
                : []
          };

          return {
            cyberFrameBranch: cleanCyberFrameBranch,
            i18n: curateI18n(cleanCyberFrameBranch.i18n)
          };
        })
      };

      const sentObj = {
        cyberFrame: cleanCyberFrame,
        i18n: curateI18n(cyberFrame.i18n)
      };
      res.send(sentObj);
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findCyberFrames()
    .then((cyberFrames) => {
      const curatedCyberFrames: CuratedIntICyberFrame[] = [];

      cyberFrames.forEach((cyberFrame) => {
        const cleanCyberFrame = {
          ...cyberFrame,
          branches: cyberFrame.branches.map((cyberFrameBranch) => {
            const cleanCyberFrameBranch = {
              ...cyberFrameBranch,
              nodes:
                cyberFrameBranch.nodes !== undefined
                  ? cyberFrameBranch.nodes.map(node => ({
                      node,
                      i18n: curateI18n(node.i18n)
                    }))
                  : []
            };

            return {
              cyberFrameBranch: cleanCyberFrameBranch,
              i18n: curateI18n(cleanCyberFrameBranch.i18n)
            };
          })
        };

        curatedCyberFrames.push({
          cyberFrame: cleanCyberFrame,
          i18n: curateI18n(cyberFrame.i18n)
        });
      });

      res.send(curatedCyberFrames);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  create, deleteCyberFrame, findAll, findCyberFrameById, findSingle, update
};
