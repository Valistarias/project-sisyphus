import db from '../../../models';

const { CyberFrameCharParam } = db;

const replaceCharParamByCyberFrame = async (req: {
  cyberFrameId: string;
  charParams: Array<{
    id: string;
    value: number;
  }>;
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const { cyberFrameId } = req;
    CyberFrameCharParam.deleteMany({ cyberFrame: cyberFrameId })
      .then(() => {
        createCharParamsByCyberFrame(req)
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

const createCharParamsByCyberFrame = async (req: {
  cyberFrameId: string;
  charParams: Array<{
    id: string;
    value: number;
  }>;
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const { cyberFrameId, charParams } = req;
    CyberFrameCharParam.create(
      charParams.map(({ id, value }) => ({
        cyberFrame: cyberFrameId,
        charParam: id,
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

const updateCharParamByCyberFrame = async (req: {
  cyberFrameId: string;
  charParamId: string;
  value: number;
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const { cyberFrameId, charParamId, value } = req;
    CyberFrameCharParam.findOneAndUpdate(
      {
        cyberFrame: cyberFrameId,
        charParam: charParamId,
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

const deleteCharParamsByCyberFrame = async (cyberFrameId: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    CyberFrameCharParam.deleteMany({ cyberFrame: cyberFrameId })
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(err);
      });
  });

export {
  createCharParamsByCyberFrame,
  deleteCharParamsByCyberFrame,
  replaceCharParamByCyberFrame,
  updateCharParamByCyberFrame,
};
