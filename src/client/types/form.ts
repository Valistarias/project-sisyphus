import { type Control, type FieldValues } from 'react-hook-form';

export interface IReactHookFormInputs {
  /** The control element from React Hook Form */
  control: Control<FieldValues, any>;
  /** The rules dictating the necessary rules for the field to be valid */
  rules?: Record<string, any>;
  /** The name of the controled element */
  inputName: string;
}
