import React, { type FC, useState, useEffect, useRef, useMemo, useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import { useSystemAlerts } from '../providers/systemAlerts';

import { Button } from '../molecules';

import { classTrim } from '../utils';

import './headerBar.scss';

interface IAlert {
  /** The ID used on the alert provider */
  id: number
  /** The content of the alert */
  children: React.JSX.Element
  /** If the timer is provided, the alert will close automatically after the timer (in seconds) */
  timer?: number
  /** Is the alert self closable */
  closable?: boolean
}

const Alert: FC<IAlert> = ({ id, children, timer, closable }) => {
  const {
    deleteAlert
  } = useSystemAlerts();

  const { t } = useTranslation();

  const [closing, setClosing] = useState(false);
  const [isAlertVisible, setAlertVisible] = useState(false);

  const timerCountdown = useRef<NodeJS.Timeout | null>(null);
  const timerDelete = useRef<NodeJS.Timeout | null>(null);

  const onCloseAlert = useCallback(() => {
    setClosing(true);
    if (timerCountdown.current !== null) {
      clearTimeout(timerCountdown.current);
    }
    timerDelete.current = setTimeout(() => {
      deleteAlert({ key: id });
    }, 1000);
  }, [deleteAlert, id]);

  const closeDom = useMemo(() => closable === true
    ? (
      <Button
        onClick={onCloseAlert}
      >
        {t('alert.close', { ns: 'components' })}
      </Button>
      )
    : null, [closable, onCloseAlert, t]);

  useEffect(
    () => {
      setTimeout(() => {
        setAlertVisible(true);
      }, 100);

      if (timer !== undefined) {
        timerCountdown.current = setTimeout(() => {
          setClosing(true);
          timerDelete.current = setTimeout(() => {
            deleteAlert({ key: id });
          }, 1000);
        }, timer * 1000);
      }
      return () => {
        if (timerDelete.current !== null) {
          clearTimeout(timerDelete.current);
        }

        if (timerCountdown.current !== null) {
          clearTimeout(timerCountdown.current);
        }
      };
    },
    [timer, deleteAlert, id]
  );

  return (
    <div
      className={
        classTrim(`
          alert
          ${!isAlertVisible ? ' alert--close' : ''}
          ${closing ? ' alert--closing' : ''}
        `)
      }
    >
      {children}
      {closeDom}
    </div>
  );
};

export default Alert;
