import React, {
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type FC,
  type ReactNode
} from 'react';

import './systemAlerts.scss';

interface IAlert {
  /** The alert number on the list (id only resets on full refresh) */
  key: number
  /** Setting the user */
  dom: React.JSX.Element
}

interface ISystemAlertsContext {
  /** Delete an alert with the id "key" */
  deleteAlert: (req: { key: number }) => void
  /** Create an alert with the id "key" and the DOM */
  createAlert: (req: { key: number, dom: React.JSX.Element }) => void
  /** Get a fresh new ID */
  getNewId: () => number
}

interface SystemAlertsProviderProps {
  /** The childrens of the Providers element */
  children: ReactNode
}

const SystemAlertsContext = React.createContext<ISystemAlertsContext | null>(null);

export const SystemAlertsProvider: FC<SystemAlertsProviderProps> = ({ children }) => {
  const [alertsElts, setAlerts] = useState<IAlert[]>([]);
  const idToGive = useRef(0);

  const getNewId = useCallback(() => {
    const oldId = idToGive.current;
    idToGive.current = oldId + 1;

    return oldId;
  }, []);

  const createAlert = useCallback(({ key, dom }) => {
    setAlerts((prev) => {
      const next = [...prev];

      const foundAlertId = next.findIndex(alert => alert.key === key);

      if (foundAlertId === -1) {
        next.push({
          key,
          dom
        });
      }

      if (JSON.stringify(prev) === JSON.stringify(next)) {
        return prev;
      }

      return next;
    });
  }, []);

  const deleteAlert = useCallback(({ key }) => {
    setAlerts((prev) => {
      const next = [...prev];

      const foundAlertId = next.findIndex(alert => alert.key === key);

      if (foundAlertId !== -1) {
        next.splice(foundAlertId, 1);
      }

      if (JSON.stringify(prev) === JSON.stringify(next)) {
        return prev;
      }

      return next;
    });
  }, []);

  const providerValues = useMemo(
    () => ({
      deleteAlert,
      createAlert,
      getNewId
    }),
    [deleteAlert, createAlert, getNewId]
  );

  return (
    <SystemAlertsContext.Provider value={providerValues}>
      <div className="alerts">{alertsElts.map(window => window.dom)}</div>
      {children}
    </SystemAlertsContext.Provider>
  );
};

export const useSystemAlerts = (): ISystemAlertsContext => useContext(SystemAlertsContext)!;
