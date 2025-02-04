import React, { useCallback, useEffect, useMemo, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import { motion } from 'framer-motion';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { Ap } from '../../atoms';
import { Button, Input, SmartSelect } from '../../molecules';
import { RichTextElement, basicRichTextElementExtentions } from '../richTextElement';

import type { ICharacter } from '../../types';

import { classTrim } from '../../utils';

import './characterCreation.scss';

interface ICharacterCreationStep6 {
  /** When the user click send and the data is send perfectly */
  onSubmitIdentification: (elt: {
    firstName: string;
    lastName: string;
    nickName?: string;
    gender: string;
    pronouns?: string;
    bio?: string;
  }) => void;
}

interface FormValues {
  firstName: string;
  lastName: string;
  nickName: string;
  gender: string;
  pronouns: string;
}

const CharacterCreationStep6: FC<ICharacterCreationStep6> = ({ onSubmitIdentification }) => {
  const { t } = useTranslation();
  const { character } = useGlobalVars();

  const bioEditor = useEditor({ extensions: basicRichTextElementExtentions });

  const createDefaultData = useCallback((character: false | ICharacter | null) => {
    if (character === false || character === null) {
      return {};
    }
    const defaultData: Partial<FormValues> = {};

    return defaultData;
  }, []);

  const { handleSubmit, control, reset } = useForm<FormValues>({
    defaultValues: useMemo(() => createDefaultData(character), [createDefaultData, character]),
  });

  const genderRange = useMemo(
    () => [
      {
        value: 'M',
        label: t('terms.gender.male'),
      },
      {
        value: 'F',
        label: t('terms.gender.female'),
      },
      {
        value: 'N',
        label: t('terms.gender.neutral'),
      },
      {
        value: 'O',
        label: t('terms.gender.other'),
      },
    ],
    [t]
  );

  const onSaveIdentification: SubmitHandler<FormValues> = useCallback(
    ({ firstName, lastName, nickName, gender, pronouns }) => {
      if (bioEditor === null) {
        return;
      }
      let html: string | null = bioEditor.getHTML();
      if (html === '<p class="ap"></p>') {
        html = null;
      }

      onSubmitIdentification({
        firstName,
        lastName,
        nickName,
        gender,
        pronouns,
        bio: html ?? undefined,
      });
    },
    [bioEditor, onSubmitIdentification]
  );

  useEffect(() => {
    reset(createDefaultData(character));
  }, [character, reset, createDefaultData]);

  return (
    <motion.div
      className={classTrim(`
        characterCreation-step6
      `)}
      initial={{ transform: 'skew(90deg, 0deg) scale3d(.2, .2, .2)' }}
      animate={{
        transform: 'skew(0, 0) scale3d(1, 1, 1)',
        transitionEnd: { transform: 'none' },
      }}
      exit={{ transform: 'skew(-90deg, 0deg) scale3d(.2, .2, .2)' }}
      transition={{
        ease: 'easeInOut',
        duration: 0.2,
      }}
    >
      <Ap className="characterCreation-step6__text">
        {t('characterCreation.step6.text', { ns: 'components' })}
      </Ap>
      <Ap className="characterCreation-step6__sub">
        {t('characterCreation.step6.sub', { ns: 'components' })}
      </Ap>
      <form
        className="characterCreation-step6__form"
        onSubmit={(evt) => {
          void handleSubmit(onSaveIdentification)(evt);
        }}
        noValidate
      >
        <div className="characterCreation-step6__form__basics">
          <Input
            control={control}
            inputName="firstName"
            type="text"
            autoComplete="username"
            rules={{ required: t('firstName.required', { ns: 'fields' }) }}
            label={t('firstName.label', { ns: 'fields' })}
            className="characterCreation-step6__form__basics__elt"
          />
          <Input
            control={control}
            inputName="lastName"
            type="text"
            autoComplete="username"
            rules={{ required: t('lastName.required', { ns: 'fields' }) }}
            label={t('lastName.label', { ns: 'fields' })}
            className="characterCreation-step6__form__basics__elt"
          />
          <Input
            control={control}
            inputName="nickName"
            type="text"
            autoComplete="username"
            label={t('nickName.label', { ns: 'fields' })}
            className="characterCreation-step6__form__basics__elt"
          />
        </div>
        <div className="characterCreation-step6__form__core">
          <SmartSelect
            control={control}
            inputName="gender"
            label={t('gender.label', { ns: 'fields' })}
            rules={{ required: t('gender.required', { ns: 'fields' }) }}
            options={genderRange}
            className="characterCreation-step6__form__core__elt"
          />
          <Input
            control={control}
            inputName="pronouns"
            type="text"
            label={t('pronouns.label', { ns: 'fields' })}
            className="characterCreation-step6__form__basics__elt"
          />
        </div>
        <div className="adminNewBag__details">
          <RichTextElement
            label={t('bio.title', { ns: 'fields' })}
            editor={bioEditor}
            rawStringContent=""
            small
          />
        </div>
        <Button type="submit">{t('characterCreation.step6.next', { ns: 'components' })}</Button>
      </form>
    </motion.div>
  );
};

export default CharacterCreationStep6;
