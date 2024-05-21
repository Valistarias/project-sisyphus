import React, { type FC, type MouseEventHandler } from 'react';

interface IQuarkProps {
  /** The class of the element */
  className?: string;
  /** When the component is hovered in */
  onMouseEnter?: MouseEventHandler;
  /** When the component is hovered out */
  onMouseLeave?: MouseEventHandler;
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

const Quark: FC<IQuark> = ({
  className,
  onMouseEnter,
  onMouseLeave,
  style,
  quarkType,
  reactProps,
  ...rest
}) => {
  const QuarkComponent = quarkType;
  return (
    <QuarkComponent
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={style}
      {...reactProps}
      {...rest}
    />
  );
};

export { Quark, type IQuarkProps };
