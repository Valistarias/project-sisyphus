import { type InternationalizationType } from './global';

// Rulebook ------------------------------------
export interface IRuleBookType {
  /** The ID of the rulebook type */
  _id: string;
  /** The name of the rulebook type */
  name: string;
}

export interface IRuleBook {
  /** The ID of the rulebook */
  _id: string;
  /** The title of the rulebook */
  title: string;
  /** The type of the rulebook */
  type: {
    _id: string;
    name: string;
  };
  /** The summary of the rulebook */
  summary: string;
  /** Is the RuleBook a draft ? */
  draft: boolean;
  /** Is the RuleBook archived ? */
  archived: boolean;
  /** When the rulebook was created */
  createdAt: Date;
  /** All the related Notions */
  notions: INotion[];
  /** All the related Chapters */
  chapters: IChapter[];
}

export interface ICuratedRuleBook {
  i18n: InternationalizationType;
  ruleBook: IRuleBook;
}

// Chapter ------------------------------------

export interface IChapterType {
  /** The ID of the chapter type */
  _id: string;
  /** The name of the chapter type */
  name: string;
}

export interface IChapter {
  /** The ID of the chapter */
  _id: string;
  /** The title of the chapter */
  title: string;
  /** The rulebook linked to this chapter */
  ruleBook: IRuleBook;
  /** The type of the chapter */
  type: {
    _id: string;
    name: string;
  };
  /** The summary of the chapter */
  summary: string;
  /** The position of this chapter, in reference with others */
  position: number;
  /** When the chapter was created */
  createdAt: Date;
  /** All the related Pages */
  pages: IPage[];
}

export interface ICuratedChapter {
  i18n: InternationalizationType;
  chapter: IChapter;
}

// Page ------------------------------------

export interface IPage {
  /** The ID of the page */
  _id: string;
  /** The title of the page */
  title: string;
  /** The title of the page */
  content: string;
  /** The rulebook linked to this page */
  chapter: IChapter;
  /** The position of this page, in reference with others */
  position: number;
  /** When the page was created */
  createdAt: Date;
}

export interface ICuratedPage {
  i18n: InternationalizationType;
  page: IPage;
}

// Notion ------------------------------------

export interface INotion {
  /** The ID of the notion */
  _id: string;
  /** The title of the notion */
  title: string;
  /** The content of the notion */
  text: string;
  /** The rulebook associated with this notion */
  ruleBook: string;
  /** When the notion was created */
  createdAt: Date;
}

export interface ICuratedNotion {
  i18n: InternationalizationType;
  notion: INotion;
}
