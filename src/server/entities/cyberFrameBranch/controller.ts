import { type Request, type Response } from 'express';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';
import { type ICyberFrame } from '../index';

import { type HydratedICyberFrameBranch } from './model';

const { CyberFrameBranch } = db;

const findCyberFrameBranches = async (): Promise<HydratedICyberFrameBranch[]> =>
  await new Promise((resolve, reject) => {
    CyberFrameBranch.find()
      .populate<{ cyberFrame: ICyberFrame }>('cyberFrame')
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('CyberFrameBranches'));
        } else {
          resolve(res as HydratedICyberFrameBranch[]);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const findCyberFrameBranchById = async (id: string): Promise<HydratedICyberFrameBranch> =>
  await new Promise((resolve, reject) => {
    CyberFrameBranch.findById(id)
      .populate<{ cyberFrame: ICyberFrame }>('cyberFrame')
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('CyberFrameBranch'));
        } else {
          resolve(res as HydratedICyberFrameBranch);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const { title, summary, cyberframe, i18n = null } = req.body;
  if (title === undefined || summary === undefined || cyberframe === undefined) {
    res.status(400).send(gemInvalidField('CyberFrameBranch'));
    return;
  }

  const cyberFrameBranch = new CyberFrameBranch({
    title,
    summary,
    cyberframe,
  });

  if (i18n !== null) {
    cyberFrameBranch.i18n = JSON.stringify(i18n);
  }

  cyberFrameBranch
    .save()
    .then(() => {
      res.send(cyberFrameBranch);
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

const update = (req: Request, res: Response): void => {
  const { id, title = null, summary = null, cyberFrame = null, i18n } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('CyberFrameBranch ID'));
    return;
  }
  findCyberFrameBranchById(id as string)
    .then((cyberFrameBranch) => {
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
        const newIntl = {
          ...(cyberFrameBranch.i18n !== null &&
          cyberFrameBranch.i18n !== undefined &&
          cyberFrameBranch.i18n !== ''
            ? JSON.parse(cyberFrameBranch.i18n)
            : {}),
        };

        Object.keys(i18n as Record<string, any>).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        cyberFrameBranch.i18n = JSON.stringify(newIntl);
      }

      cyberFrameBranch
        .save()
        .then(() => {
          res.send({ message: 'CyberFrame branch was updated successfully!', cyberFrameBranch });
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('CyberFrameBranch'));
    });
};

const deleteCyberFrameBranchById = async (id: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('CyberFrameBranch ID'));
      return;
    }
    CyberFrameBranch.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: Error) => {
        reject(gemServerError(err));
      });
  });

const deleteCyberFrameBranch = (req: Request, res: Response): void => {
  const { id } = req.body;
  deleteCyberFrameBranchById(id as string)
    .then(() => {
      res.send({ message: 'CyberFrame branch was deleted successfully!' });
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

interface CuratedICyberFrameBranch {
  i18n: Record<string, any> | Record<string, unknown>;
  cyberFrameBranch: HydratedICyberFrameBranch;
}

const curateCyberFrameBranch = (
  cyberFrameBranch: HydratedICyberFrameBranch
): Record<string, any> => {
  if (
    cyberFrameBranch.i18n === null ||
    cyberFrameBranch.i18n === '' ||
    cyberFrameBranch.i18n === undefined
  ) {
    return {};
  }
  return JSON.parse(cyberFrameBranch.i18n);
};

const findSingle = (req: Request, res: Response): void => {
  const { cyberFrameBranchId } = req.query;
  if (cyberFrameBranchId === undefined || typeof cyberFrameBranchId !== 'string') {
    res.status(400).send(gemInvalidField('CyberFrameBranch ID'));
    return;
  }
  findCyberFrameBranchById(cyberFrameBranchId)
    .then((cyberFrameBranch) => {
      const sentObj = {
        cyberFrameBranch,
        i18n: curateCyberFrameBranch(cyberFrameBranch),
      };
      res.send(sentObj);
    })
    .catch((err: Error) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findCyberFrameBranches()
    .then((cyberFrameBranchs) => {
      const curatedCyberFrameBranches: CuratedICyberFrameBranch[] = [];

      cyberFrameBranchs.forEach((cyberFrameBranch) => {
        curatedCyberFrameBranches.push({
          cyberFrameBranch,
          i18n: curateCyberFrameBranch(cyberFrameBranch),
        });
      });

      res.send(curatedCyberFrameBranches);
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

export { create, deleteCyberFrameBranch, findAll, findCyberFrameBranchById, findSingle, update };
