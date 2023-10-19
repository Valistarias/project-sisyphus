import React, { type FC } from 'react';

import { useSystemAlerts } from '../providers/systemAlerts';

import './headerBar.scss';

interface IAlert {
  /** The ID used on the alert provider */
  id: number
  /** The content of the alert */
  children: React.JSX.Element
}

const Alert: FC<IAlert> = ({ id, children }) => {
  const {
    deleteAlert
  } = useSystemAlerts();
  return (
    <div className="alert">
      {children}
    </div>
  );
};

export default Alert;
