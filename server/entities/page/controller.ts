import db from '../../models';

import { type Request, type Response } from 'express';
import { type HydratedIPage } from './model';
import type { HydratedIChapter } from '../index';

import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';

const { Page } = db;

const findPages = async (): Promise<HydratedIPage[]> =>
  await new Promise((resolve, reject) => {
    Page.find()
      .populate<{ chapter: HydratedIChapter }>({
        path: 'chapter',
        populate: 'ruleBook',
      })
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Pages'));
        } else {
          resolve(res as HydratedIPage[]);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const findPagesByChapter = async (chapterId: string): Promise<HydratedIPage[]> =>
  await new Promise((resolve, reject) => {
    Page.find({ chapter: chapterId })
      .populate<{ chapter: HydratedIChapter }>({
        path: 'chapter',
        populate: 'ruleBook',
      })
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Pages'));
        } else {
          resolve(res as HydratedIPage[]);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const findPageById = async (id: string): Promise<HydratedIPage> =>
  await new Promise((resolve, reject) => {
    Page.findById(id)
      .populate<{ chapter: HydratedIChapter }>({
        path: 'chapter',
        populate: 'ruleBook',
      })
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Page'));
        } else {
          resolve(res as HydratedIPage);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const { title, content, chapter, i18n = null } = req.body;
  if (title === undefined || content === undefined || chapter === undefined) {
    res.status(400).send(gemInvalidField('Page'));
    return;
  }

  findPagesByChapter(chapter)
    .then((pages) => {
      const page = new Page({
        title,
        content,
        chapter,
        position: pages.length,
      });

      if (i18n !== null) {
        page.i18n = JSON.stringify(i18n);
      }

      page
        .save()
        .then(() => {
          res.send(page);
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch((err) => res.status(500).send(gemServerError(err)));
};

const update = (req: Request, res: Response): void => {
  const { id, title = null, content = null, i18n } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Page ID'));
    return;
  }
  findPageById(id)
    .then((page) => {
      if (title !== null) {
        page.title = title;
      }
      if (content !== null) {
        page.content = content;
      }

      if (i18n !== null) {
        const newIntl = {
          ...(page.i18n !== null && page.i18n !== undefined && page.i18n !== ''
            ? JSON.parse(page.i18n)
            : {}),
        };

        Object.keys(i18n).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        page.i18n = JSON.stringify(newIntl);
      }

      page
        .save()
        .then(() => {
          res.send({ message: 'Page was updated successfully!', page });
        })
        .catch((err) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Page'));
    });
};

const deletePage = (req: Request, res: Response): void => {
  const { id } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Page ID'));
    return;
  }
  Page.findByIdAndDelete(id)
    .then(() => {
      res.send({ message: 'Page was deleted successfully!' });
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

const deletePagesByChapterId = async (chapterId: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (chapterId === undefined) {
      reject(gemInvalidField('Chapter ID'));
      return;
    }
    Page.deleteMany({ chapter: chapterId })
      .then(() => {
        resolve(true);
      })
      .catch((err: Error) => {
        reject(err);
      });
  });

interface CuratedIPage {
  i18n: Record<string, any> | Record<string, unknown>;
  page: HydratedIPage;
}

const curatePage = (page: HydratedIPage): Record<string, any> => {
  if (page.i18n === null || page.i18n === '' || page.i18n === undefined) {
    return {};
  }
  return JSON.parse(page.i18n);
};

const findSingle = (req: Request, res: Response): void => {
  const { pageId } = req.query;
  if (pageId === undefined || typeof pageId !== 'string') {
    res.status(400).send(gemInvalidField('Page ID'));
    return;
  }
  findPageById(pageId)
    .then((page) => {
      const sentObj = {
        page,
        i18n: curatePage(page),
      };
      res.send(sentObj);
    })
    .catch((err) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findPages()
    .then((pages) => {
      const curatedPages: CuratedIPage[] = [];

      pages.forEach((page) => {
        curatedPages.push({
          page,
          i18n: curatePage(page),
        });
      });

      res.send(curatedPages);
    })
    .catch((err) => res.status(500).send(gemServerError(err)));
};

const findAllByChapter = (req: Request, res: Response): void => {
  const { chapterId } = req.query;
  if (chapterId === undefined || typeof chapterId !== 'string') {
    res.status(400).send(gemInvalidField('RuleBook ID'));
    return;
  }
  findPagesByChapter(chapterId)
    .then((pages) => {
      const curatedChapters: CuratedIPage[] = [];

      pages.forEach((page) => {
        curatedChapters.push({
          page,
          i18n: curatePage(page),
        });
      });

      res.send(curatedChapters);
    })
    .catch((err) => res.status(500).send(gemServerError(err)));
};

export {
  create,
  update,
  deletePage,
  findSingle,
  findAll,
  findPageById,
  deletePagesByChapterId,
  findPagesByChapter,
  findAllByChapter,
};
