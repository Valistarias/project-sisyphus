import type {
  Request, Response
} from 'express';
import type { ObjectId } from 'mongoose';

import db from '../../models';
import {
  gemInvalidField, gemNotFound, gemServerError
} from '../../utils/globalErrorMessage';
import { curateDamageIds } from '../damage/controller';

import type { InternationalizationType } from '../../utils/types';
import type { IDamage } from '../damage/model';
import type { INPC } from '../index';
import type {
  HydratedIProgram, IProgram
} from './model';

import { curateI18n } from '../../utils';

const { Program } = db;

interface findAllPayload {
  starterKit?: string | Record<string, string[]>
}

const findPrograms = async (options?: findAllPayload): Promise<HydratedIProgram[]> =>
  await new Promise((resolve, reject) => {
    Program.find(options ?? {})
      .populate<{ damages: IDamage[] }>('damages')
      .populate<{ ai: INPC }>('ai')
      .then((res?: HydratedIProgram[] | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Programs'));
        } else {
          resolve(res);
        }
      })
      .catch((err: unknown) => {
        reject(err);
      });
  });

const findProgramById = async (id: string): Promise<HydratedIProgram> =>
  await new Promise((resolve, reject) => {
    Program.findById(id)
      .populate<{ damages: IDamage[] }>('damages')
      .populate<{ ai: INPC }>('ai')
      .then((res?: HydratedIProgram | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Program'));
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
    title,
    summary,
    i18n = null,
    ram,
    rarity,
    starterKit,
    programScope,
    itemType,
    cost,
    ai,
    aiSummoned,
    uses,
    radius,
    damages
  } = req.body;
  if (
    title === undefined
    || summary === undefined
    || ram === undefined
    || rarity === undefined
    || programScope === undefined
    || itemType === undefined
    || cost === undefined
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
    radius,
    ai,
    aiSummoned,
    programScope,
    starterKit,
    itemType,
    uses
  });

  if (i18n !== null) {
    program.i18n = JSON.stringify(i18n);
  }

  curateDamageIds({
    damagesToRemove: [],
    damagesToStay: [],
    damagesToAdd: damages as Array<{
      damageType: string
      dices: string
    }>
  })
    .then((damageIds) => {
      if (damageIds.length > 0) {
        program.damages = damageIds.map(damageId => String(damageId));
      }
      program
        .save()
        .then(() => {
          res.send(program);
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
    ram = null,
    rarity = null,
    starterKit = null,
    programScope = null,
    cost = null,
    ai = null,
    aiSummoned = null,
    uses = null,
    radius = null,
    damages = null,
    itemType = null
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
      if (starterKit !== null) {
        program.starterKit = starterKit;
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
      if (itemType !== null) {
        program.itemType = itemType;
      }

      const damagesToStay: string[] = [];
      interface IDamageElt extends IDamage {
        _id: ObjectId
      }
      const damagesToRemove = program.damages.reduce((result: string[], elt: IDamageElt) => {
        const foundDamage = damages.find(
          damage => damage.damageType === String(elt.damageType) && damage.dices === elt.dices
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
            damageType: string
            dices: string
          }>,
          elt: {
            damageType: string
            dices: string
          }
        ) => {
          const foundDamage = program.damages.find(
            damage =>
              typeof damage !== 'string'
              && String(damage.damageType) === elt.damageType
              && damage.dices === elt.dices
          );
          if (foundDamage === undefined) {
            result.push(elt);
          }

          return result;
        },
        []
      );

      if (i18n !== null) {
        const newIntl: InternationalizationType = { ...(program.i18n !== null && program.i18n !== undefined && program.i18n !== ''
          ? JSON.parse(program.i18n)
          : {}) };

        Object.keys(i18n).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        program.i18n = JSON.stringify(newIntl);
      }

      curateDamageIds({
        damagesToRemove,
        damagesToAdd,
        damagesToStay
      })
        .then((damageIds) => {
          if (damageIds.length > 0) {
            program.damages = damageIds.map(skillBonusId => String(skillBonusId));
          } else if (damageIds !== null && damageIds.length === 0) {
            program.damages = [];
          }
          program
            .save()
            .then(() => {
              res.send({
                message: 'Program was updated successfully!', program
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
      res.status(404).send(gemNotFound('Program'));
    });
};

const deleteProgramById = async (id?: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Program ID'));

      return;
    }
    Program.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const deleteProgram = (req: Request, res: Response): void => {
  const { id }: { id: string } = req.body;

  findProgramById(id)
    .then(() => {
      deleteProgramById(id)
        .then(() => {
          res.send({ message: 'Program was deleted successfully!' });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Program'));
    });
};

interface InternationalizedProgram extends Omit<IProgram, 'ai'> {
  ai?: {
    i18n?: InternationalizationType
    nPC: any
  }
}

interface CuratedIProgram {
  i18n?: InternationalizationType
  program: InternationalizedProgram
}

const findSingle = (req: Request, res: Response): void => {
  const { programId } = req.query;
  if (programId === undefined || typeof programId !== 'string') {
    res.status(400).send(gemInvalidField('Program ID'));

    return;
  }
  findProgramById(programId)
    .then((programSent) => {
      const program: InternationalizedProgram = programSent.toJSON();
      if (programSent.ai !== undefined) {
        program.ai = {
          nPC: program.ai,
          i18n: programSent.ai.i18n !== undefined ? JSON.parse(programSent.ai.i18n) : {}
        };
      }
      const sentObj = {
        program,
        i18n: curateI18n(programSent.i18n)
      };
      res.send(sentObj);
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findPrograms()
    .then((programs) => {
      const curatedPrograms: CuratedIProgram[] = [];
      programs.forEach((programSent) => {
        const program: InternationalizedProgram = programSent.toJSON();
        if (programSent.ai !== undefined) {
          program.ai = {
            nPC: program.ai,
            i18n: programSent.ai.i18n !== undefined ? JSON.parse(programSent.ai.i18n) : {}
          };
        }
        curatedPrograms.push({
          program,
          i18n: curateI18n(programSent.i18n)
        });
      });

      res.send(curatedPrograms);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const findAllStarter = (req: Request, res: Response): void => {
  findPrograms({ starterKit: { $in: ['always', 'option'] } })
    .then((programs) => {
      const curatedPrograms: CuratedIProgram[] = [];
      programs.forEach((programSent) => {
        const program: InternationalizedProgram = programSent.toJSON();
        if (programSent.ai !== undefined) {
          program.ai = {
            nPC: program.ai,
            i18n: programSent.ai.i18n !== undefined ? JSON.parse(programSent.ai.i18n) : {}
          };
        }
        curatedPrograms.push({
          program,
          i18n: curateI18n(programSent.i18n)
        });
      });

      res.send(curatedPrograms);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  create, deleteProgram, findAll, findAllStarter, findProgramById, findSingle, update
};
