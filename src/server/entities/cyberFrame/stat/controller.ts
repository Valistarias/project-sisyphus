import db from '../../../models';

const { CyberFrameStat } = db;

const replaceStatByCyberFrame = async (req: {
  cyberFrameId: string;
  stats: Array<{
    id: string;
    value: number;
  }>;
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const { cyberFrameId } = req;
    CyberFrameStat.deleteMany({ cyberFrame: cyberFrameId })
      .then(() => {
        createStatsByCyberFrame(req)
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

const createStatsByCyberFrame = async (req: {
  cyberFrameId: string;
  stats: Array<{
    id: string;
    value: number;
  }>;
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const { cyberFrameId, stats } = req;
    CyberFrameStat.create(
      stats.map(({ id, value }) => ({
        cyberFrame: cyberFrameId,
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

const updateStatByCyberFrame = async (req: {
  cyberFrameId: string;
  statId: string;
  value: number;
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const { cyberFrameId, statId, value } = req;
    CyberFrameStat.findOneAndUpdate(
      {
        cyberFrame: cyberFrameId,
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

const deleteStatsByCyberFrame = async (cyberFrameId: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    CyberFrameStat.deleteMany({ cyberFrame: cyberFrameId })
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(err);
      });
  });

export {
  createStatsByCyberFrame,
  deleteStatsByCyberFrame,
  replaceStatByCyberFrame,
  updateStatByCyberFrame,
};
