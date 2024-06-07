import db from '../../../models';

const { BodyImplant } = db;

const replaceImplantByBody = async (req: {
  bodyId: string;
  implantIds: string[];
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const { bodyId } = req;
    BodyImplant.deleteMany({ body: bodyId })
      .then(() => {
        createImplantsByBody(req)
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

const createImplantsByBody = async (req: {
  bodyId: string;
  implantIds: string[];
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const { bodyId, implantIds } = req;
    BodyImplant.create(
      implantIds.map((implantId) => ({
        body: bodyId,
        implant: implantId,
      }))
    )
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(err);
      });
  });

const updateImplantByBody = async (req: {
  bodyId: string;
  implantId: string;
  equiped?: boolean;
  bag?: string;
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const { bodyId, implantId, equiped = null, bag = null } = req;
    const updateObj: {
      bag?: string;
      equiped?: boolean;
    } = {};
    if (equiped !== null) {
      updateObj.equiped = equiped;
      if (equiped) {
        updateObj.bag = undefined;
      }
    }
    if (bag !== null) {
      updateObj.bag = bag;
    }
    BodyImplant.findOneAndUpdate(
      {
        body: bodyId,
        implant: implantId,
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

const deleteImplantsByBody = async (bodyId: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    BodyImplant.deleteMany({
      body: bodyId,
    })
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(err);
      });
  });

export { createImplantsByBody, deleteImplantsByBody, replaceImplantByBody, updateImplantByBody };
