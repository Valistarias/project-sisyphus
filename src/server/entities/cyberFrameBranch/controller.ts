import type {
  Request, Response
} from 'express';
import type { FlattenMaps, HydratedDocument, ObjectId } from 'mongoose';

import db from '../../models';
import {
  gemForbidden,
  gemInvalidField,
  gemNotFound,
  gemServerError
} from '../../utils/globalErrorMessage';

import type { ICuratedCyberFrameToSend, ICuratedNodeToSend, InternationalizationType } from '../../utils/types';
import type { HydratedICyberFrame, HydratedINode, ICyberFrame } from '../index';
import type {
  HydratedICyberFrameBranch, ICyberFrameBranch
} from './model';
import type { INodeSent } from '../node/controller';

import { curateI18n } from '../../utils';

const { CyberFrameBranch } = db;

const findCyberFrameBranches = async (): Promise<HydratedICyberFrameBranch[]> =>
  await new Promise((resolve, reject) => {
    CyberFrameBranch.find()
      .populate<{ cyberFrame: HydratedICyberFrame }>('cyberFrame')
      .populate<{ nodes: HydratedINode[] }>({
        path: 'nodes',
        select: '_id title summary icon',
        populate: [
          'effects',
          'actions'
        ]
      })
      .then((res: HydratedICyberFrameBranch[]) => {
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
): Promise<HydratedICyberFrameBranch[]> =>
  await new Promise((resolve, reject) => {
    CyberFrameBranch.find({ cyberFrame: cyberFrameId })
      .populate<{ cyberFrame: HydratedICyberFrame }>('cyberFrame')
      .populate<{ nodes: HydratedINode[] }>({
        path: 'nodes',
        select: '_id title summary icon'
      })
      .then((res?: HydratedICyberFrameBranch[] | null) => {
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

const findCyberFrameBranchById = async (
  id: string
): Promise<HydratedICyberFrameBranch> =>
  await new Promise((resolve, reject) => {
    CyberFrameBranch.findById(id)
      .populate<{ cyberFrame: ICyberFrame }>('cyberFrame')
      .populate<{ nodes: HydratedINode[] }>({
        path: 'nodes',
        select: '_id title summary icon'
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

const create = (req: Request, res: Response): void => {
  const {
    title, summary, cyberFrame, i18n = null
  }: {
    id?: string
    title?: string
    summary?: string
    cyberFrame?: ObjectId
    i18n: InternationalizationType | null
  } = req.body;
  if (
    title === undefined
    || summary === undefined
    || cyberFrame === undefined
  ) {
    res.status(400).send(gemInvalidField('CyberFrameBranch'));

    return;
  }
  if (title === '_general') {
    res.status(403).send(gemForbidden());

    return;
  }

  const cyberFrameBranch = new CyberFrameBranch({
    title,
    summary,
    cyberFrame
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
    const cyberFrameBranch = new CyberFrameBranch({
      title: '_general',
      summary: '',
      cyberFrame: id
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
    id, title = null, summary = null, cyberFrame = null, i18n
  }: {
    id?: string
    title: string | null
    summary: string | null
    i18n: InternationalizationType | null
    cyberFrame: ObjectId | null
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('CyberFrameBranch ID'));

    return;
  }
  if (title === '_general') {
    res.status(403).send(gemForbidden());

    return;
  }
  findCyberFrameBranchById(id)
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
        const newIntl: InternationalizationType = { ...(
          cyberFrameBranch.i18n !== undefined
          && cyberFrameBranch.i18n !== ''
            ? JSON.parse(cyberFrameBranch.i18n)
            : {}
        ) };

        Object.keys(i18n).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        cyberFrameBranch.i18n = JSON.stringify(newIntl);
      }

      cyberFrameBranch
        .save()
        .then(() => {
          res.send({
            message: 'CyberFrame branch was updated successfully!', cyberFrameBranch
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

const deleteCyberFrameBranchesByCyberFrameId = async (
  cyberFrameId?: string
): Promise<boolean> =>
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

type ICyberFrameBranchSent = HydratedDocument<
  Omit<
    FlattenMaps<ICyberFrameBranch>
    , 'cyberFrame'
  > & {
    cyberFrame: HydratedICyberFrame
    nodes?: INodeSent[]
  }
>;

interface CuratedICyberFrameBranchToSend {
  cyberFrameBranch:
    Omit<
      FlattenMaps<ICyberFrameBranch>
      , 'cyberFrame'
    > & {
      cyberFrame: ICuratedCyberFrameToSend
      nodes?: ICuratedNodeToSend[]
    }
  i18n?: InternationalizationType
}

const curateSingleCyberFrameBranch = (
  cyberFrameBranchSent: ICyberFrameBranchSent
): CuratedICyberFrameBranchToSend => {
  const curatedNodes = cyberFrameBranchSent.nodes?.length !== undefined
    && cyberFrameBranchSent.nodes.length > 0
    ? cyberFrameBranchSent.nodes.map((node) => {
        const data = node.toJSON();

        return {
          ...data,
          ...(
            data.i18n !== undefined
              ? { i18n: JSON.parse(data.i18n) }
              : {}
          )
        };
      })
    : [];

  const curatedCyberFrame = {
    ...cyberFrameBranchSent.cyberFrame.toJSON(),
    ...(
      cyberFrameBranchSent.cyberFrame.i18n !== undefined
        ? { i18n: JSON.parse(cyberFrameBranchSent.cyberFrame.i18n) }
        : {}
    )
  };

  return {
    cyberFrameBranch: {
      ...cyberFrameBranchSent.toJSON(),
      nodes: curatedNodes,
      cyberFrame: curatedCyberFrame
    },
    i18n: curateI18n(cyberFrameBranchSent.i18n)
  };
};

const findSingle = (req: Request, res: Response): void => {
  const { cyberFrameBranchId } = req.query;
  if (cyberFrameBranchId === undefined || typeof cyberFrameBranchId !== 'string') {
    res.status(400).send(gemInvalidField('CyberFrameBranch ID'));

    return;
  }
  findCyberFrameBranchById(cyberFrameBranchId)
    .then((cyberFrameBranch: ICyberFrameBranchSent) => {
      res.send(curateSingleCyberFrameBranch(cyberFrameBranch));
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findCyberFrameBranches()
    .then((cyberFrameBranches: ICyberFrameBranchSent[]) => {
      const curatedCyberFrameBranches: CuratedICyberFrameBranchToSend[] = [];

      cyberFrameBranches.forEach((cyberFrameBranch) => {
        curatedCyberFrameBranches.push(
          curateSingleCyberFrameBranch(cyberFrameBranch)
        );
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
    .then((cyberFrameBranches: ICyberFrameBranchSent[]) => {
      const curatedCyberFrameBranches: CuratedICyberFrameBranchToSend[] = [];

      cyberFrameBranches.forEach((cyberFrameBranch) => {
        curatedCyberFrameBranches.push(
          curateSingleCyberFrameBranch(cyberFrameBranch)
        );
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
  update
};
