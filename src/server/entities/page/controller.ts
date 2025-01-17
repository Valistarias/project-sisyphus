import type {
  Request, Response
} from 'express';

import db from '../../models';
import {
  gemInvalidField, gemNotFound, gemServerError
} from '../../utils/globalErrorMessage';

import type { HydratedIPage } from './model';
import type { InternationalizationType } from '../../utils/types';
import type { HydratedIChapter } from '../index';

import { curateI18n } from '../../utils';

const { Page } = db;

const findPages = async (): Promise<HydratedIPage[]> =>
  await new Promise((resolve, reject) => {
    Page.find()
      .populate<{ chapter: HydratedIChapter }>({
        path: 'chapter',
        populate: 'ruleBook'
      })
      .then((res: HydratedIPage[]) => {
        if (res.length === 0) {
          reject(gemNotFound('Pages'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const findPagesByChapter = async (
  chapterId: string
): Promise<HydratedIPage[]> =>
  await new Promise((resolve, reject) => {
    Page.find({ chapter: chapterId })
      .populate<{ chapter: HydratedIChapter }>({
        path: 'chapter',
        populate: 'ruleBook'
      })
      .then((res?: HydratedIPage[] | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Pages'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const findPageById = async (id: string): Promise<HydratedIPage> =>
  await new Promise((resolve, reject) => {
    Page.findById(id)
      .populate<{ chapter: HydratedIChapter }>({
        path: 'chapter',
        populate: 'ruleBook'
      })
      .then((res?: HydratedIPage | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Page'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const create = (req: Request, res: Response): void => {
  const {
    title, content, chapter, i18n = null
  }: {
    title?: string
    content?: string
    i18n?: InternationalizationType | null
    chapter?: string
  } = req.body;
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
        position: pages.length
      });

      if (i18n !== null) {
        page.i18n = JSON.stringify(i18n);
      }

      page
        .save()
        .then(() => {
          res.send(page);
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const update = (req: Request, res: Response): void => {
  const {
    id, title = null, content = null, i18n
  }: {
    id?: string
    title: string | null
    content: string | null
    i18n: InternationalizationType | null
    chapter: string | null
  } = req.body;
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
        const newIntl: InternationalizationType = { ...(
          page.i18n !== undefined
          && page.i18n !== ''
            ? JSON.parse(page.i18n)
            : {}) };

        Object.keys(i18n).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        page.i18n = JSON.stringify(newIntl);
      }

      page
        .save()
        .then(() => {
          res.send({
            message: 'Page was updated successfully!', page
          });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Page'));
    });
};

const deletePage = (req: Request, res: Response): void => {
  const { id }: { id?: string } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Page ID'));

    return;
  }
  Page.findByIdAndDelete(id)
    .then(() => {
      res.send({ message: 'Page was deleted successfully!' });
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const deletePagesByChapterId = async (chapterId?: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (chapterId === undefined) {
      resolve(true);

      return;
    }
    Page.deleteMany({ chapter: chapterId })
      .then(() => {
        resolve(true);
      })
      .catch((err: unknown) => {
        reject(err);
      });
  });

interface CuratedIPage {
  i18n?: InternationalizationType
  page: HydratedIPage
}

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
        i18n: curateI18n(page.i18n)
      };
      res.send(sentObj);
    })
    .catch((err: unknown) => {
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
          i18n: curateI18n(page.i18n)
        });
      });

      res.send(curatedPages);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
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
          i18n: curateI18n(page.i18n)
        });
      });

      res.send(curatedChapters);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  create,
  deletePage,
  deletePagesByChapterId,
  findAll,
  findAllByChapter,
  findPageById,
  findPagesByChapter,
  findSingle,
  update
};
