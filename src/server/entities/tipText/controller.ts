import { type Request, type Response } from 'express';

import db from '../../models';
import {
  gemDuplicate,
  gemInvalidField,
  gemNotFound,
  gemServerError,
} from '../../utils/globalErrorMessage';

import { type HydratedITipText } from './model';

import { curateI18n } from '../../utils';

const { TipText } = db;

const findTipTexts = async (): Promise<HydratedITipText[]> =>
  await new Promise((resolve, reject) => {
    TipText.find()
      .then(async (res?: HydratedITipText[] | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('TipTexts'));
        } else {
          resolve(res);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const findTipTextById = async (id: string): Promise<HydratedITipText> =>
  await new Promise((resolve, reject) => {
    TipText.findById(id)
      .then(async (res?: HydratedITipText | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('TipText'));
        } else {
          resolve(res);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const checkDuplicateTipTextTipId = async (
  tipId: string,
  alreadyExistOnce: boolean = false
): Promise<string | boolean> =>
  await new Promise((resolve, reject) => {
    TipText.find({ tipId })
      .then(async (res) => {
        if (res.length === 0 || (alreadyExistOnce && res.length === 1)) {
          resolve(false);
        } else {
          resolve(res[0].title);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const checkDuplicateTipId = async (
  tipId: string,
  alreadyExistOnce: boolean
): Promise<string | boolean> =>
  await new Promise((resolve, reject) => {
    checkDuplicateTipTextTipId(tipId, alreadyExistOnce)
      .then((responseTipText: string | boolean) => {
        if (typeof responseTipText === 'boolean') {
          resolve(false);
        } else {
          resolve(responseTipText);
        }
      })
      .catch((err: Error) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const { title, summary, i18n = null, tipId } = req.body;
  if (title === undefined || summary === undefined || tipId === undefined) {
    res.status(400).send(gemInvalidField('Item Modifier'));
    return;
  }

  checkDuplicateTipId(tipId as string, false)
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
          .catch((err: Error) => {
            res.status(500).send(gemServerError(err));
          });
      } else {
        res.status(400).send(gemDuplicate(response));
      }
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

const update = (req: Request, res: Response): void => {
  const { id, title = null, summary = null, i18n, tipId = null } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Item Modifier ID'));
    return;
  }
  findTipTextById(id as string)
    .then((tipText) => {
      const alreadyExistOnce = typeof tipId === 'string' && tipId === tipText.tipId;
      checkDuplicateTipId(tipId as string, alreadyExistOnce)
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
              const newIntl = {
                ...(tipText.i18n !== null && tipText.i18n !== undefined && tipText.i18n !== ''
                  ? JSON.parse(tipText.i18n)
                  : {}),
              };

              Object.keys(i18n as Record<string, any>).forEach((lang) => {
                newIntl[lang] = i18n[lang];
              });

              tipText.i18n = JSON.stringify(newIntl);
            }

            tipText
              .save()
              .then(() => {
                res.send({ message: 'Item Modifier was updated successfully!', tipText });
              })
              .catch((err: Error) => {
                res.status(500).send(gemServerError(err));
              });
          } else {
            res.status(400).send(gemInvalidField('TipId'));
          }
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Item Modifier'));
    });
};

const deleteTipTextById = async (id: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Item Modifier ID'));
      return;
    }
    TipText.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: Error) => {
        reject(gemServerError(err));
      });
  });

const deleteTipText = (req: Request, res: Response): void => {
  const { id } = req.body;
  deleteTipTextById(id as string)
    .then(() => {
      res.send({ message: 'Item Modifier was deleted successfully!' });
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

interface CuratedITipText {
  i18n: Record<string, any> | Record<string, unknown>;
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
    .catch((err: Error) => {
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
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
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
