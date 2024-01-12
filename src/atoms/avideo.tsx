import React, { useMemo, type FC } from 'react';

import LogoVideo from '../assets/videos/logo.webm';

import { classTrim } from '../utils';

import './avideo.scss';

type typeVideos = 'logo';

interface IAvideo {
  /** The type of icon */
  video: typeVideos;
  /** The class of the Icon element */
  className?: string;
  /** When the icon is clicked */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

const Avideo: FC<IAvideo> = ({ video, className, onClick }) => {
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
          <video className={classes} src={LogoVideo} muted autoPlay loop disablePictureInPicture />
        );
      default:
        return <video className={classes} src={LogoVideo} />;
    }
  }, [video, classes]);

  return icoDom;
};

export { Avideo, type IAvideo, type typeVideos };
