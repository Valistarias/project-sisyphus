import React, { type FC } from 'react';

interface IQuarkProps {
  /** The class of the element */
  className?: string;
  /** The style defined for the element */
  style?: React.CSSProperties;
  /** Everything else */
  [prop: string]: unknown;
}

interface IQuark extends IQuarkProps {
  /** The type of the element */
  quarkType: React.ElementType;
  /** Everything else */
  [prop: string]: unknown;
}

const Quark: FC<IQuark> = ({ className, quarkType, ...rest }) => {
  const QuarkComponent = quarkType;
  return <QuarkComponent className={className} {...rest} />;
};

export { Quark, type IQuarkProps };
