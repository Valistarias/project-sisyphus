import type {
  Request, Response
} from 'express';
import type { FlattenMaps, HydratedDocument, ObjectId } from 'mongoose';

import db from '../../models';
import {
  gemInvalidField, gemNotFound, gemServerError
} from '../../utils/globalErrorMessage';
import { curateDamageIds } from '../damage/controller';

import type { InternationalizationType } from '../../utils/types';
import type { INPC, HydratedIDamage } from '../index';
import type {
  HydratedIProgram, IProgram
} from './model';

import { curateI18n } from '../../utils';

const { Program } = db;

interface findAllPayload {
  starterKit?: string | Record<string, string[]>
}

const findPrograms = async (
  options?: findAllPayload
): Promise<HydratedIProgram[]> =>
  await new Promise((resolve, reject) => {
    Program.find(options ?? {})
      .populate<{ damages: HydratedIDamage[] }>('damages')
      .populate<{ ai: INPC }>('ai')
      .then((res: HydratedIProgram[]) => {
        if (res.length === 0) {
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
      .populate<{ damages: HydratedIDamage[] }>('damages')
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
  }: {
    title?: string
    summary?: string
    i18n?: InternationalizationType | null
    ram?: number
    rarity?: ObjectId
    programScope?: ObjectId
    itemType?: ObjectId
    starterKit?: string
    cost?: number
    ai?: ObjectId
    aiSummoned?: number
    uses?: number
    radius?: number
    damages?: Array<{
      damageType: string
      dices: string
    }>
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
    damagesToAdd: damages
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
  }: {
    id?: string
    title: string | null
    summary: string | null
    i18n: InternationalizationType | null
    ram: number | null
    rarity: ObjectId | null
    programScope: ObjectId | null
    itemType: ObjectId | null
    starterKit?: 'always' | 'never' | 'option' | null
    cost: number | null
    ai?: ObjectId | null
    aiSummoned?: number | null
    uses: number | null
    radius: number | null
    damages?: Array<{
      damageType: string
      dices: string
    }> | null
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Program ID'));

    return;
  }

  findProgramById(id)
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
      let damagesToRemove: string[] = [];
      let damagesToAdd: Array<{
        damageType: string
        dices: string
      }> = [];

      if (damages !== null) {
        damagesToRemove = program.damages.reduce(
          (result: string[], elt: HydratedIDamage) => {
            const foundDamage = damages.find(
              damage => damage.damageType === String(elt.damageType)
                && damage.dices === elt.dices
            );
            if (foundDamage === undefined) {
              result.push(String(elt._id));
            } else {
              damagesToStay.push(String(elt._id));
            }

            return result;
          }, []);

        damagesToAdd = damages.reduce(
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
      }

      if (i18n !== null) {
        const newIntl: InternationalizationType = { ...(
          program.i18n !== undefined
          && program.i18n !== ''
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
            program.damages = damageIds.map(
              skillBonusId => String(skillBonusId)
            );
          } else if (damageIds.length === 0) {
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

export type IProgramSent = HydratedDocument<
  Omit<IProgram, 'damages' | 'ai'> & {
    damages: HydratedIDamage[]
    ai?: INPC
  }
>;

export interface CuratedIProgramToSend {
  program: Omit<
    FlattenMaps<IProgram>
    , 'damages' | 'ai'
  > & {
    damages: Array<FlattenMaps<HydratedIDamage>>
    ai?: {
      nPC: INPC
      i18n?: InternationalizationType
    }
  }
  i18n?: InternationalizationType
}

export const curateSingleProgram = (
  programSent: IProgramSent
): CuratedIProgramToSend => {
  let curatedAI: {
    nPC: INPC
    i18n?: InternationalizationType
  } | undefined;
  if (programSent.ai !== undefined) {
    curatedAI = {
      nPC: programSent.ai,
      i18n: programSent.ai.i18n !== undefined
        ? JSON.parse(programSent.ai.i18n)
        : {}
    };
  }

  return {
    program: {
      ...programSent.toJSON(),
      ai: curatedAI
    },
    i18n: curateI18n(programSent.i18n)
  };
};

const findSingle = (req: Request, res: Response): void => {
  const { programId } = req.query;
  if (programId === undefined || typeof programId !== 'string') {
    res.status(400).send(gemInvalidField('Program ID'));

    return;
  }
  findProgramById(programId)
    .then((programSent: IProgramSent) => {
      res.send(curateSingleProgram(programSent));
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findPrograms()
    .then((programs: IProgramSent[]) => {
      const curatedPrograms: CuratedIProgramToSend[] = [];

      programs.forEach((programSent) => {
        curatedPrograms.push(curateSingleProgram(programSent));
      });

      res.send(curatedPrograms);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const findAllStarter = (req: Request, res: Response): void => {
  findPrograms({ starterKit: { $in: ['always', 'option'] } })
    .then((programs: IProgramSent[]) => {
      const curatedPrograms: CuratedIProgramToSend[] = [];
      programs.forEach((programSent) => {
        curatedPrograms.push(curateSingleProgram(programSent));
      });

      res.send(curatedPrograms);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  create,
  deleteProgram,
  findAll,
  findAllStarter,
  findProgramById,
  findSingle,
  update
};
