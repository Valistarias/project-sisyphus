import type { Request, Response } from 'express';

import db from '../../models';
import {
  gemDuplicate,
  gemInvalidField,
  gemNotFound,
  gemServerError,
} from '../../utils/globalErrorMessage';

import type { HydratedITipText } from './model';
import type { InternationalizationType } from '../../utils/types';

import { curateI18n } from '../../utils';

const { TipText } = db;

const findTipTexts = async (): Promise<HydratedITipText[]> =>
  await new Promise((resolve, reject) => {
    TipText.find()
      .then((res: HydratedITipText[]) => {
        if (res.length === 0) {
          reject(gemNotFound('TipTexts'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const findTipTextById = async (id: string): Promise<HydratedITipText> =>
  await new Promise((resolve, reject) => {
    TipText.findById(id)
      .then((res?: HydratedITipText | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('TipText'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const checkDuplicateTipTextTipId = async (
  tipId: string,
  alreadyExistOnce = false
): Promise<string | boolean> =>
  await new Promise((resolve, reject) => {
    TipText.find({ tipId })
      .then((res) => {
        if (res.length === 0 || (alreadyExistOnce && res.length === 1)) {
          resolve(false);
        } else {
          resolve(res[0].title);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const checkDuplicateTipId = async (
  tipId: string | null,
  alreadyExistOnce: boolean
): Promise<string | boolean> =>
  await new Promise((resolve, reject) => {
    if (tipId !== null) {
      checkDuplicateTipTextTipId(tipId, alreadyExistOnce)
        .then((responseTipText: string | boolean) => {
          if (typeof responseTipText === 'boolean') {
            resolve(false);
          } else {
            resolve(responseTipText);
          }
        })
        .catch((err: unknown) => {
          reject(err);
        });
    } else {
      resolve(false);
    }
  });

const create = (req: Request, res: Response): void => {
  const {
    title,
    summary,
    i18n = null,
    tipId,
  }: {
    id?: string;
    title?: string;
    summary?: string;
    i18n?: InternationalizationType | null;
    tipId?: string;
  } = req.body;
  if (title === undefined || summary === undefined || tipId === undefined) {
    res.status(400).send(gemInvalidField('Item Modifier'));

    return;
  }

  checkDuplicateTipId(tipId, false)
    .then((response) => {
      if (typeof response === 'boolean') {
        const tipText = new TipText({
          title,
          summary,
          tipId,
        });

        if (i18n !== null) {
          tipText.i18n = JSON.stringify(i18n);
        }

        tipText
          .save()
          .then(() => {
            res.send(tipText);
          })
          .catch((err: unknown) => {
            res.status(500).send(gemServerError(err));
          });
      } else {
        res.status(400).send(gemDuplicate(response));
      }
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
    i18n,
    tipId = null,
  }: {
    id?: string;
    title: string | null;
    summary: string | null;
    i18n: InternationalizationType | null;
    tipId: string | null;
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Item Modifier ID'));

    return;
  }
  findTipTextById(id)
    .then((tipText) => {
      const alreadyExistOnce = typeof tipId === 'string' && tipId === tipText.tipId;
      checkDuplicateTipId(tipId, alreadyExistOnce)
        .then((response) => {
          if (typeof response === 'boolean') {
            if (title !== null) {
              tipText.title = title;
            }
            if (tipId !== null) {
              tipText.tipId = tipId;
            }
            if (summary !== null) {
              tipText.summary = summary;
            }

            if (i18n !== null) {
              const newIntl: InternationalizationType = {
                ...(tipText.i18n !== undefined && tipText.i18n !== ''
                  ? JSON.parse(tipText.i18n)
                  : {}),
              };

              Object.keys(i18n).forEach((lang) => {
                newIntl[lang] = i18n[lang];
              });

              tipText.i18n = JSON.stringify(newIntl);
            }

            tipText
              .save()
              .then(() => {
                res.send({
                  message: 'Item Modifier was updated successfully!',
                  tipText,
                });
              })
              .catch((err: unknown) => {
                res.status(500).send(gemServerError(err));
              });
          } else {
            res.status(400).send(gemInvalidField('TipId'));
          }
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Item Modifier'));
    });
};

const deleteTipTextById = async (id?: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Item Modifier ID'));

      return;
    }
    TipText.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const deleteTipText = (req: Request, res: Response): void => {
  const { id }: { id: string } = req.body;
  deleteTipTextById(id)
    .then(() => {
      res.send({ message: 'Item Modifier was deleted successfully!' });
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

interface CuratedITipText {
  i18n?: InternationalizationType;
  tipText: HydratedITipText;
}

const findSingle = (req: Request, res: Response): void => {
  const { tipTextId } = req.query;
  if (tipTextId === undefined || typeof tipTextId !== 'string') {
    res.status(400).send(gemInvalidField('TipText ID'));

    return;
  }
  findTipTextById(tipTextId)
    .then((tipText) => {
      const sentObj = {
        tipText,
        i18n: curateI18n(tipText.i18n),
      };
      res.send(sentObj);
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findTipTexts()
    .then((tipTexts) => {
      const curatedTipTexts: CuratedITipText[] = [];

      tipTexts.forEach((tipText) => {
        curatedTipTexts.push({
          tipText,
          i18n: curateI18n(tipText.i18n),
        });
      });

      res.send(curatedTipTexts);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  checkDuplicateTipTextTipId,
  create,
  deleteTipText,
  findAll,
  findSingle,
  findTipTextById,
  update,
};
