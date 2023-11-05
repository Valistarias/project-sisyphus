import db from '../../models';

import { type Request, type Response } from 'express';
import { type HydratedIChapter } from './model';
import type { IRuleBook, IChapterType } from '../index';

import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';
import { deletePagesByChapterId } from '../page/controller';

const { Chapter } = db;

const findChapters = async (): Promise<HydratedIChapter[]> =>
  await new Promise((resolve, reject) => {
    Chapter.find()
      .populate<{ type: IChapterType }>('type')
      .populate<{ ruleBook: IRuleBook }>('ruleBook')
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Chapters'));
        } else {
          resolve(res as HydratedIChapter[]);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const findChaptersByRuleBook = async (ruleBookId: string): Promise<HydratedIChapter[]> =>
  await new Promise((resolve, reject) => {
    Chapter.find({ ruleBook: ruleBookId })
      .populate<{ type: IChapterType }>('type')
      .populate<{ ruleBook: IRuleBook }>('ruleBook')
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Chapters'));
        } else {
          resolve(res as HydratedIChapter[]);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const findChapterById = async (id: string): Promise<HydratedIChapter> =>
  await new Promise((resolve, reject) => {
    Chapter.findById(id)
      .populate<{ type: IChapterType }>('type')
      .populate<{ ruleBook: IRuleBook }>('ruleBook')
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Chapter'));
        } else {
          resolve(res as HydratedIChapter);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const { title, summary, type, ruleBook, i18n = null } = req.body;
  if (title === undefined || summary === undefined || ruleBook === undefined) {
    res.status(400).send(gemInvalidField('Chapter'));
    return;
  }

  findChaptersByRuleBook(ruleBook)
    .then((chapters) => {
      const chapter = new Chapter({
        title,
        summary,
        type,
        ruleBook,
        position: chapters.length,
      });

      if (i18n !== null) {
        chapter.i18n = JSON.stringify(i18n);
      }

      chapter
        .save()
        .then(() => {
          res.send(chapter);
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch((err) => res.status(500).send(gemServerError(err)));
};

const update = (req: Request, res: Response): void => {
  const { id, title = null, summary = null, i18n } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Chapter ID'));
    return;
  }
  findChapterById(id)
    .then((chapter) => {
      if (title !== null) {
        chapter.title = title;
      }
      if (summary !== null) {
        chapter.summary = summary;
      }

      if (i18n !== null) {
        const newIntl = {
          ...(chapter.i18n !== null && chapter.i18n !== undefined && chapter.i18n !== ''
            ? JSON.parse(chapter.i18n)
            : {}),
        };

        Object.keys(i18n).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        chapter.i18n = JSON.stringify(newIntl);
      }

      chapter
        .save()
        .then(() => {
          res.send({ message: 'Chapter was updated successfully!', chapter });
        })
        .catch((err) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Chapter'));
    });
};

const deleteChapter = (req: Request, res: Response): void => {
  const { id } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Chapter ID'));
    return;
  }
  deletePagesByChapterId(id)
    .then(() => {
      Chapter.findByIdAndDelete(id)
        .then(() => {
          res.send({ message: 'Chapter was deleted successfully!' });
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

interface CuratedIChapter {
  i18n: Record<string, any> | Record<string, unknown>;
  chapter: HydratedIChapter;
}

const curateChapter = (chapter: HydratedIChapter): Record<string, any> => {
  if (chapter.i18n === null || chapter.i18n === '' || chapter.i18n === undefined) {
    return {};
  }
  return JSON.parse(chapter.i18n);
};

const findSingle = (req: Request, res: Response): void => {
  const { chapterId } = req.query;
  if (chapterId === undefined || typeof chapterId !== 'string') {
    res.status(400).send(gemInvalidField('Chapter ID'));
    return;
  }
  findChapterById(chapterId)
    .then((chapter) => {
      const sentObj = {
        chapter,
        i18n: curateChapter(chapter),
      };
      res.send(sentObj);
    })
    .catch((err) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findChapters()
    .then((chapters) => {
      const curatedChapters: CuratedIChapter[] = [];

      chapters.forEach((chapter) => {
        curatedChapters.push({
          chapter,
          i18n: curateChapter(chapter),
        });
      });

      res.send(curatedChapters);
    })
    .catch((err) => res.status(500).send(gemServerError(err)));
};

const findAllByRuleBook = (req: Request, res: Response): void => {
  const { ruleBookId } = req.query;
  if (ruleBookId === undefined || typeof ruleBookId !== 'string') {
    res.status(400).send(gemInvalidField('RuleBook ID'));
    return;
  }
  findChaptersByRuleBook(ruleBookId)
    .then((chapters) => {
      const curatedChapters: CuratedIChapter[] = [];

      chapters.forEach((chapter) => {
        curatedChapters.push({
          chapter,
          i18n: curateChapter(chapter),
        });
      });

      res.send(curatedChapters);
    })
    .catch((err) => res.status(500).send(gemServerError(err)));
};

export { create, update, deleteChapter, findSingle, findAll, findChapterById, findAllByRuleBook };
