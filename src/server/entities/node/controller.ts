import { type Request, type Response } from 'express';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';
import {
  type IAction,
  type ICharParamBonus,
  type IEffect,
  type ISkillBonus,
  type IStatBonus,
} from '../index';

import { type HydratedINode } from './model';

const { Node } = db;

const findNodes = async (): Promise<HydratedINode[]> =>
  await new Promise((resolve, reject) => {
    Node.find()
      .populate<{ effects: IEffect[] }>('effects')
      .populate<{ actions: IAction[] }>('actions')
      .populate<{ skillBonuses: ISkillBonus[] }>('skillBonuses')
      .populate<{ statBonuses: IStatBonus[] }>('statBonuses')
      .populate<{ charParamBonuses: ICharParamBonus[] }>('charParamBonuses')
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Nodes'));
        } else {
          resolve(res as HydratedINode[]);
        }
      })
      .catch(async (err: Error) => {
        reject(err);
      });
  });

const findNodesByBranch = async ({
  cyberFrameBranchId,
  skillBranchId,
}: {
  cyberFrameBranchId?: string;
  skillBranchId?: string;
}): Promise<HydratedINode[]> =>
  await new Promise((resolve, reject) => {
    Node.find(
      cyberFrameBranchId !== undefined
        ? { cyberFrameBranch: cyberFrameBranchId }
        : { skillBranch: skillBranchId }
    )
      .populate<{ effects: IEffect[] }>('effects')
      .populate<{ actions: IAction[] }>('actions')
      .populate<{ skillBonuses: ISkillBonus[] }>('skillBonuses')
      .populate<{ statBonuses: IStatBonus[] }>('statBonuses')
      .populate<{ charParamBonuses: ICharParamBonus[] }>('charParamBonuses')
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Nodes'));
        } else {
          resolve(res as HydratedINode[]);
        }
      })
      .catch(async (err: Error) => {
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
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Node'));
        } else {
          resolve(res as HydratedINode);
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
    overrides,
  } = req.body;
  if (
    title === undefined ||
    summary === undefined ||
    (skillBranch === undefined && cyberFrameBranch === undefined) ||
    rank === undefined
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
    overrides,
  });

  if (i18n !== null) {
    node.i18n = JSON.stringify(i18n);
  }

  console.log('node', node);

  // node
  //   .save()
  //   .then(() => {
  //     res.send(node);
  //   })
  //   .catch((err: Error) => {
  //     res.status(500).send(gemServerError(err));
  //   });
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
    overrides = null,
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
      if (effects !== null) {
        node.effects = effects;
      }
      if (actions !== null) {
        node.actions = actions;
      }
      if (skillBonuses !== null) {
        node.skillBonuses = skillBonuses;
      }
      if (statBonuses !== null) {
        node.statBonuses = statBonuses;
      }
      if (charParamBonuses !== null) {
        node.charParamBonuses = charParamBonuses;
      }
      if (overrides !== null) {
        node.overrides = overrides;
      }

      if (i18n !== null) {
        const newIntl = {
          ...(node.i18n !== null && node.i18n !== undefined && node.i18n !== ''
            ? JSON.parse(node.i18n)
            : {}),
        };

        Object.keys(i18n as Record<string, any>).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        node.i18n = JSON.stringify(newIntl);
      }

      node
        .save()
        .then(() => {
          res.send({ message: 'Node was updated successfully!', node });
        })
        .catch((err: Error) => {
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
      .catch((err: Error) => {
        reject(gemServerError(err));
      });
  });

const deleteNode = (req: Request, res: Response): void => {
  const { id } = req.body;
  deleteNodeById(id as string)
    .then(() => {
      res.send({ message: 'Node was deleted successfully!' });
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

interface CuratedINode {
  i18n: Record<string, any> | Record<string, unknown>;
  node: HydratedINode;
}

const curateNode = (node: HydratedINode): Record<string, any> => {
  if (node.i18n === null || node.i18n === '' || node.i18n === undefined) {
    return {};
  }
  return JSON.parse(node.i18n);
};

const findSingle = (req: Request, res: Response): void => {
  const { nodeId } = req.query;
  if (nodeId === undefined || typeof nodeId !== 'string') {
    res.status(400).send(gemInvalidField('Node ID'));
    return;
  }
  findNodeById(nodeId)
    .then((node) => {
      const sentObj = {
        node,
        i18n: curateNode(node),
      };
      res.send(sentObj);
    })
    .catch((err: Error) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findNodes()
    .then((nodes) => {
      const curatedNodes: CuratedINode[] = [];

      nodes.forEach((node) => {
        curatedNodes.push({
          node,
          i18n: curateNode(node),
        });
      });

      res.send(curatedNodes);
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

const findAllByBranch = (req: Request, res: Response): void => {
  const { cyberFrameBranchId, skillBranchId } = req.query as {
    cyberFrameBranchId?: string;
    skillBranchId?: string;
  };
  if (cyberFrameBranchId === undefined && skillBranchId === undefined) {
    res.status(400).send(gemInvalidField('ID'));
    return;
  }
  findNodesByBranch({ cyberFrameBranchId, skillBranchId })
    .then((nodes) => {
      const curatedCyberFrameBranches: CuratedINode[] = [];

      nodes.forEach((node) => {
        curatedCyberFrameBranches.push({
          node,
          i18n: curateNode(node),
        });
      });

      res.send(curatedCyberFrameBranches);
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

export { create, deleteNode, findAll, findAllByBranch, findNodeById, findSingle, update };
