import React, {
  useContext, useEffect, useMemo, useState, type FC, type ReactNode
} from 'react';

import {
  io, type Socket
} from 'socket.io-client';

import type { DefaultEventsMap } from 'socket.io/dist/typed-events';

interface ISocketContext {
  /** The socket event when something happens  */
  socket: Socket | null
  /** Is the socket ready  */
  loading: boolean
}

interface SocketProviderProps {
  /** The childrens of the Providers element */
  children: ReactNode
}

const SocketContext = React.createContext<ISocketContext | null>(null);

export const SocketProvider: FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const socketObj = io();
    setSocket(socketObj);
    setLoading(false);
  }, []);

  const providerValues = useMemo(
    () => ({
      socket,
      loading
    }),
    [socket, loading]
  );

  return <SocketContext.Provider value={providerValues}>{children}</SocketContext.Provider>;
};

export const useSocket = (): ISocketContext => useContext(SocketContext)!;
