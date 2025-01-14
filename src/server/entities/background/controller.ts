import type {
  Request, Response
} from 'express';
import type { ObjectId } from 'mongoose';

import db from '../../models';
import {
  gemInvalidField, gemNotFound, gemServerError
} from '../../utils/globalErrorMessage';
import { curateCharParamBonusIds } from '../charParamBonus/controller';
import { curateSkillBonusIds } from '../skillBonus/controller';
import { curateStatBonusIds } from '../statBonus/controller';

import type {
  ICharParamBonus, ISkillBonus, IStatBonus
} from '../index';
import type { HydratedIBackground } from './model';

import { curateI18n } from '../../utils';

const { Background } = db;

const findBackgrounds = async (): Promise<HydratedIBackground[]> =>
  await new Promise((resolve, reject) => {
    Background.find()
      .populate<{ skillBonuses: ISkillBonus[] }>('skillBonuses')
      .populate<{ statBonuses: IStatBonus[] }>('statBonuses')
      .populate<{ charParamBonuses: ICharParamBonus[] }>('charParamBonuses')
      .then((res?: HydratedIBackground[] | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Backgrounds'));
        } else {
          resolve(res);
        }
      })
      .catch((err: unknown) => {
        reject(err);
      });
  });

const findBackgroundById = async (id: string): Promise<HydratedIBackground> =>
  await new Promise((resolve, reject) => {
    Background.findById(id)
      .populate<{ skillBonuses: ISkillBonus[] }>('skillBonuses')
      .populate<{ statBonuses: IStatBonus[] }>('statBonuses')
      .populate<{ charParamBonuses: ICharParamBonus[] }>('charParamBonuses')
      .then((res?: HydratedIBackground | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Background'));
        } else {
          resolve(res);
        }
      })
      .catch((err: unknown) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const {
    title, summary, i18n = null, skillBonuses, statBonuses, charParamBonuses
  } = req.body;
  if (title === undefined || summary === undefined) {
    res.status(400).send(gemInvalidField('Background'));

    return;
  }

  const background = new Background({
    title,
    summary
  });

  if (i18n !== null) {
    background.i18n = JSON.stringify(i18n);
  }

  curateSkillBonusIds({
    skillBonusesToRemove: [],
    skillBonusesToStay: [],
    skillBonusesToAdd: skillBonuses as Array<{
      skill: string
      value: number
    }>
  })
    .then((skillBonusIds) => {
      if (skillBonusIds.length > 0) {
        background.skillBonuses = skillBonusIds.map(skillBonusId => String(skillBonusId));
      }
      curateStatBonusIds({
        statBonusesToRemove: [],
        statBonusesToStay: [],
        statBonusesToAdd: statBonuses as Array<{
          stat: string
          value: number
        }>
      })
        .then((statBonusIds) => {
          if (statBonusIds.length > 0) {
            background.statBonuses = statBonusIds.map(statBonusId => String(statBonusId));
          }
          curateCharParamBonusIds({
            charParamBonusesToRemove: [],
            charParamBonusesToStay: [],
            charParamBonusesToAdd: charParamBonuses as Array<{
              charParam: string
              value: number
            }>
          })
            .then((charParamBonusIds) => {
              if (charParamBonusIds.length > 0) {
                background.charParamBonuses = charParamBonusIds.map(charParamBonusId =>
                  String(charParamBonusId)
                );
              }
              background
                .save()
                .then(() => {
                  res.send(background);
                })
                .catch((err: unknown) => {
                  res.status(500).send(gemServerError(err));
                });
            })
            .catch((err: unknown) => {
              res.status(500).send(gemServerError(err));
            });
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
    id,
    title = null,
    summary = null,
    i18n,
    skillBonuses = null,
    statBonuses = null,
    charParamBonuses = null
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Background ID'));

    return;
  }

  findBackgroundById(id as string)
    .then((background) => {
      if (title !== null) {
        background.title = title;
      }
      if (summary !== null) {
        background.summary = summary;
      }

      const skillBonusesToStay: string[] = [];
      interface ISkillBonusElt extends ISkillBonus {
        _id: ObjectId
      }
      const skillBonusesToRemove = background.skillBonuses.reduce(
        (result: string[], elt: ISkillBonusElt) => {
          const foundSkillBonus = skillBonuses.find(
            skillBonus => skillBonus.skill === String(elt.skill) && skillBonus.value === elt.value
          );
          if (foundSkillBonus === undefined) {
            result.push(String(elt._id));
          } else {
            skillBonusesToStay.push(String(elt._id));
          }

          return result;
        },
        []
      );

      const skillBonusesToAdd = skillBonuses.reduce(
        (
          result: Array<{
            skill: string
            value: number
          }>,
          elt: {
            skill: string
            value: number
          }
        ) => {
          const foundSkillBonus = background.skillBonuses.find(
            skillBonus =>
              typeof skillBonus !== 'string'
              && String(skillBonus.skill) === elt.skill
              && skillBonus.value === elt.value
          );
          if (foundSkillBonus === undefined) {
            result.push(elt);
          }

          return result;
        },
        []
      );

      const statBonusesToStay: string[] = [];
      interface IStatBonusElt extends IStatBonus {
        _id: ObjectId
      }
      const statBonusesToRemove = background.statBonuses.reduce(
        (result: string[], elt: IStatBonusElt) => {
          const foundStatBonus = statBonuses.find(
            statBonus => statBonus.stat === String(elt.stat) && statBonus.value === elt.value
          );
          if (foundStatBonus === undefined) {
            result.push(String(elt._id));
          } else {
            statBonusesToStay.push(String(elt._id));
          }

          return result;
        },
        []
      );

      const statBonusesToAdd = statBonuses.reduce(
        (
          result: Array<{
            stat: string
            value: number
          }>,
          elt: {
            stat: string
            value: number
          }
        ) => {
          const foundStatBonus = background.statBonuses.find(
            statBonus =>
              typeof statBonus !== 'string'
              && String(statBonus.stat) === elt.stat
              && statBonus.value === elt.value
          );
          if (foundStatBonus === undefined) {
            result.push(elt);
          }

          return result;
        },
        []
      );

      const charParamBonusesToStay: string[] = [];
      interface ICharParamBonusElt extends ICharParamBonus {
        _id: ObjectId
      }
      const charParamBonusesToRemove = background.charParamBonuses.reduce(
        (result: string[], elt: ICharParamBonusElt) => {
          const foundCharParamBonus = charParamBonuses.find(
            charParamBonus =>
              charParamBonus.charParam === String(elt.charParam)
              && charParamBonus.value === elt.value
          );
          if (foundCharParamBonus === undefined) {
            result.push(String(elt._id));
          } else {
            charParamBonusesToStay.push(String(elt._id));
          }

          return result;
        },
        []
      );

      const charParamBonusesToAdd = charParamBonuses.reduce(
        (
          result: Array<{
            charParam: string
            value: number
          }>,
          elt: {
            charParam: string
            value: number
          }
        ) => {
          const foundCharParamBonus = background.charParamBonuses.find(
            charParamBonus =>
              typeof charParamBonus !== 'string'
              && String(charParamBonus.charParam) === elt.charParam
              && charParamBonus.value === elt.value
          );
          if (foundCharParamBonus === undefined) {
            result.push(elt);
          }

          return result;
        },
        []
      );

      if (i18n !== null) {
        const newIntl: InternationalizationType = { ...(background.i18n !== null && background.i18n !== undefined && background.i18n !== ''
          ? JSON.parse(background.i18n)
          : {}) };

        Object.keys(i18n).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        background.i18n = JSON.stringify(newIntl);
      }

      curateSkillBonusIds({
        skillBonusesToRemove,
        skillBonusesToAdd,
        skillBonusesToStay
      })
        .then((skillBonusIds) => {
          if (skillBonusIds.length > 0) {
            background.skillBonuses = skillBonusIds.map(skillBonusId => String(skillBonusId));
          } else if (skillBonuses !== null && skillBonuses.length === 0) {
            background.skillBonuses = [];
          }
          curateStatBonusIds({
            statBonusesToRemove,
            statBonusesToAdd,
            statBonusesToStay
          })
            .then((statBonusIds) => {
              if (statBonusIds.length > 0) {
                background.statBonuses = statBonusIds.map(statBonusId => String(statBonusId));
              }
              curateCharParamBonusIds({
                charParamBonusesToRemove,
                charParamBonusesToAdd,
                charParamBonusesToStay
              })
                .then((charParamBonusIds) => {
                  if (charParamBonusIds.length > 0) {
                    background.charParamBonuses = charParamBonusIds.map(charParamBonusId =>
                      String(charParamBonusId)
                    );
                  }
                  background
                    .save()
                    .then(() => {
                      res.send({
                        message: 'Background was updated successfully!',
                        background
                      });
                    })
                    .catch((err: unknown) => {
                      res.status(500).send(gemServerError(err));
                    });
                })
                .catch((err: unknown) => {
                  res.status(500).send(gemServerError(err));
                });
            })
            .catch((err: unknown) => {
              res.status(500).send(gemServerError(err));
            });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Background'));
    });
};

const deleteBackgroundById = async (id?: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Background ID'));

      return;
    }
    Background.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const deleteBackground = (req: Request, res: Response): void => {
  const { id }: { id: string } = req.body;

  findBackgroundById(id)
    .then((background) => {
      const skillBonusesToRemove = background.skillBonuses.map(elt => elt._id);
      const statBonusesToRemove = background.statBonuses.map(elt => elt._id);
      const charParamBonusesToRemove = background.charParamBonuses.map(elt => elt._id);

      curateSkillBonusIds({
        skillBonusesToRemove,
        skillBonusesToAdd: [],
        skillBonusesToStay: []
      })
        .then(() => {
          curateStatBonusIds({
            statBonusesToRemove,
            statBonusesToAdd: [],
            statBonusesToStay: []
          })
            .then(() => {
              curateCharParamBonusIds({
                charParamBonusesToRemove,
                charParamBonusesToAdd: [],
                charParamBonusesToStay: []
              })
                .then(() => {
                  deleteBackgroundById(id)
                    .then(() => {
                      res.send({ message: 'Background was deleted successfully!' });
                    })
                    .catch((err: unknown) => {
                      res.status(500).send(gemServerError(err));
                    });
                })
                .catch((err: unknown) => {
                  res.status(500).send(gemServerError(err));
                });
            })
            .catch((err: unknown) => {
              res.status(500).send(gemServerError(err));
            });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Background'));
    });
};

interface CuratedIBackground {
  i18n?: InternationalizationType
  background: any
}

const findSingle = (req: Request, res: Response): void => {
  const { backgroundId } = req.query;
  if (backgroundId === undefined || typeof backgroundId !== 'string') {
    res.status(400).send(gemInvalidField('Background ID'));

    return;
  }
  findBackgroundById(backgroundId)
    .then((backgroundSent) => {
      const background = backgroundSent.toJSON();
      const sentObj = {
        background,
        i18n: curateI18n(backgroundSent.i18n)
      };
      res.send(sentObj);
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findBackgrounds()
    .then((backgrounds) => {
      const curatedBackgrounds: CuratedIBackground[] = [];
      backgrounds.forEach((backgroundSent) => {
        const background = backgroundSent.toJSON();
        curatedBackgrounds.push({
          background,
          i18n: curateI18n(backgroundSent.i18n)
        });
      });

      res.send(curatedBackgrounds);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  create, deleteBackground, findAll, findBackgroundById, findSingle, update
};
