import db from '../../../models';

const { CharacterNode } = db;

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
    CharacterNode.deleteMany({ character: characterId })
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
  updateNodeByCharacter,
};
