/* eslint-disable @typescript-eslint/no-explicit-any -- Any used for controls, that are not typed in react hook form */
import type { Control } from 'react-hook-form';

export interface IReactHookFormInputs {
  /** The control element from React Hook Form */
  control: Control<any>;
  /** The rules dictating the necessary rules for the field to be valid */
  rules?: Record<string, unknown>;
  /** The name of the controled element */
  inputName: string;
}
