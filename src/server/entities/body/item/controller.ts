import db from '../../../models';

const { BodyItem } = db;

const replaceItemByBody = async (req: {
  bodyId: string;
  items: Array<{
    id: string;
    qty: number;
  }>;
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const { bodyId } = req;
    BodyItem.deleteMany({ body: bodyId })
      .then(() => {
        createItemsByBody(req)
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

const createItemsByBody = async (req: {
  bodyId: string;
  items: Array<{
    id: string;
    qty: number;
  }>;
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const { bodyId, items } = req;
    BodyItem.create(
      items.map(({ id, qty }) => ({
        body: bodyId,
        item: id,
        qty,
      }))
    )
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(err);
      });
  });

const updateItemByBody = async (req: {
  bodyId: string;
  itemId: string;
  qty?: number;
  bag?: string;
}): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    const { bodyId, itemId, qty = null, bag = null } = req;
    const updateObj: {
      bag?: string;
      qty?: number;
    } = {};
    if (qty !== null) {
      updateObj.qty = qty;
    }
    if (bag !== null) {
      updateObj.bag = bag;
    }
    BodyItem.findOneAndUpdate(
      {
        body: bodyId,
        item: itemId,
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

const deleteItemsByBody = async (bodyId: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    BodyItem.deleteMany({ body: bodyId })
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(err);
      });
  });

export { createItemsByBody, deleteItemsByBody, replaceItemByBody, updateItemByBody };
