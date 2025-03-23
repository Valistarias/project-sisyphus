import React, { useCallback, useContext, useMemo, useRef, type FC, type ReactNode } from 'react';

import { Howl } from 'howler';

import ToneAudio from '../assets/audio/tone.mp3';

interface ISoundSystemContext {
  /** The main tone */
  tone: (rate?: number) => void;
  /** The main tone, with throttle */
  timedTone: (rate?: number) => void;
}

interface SoundSystemProviderProps {
  /** The childrens of the Providers element */
  children: ReactNode;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- To avoid null values
const SoundSystemContext = React.createContext<ISoundSystemContext>({} as ISoundSystemContext);

export const SoundSystemProvider: FC<SoundSystemProviderProps> = ({ children }) => {
  const timeoutPlayTone = useRef(true);

  const toneSound = useMemo<Howl>(
    () =>
      new Howl({
        src: [ToneAudio],
        volume: 0.1,
      }),
    []
  );

  const timedTone = useCallback(
    (rate = 1) => {
      if (timeoutPlayTone.current) {
        toneSound.rate(rate);
        toneSound.play();
        timeoutPlayTone.current = false;
        setTimeout(() => {
          timeoutPlayTone.current = true;
        }, 500);
      }
    },
    [toneSound]
  );

  const tone = useCallback(
    (rate = 1) => {
      toneSound.rate(rate);
      toneSound.play();
    },
    [toneSound]
  );

  const providerValues = useMemo(() => ({ tone, timedTone }), [tone, timedTone]);

  return (
    <SoundSystemContext.Provider value={providerValues}>{children}</SoundSystemContext.Provider>
  );
};

export const useSoundSystem = (): ISoundSystemContext => useContext(SoundSystemContext);
