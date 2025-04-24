import type { Request, Response } from 'express';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';

import type { InternationalizationType } from '../../utils/types';
import type { HydratedIRuleBook, IRuleBook } from '../index';
import type { HydratedICyberFrame, LeanICyberFrame } from './model';

import { curateI18n } from '../../utils';

const { CyberFrame } = db;

const findCyberFrames = async (): Promise<LeanICyberFrame[]> =>
  await new Promise((resolve, reject) => {
    CyberFrame.find()
      .lean()
      .populate<{ ruleBook: IRuleBook }>('ruleBook')
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

const findCyberFrameById = async (id: string): Promise<LeanICyberFrame> =>
  await new Promise((resolve, reject) => {
    CyberFrame.findById(id)
      .lean()
      .populate<{ ruleBook: IRuleBook }>('ruleBook')
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
  const { title, summary, i18n = null, ruleBook } = req.body;
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
      res.send(cyberFrame);
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
  }: {
    id?: string;
    title: string | null;
    summary: string | null;
    ruleBook: string | null;
    i18n: InternationalizationType | null;
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
          res.send({
            message: 'CyberFrame was updated successfully!',
            cyberFrame,
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
    CyberFrame.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
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

const findAll = (req: Request, res: Response): void => {
  findCyberFrames()
    .then((cyberFrames) => {
      const curatedCyberFrames: CuratedICyberFrameToSend[] = [];

      cyberFrames.forEach((cyberFrameSent) => {
        curatedCyberFrames.push(curateSingleCyberFrame(cyberFrameSent));
      });

      res.send(curatedCyberFrames);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export { create, deleteCyberFrame, findAll, findCyberFrameById, findSingle, update };
