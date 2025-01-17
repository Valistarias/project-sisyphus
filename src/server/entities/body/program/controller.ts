import db from '../../../models';

const { BodyProgram } = db;

const replaceProgramByBody = async (req: {
  bodyId: string
  programIds: string[]
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const { bodyId } = req;
    BodyProgram.deleteMany({ body: bodyId })
      .then(() => {
        createProgramsByBody(req)
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

const createProgramsByBody = async (req: {
  bodyId: string
  programIds: string[]
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const {
      bodyId, programIds
    } = req;
    BodyProgram.create(
      programIds.map(programId => ({
        body: bodyId,
        program: programId
      }))
    )
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const updateProgramByBody = async (req: {
  bodyId: string
  programId: string
  uses?: number
  bag?: string
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const {
      bodyId, programId, uses = null, bag = null
    } = req;
    const updateObj: {
      uses?: number
      bag?: string
    } = {};
    if (uses !== null) {
      updateObj.uses = uses;
    }
    if (bag !== null) {
      updateObj.bag = bag;
    }
    BodyProgram.findOneAndUpdate(
      {
        body: bodyId,
        program: programId
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

const deleteProgramsByBody = async (bodyId: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    BodyProgram.deleteMany({ body: bodyId })
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

export {
  createProgramsByBody,
  deleteProgramsByBody,
  replaceProgramByBody,
  updateProgramByBody
};
