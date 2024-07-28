import React, { forwardRef, type MouseEventHandler } from 'react';

interface IQuarkProps {
  /** The class of the element */
  className?: string;
  /** When the component is hovered in */
  onMouseEnter?: MouseEventHandler;
  /** When the component is hovered out */
  onMouseLeave?: MouseEventHandler;
  /** When the component is focused in */
  onFocus?: MouseEventHandler;
  /** When the component is focused out */
  onBlur?: MouseEventHandler;
  /** The style defined for the element */
  style?: React.CSSProperties;
  /** The react props that need to be set to the smallest defined element */
  reactProps?: Record<string, unknown>;
}

interface IQuark extends IQuarkProps {
  /** The type of the element */
  quarkType: React.ElementType;
  /** Everything else */
  [rest: string]: unknown;
}

const Quark = forwardRef<HTMLElement, IQuark>(
  ({ className, onMouseEnter, onMouseLeave, style, quarkType, reactProps, ...rest }, ref) => {
    const QuarkComponent = quarkType;
    return (
      <QuarkComponent
        ref={ref}
        className={className}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={style}
        {...reactProps}
        {...rest}
      />
    );
  }
);

Quark.displayName = 'Quark';

export { Quark, type IQuarkProps };
