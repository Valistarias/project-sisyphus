import React, { type MouseEventHandler } from 'react';

type IQuarkProps<T> = {
  /** The class of the element */
  className?: string
  /** When the component is hovered in */
  onMouseEnter?: MouseEventHandler
  /** When the component is hovered out */
  onMouseLeave?: MouseEventHandler
  /** When the component is focused in */
  onFocus?: MouseEventHandler
  /** When the component is focused out */
  onBlur?: MouseEventHandler
  /** The style defined for the element */
  style?: React.CSSProperties
  /** The react props that need to be set to the smallest defined element */
  reactProps?: Record<string, unknown>
} & T;

interface IQuarkInherit {
  /** The type of the element */
  quarkType: React.ElementType
}

function Quark<InheritedProps>({
  className, onMouseEnter, onMouseLeave, style, quarkType, reactProps, ...rest
}: IQuarkProps<InheritedProps> & IQuarkInherit): React.ReactNode {
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
}

Quark.displayName = 'Quark';

export {
  Quark, type IQuarkProps
};
