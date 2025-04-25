import db from '../../../models';

const { BodySkill } = db;

const replaceSkillByBody = async (req: {
  bodyId: string;
  skills: Array<{
    id: string;
    value: number;
  }>;
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const { bodyId } = req;
    BodySkill.deleteMany({ body: bodyId })
      .then(() => {
        createSkillsByBody(req)
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

const createSkillsByBody = async (req: {
  bodyId: string;
  skills: Array<{
    id: string;
    value: number;
  }>;
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const { bodyId, skills } = req;
    BodySkill.create(
      skills.map(({ id, value }) => ({
        body: bodyId,
        skill: id,
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

const updateSkillByBody = async (req: {
  bodyId: string;
  skillId: string;
  value: number;
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const { bodyId, skillId, value } = req;
    BodySkill.findOneAndUpdate(
      {
        body: bodyId,
        skill: skillId,
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

const deleteSkillsByBody = async (bodyId: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    BodySkill.deleteMany({ body: bodyId })
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(err);
      });
  });

export { createSkillsByBody, deleteSkillsByBody, replaceSkillByBody, updateSkillByBody };
