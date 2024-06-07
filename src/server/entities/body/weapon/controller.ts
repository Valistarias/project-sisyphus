import db from '../../../models';

const { BodyWeapon } = db;

const replaceWeaponByBody = async (req: {
  bodyId: string;
  weaponIds: string[];
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const { bodyId } = req;
    BodyWeapon.deleteMany({ body: bodyId })
      .then(() => {
        createWeaponsByBody(req)
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

const createWeaponsByBody = async (req: {
  bodyId: string;
  weaponIds: string[];
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const { bodyId, weaponIds } = req;
    BodyWeapon.create(
      weaponIds.map((weaponId) => ({
        body: bodyId,
        weapon: weaponId,
      }))
    )
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(err);
      });
  });

const updateWeaponByBody = async (req: {
  bodyId: string;
  weaponId: string;
  ammoId?: string;
  bullets?: number;
  bag?: string;
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const { bodyId, weaponId, ammoId = null, bullets = null, bag = null } = req;
    const updateObj: {
      ammo?: string;
      bag?: string;
      bullets?: number;
    } = {};
    if (ammoId !== null) {
      updateObj.ammo = ammoId;
    }
    if (bullets !== null) {
      updateObj.bullets = bullets;
    }
    if (bag !== null) {
      updateObj.bag = bag;
    }
    BodyWeapon.findOneAndUpdate(
      {
        body: bodyId,
        weapon: weaponId,
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

const deleteWeaponsByBody = async (bodyId: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    BodyWeapon.deleteMany({
      body: bodyId,
    })
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(err);
      });
  });

export { createWeaponsByBody, deleteWeaponsByBody, replaceWeaponByBody, updateWeaponByBody };
