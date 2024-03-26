import { type Request, type Response } from 'express';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';

import { type HydratedICharParam } from './model';

const { CharParam } = db;

const findCharParams = async (): Promise<HydratedICharParam[]> =>
  await new Promise((resolve, reject) => {
    CharParam.find()
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('CharParams'));
        } else {
          resolve(res as HydratedICharParam[]);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const findCharParamById = async (id: string): Promise<HydratedICharParam> =>
  await new Promise((resolve, reject) => {
    CharParam.findById(id)
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('CharParam'));
        } else {
          resolve(res as HydratedICharParam);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const { title, summary, short, i18n = null } = req.body;
  if (title === undefined || summary === undefined || short === undefined) {
    res.status(400).send(gemInvalidField('CharParam'));
    return;
  }

  const charParam = new CharParam({
    title,
    summary,
    short,
  });

  if (i18n !== null) {
    charParam.i18n = JSON.stringify(i18n);
  }

  charParam
    .save()
    .then(() => {
      res.send(charParam);
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

const update = (req: Request, res: Response): void => {
  const { id, title = null, summary = null, i18n, short = null } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('CharParam ID'));
    return;
  }
  findCharParamById(id as string)
    .then((charParam) => {
      if (title !== null) {
        charParam.title = title;
      }
      if (summary !== null) {
        charParam.summary = summary;
      }
      if (short !== null) {
        charParam.short = short;
      }

      if (i18n !== null) {
        const newIntl = {
          ...(charParam.i18n !== null && charParam.i18n !== undefined && charParam.i18n !== ''
            ? JSON.parse(charParam.i18n)
            : {}),
        };

        Object.keys(i18n as Record<string, any>).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        charParam.i18n = JSON.stringify(newIntl);
      }

      charParam
        .save()
        .then(() => {
          res.send({ message: 'CharParam was updated successfully!', charParam });
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('CharParam'));
    });
};

const deleteCharParamById = async (id: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('CharParam ID'));
      return;
    }
    CharParam.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: Error) => {
        reject(gemServerError(err));
      });
  });

const deleteCharParam = (req: Request, res: Response): void => {
  const { id } = req.body;
  deleteCharParamById(id as string)
    .then(() => {
      res.send({ message: 'CharParam was deleted successfully!' });
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

interface CuratedICharParam {
  i18n: Record<string, any> | Record<string, unknown>;
  charParam: HydratedICharParam;
}

const curateCharParam = (charParam: HydratedICharParam): Record<string, any> => {
  if (charParam.i18n === null || charParam.i18n === '' || charParam.i18n === undefined) {
    return {};
  }
  return JSON.parse(charParam.i18n);
};

const findSingle = (req: Request, res: Response): void => {
  const { charParamId } = req.query;
  if (charParamId === undefined || typeof charParamId !== 'string') {
    res.status(400).send(gemInvalidField('CharParam ID'));
    return;
  }
  findCharParamById(charParamId)
    .then((charParam) => {
      const sentObj = {
        charParam,
        i18n: curateCharParam(charParam),
      };
      res.send(sentObj);
    })
    .catch((err: Error) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findCharParams()
    .then((charParams) => {
      const curatedCharParams: CuratedICharParam[] = [];

      charParams.forEach((charParam) => {
        curatedCharParams.push({
          charParam,
          i18n: curateCharParam(charParam),
        });
      });

      res.send(curatedCharParams);
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

export { create, deleteCharParam, findAll, findCharParamById, findSingle, update };
