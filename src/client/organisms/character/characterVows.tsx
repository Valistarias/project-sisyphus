import React, { useMemo, type FC } from 'react';

import { useGlobalVars } from '../../providers';

import { Ali, AnodeIcon, Atitle, Aul } from '../../atoms';

import type { ICuratedClergy } from '../../types';
import type { TypeNodeIcons } from '../../types/rules';

import { classTrim } from '../../utils';

import './characterVows.scss';

const CharacterVows: FC = () => {
  const { character, clergies } = useGlobalVars();

  const correlatedClergy = useMemo<ICuratedClergy | null>(() => {
    if (
      character === null ||
      character === false ||
      character.vows === undefined ||
      character.vows.length === 0 ||
      clergies.length === 0
    ) {
      return null;
    }

    const foundClergy = clergies.find(
      (clergy) => clergy.clergy._id === character.vows![0].vow.clergy
    );

    if (foundClergy === undefined) {
      return null;
    }

    return foundClergy;
  }, [character, clergies]);

  return (
    <div
      className={classTrim(`
      char-vows
    `)}
    >
      {correlatedClergy !== null ? (
        <>
          <Atitle className="char-vows__title" level={4}>
            {correlatedClergy.clergy.title}
          </Atitle>
          <AnodeIcon
            className="char-vows__icon"
            type={correlatedClergy.clergy.icon as TypeNodeIcons}
          />
        </>
      ) : null}

      <Aul noPoints className="char-vows__list">
        {character !== null && character !== false && character.vows !== undefined
          ? character.vows.map((vow) => (
              <Ali className="char-vows__list__vow" key={vow.vow._id}>
                {vow.vow.title}
              </Ali>
            ))
          : null}
      </Aul>
    </div>
  );
};

export default CharacterVows;
