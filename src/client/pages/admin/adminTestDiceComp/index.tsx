import React, { useCallback, useMemo, useState, type FC } from 'react';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Atitle } from '../../../atoms';
import { Button, Input } from '../../../molecules';

import { regexDiceFormula } from '../../../utils';

import './adminTestDiceComp.scss';

interface FormValues {
  diceFormula: string;
}

const AdminTestDiceComp: FC = () => {
  const { t } = useTranslation();
  const { control, handleSubmit } = useForm();

  const [formula, setFormula] = useState<string | null>(null);

  const formulaScores = useMemo(() => {
    if (formula === null) {
      return null;
    }
    const scores: Record<
      string,
      | {
          // rolls: number[][];
          count: number;
          thisP?: number;
          orMoreP?: number;
          orLessP?: number;
        }
      | undefined
    > = {};
    const increments: number[] = [];
    const [diceNumber, valueDice] = formula.split('d').map((val) => Number(val));
    const variations = Math.pow(valueDice, diceNumber);
    for (let i = 0; i < diceNumber; i++) {
      increments.push(Math.pow(valueDice, i));
    }

    // Establishing base array
    for (let y = 0; y < variations; y++) {
      const diceVal: number[] = [];
      let total = 0;
      increments.forEach((increment) => {
        const singleDieVal = (Math.trunc(y / increment) % valueDice) + 1;
        diceVal.push(singleDieVal);
        total += singleDieVal;
      });
      scores[total] = {
        // rolls: [diceVal],
        count: (scores[total]?.count ?? 0) + 1,
      };
    }

    let orLessCount = 0;
    let orMoreCount = variations;

    const cleanScores: Record<
      string,
      {
        // rolls: number[][];
        count: number;
        thisP?: number;
        orMoreP?: number;
        orLessP?: number;
      }
    > = {};
    Object.keys(scores).forEach((scoreId) => {
      if (scores[scoreId] !== undefined) {
        cleanScores[scoreId] = scores[scoreId];
      }
    });

    const possibleScores = Object.keys(cleanScores);

    // Probabilities
    possibleScores.forEach((possibleScore) => {
      const score = cleanScores[possibleScore].count;
      cleanScores[possibleScore].thisP = Math.round((score / variations) * 10000) / 100;

      orLessCount += score;
      cleanScores[possibleScore].orLessP = Math.round((orLessCount / variations) * 10000) / 100;
      cleanScores[possibleScore].orMoreP = Math.round((orMoreCount / variations) * 10000) / 100;
      orMoreCount -= score;
    });

    return (
      <table className="adminTestDiceComp__table">
        <caption>
          {t('adminTestDiceComp.caption', {
            ns: 'pages',
            formula,
            variations,
          })}
        </caption>
        <thead>
          <tr>
            <th scope="col">{t('adminTestDiceComp.score', { ns: 'pages' })}</th>
            {/* <th scope="col">Possible Throws</th> */}
            <th scope="col">{t('adminTestDiceComp.count', { ns: 'pages' })}</th>
            <th scope="col">{t('adminTestDiceComp.this', { ns: 'pages' })}</th>
            <th scope="col">{t('adminTestDiceComp.orMore', { ns: 'pages' })}</th>
            <th scope="col">{t('adminTestDiceComp.orLess', { ns: 'pages' })}</th>
          </tr>
        </thead>
        <tbody>
          {possibleScores.map((possibleScore, index) => {
            const { count, thisP, orMoreP, orLessP } = cleanScores[possibleScore];

            return (
              <tr key={index}>
                <th scope="row">{possibleScore}</th>
                {/* <td>{JSON.stringify(rolls)}</td> */}
                <td>{count}</td>
                <td>{`${thisP}%`}</td>
                <td>{`${orMoreP}%`}</td>
                <td>{`${orLessP}%`}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }, [formula, t]);

  const onSubmit: SubmitHandler<FormValues> = useCallback(({ diceFormula }) => {
    setFormula(diceFormula);
  }, []);

  return (
    <div className="adminTestDiceComp">
      <Atitle level={1}>{t('adminTestDiceComp.title', { ns: 'pages' })}</Atitle>
      <form
        className="adminTestDiceComp__form"
        onSubmit={(evt) => {
          void handleSubmit(onSubmit)(evt);
        }}
        noValidate
      >
        <Input
          control={control}
          inputName="diceFormula"
          type="text"
          rules={{
            required: t('diceFormula.required', { ns: 'fields' }),
            pattern: {
              value: regexDiceFormula,
              message: t('diceFormula.pattern', { ns: 'fields' }),
            },
          }}
          label={t('diceFormula.label', { ns: 'fields' })}
        />
        <Button type="submit">{t('adminTestDiceComp.formCTA', { ns: 'pages' })}</Button>
      </form>
      {formula != null ? (
        <div className="adminTestDiceComp__formula-results">{formulaScores}</div>
      ) : null}
    </div>
  );
};

export default AdminTestDiceComp;
