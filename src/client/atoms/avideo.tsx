/* eslint-disable @typescript-eslint/no-unnecessary-condition -- There is only one type of video, for the moment */
import React from 'react';
import { useMemo, type FC } from 'react';

import LogoVideo from '../assets/videos/logo.webm';
import { Quark, type IQuarkProps } from '../quark';

import { classTrim } from '../utils';

import './avideo.scss';

type typeVideos = 'logo';

interface IAvideo {
  /** The type of icon */
  video: typeVideos;
  /** When the icon is clicked */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

const Avideo: FC<IQuarkProps<IAvideo>> = ({ video, className, onClick }) => {
  const classes = useMemo<string>(
    () =>
      classTrim(`
    avideo
    ${className ?? ''}
  `),
    [className]
  );

  const icoDom = useMemo(() => {
    switch (video) {
      case 'logo':
        return (
          <Quark
            quarkType="video"
            className={classes}
            src={LogoVideo}
            muted
            autoPlay
            loop
            disablePictureInPicture
          />
        );
    }
  }, [video, classes]);

  return icoDom;
};

export { Avideo, type IAvideo, type typeVideos };
