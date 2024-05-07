import React, { useMemo, type FC, type ReactNode } from 'react';

import { type FieldValues, type SubmitHandler } from 'react-hook-form';

import { useGlobalVars } from '../../providers';

import { Atitle } from '../../atoms';

interface ICharacterCreationStep1 {
  /** When the user click send and the data is send perfectly */
  onCreaftionStepFinished: SubmitHandler<FieldValues>;
}

interface FormValues {
  cyberFrameId: string;
}

const CharacterCreationStep1: FC<ICharacterCreationStep1> = ({ onCreaftionStepFinished }) => {
  const { cyberFrames } = useGlobalVars();

  const cyberFrameList = useMemo(() => {
    const cFrameElts: ReactNode[] = [];
    cyberFrames.forEach((cyberFrameElt) => {
      const { cyberFrame } = cyberFrameElt;

      cFrameElts.push(
        <div key={cyberFrame._id} className="characterCreation-step1__cFrame">
          <Atitle>{cyberFrame.title}</Atitle>
        </div>
      );
    });
    return cFrameElts;
  }, [cyberFrames]);

  return <div className="characterCreation-step1">{cyberFrameList}</div>;
};

export default CharacterCreationStep1;
