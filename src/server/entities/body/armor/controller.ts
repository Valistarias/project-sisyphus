import db from '../../../models';

const { BodyArmor } = db;

const replaceArmorByBody = async (req: {
  bodyId: string
  armorIds: string[]
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const { bodyId } = req;
    BodyArmor.deleteMany({ body: bodyId })
      .then(() => {
        createArmorsByBody(req)
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

const createArmorsByBody = async (req: {
  bodyId: string
  armorIds: string[]
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const {
      bodyId, armorIds
    } = req;
    BodyArmor.create(
      armorIds.map(armorId => ({
        body: bodyId,
        armor: armorId
      }))
    )
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(err);
      });
  });

const updateArmorByBody = async (req: {
  bodyId: string
  armorId: string
  equiped?: boolean
  bag?: string
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const {
      bodyId, armorId, equiped = null, bag = null
    } = req;
    const updateObj: {
      bag?: string
      equiped?: boolean
    } = {};
    if (bag !== null) {
      updateObj.bag = bag;
    }
    if (equiped !== null) {
      updateObj.equiped = equiped;
      if (equiped) {
        updateObj.bag = undefined;
      }
    }
    BodyArmor.findOneAndUpdate(
      {
        body: bodyId,
        armor: armorId
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

const deleteArmorsByBody = async (bodyId: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    BodyArmor.deleteMany({ body: bodyId })
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(err);
      });
  });

export {
  createArmorsByBody, deleteArmorsByBody, replaceArmorByBody, updateArmorByBody
};
