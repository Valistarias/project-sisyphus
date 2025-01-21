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
  deleteCyberFrameBranchesByCyberFrameId
} from '../cyberFrameBranch/controller';

import type { InternationalizationType } from '../../utils/types';
import type {
  HydratedINode, ICyberFrameBranch, IRuleBook
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
      .populate<{
      branches: Array<ICyberFrameBranch & {
        nodes: HydratedINode[]
      }>
    }>({
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
      .then((res: LeanICyberFrame[]) => {
        if (res.length === 0) {
          reject(gemNotFound('CyberFrames'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const findCyberFrameById = async (id: string): Promise<HydratedICyberFrame> =>
  await new Promise((resolve, reject) => {
    CyberFrame.findById(id)
      .populate<{ ruleBook: IRuleBook }>('ruleBook')
      .populate<{
      branches: Array<ICyberFrameBranch & {
        nodes: HydratedINode[]
      }>
    }>({
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
        reject(gemServerError(err));
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
  }: {
    id?: string
    title: string | null
    summary: string | null
    ruleBook: ObjectId | null
    i18n: InternationalizationType | null
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('CyberFrame ID'));

    return;
  }
  findCyberFrameById(id)
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
        const newIntl: InternationalizationType = { ...(
          cyberFrame.i18n !== undefined
          && cyberFrame.i18n !== ''
            ? JSON.parse(cyberFrame.i18n)
            : {}
        ) };

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
  branches: Array<{
    cyberFrameBranch:
      Omit<
        FlattenMaps<ICyberFrameBranch>
        , 'cyberFrame'
      > & {
        cyberFrame: ObjectId
      }
    i18n?: InternationalizationType
  }>
}

const findSingle = (req: Request, res: Response): void => {
  const { cyberFrameId } = req.query;
  if (cyberFrameId === undefined || typeof cyberFrameId !== 'string') {
    res.status(400).send(gemInvalidField('CyberFrame ID'));

    return;
  }
  findCyberFrameById(cyberFrameId)
    .then((cyberFrameSent) => {
      const data = cyberFrameSent.toJSON();
      const cleanCyberFrame = {
        ...data,
        branches: data.branches.map((cyberFrameBranch) => {
          const curatedNodes = cyberFrameBranch.nodes.length > 0
            ? cyberFrameBranch.nodes.map(node => ({
                node,
                i18n: curateI18n(node.i18n)
              }))
            : [];

          return {
            cyberFrameBranch: {
              ...cyberFrameBranch,
              nodes: curatedNodes
            },
            i18n: curateI18n(cyberFrameBranch.i18n)
          };
        })
      };

      const sentObj = {
        cyberFrame: cleanCyberFrame,
        i18n: curateI18n(data.i18n)
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
      const curatedCyberFrames: Array<{
        i18n?: InternationalizationType
        cyberFrame: CuratedICyberFrame
      }> = [];

      cyberFrames.forEach((cyberFrame) => {
        const cleanCyberFrame: CuratedICyberFrame = {
          ...cyberFrame,
          branches: cyberFrame.branches.map((cyberFrameBranch) => {
            const curatedNodes = cyberFrameBranch.nodes.length > 0
              ? cyberFrameBranch.nodes.map(node => ({
                  node,
                  i18n: curateI18n(node.i18n)
                }))
              : [];

            return {
              cyberFrameBranch: {
                ...cyberFrameBranch,
                nodes: curatedNodes
              },
              i18n: curateI18n(cyberFrameBranch.i18n)
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
