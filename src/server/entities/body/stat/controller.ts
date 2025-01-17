import db from '../../../models';

const { BodyStat } = db;

const replaceStatByBody = async (req: {
  bodyId: string
  stats: Array<{
    id: string
    value: number
  }>
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const { bodyId } = req;
    BodyStat.deleteMany({ body: bodyId })
      .then(() => {
        createStatsByBody(req)
          .then(() => {
            resolve(true);
          })
          .catch((err) => {
            reject(err);
          });
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const createStatsByBody = async (req: {
  bodyId: string
  stats: Array<{
    id: string
    value: number
  }>
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const {
      bodyId, stats
    } = req;
    BodyStat.create(
      stats.map(({
        id, value
      }) => ({
        body: bodyId,
        stat: id,
        value
      }))
    )
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const updateStatByBody = async (req: {
  bodyId: string
  statId: string
  value: number
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const {
      bodyId, statId, value
    } = req;
    BodyStat.findOneAndUpdate(
      {
        body: bodyId,
        stat: statId
      },
      { value }
    )
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const deleteStatsByBody = async (bodyId: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    BodyStat.deleteMany({ body: bodyId })
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

export {
  createStatsByBody, deleteStatsByBody, replaceStatByBody, updateStatByBody
};
