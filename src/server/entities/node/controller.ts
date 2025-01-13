import type { Request, Response } from 'express';
import type { ObjectId } from 'mongoose';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';
import { smartUpdateActions } from '../action/controller';
import { curateCharParamBonusIds } from '../charParamBonus/controller';
import { findCyberFrameBranchesByFrame } from '../cyberFrameBranch/controller';
import { smartUpdateEffects } from '../effect/controller';
import { curateSkillBonusIds } from '../skillBonus/controller';
import { findSkillBranchesBySkill } from '../skillBranch/controller';
import { curateStatBonusIds } from '../statBonus/controller';

import type {
  IAction,
  ICharParamBonus,
  ICyberFrameBranch,
  IEffect,
  ISkillBonus,
  ISkillBranch,
  IStatBonus
} from '../index';
import type { HydratedINode } from './model';

import { curateI18n } from '../../utils';

const { Node } = db;

interface findAllPayload {
  cyberFrameBranch?: string | Record<string, string[]>
  skillBranch?: string | Record<string, string[]>
}

const findNodes = async (options?: findAllPayload): Promise<HydratedINode[]> =>
  await new Promise((resolve, reject) => {
    Node.find(options ?? {})
      .populate<{ effects: IEffect[] }>('effects')
      .populate<{ actions: IAction[] }>('actions')
      .populate<{ skillBonuses: ISkillBonus[] }>('skillBonuses')
      .populate<{ statBonuses: IStatBonus[] }>('statBonuses')
      .populate<{ charParamBonuses: ICharParamBonus[] }>('charParamBonuses')
      .then(async (res?: HydratedINode[] | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Nodes'));
        } else {
          resolve(res);
        }
      })
      .catch(async (err: unknown) => {
        reject(err);
      });
  });

