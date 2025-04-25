import db from '../../../models';

const { CharacterStat } = db;

const replaceStatByCharacter = async (req: {
  characterId: string;
  stats: Array<{
    id: string;
    value: number;
  }>;
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const { characterId } = req;
    CharacterStat.deleteMany({ character: characterId })
      .then(() => {
        createStatsByCharacter(req)
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
  });

const createStatsByCharacter = async (req: {
  characterId: string;
  stats: Array<{
    id: string;
    value: number;
  }>;
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const { characterId, stats } = req;
    CharacterStat.create(
      stats.map(({ id, value }) => ({
        character: characterId,
        stat: id,
        value,
      }))
    )
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(err);
      });
  });

const updateStatByCharacter = async (req: {
  characterId: string;
  statId: string;
  value: number;
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const { characterId, statId, value } = req;
    CharacterStat.findOneAndUpdate(
      {
        character: characterId,
        stat: statId,
      },
      { value }
    )
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(err);
      });
  });

const deleteStatsByCharacter = async (characterId: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    CharacterStat.deleteMany({ character: characterId })
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(err);
      });
  });

export {
  createStatsByCharacter,
  deleteStatsByCharacter,
  replaceStatByCharacter,
  updateStatByCharacter,
};
