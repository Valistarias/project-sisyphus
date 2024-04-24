import { type Request, type Response } from 'express';
import { type ObjectId } from 'mongoose';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';
import { curateDamageIds } from '../damage/controller';
import { type IDamage } from '../damage/model';
import { type INPC } from '../index';

import { type HydratedIProgram } from './model';

const { Program } = db;

const findPrograms = async (): Promise<HydratedIProgram[]> =>
  await new Promise((resolve, reject) => {
    Program.find()
      .populate<{ damages: IDamage[] }>('damages')
      .populate<{ ai: INPC }>('ai')
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Programs'));
        } else {
          resolve(res as HydratedIProgram[]);
        }
      })
      .catch(async (err: Error) => {
        reject(err);
      });
  });

const findProgramById = async (id: string): Promise<HydratedIProgram> =>
  await new Promise((resolve, reject) => {
    Program.findById(id)
      .populate<{ damages: IDamage[] }>('damages')
      .populate<{ ai: INPC }>('ai')
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Program'));
        } else {
          resolve(res as HydratedIProgram);
        }
      })
      .catch(async (err: Error) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const {
    title,
    summary,
    i18n = null,
    ram,
    rarity,
    itemType,
    programScope,
    cost,
    ai,
    aiSummoned,
    uses,
    radius,
    damages,
  } = req.body;
  if (
    title === undefined ||
    summary === undefined ||
    ram === undefined ||
    rarity === undefined ||
    ram === undefined ||
    itemType === undefined ||
    programScope === undefined ||
    cost === undefined
  ) {
    res.status(400).send(gemInvalidField('Program'));
    return;
  }

  const program = new Program({
    title,
    summary,
    rarity,
    cost,
    ram,
    itemType,
    radius,
    ai,
    aiSummoned,
    programScope,
    uses,
  });

  if (i18n !== null) {
    program.i18n = JSON.stringify(i18n);
  }

  curateDamageIds({
    damagesToRemove: [],
    damagesToStay: [],
    damagesToAdd: damages as Array<{
      damageType: string;
      dices: string;
    }>,
  })
    .then((damageIds) => {
      if (damageIds.length > 0) {
        program.damages = damageIds.map((damageId) => String(damageId));
      }
      program
        .save()
        .then(() => {
          res.send(program);
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

const update = (req: Request, res: Response): void => {
  const {
    id,
    title = null,
    summary = null,
    i18n,
    ram = null,
    rarity = null,
    itemType = null,
    programScope = null,
    cost = null,
    ai = null,
    aiSummoned = null,
    uses = null,
    radius = null,
    damages = null,
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Program ID'));
    return;
  }

  findProgramById(id as string)
    .then((program) => {
      if (title !== null) {
        program.title = title;
      }
      if (ram !== null) {
        program.ram = ram;
      }
      if (summary !== null) {
        program.summary = summary;
      }
      if (programScope !== null) {
        program.programScope = programScope;
      }
      if (rarity !== null) {
        program.rarity = rarity;
      }
      if (itemType !== null) {
        program.itemType = itemType;
      }
      if (aiSummoned !== null) {
        program.aiSummoned = aiSummoned;
      }
      if (ai !== null) {
        program.ai = ai;
      }
      if (uses !== null) {
        program.uses = uses;
      }
      if (radius !== null) {
        program.radius = radius;
      }
      if (cost !== null) {
        program.cost = cost;
      }

      const damagesToStay: string[] = [];
      interface IDamageElt extends IDamage {
        _id: ObjectId;
      }
      const damagesToRemove = program.damages.reduce((result: string[], elt: IDamageElt) => {
        const foundDamage = damages.find(
          (damage) => damage.damageType === String(elt.damageType) && damage.dices === elt.dices
        );
        if (foundDamage === undefined) {
          result.push(String(elt._id));
        } else {
          damagesToStay.push(String(elt._id));
        }
        return result;
      }, []);

      const damagesToAdd = damages.reduce(
        (
          result: Array<{
            damageType: string;
            dices: string;
          }>,
          elt: {
            damageType: string;
            dices: string;
          }
        ) => {
          const foundDamage = program.damages.find(
            (damage) =>
              typeof damage !== 'string' &&
              String(damage.damageType) === elt.damageType &&
              damage.dices === elt.dices
          );
          if (foundDamage === undefined) {
            result.push(elt);
          }
          return result;
        },
        []
      );

      if (i18n !== null) {
        const newIntl = {
          ...(program.i18n !== null && program.i18n !== undefined && program.i18n !== ''
            ? JSON.parse(program.i18n)
            : {}),
        };

        Object.keys(i18n as Record<string, any>).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        program.i18n = JSON.stringify(newIntl);
      }

      curateDamageIds({
        damagesToRemove,
        damagesToAdd,
        damagesToStay,
      })
        .then((damageIds) => {
          if (damageIds.length > 0) {
            program.damages = damageIds.map((skillBonusId) => String(skillBonusId));
          } else if (damageIds !== null && damageIds.length === 0) {
            program.damages = [];
          }
          program
            .save()
            .then(() => {
              res.send({ message: 'Program was updated successfully!', program });
            })
            .catch((err: Error) => {
              res.status(500).send(gemServerError(err));
            });
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Program'));
    });
};

const deleteProgramById = async (id: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Program ID'));
      return;
    }
    Program.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: Error) => {
        reject(gemServerError(err));
      });
  });

const deleteProgram = (req: Request, res: Response): void => {
  const { id } = req.body;

  findProgramById(id as string)
    .then(() => {
      deleteProgramById(id as string)
        .then(() => {
          res.send({ message: 'Program was deleted successfully!' });
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Program'));
    });
};

interface CuratedIProgram {
  i18n: Record<string, any> | Record<string, unknown>;
  program: any;
}

const curateProgram = (program: HydratedIProgram): Record<string, any> => {
  if (program.i18n === null || program.i18n === '' || program.i18n === undefined) {
    return {};
  }
  return JSON.parse(program.i18n);
};

const findSingle = (req: Request, res: Response): void => {
  const { programId } = req.query;
  if (programId === undefined || typeof programId !== 'string') {
    res.status(400).send(gemInvalidField('Program ID'));
    return;
  }
  findProgramById(programId)
    .then((programSent) => {
      const program = programSent.toJSON();
      const sentObj = {
        program,
        i18n: curateProgram(programSent),
      };
      res.send(sentObj);
    })
    .catch((err: Error) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findPrograms()
    .then((programs) => {
      const curatedPrograms: CuratedIProgram[] = [];
      programs.forEach((programSent) => {
        const program = programSent.toJSON();
        curatedPrograms.push({
          program,
          i18n: curateProgram(programSent),
        });
      });

      res.send(curatedPrograms);
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

export { create, deleteProgram, findAll, findProgramById, findSingle, update };
