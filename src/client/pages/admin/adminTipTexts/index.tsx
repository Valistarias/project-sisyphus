import React, { useMemo, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../../providers';

import { Ali, Atitle, Aul } from '../../../atoms';
import { LinkButton } from '../../../molecules';

import { classTrim } from '../../../utils';

import './adminTipTexts.scss';

const AdminTipTexts: FC = () => {
  const { t } = useTranslation();
  const { tipTexts } = useGlobalVars();

  // TODO: Handle i18n in place of basic english language
  const tipTextsList = useMemo(() => {
    if (tipTexts.length === 0) {
      return null;
    }

    return (
      <Aul className="adminTipTexts__tip-text-list" noPoints>
        {tipTexts.map(({ tipText }) => (
          <Ali
            className={classTrim(`
              adminTipTexts__tip-text-list__elt
            `)}
            key={tipText._id}
          >
            <Atitle level={3}>{tipText.title}</Atitle>
            <LinkButton href={`/admin/tiptext/${tipText._id}`}>
              {t('adminTipTexts.editTipText', { ns: 'pages' })}
            </LinkButton>
          </Ali>
        ))}
      </Aul>
    );
  }, [tipTexts, t]);

  return (
    <div className="adminTipTexts">
      <Atitle level={1}>{t('adminTipTexts.title', { ns: 'pages' })}</Atitle>
      <div className="adminTipTexts__content">
        <div className="adminTipTexts__books">
          <Atitle level={2}>{t('adminTipTexts.list', { ns: 'pages' })}</Atitle>
          <div className="adminTipTexts__books__list">{tipTextsList}</div>
          <LinkButton href="/admin/tiptext/new">
            {t('adminNewTipText.title', { ns: 'pages' })}
          </LinkButton>
        </div>
      </div>
    </div>
  );
};

export default AdminTipTexts;
