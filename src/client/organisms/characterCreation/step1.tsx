import React, { type FC } from 'react';

import { type FieldValues, type SubmitHandler } from 'react-hook-form';

import { useGlobalVars } from '../../providers';

import { Ap } from '../../atoms';

interface ICharacterCreationStep1 {
  /** When the user click send and the data is send perfectly */
  onCreaftionStepFinished: SubmitHandler<FieldValues>;
}

interface FormValues {
  cyberFrameId: string;
}

const CharacterCreationStep1: FC<ICharacterCreationStep1> = ({ onCreaftionStepFinished }) => {
  const { cyberFrames } = useGlobalVars();

  console.log('cyberFrames', cyberFrames);

  return (
    <div className="characterCreation-step1">
      <Ap>Henlo</Ap>
    </div>
  );
};

export default CharacterCreationStep1;
