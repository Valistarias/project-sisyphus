import React, { type FC, useMemo } from 'react';

import { classTrim } from '../utils';

import './atitle.scss';

interface IAtitle {
  /** The class of the title */
  level?: number;
  /** The class of the P element */
  className?: string;
  /** The childrens of the P element */
  children: React.JSX.Element | string | string[];
}

const Atitle: FC<IAtitle> = ({ className, children, level = 1 }) => {
  const classes = useMemo(
    () =>
      classTrim(`
    atitle
    atitle--h${level}
    ${className ?? ''}
  `),
    [className, level]
  );

  const titleDom = useMemo(() => {
    switch (level) {
      case 2:
        return <h2 className={classes}>{children}</h2>;
      case 3:
        return <h3 className={classes}>{children}</h3>;
      case 4:
        return <h4 className={classes}>{children}</h4>;
      default:
        return <h1 className={classes}>{children}</h1>;
    }
  }, [level, classes, children]);

  return titleDom;
};

export default Atitle;
