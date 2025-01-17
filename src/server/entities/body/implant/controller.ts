import db from '../../../models';

const { BodyImplant } = db;

const replaceImplantByBody = async (req: {
  bodyId: string
  implantIds: string[]
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
        reject(gemServerError(err));
      });
  });

const createImplantsByBody = async (req: {
  bodyId: string
  implantIds: string[]
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const {
      bodyId, implantIds
    } = req;
    BodyImplant.create(
      implantIds.map(implantId => ({
        body: bodyId,
        implant: implantId
      }))
    )
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const updateImplantByBody = async (req: {
  bodyId: string
  implantId: string
  equiped: string | null
  bag: string | null
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const {
      bodyId, implantId, equiped = null, bag = null
    } = req;
    const updateObj: {
      bag?: string
      equiped?: string
    } = {};
    if (bag !== null) {
      updateObj.bag = bag;
    }
    if (equiped !== null) {
      updateObj.equiped = equiped;
      updateObj.bag = undefined;
    }
    BodyImplant.findOneAndUpdate(
      {
        body: bodyId,
        implant: implantId
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

const deleteImplantsByBody = async (bodyId: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    BodyImplant.deleteMany({ body: bodyId })
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

export {
  createImplantsByBody,
  deleteImplantsByBody,
  replaceImplantByBody,
  updateImplantByBody
};
