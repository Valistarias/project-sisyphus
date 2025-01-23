import React, { type FC } from 'react';

import { useTranslation } from 'react-i18next';

import {
  Ap, type IAButton
} from '../atoms';

import type { ICuratedStat } from '../types';
import type { ISourcePoints } from '../utils/character';

import {
  addSymbol, classTrim
} from '../utils';

import './detailsBonuses.scss';

interface IDetailsBonuses extends IAButton {
  /** The bonuses to display */
  bonuses: ISourcePoints[]
  /** The associated stat */
  stat?: ICuratedStat
}

interface ILineData {
  id: string
  total: number
  text: string
}

const DetailsBonuses: FC<IDetailsBonuses> = ({
  bonuses, stat
}) => {
  const { t } = useTranslation();

  // TODO: Deal with i18n
  const statTexts = stat?.stat;

  const lines: Record<
    string,
    ILineData
  > = {};
  bonuses.forEach((bonus) => {
    if (bonus.fromBody === true) {
      lines.body = {
        id: 'body',
        total: bonus.value,
        text: t('detailBonuses.fromBody', { ns: 'components' })
      };
    } else if (bonus.fromBase === true) {
      lines.body = {
        id: 'body',
        total: bonus.value,
        text: t('detailBonuses.fromBase', { ns: 'components' })
      };
    } else if (bonus.fromStat === true) {
      lines.stat = {
        id: 'stat',
        total: bonus.value,
        text: statTexts?.title ?? t('detailBonuses.fromStatGeneric', { ns: 'components' })
      };
    } else if (bonus.fromBackground === true) {
      lines.background = {
        id: 'background',
        total: bonus.value,
        text: t(
          'detailBonuses.fromBackground',
          { ns: 'components', details: bonus.details }
        )
      };
    } else if (
      bonus.origin?.skill !== undefined
      || bonus.origin?.cyberFrame !== undefined
    ) {
      const relevantId
        = bonus.origin.skill !== undefined
          ? `skill-${bonus.origin.skill.skill._id}`
          : `cyberFrame-${bonus.origin.cyberFrame?.cyberFrame._id}`;
      // TODO: Deal with i18n
      const relevantText
        = bonus.origin.skill !== undefined
          ? bonus.origin.skill.skill.title
          : bonus.origin.cyberFrame?.cyberFrame.title;
      if ((lines[relevantId] as ILineData | undefined) === undefined) {
        lines[relevantId] = {
          id: relevantId,
          total: bonus.value,
          text: relevantText ?? ''
        };
      } else {
        lines[relevantId].total += bonus.value;
      }
    } else if (bonus.fromThrottleStat === true) {
      lines.fromThrottleStat = {
        id: 'fromThrottleStat',
        total: bonus.value,
        text: t('detailBonuses.fromThrottleStat', { ns: 'components' })
      };
    }
  });

  return (
    <div
      className={classTrim(`
      details-bonuses
    `)}
    >
      <Ap className="details-bonuses__title">{t('detailBonuses.title', { ns: 'components' })}</Ap>
      {
        Object.values(lines).map(({
          id, total, text
        }) => (
          <Ap key={id} className="details-bonuses__line">
            {`${text}:`}
            <span
              className={classTrim(`
              details-bonuses__line__score
              ${total > 0 ? 'details-bonuses__line__score--positive' : 'details-bonuses__line__score--negative'}
            `)}
            >
              {addSymbol(total)}
            </span>
          </Ap>
        ))
      }
    </div>
  );
};

export default DetailsBonuses;
