import React, { type FC } from 'react';

interface IQuarkProps {
  /** The class of the element */
  className?: string;
  /** The style defined for the element */
  style?: React.CSSProperties;
  /** The react props that need to be set to the smallest defined element */
  reactProps?: Record<string, unknown>;
  /** Everything else */
  [prop: string]: unknown;
}

interface IQuark extends IQuarkProps {
  /** The type of the element */
  quarkType: React.ElementType;
  /** Everything else */
  [prop: string]: unknown;
}

const Quark: FC<IQuark> = ({ className, style, quarkType, reactProps, ...rest }) => {
  const QuarkComponent = quarkType;
  return <QuarkComponent className={className} style={style} {...reactProps} {...rest} />;
};

export { Quark, type IQuarkProps };
