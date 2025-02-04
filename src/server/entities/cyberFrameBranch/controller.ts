import type { Request, Response } from 'express';
import type { ObjectId } from 'mongoose';

import db from '../../models';
import {
  gemForbidden,
  gemInvalidField,
  gemNotFound,
  gemServerError,
} from '../../utils/globalErrorMessage';

import type { InternationalizationType } from '../../utils/types';
import type { HydratedINode, ICyberFrame, INode, LeanINode } from '../index';
import type { HydratedICyberFrameBranch, LeanICyberFrameBranch } from './model';

import { curateI18n } from '../../utils';

const { CyberFrameBranch } = db;

const findCyberFrameBranches = async (): Promise<LeanICyberFrameBranch[]> =>
  await new Promise((resolve, reject) => {
    CyberFrameBranch.find()
      .lean()
      .populate<{ cyberFrame: ICyberFrame }>('cyberFrame')
      .populate<{ nodes: Array<INode<string>> }>({
        path: 'nodes',
        select: '_id title summary icon',
        populate: ['effects', 'actions', 'skillBonuses', 'statBonuses', 'charParamBonuses'],
      })
      .then((res: LeanICyberFrameBranch[]) => {
        if (res.length === 0) {
          reject(gemNotFound('CyberFrameBranches'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const findCyberFrameBranchesByFrame = async (
  cyberFrameId: string
): Promise<LeanICyberFrameBranch[]> =>
  await new Promise((resolve, reject) => {
    CyberFrameBranch.find({ cyberFrame: cyberFrameId })
      .lean()
      .populate<{ cyberFrame: ICyberFrame }>('cyberFrame')
      .populate<{ nodes: Array<INode<string>> }>({
        path: 'nodes',
        select: '_id title summary icon',
        populate: ['effects', 'actions', 'skillBonuses', 'statBonuses', 'charParamBonuses'],
      })
      .then((res?: LeanICyberFrameBranch[] | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('CyberFrameBranches'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const findCompleteCyberFrameBranchById = async (id: string): Promise<HydratedICyberFrameBranch> =>
  await new Promise((resolve, reject) => {
    CyberFrameBranch.findById(id)
      .populate<{ cyberFrame: ICyberFrame }>('cyberFrame')
      .populate<{ nodes: HydratedINode[] }>({
        path: 'nodes',
        select: '_id title summary icon',
      })
      .then((res) => {
        if (res === null) {
          reject(gemNotFound('CyberFrameBranch'));
        } else {
          resolve(res as HydratedICyberFrameBranch);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const findCyberFrameBranchById = async (id: string): Promise<LeanICyberFrameBranch> =>
  await new Promise((resolve, reject) => {
    CyberFrameBranch.findById(id)
      .lean()
      .populate<{ cyberFrame: ICyberFrame }>('cyberFrame')
      .populate<{ nodes: Array<INode<string>> }>({
        path: 'nodes',
        select: '_id title summary icon',
        populate: ['effects', 'actions', 'skillBonuses', 'statBonuses', 'charParamBonuses'],
      })
      .then((res) => {
        if (res === null) {
          reject(gemNotFound('CyberFrameBranch'));
        } else {
          resolve(res as LeanICyberFrameBranch);
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
    cyberFrame,
    i18n = null,
  }: {
    id?: string;
    title?: string;
    summary?: string;
    cyberFrame?: ObjectId;
    i18n: InternationalizationType | null;
  } = req.body;
  if (title === undefined || summary === undefined || cyberFrame === undefined) {
    res.status(400).send(gemInvalidField('CyberFrameBranch'));

    return;
  }
  if (title === '_general') {
    res.status(403).send(gemForbidden());

    return;
  }

  const cyberFrameBranch: HydratedICyberFrameBranch = new CyberFrameBranch({
    title,
    summary,
    cyberFrame,
  });

  if (i18n !== null) {
    cyberFrameBranch.i18n = JSON.stringify(i18n);
  }

  cyberFrameBranch
    .save()
    .then(() => {
      res.send(cyberFrameBranch);
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const createGeneralForCyberFrameId = async (id?: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('CyberFrame ID'));

      return;
    }
    const cyberFrameBranch: HydratedICyberFrameBranch = new CyberFrameBranch({
      title: '_general',
      summary: '',
      cyberFrame: id,
    });
    cyberFrameBranch
      .save()
      .then(() => {
        resolve(true);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const update = (req: Request, res: Response): void => {
  const {
    id,
    title = null,
    summary = null,
    cyberFrame = null,
    i18n,
  }: {
    id?: string;
    title: string | null;
    summary: string | null;
    i18n: InternationalizationType | null;
    cyberFrame: ObjectId | null;
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('CyberFrameBranch ID'));

    return;
  }
  if (title === '_general') {
    res.status(403).send(gemForbidden());

    return;
  }
  findCompleteCyberFrameBranchById(id)
    .then((cyberFrameBranch) => {
      if (cyberFrameBranch.title === '_general') {
        res.status(403).send(gemForbidden());

        return;
      }
      if (title !== null) {
        cyberFrameBranch.title = title;
      }
      if (summary !== null) {
        cyberFrameBranch.summary = summary;
      }
      if (cyberFrame !== null) {
        cyberFrameBranch.cyberFrame = cyberFrame;
      }

      if (i18n !== null) {
        const newIntl: InternationalizationType = {
          ...(cyberFrameBranch.i18n !== undefined && cyberFrameBranch.i18n !== ''
            ? JSON.parse(cyberFrameBranch.i18n)
            : {}),
        };

        Object.keys(i18n).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        cyberFrameBranch.i18n = JSON.stringify(newIntl);
      }

      cyberFrameBranch
        .save()
        .then(() => {
          res.send({
            message: 'CyberFrame branch was updated successfully!',
            cyberFrameBranch,
          });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('CyberFrameBranch'));
    });
};

const deleteCyberFrameBranchById = async (id?: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('CyberFrameBranch ID'));

      return;
    }
    findCyberFrameBranchById(id)
      .then(({ title }) => {
        if (title === '_general') {
          reject(gemForbidden());
        } else {
          CyberFrameBranch.findByIdAndDelete(id)
            .then(() => {
              resolve(true);
            })
            .catch((err: unknown) => {
              reject(gemServerError(err));
            });
        }
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const deleteCyberFrameBranch = (req: Request, res: Response): void => {
  const { id }: { id: string } = req.body;
  deleteCyberFrameBranchById(id)
    .then(() => {
      res.send({ message: 'CyberFrame branch was deleted successfully!' });
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const deleteCyberFrameBranchesByCyberFrameId = async (cyberFrameId?: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (cyberFrameId === undefined) {
      resolve(true);

      return;
    }
    CyberFrameBranch.deleteMany({ cyberFrame: cyberFrameId })
      .then(() => {
        resolve(true);
      })
      .catch((err: unknown) => {
        reject(err);
      });
  });

interface CuratedICyberFrameBranchToSend {
  cyberFrameBranch: Omit<LeanICyberFrameBranch, 'cyberFrame'> & {
    cyberFrame: ICyberFrame;
    nodes?: LeanINode[];
  };
  i18n?: InternationalizationType;
}

const curateSingleCyberFrameBranch = (
  cyberFrameBranchSent: LeanICyberFrameBranch
): CuratedICyberFrameBranchToSend => {
  const curatedNodes =
    cyberFrameBranchSent.nodes?.length !== undefined && cyberFrameBranchSent.nodes.length > 0
      ? cyberFrameBranchSent.nodes.map((node) => ({
          ...node,
          ...(node.i18n !== undefined ? { i18n: JSON.parse(node.i18n) } : {}),
        }))
      : [];

  const curatedCyberFrame = {
    ...cyberFrameBranchSent.cyberFrame,
    ...(cyberFrameBranchSent.cyberFrame.i18n !== undefined
      ? { i18n: JSON.parse(cyberFrameBranchSent.cyberFrame.i18n) }
      : {}),
  };

  return {
    cyberFrameBranch: {
      ...cyberFrameBranchSent,
      nodes: curatedNodes,
      cyberFrame: curatedCyberFrame,
    },
    i18n: curateI18n(cyberFrameBranchSent.i18n),
  };
};

const findSingle = (req: Request, res: Response): void => {
  const { cyberFrameBranchId } = req.query;
  if (cyberFrameBranchId === undefined || typeof cyberFrameBranchId !== 'string') {
    res.status(400).send(gemInvalidField('CyberFrameBranch ID'));

    return;
  }
  findCyberFrameBranchById(cyberFrameBranchId)
    .then((cyberFrameBranch) => {
      res.send(curateSingleCyberFrameBranch(cyberFrameBranch));
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findCyberFrameBranches()
    .then((cyberFrameBranches) => {
      const curatedCyberFrameBranches: CuratedICyberFrameBranchToSend[] = [];

      cyberFrameBranches.forEach((cyberFrameBranch) => {
        curatedCyberFrameBranches.push(curateSingleCyberFrameBranch(cyberFrameBranch));
      });

      res.send(curatedCyberFrameBranches);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const findAllByFrame = (req: Request, res: Response): void => {
  const { cyberFrameId } = req.query;
  if (cyberFrameId === undefined || typeof cyberFrameId !== 'string') {
    res.status(400).send(gemInvalidField('CyberFrame ID'));

    return;
  }
  findCyberFrameBranchesByFrame(cyberFrameId)
    .then((cyberFrameBranches) => {
      const curatedCyberFrameBranches: CuratedICyberFrameBranchToSend[] = [];

      cyberFrameBranches.forEach((cyberFrameBranch) => {
        curatedCyberFrameBranches.push(curateSingleCyberFrameBranch(cyberFrameBranch));
      });

      res.send(curatedCyberFrameBranches);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  create,
  createGeneralForCyberFrameId,
  deleteCyberFrameBranch,
  deleteCyberFrameBranchesByCyberFrameId,
  findAll,
  findAllByFrame,
  findCyberFrameBranchById,
  findCyberFrameBranchesByFrame,
  findSingle,
  update,
};
