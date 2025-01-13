import db from '../../../models';

import type { INode } from '../../node/model';

const { CharacterNode } = db;

const replaceCyberFrameNodeByCharacter = async (req: {
  characterId: string;
  nodeIds: string[];
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const { characterId, nodeIds } = req;
    CharacterNode.find({
      character: characterId,
    })
      .populate<{ node: INode }>('node')
      .then(async (res) => {
        const idToDel: string[] = [];
        res.forEach((charNode) => {
          if (charNode.node.cyberFrameBranch !== undefined) {
            idToDel.push(charNode._id.toString());
          }
        });

        CharacterNode.deleteMany({ _id: { $in: idToDel } })
          .then(() => {
            CharacterNode.create(
              nodeIds.map((nodeId) => ({
                character: characterId,
                node: nodeId,
                used: 0,
              }))
            )
              .then(() => {
                resolve(true);
              })
              .catch((err) => {
                reject(err);
              });
          })
          .catch((err) => {
            reject(err);
          });
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const createNodesByCharacter = async (req: {
  characterId: string;
  nodeIds: string[];
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const { characterId, nodeIds } = req;
    CharacterNode.create(
      nodeIds.map((nodeId) => ({
        character: characterId,
        node: nodeId,
        used: 0,
      }))
    )
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(err);
      });
  });

const updateNodeByCharacter = async (req: {
  characterId: string;
  nodeId: string;
  used: number;
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const { characterId, nodeId, used } = req;
    CharacterNode.findOneAndUpdate(
      {
        character: characterId,
        node: nodeId,
      },
      { used }
    )
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(err);
      });
  });

const deleteSpecificNodesByCharacter = async (req: {
  characterId: string;
  nodeIds: string[];
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const { characterId, nodeIds } = req;
    CharacterNode.deleteMany({
      character: characterId,
      node: { $in: nodeIds },
    })
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(err);
      });
  });

const deleteNodesByCharacter = async (characterId: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    CharacterNode.deleteMany({
      character: characterId,
    })
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(err);
      });
  });

export {
  createNodesByCharacter,
  deleteNodesByCharacter,
  deleteSpecificNodesByCharacter,
  replaceCyberFrameNodeByCharacter,
  updateNodeByCharacter,
};
