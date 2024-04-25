import React, { useMemo, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../../providers';

import { Ali, Atitle, Aul } from '../../../atoms';
import { Button } from '../../../molecules';

import { classTrim } from '../../../utils';

import './adminCyberFrames.scss';

const AdminCyberFrames: FC = () => {
  const { t } = useTranslation();
  const { cyberFrames } = useGlobalVars();

  // TODO: Handle i18n in place of basic english language
  // TODO: Display all branches on one cyber frame
  const cyberFramesList = useMemo(() => {
    if (cyberFrames === null || cyberFrames.length === 0) {
      return null;
    }
    return (
      <Aul className="adminCyberFrames__cyberframe-list" noPoints>
        {cyberFrames.map(({ cyberFrame }) => (
          <Ali
            className={classTrim(`
              adminCyberFrames__cyberframe-list__elt
            `)}
            key={cyberFrame._id}
          >
            <Atitle level={3}>{cyberFrame.title}</Atitle>
            <Button href={`/admin/cyberframe/${cyberFrame._id}`}>
              {t('adminCyberFrames.editCyberFrame', { ns: 'pages' })}
            </Button>
          </Ali>
        ))}
      </Aul>
    );
  }, [cyberFrames, t]);

  return (
    <div className="adminCyberFrames">
      <Atitle level={1}>{t('adminCyberFrames.title', { ns: 'pages' })}</Atitle>
      <div className="adminCyberFrames__content">
        <div className="adminCyberFrames__frames">
          <Atitle level={2}>{t('adminCyberFrames.list', { ns: 'pages' })}</Atitle>
          <div className="adminCyberFrames__frames__list">{cyberFramesList}</div>
          <Button href="/admin/cyberframe/new">
            {t('adminNewCyberFrame.title', { ns: 'pages' })}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminCyberFrames;
