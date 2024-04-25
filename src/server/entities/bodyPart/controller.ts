import { type Request, type Response } from 'express';

import db from '../../models';
import {
  gemDuplicate,
  gemInvalidField,
  gemNotFound,
  gemServerError,
} from '../../utils/globalErrorMessage';

import { type HydratedIBodyPart } from './model';

const { BodyPart } = db;

const findBodyParts = async (): Promise<HydratedIBodyPart[]> =>
  await new Promise((resolve, reject) => {
    BodyPart.find()
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('BodyParts'));
        } else {
          resolve(res as HydratedIBodyPart[]);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const findBodyPartById = async (id: string): Promise<HydratedIBodyPart> =>
  await new Promise((resolve, reject) => {
    BodyPart.findById(id)
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('BodyPart'));
        } else {
          resolve(res as HydratedIBodyPart);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const checkDuplicateBodyPartPartId = async (
  partId: string,
  alreadyExistOnce: boolean = false
): Promise<string | boolean> =>
  await new Promise((resolve, reject) => {
    BodyPart.find({ partId })
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

const checkDuplicatePartId = async (
  partId: string,
  alreadyExistOnce: boolean
): Promise<string | boolean> =>
  await new Promise((resolve, reject) => {
    checkDuplicateBodyPartPartId(partId, alreadyExistOnce)
      .then((responseBodyPart: string | boolean) => {
        if (typeof responseBodyPart === 'boolean') {
          resolve(false);
        } else {
          resolve(responseBodyPart);
        }
      })
      .catch((err: Error) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const { title, summary, i18n = null, partId, limit } = req.body;
  if (title === undefined || summary === undefined || partId === undefined || limit === undefined) {
    res.status(400).send(gemInvalidField('Body Part'));
    return;
  }

  checkDuplicatePartId(partId as string, false)
    .then((response) => {
      if (typeof response === 'boolean') {
        const bodyPart = new BodyPart({
          title,
          summary,
          partId,
          limit,
        });

        if (i18n !== null) {
          bodyPart.i18n = JSON.stringify(i18n);
        }

        bodyPart
          .save()
          .then(() => {
            res.send(bodyPart);
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
  const { id, title = null, summary = null, i18n, partId = null, limit = null } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Body Part ID'));
    return;
  }
  findBodyPartById(id as string)
    .then((bodyPart) => {
      const alreadyExistOnce = typeof partId === 'string' && partId === bodyPart.partId;
      checkDuplicatePartId(partId as string, alreadyExistOnce)
        .then((response) => {
          if (typeof response === 'boolean') {
            if (title !== null) {
              bodyPart.title = title;
            }
            if (partId !== null) {
              bodyPart.partId = partId;
            }
            if (summary !== null) {
              bodyPart.summary = summary;
            }
            if (limit !== null) {
              bodyPart.limit = limit;
            }

            if (i18n !== null) {
              const newIntl = {
                ...(bodyPart.i18n !== null && bodyPart.i18n !== undefined && bodyPart.i18n !== ''
                  ? JSON.parse(bodyPart.i18n)
                  : {}),
              };

              Object.keys(i18n as Record<string, any>).forEach((lang) => {
                newIntl[lang] = i18n[lang];
              });

              bodyPart.i18n = JSON.stringify(newIntl);
            }

            bodyPart
              .save()
              .then(() => {
                res.send({ message: 'Body Part was updated successfully!', bodyPart });
              })
              .catch((err: Error) => {
                res.status(500).send(gemServerError(err));
              });
          } else {
            res.status(400).send(gemInvalidField('BodyPart'));
          }
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Body Part'));
    });
};

const deleteBodyPartById = async (id: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Body Part ID'));
      return;
    }
    BodyPart.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: Error) => {
        reject(gemServerError(err));
      });
  });

const deleteBodyPart = (req: Request, res: Response): void => {
  const { id } = req.body;
  deleteBodyPartById(id as string)
    .then(() => {
      res.send({ message: 'Body Part was deleted successfully!' });
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

interface CuratedIBodyPart {
  i18n: Record<string, any> | Record<string, unknown>;
  bodyPart: HydratedIBodyPart;
}

const curateBodyPart = (bodyPart: HydratedIBodyPart): Record<string, any> => {
  if (bodyPart.i18n === null || bodyPart.i18n === '' || bodyPart.i18n === undefined) {
    return {};
  }
  return JSON.parse(bodyPart.i18n);
};

const findSingle = (req: Request, res: Response): void => {
  const { bodyPartId } = req.query;
  if (bodyPartId === undefined || typeof bodyPartId !== 'string') {
    res.status(400).send(gemInvalidField('BodyPart ID'));
    return;
  }
  findBodyPartById(bodyPartId)
    .then((bodyPart) => {
      const sentObj = {
        bodyPart,
        i18n: curateBodyPart(bodyPart),
      };
      res.send(sentObj);
    })
    .catch((err: Error) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findBodyParts()
    .then((bodyParts) => {
      const curatedBodyParts: CuratedIBodyPart[] = [];

      bodyParts.forEach((bodyPart) => {
        curatedBodyParts.push({
          bodyPart,
          i18n: curateBodyPart(bodyPart),
        });
      });

      res.send(curatedBodyParts);
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

export {
  checkDuplicateBodyPartPartId,
  create,
  deleteBodyPart,
  findAll,
  findBodyPartById,
  findSingle,
  update,
};
