import db from '../../../models';

const { BodyAmmo } = db;

const replaceAmmoByBody = async (req: {
  bodyId: string
  ammos: Array<{
    id: string
    qty: number
  }>
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const { bodyId } = req;
    BodyAmmo.deleteMany({ body: bodyId })
      .then(() => {
        createAmmosByBody(req)
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

const createAmmosByBody = async (req: {
  bodyId: string
  ammos: Array<{
    id: string
    qty: number
  }>
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const {
      bodyId, ammos
    } = req;
    BodyAmmo.create(
      ammos.map(({
        id, qty
      }) => ({
        body: bodyId,
        ammo: id,
        qty
      }))
    )
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const updateAmmoByBody = async (req: {
  bodyId: string
  ammoId: string
  qty?: number
  bag?: string
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const {
      bodyId, ammoId, qty = null, bag = null
    } = req;
    const updateObj: {
      bag?: string
      qty?: number
    } = {};
    if (qty !== null) {
      updateObj.qty = qty;
    }
    if (bag !== null) {
      updateObj.bag = bag;
    }
    BodyAmmo.findOneAndUpdate(
      {
        body: bodyId,
        ammo: ammoId
      },
      updateObj
    )
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const deleteAmmosByBody = async (bodyId: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    BodyAmmo.deleteMany({ body: bodyId })
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

export {
  createAmmosByBody, deleteAmmosByBody, replaceAmmoByBody, updateAmmoByBody
};
