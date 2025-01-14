import db from '../../../models';

const { BodyBag } = db;

const replaceBagByBody = async (req: {
  bodyId: string, bagIds: string[]
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const { bodyId } = req;
    BodyBag.deleteMany({ body: bodyId })
      .then(() => {
        createBagsByBody(req)
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

const createBagsByBody = async (req: {
  bodyId: string, bagIds: string[]
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const {
      bodyId, bagIds
    } = req;
    BodyBag.create(
      bagIds.map(bagId => ({
        body: bodyId,
        bag: bagId
      }))
    )
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(err);
      });
  });

const updateBagByBody = async (req: {
  bodyId: string
  bagId: string
  equiped?: boolean
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const {
      bodyId, bagId, equiped = null
    } = req;
    const updateObj: { equiped?: boolean } = {};
    if (equiped !== null) {
      updateObj.equiped = equiped;
    }
    BodyBag.findOneAndUpdate(
      {
        body: bodyId,
        bag: bagId
      },
      updateObj
    )
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(err);
      });
  });

const deleteBagsByBody = async (bodyId: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    BodyBag.deleteMany({ body: bodyId })
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(err);
      });
  });

export {
  createBagsByBody, deleteBagsByBody, replaceBagByBody, updateBagByBody
};