const findNodeById = async (id: string): Promise<HydratedINode> =>
  await new Promise((resolve, reject) => {
    Node.findById(id)
      .populate<{ effects: IEffect[] }>('effects')
      .populate<{ actions: IAction[] }>('actions')
      .populate<{ skillBonuses: ISkillBonus[] }>('skillBonuses')
      .populate<{ statBonuses: IStatBonus[] }>('statBonuses')
      .populate<{ charParamBonuses: ICharParamBonus[] }>('charParamBonuses')
      .populate<{ skillBranch: ISkillBranch }>('skillBranch')
      .populate<{ cyberFrameBranch: ICyberFrameBranch }>('cyberFrameBranch')
      .then(async (res?: HydratedINode | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Node'));
        } else {
          resolve(res);
        }
      })
      .catch(async (err: unknown) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const {
    title,
    summary,
    icon,
    quote,
    i18n = null,
    skillBranch,
    cyberFrameBranch,
    rank,
    effects,
    actions,
    skillBonuses,
    statBonuses,
    charParamBonuses,
    overrides
  } = req.body;
  if (
    title === undefined
    || summary === undefined
    || (skillBranch === undefined && cyberFrameBranch === undefined)
    || rank === undefined
  ) {
    res.status(400).send(gemInvalidField('Node'));

    return;
  }

  const node = new Node({
    title,
    summary,
    icon,
    quote,
    skillBranch,
    cyberFrameBranch,
    rank,
    overrides
  });

  if (i18n !== null) {
    node.i18n = JSON.stringify(i18n);
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
        node.skillBonuses = skillBonusIds.map(skillBonusId => String(skillBonusId));
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
            node.statBonuses = statBonusIds.map(statBonusId => String(statBonusId));
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
                node.charParamBonuses = charParamBonusIds.map(charParamBonusId =>
                  String(charParamBonusId)
                );
              }
              smartUpdateEffects({
                effectsToRemove: [],
                effectsToUpdate: effects
              })
                .then((effectsIds) => {
                  if (effectsIds.length > 0) {
                    node.effects = effectsIds.map(effectsId => String(effectsId));
                  }
                  smartUpdateActions({
                    actionsToRemove: [],
                    actionsToUpdate: actions
                  })
                    .then((actionsIds) => {
                      if (actionsIds.length > 0) {
                        node.actions = actionsIds.map(actionsId => String(actionsId));
                      }
                      node
                        .save()
                        .then(() => {
                          res.send(node);
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
    icon = null,
    quote = null,
    i18n,
    skillBranch = null,
    cyberFrameBranch = null,
    rank = null,
    effects = null,
    actions = null,
    skillBonuses = null,
    statBonuses = null,
    charParamBonuses = null,
    overrides = null
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Node ID'));

    return;
  }

  findNodeById(id as string)
    .then((node) => {
      if (title !== null) {
        node.title = title;
      }
      if (icon !== null) {
        node.icon = icon;
      }
      if (summary !== null) {
        node.summary = summary;
      }
      if (quote !== null) {
        node.quote = quote;
      }
      if (skillBranch !== null) {
        node.skillBranch = skillBranch;
      }
      if (cyberFrameBranch !== null) {
        node.cyberFrameBranch = cyberFrameBranch;
      }
      if (rank !== null) {
        node.rank = rank;
      }
      if (overrides !== null) {
        node.overrides = overrides;
      }

      const skillBonusesToStay: string[] = [];
      interface ISkillBonusElt extends ISkillBonus {
        _id: ObjectId
      }
      const skillBonusesToRemove = node.skillBonuses.reduce(
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
          const foundSkillBonus = node.skillBonuses.find(
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
      const statBonusesToRemove = node.statBonuses.reduce(
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
          const foundStatBonus = node.statBonuses.find(
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
      const charParamBonusesToRemove = node.charParamBonuses.reduce(
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
          const foundCharParamBonus = node.charParamBonuses.find(
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

      interface IEffectElt extends IEffect {
        _id: ObjectId
      }
      const effectsToRemove = node.effects.reduce((result: string[], elt: IEffectElt) => {
        const foundEffect = effects.find(
          effect => effect.id !== undefined && String(effect.id) === String(elt._id)
        );
        if (foundEffect === undefined) {
          result.push(String(elt._id));
        }

        return result;
      }, []);

      interface IActionElt extends IAction {
        _id: ObjectId
      }
      const actionsToRemove = node.actions.reduce((result: string[], elt: IActionElt) => {
        const foundAction = actions.find(
          action => action.id !== undefined && String(action.id) === String(elt._id)
        );
        if (foundAction === undefined) {
          result.push(String(elt._id));
        }

        return result;
      }, []);

      if (i18n !== null) {
        const newIntl = {
          ...(node.i18n !== null && node.i18n !== undefined && node.i18n !== ''
            ? JSON.parse(node.i18n)
            : {})
        };

        Object.keys(i18n as Record<string, any>).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        node.i18n = JSON.stringify(newIntl);
      }

      curateSkillBonusIds({
        skillBonusesToRemove,
        skillBonusesToAdd,
        skillBonusesToStay
      })
        .then((skillBonusIds) => {
          if (skillBonusIds.length > 0) {
            node.skillBonuses = skillBonusIds.map(skillBonusId => String(skillBonusId));
          } else if (skillBonuses !== null && skillBonuses.length === 0) {
            node.skillBonuses = [];
          }
          curateStatBonusIds({
            statBonusesToRemove,
            statBonusesToAdd,
            statBonusesToStay
          })
            .then((statBonusIds) => {
              if (statBonusIds.length > 0) {
                node.statBonuses = statBonusIds.map(statBonusId => String(statBonusId));
              }
              curateCharParamBonusIds({
                charParamBonusesToRemove,
                charParamBonusesToAdd,
                charParamBonusesToStay
              })
                .then((charParamBonusIds) => {
                  if (charParamBonusIds.length > 0) {
                    node.charParamBonuses = charParamBonusIds.map(charParamBonusId =>
                      String(charParamBonusId)
                    );
                  }
                  smartUpdateEffects({
                    effectsToRemove,
                    effectsToUpdate: effects
                  })
                    .then((effectsIds) => {
                      if (effectsIds.length > 0) {
                        node.effects = effectsIds.map(effectsId => String(effectsId));
                      }
                      smartUpdateActions({
                        actionsToRemove,
                        actionsToUpdate: actions
                      })
                        .then((actionsIds) => {
                          if (actionsIds.length > 0) {
                            node.actions = actionsIds.map(actionsId => String(actionsId));
                          }
                          node
                            .save()
                            .then(() => {
                              res.send({ message: 'Node was updated successfully!', node });
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
            .catch((err: unknown) => {
              res.status(500).send(gemServerError(err));
            });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Node'));
    });
};

const deleteNodeById = async (id: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Node ID'));

      return;
    }
    Node.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const deleteNode = (req: Request, res: Response): void => {
  const { id } = req.body;

  findNodeById(id as string)
    .then((node) => {
      const skillBonusesToRemove = node.skillBonuses.map(elt => elt._id);
      const statBonusesToRemove = node.statBonuses.map(elt => elt._id);
      const charParamBonusesToRemove = node.charParamBonuses.map(elt => elt._id);
      const effectsToRemove = node.effects.map(elt => elt._id);
      const actionsToRemove = node.actions.map(elt => elt._id);

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
                  smartUpdateEffects({
                    effectsToRemove,
                    effectsToUpdate: []
                  })
                    .then(() => {
                      smartUpdateActions({
                        actionsToRemove,
                        actionsToUpdate: []
                      })
                        .then(() => {
                          deleteNodeById(id as string)
                            .then(() => {
                              res.send({ message: 'Node was deleted successfully!' });
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
            .catch((err: unknown) => {
              res.status(500).send(gemServerError(err));
            });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Node'));
    });
};

interface CuratedINode {
  i18n: Record<string, unknown>
  node: any
}

const findSingle = (req: Request, res: Response): void => {
  const { nodeId } = req.query;
  if (nodeId === undefined || typeof nodeId !== 'string') {
    res.status(400).send(gemInvalidField('Node ID'));

    return;
  }
  findNodeById(nodeId)
    .then((nodeSent) => {
      const curatedActions
        = nodeSent.actions.length > 0
          ? nodeSent.actions.map((action) => {
              const data = action.toJSON();

              return {
                ...data,
                ...(data.i18n !== undefined ? { i18n: JSON.parse(data.i18n as string) } : {})
              };
            })
          : [];
      const curatedEffects
        = nodeSent.effects.length > 0
          ? nodeSent.effects.map((effect) => {
              const data = effect.toJSON();

              return {
                ...data,
                ...(data.i18n !== undefined ? { i18n: JSON.parse(data.i18n as string) } : {})
              };
            })
          : [];
      const node = nodeSent.toJSON();
      node.actions = curatedActions;
      node.effects = curatedEffects;
      const sentObj = {
        node,
        i18n: curateI18n(nodeSent.i18n)
      };
      res.send(sentObj);
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findNodes()
    .then((nodes) => {
      const curatedNodes: CuratedINode[] = [];
      nodes.forEach((nodeSent) => {
        const curatedActions
          = nodeSent.actions.length > 0
            ? nodeSent.actions.map((action) => {
                const data = action.toJSON();

                return {
                  ...data,
                  ...(data.i18n !== undefined ? { i18n: JSON.parse(data.i18n as string) } : {})
                };
              })
            : [];
        const curatedEffects
          = nodeSent.effects.length > 0
            ? nodeSent.effects.map((effect) => {
                const data = effect.toJSON();

                return {
                  ...data,
                  ...(data.i18n !== undefined ? { i18n: JSON.parse(data.i18n as string) } : {})
                };
              })
            : [];
        const node = nodeSent.toJSON();
        node.actions = curatedActions;
        node.effects = curatedEffects;
        curatedNodes.push({
          node,
          i18n: curateI18n(nodeSent.i18n)
        });
      });

      res.send(curatedNodes);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const findAllByBranch = (req: Request, res: Response): void => {
  const { cyberFrameBranchId, skillBranchId } = req.query as {
    cyberFrameBranchId?: string
    skillBranchId?: string
  };
  if (cyberFrameBranchId === undefined && skillBranchId === undefined) {
    res.status(400).send(gemInvalidField('ID'));

    return;
  }
  findNodes({ cyberFrameBranch: cyberFrameBranchId, skillBranch: skillBranchId })
    .then((nodes) => {
      const curatedNodes: CuratedINode[] = [];

      nodes.forEach((nodeSent) => {
        const curatedActions
          = nodeSent.actions.length > 0
            ? nodeSent.actions.map((action) => {
                const data = action.toJSON();

                return {
                  ...data,
                  ...(data.i18n !== undefined ? { i18n: JSON.parse(data.i18n as string) } : {})
                };
              })
            : [];
        const curatedEffects
          = nodeSent.effects.length > 0
            ? nodeSent.effects.map((effect) => {
                const data = effect.toJSON();

                return {
                  ...data,
                  ...(data.i18n !== undefined ? { i18n: JSON.parse(data.i18n as string) } : {})
                };
              })
            : [];
        const node = nodeSent.toJSON();
        node.actions = curatedActions;
        node.effects = curatedEffects;
        curatedNodes.push({
          node,
          i18n: curateI18n(nodeSent.i18n)
        });
      });

      res.send(curatedNodes);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const findAndCurateNodesByParent = async ({
  cyberFrameBranchIds,
  skillBranchIds
}: {
  cyberFrameBranchIds?: string[]
  skillBranchIds?: string[]
}): Promise<CuratedINode[]> =>
  await new Promise((resolve, reject) => {
    const opts: findAllPayload = {};
    if (skillBranchIds !== undefined) {
      opts.skillBranch = { $in: skillBranchIds };
    }
    if (cyberFrameBranchIds !== undefined) {
      opts.cyberFrameBranch = { $in: cyberFrameBranchIds };
    }
    findNodes(opts)
      .then((nodes) => {
        const curatedNodes: CuratedINode[] = [];

        nodes.forEach((nodeSent) => {
          const curatedActions
            = nodeSent.actions.length > 0
              ? nodeSent.actions.map((action) => {
                  const data = action.toJSON();

                  return {
                    ...data,
                    ...(data.i18n !== undefined ? { i18n: JSON.parse(data.i18n as string) } : {})
                  };
                })
              : [];
          const curatedEffects
            = nodeSent.effects.length > 0
              ? nodeSent.effects.map((effect) => {
                  const data = effect.toJSON();

                  return {
                    ...data,
                    ...(data.i18n !== undefined ? { i18n: JSON.parse(data.i18n as string) } : {})
                  };
                })
              : [];
          const node = nodeSent.toJSON();
          node.actions = curatedActions;
          node.effects = curatedEffects;
          curatedNodes.push({
            node,
            i18n: curateI18n(nodeSent.i18n)
          });
        });
        resolve(curatedNodes);
      })
      .catch((err: unknown) => {
        reject(err);
      });
  });

const findAllBySkill = (req: Request, res: Response): void => {
  const { skillId } = req.query;
  if (skillId === undefined) {
    res.status(400).send(gemInvalidField('Skill ID'));

    return;
  }
  findSkillBranchesBySkill(skillId as string)
    .then((skillBranches) => {
      const skillBranchIds = skillBranches.map(skillBranch => String(skillBranch._id));
      findAndCurateNodesByParent({ skillBranchIds })
        .then((nodes) => {
          res.send(nodes);
        })
        .catch((err: unknown) => res.status(500).send(gemServerError(err)));
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const findAllByCyberFrame = (req: Request, res: Response): void => {
  const { cyberFrameId } = req.query;
  if (cyberFrameId === undefined) {
    res.status(400).send(gemInvalidField('Skill ID'));

    return;
  }
  findCyberFrameBranchesByFrame(cyberFrameId as string)
    .then((cyberFrameBranches) => {
      const cyberFrameBranchIds = cyberFrameBranches.map(cyberFrameBranch =>
        String(cyberFrameBranch._id)
      );
      findAndCurateNodesByParent({ cyberFrameBranchIds })
        .then((nodes) => {
          res.send(nodes);
        })
        .catch((err: unknown) => res.status(500).send(gemServerError(err)));
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  create,
  deleteNode,
  findAll,
  findAllByBranch,
  findAllByCyberFrame,
  findAllBySkill,
  findNodeById,
  findSingle,
  update,
  type CuratedINode
};
