import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FC,
  type ReactNode,
} from 'react';

import { useTranslation } from 'react-i18next';

import { Ap, Atitle } from '../atoms';
import { Button } from '../molecules';

import { classTrim } from '../utils';

import './confirmMessage.scss';

interface IConfirmContent {
  /** The title to be displayed on the window */
  title: string;
  /** The text inside the confirm element */
  text: string;
  /** The text inside the confirm button */
  confirmCta?: string;
  /** The theme of tyhe confirm content */
  theme?: 'error' | 'info';
  /** Did the confirm need some strong verification
   * (as in "write DELETE to confirm") */
  strong?: boolean;
}

interface IConfirmMessageContext {
  /** The event system linked to the confirm popup */
  ConfMessageEvent: {
    addEventListener: (id: string, cb: (data: any) => void) => void;
    removeEventListener: (id: string, cb: (data: any) => void) => void;
    dispatchEvent: (evt: Event) => void;
  };
  /** The function to send all the data to the confirm message element */
  setConfirmContent: (res: IConfirmContent, cb: (evtId: string) => void) => void;
}

interface ConfirmMessageProviderProps {
  /** The childrens of the Providers element */
  children: ReactNode;
}

const ConfirmMessageContext = React.createContext<IConfirmMessageContext | null>(null);

function Emitter(): void {
  const eventTarget = document.createDocumentFragment();

  function delegate(method: string): void {
    this[method] = eventTarget[method].bind(eventTarget);
  }

  Emitter.methods.forEach(delegate, this);
}

function ConfMessageEventEmitter(): void {
  Emitter.call(this);
}

Emitter.methods = ['addEventListener', 'dispatchEvent', 'removeEventListener'];

export const ConfirmMessageProvider: FC<ConfirmMessageProviderProps> = ({ children }) => {
  const { t } = useTranslation();
  const ConfMessageEvent = useMemo(() => new ConfMessageEventEmitter(), []);

  const [idEvt, setIdEvt] = useState('');

  const [confirmData, setConfirmData] = useState<IConfirmContent | null>(null);
  const [isWindowOpened, setWindowOpened] = useState<boolean>(false);

  const onConfirmAction = useCallback(() => {
    if (idEvt !== '') {
      ConfMessageEvent.dispatchEvent(
        new CustomEvent(idEvt, {
          detail: {
            proceed: true,
          },
        })
      );
      setWindowOpened(false);
    }
  }, [ConfMessageEvent, idEvt]);

  const onAbort = useCallback(() => {
    if (idEvt !== '') {
      ConfMessageEvent.dispatchEvent(
        new CustomEvent(idEvt, {
          detail: {
            proceed: false,
          },
        })
      );
      setWindowOpened(false);
    }
  }, [ConfMessageEvent, idEvt]);

  const setConfirmContent = useCallback((elts: IConfirmContent, cb: (evtId: string) => void) => {
    setConfirmData(elts);
    const eventId = Date.now();
    cb(String(eventId));
    setIdEvt(String(eventId));
  }, []);

  const providerValues = useMemo(
    () => ({
      setConfirmContent,
      ConfMessageEvent,
    }),
    [setConfirmContent, ConfMessageEvent]
  );

  useEffect(() => {
    if (idEvt !== '') {
      setWindowOpened(true);
    }
  }, [idEvt]);

  return (
    <ConfirmMessageContext.Provider value={providerValues}>
      <div
        className={classTrim(`
          confirm-message
            ${isWindowOpened ? 'confirm-message--open' : ''}
          `)}
      >
        <div className="confirm-message__shadow" onClick={onAbort} />
        <div className="confirm-message__window">
          <Atitle>{confirmData?.title ?? ''}</Atitle>
          <Ap>{confirmData?.text ?? ''}</Ap>
          <div className="confirm-message__window__buttons">
            <Button
              color={confirmData?.theme === 'error' ? 'error' : 'primary'}
              onClick={onConfirmAction}
            >
              {confirmData?.confirmCta ?? 'Confirm'}
            </Button>
            <Button theme="text-only" onClick={onAbort}>
              {t('terms.general.abort')}
            </Button>
          </div>
        </div>
      </div>
      {children}
    </ConfirmMessageContext.Provider>
  );
};

export const useConfirmMessage = (): IConfirmMessageContext => {
  return useContext(ConfirmMessageContext) as IConfirmMessageContext;
};
