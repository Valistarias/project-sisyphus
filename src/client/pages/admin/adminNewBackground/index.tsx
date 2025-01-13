import React, { useCallback, useMemo, useRef, useState, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useApi, useGlobalVars, useSystemAlerts } from '../../../providers';

import { Aerror, Ap, Atitle } from '../../../atoms';
import { Button, Input, SmartSelect } from '../../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../../organisms';

import { classTrim, isThereDuplicate } from '../../../utils';

import './adminNewBackground.scss';

interface FormValues {
  name: string;
  nameFr: string;
  skillBonuses?: Record<
    string,
    {
      skill: string;
      value: number;
    }
  >;
  statBonuses?: Record<
    string,
    {
      stat: string;
      value: number;
    }
  >;
  charParamBonuses?: Record<
    string,
    {
      charParam: string;
      value: number;
    }
  >;
}

const AdminNewBackground: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const navigate = useNavigate();
  const { createAlert, getNewId } = useSystemAlerts();
  const { skills, stats, charParams } = useGlobalVars();

  const [displayInt, setDisplayInt] = useState(false);

  // General elements, for bonuses
  const skillSelect = useMemo(
    () =>
      skills.map(({ skill }) => ({
        value: skill._id,
        // TODO : Handle Internationalization
        label: skill.title,
      })),
    [skills]
  );
  const [skillBonusIds, setSkillBonusIds] = useState<number[]>([]);
  const idIncrement = useRef(0);

  const statSelect = useMemo(
    () =>
      stats.map(({ stat }) => ({
        value: stat._id,
        // TODO : Handle Internationalization
        label: stat.title,
      })),
    [stats]
  );
  const [statBonusIds, setStatBonusIds] = useState<number[]>([]);

  const charParamSelect = useMemo(
    () =>
      charParams.map(({ charParam }) => ({
        value: charParam._id,
        // TODO : Handle Internationalization
        label: charParam.title,
      })),
    [charParams]
  );
  const [charParamBonusIds, setCharParamBonusIds] = useState<number[]>([]);

  const introEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const introFrEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const {
    handleSubmit,
    setError,
    unregister,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      icon: 'default',
    },
  });

  const onAddSkillBonus = useCallback(() => {
    setSkillBonusIds((prev) => {
      const next = [...prev];
      next.push(idIncrement.current);
      idIncrement.current += 1;
      return next;
    });
  }, []);

  const onAddStatBonus = useCallback(() => {
    setStatBonusIds((prev) => {
      const next = [...prev];
      next.push(idIncrement.current);
      idIncrement.current += 1;
      return next;
    });
  }, []);

  const onAddCharParamBonus = useCallback(() => {
    setCharParamBonusIds((prev) => {
      const next = [...prev];
      next.push(idIncrement.current);
      idIncrement.current += 1;
      return next;
    });
  }, []);

  const onSaveBackground: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr, ...elts }) => {
      if (introEditor === null || introFrEditor === null || api === undefined) {
        return;
      }

      // Check duplicate on skills
      const skillBonuses = elts.skillBonuses !== undefined ? Object.values(elts.skillBonuses) : [];
      let duplicateSkillBonuses = false;
      if (skillBonuses.length > 0) {
        duplicateSkillBonuses = isThereDuplicate(
          skillBonuses.map((skillBonus) => skillBonus.skill)
        );
      }
      if (duplicateSkillBonuses) {
        setError('root.serverError', {
          type: 'duplicate',
          message: t('adminNewBackground.errorDuplicateSkill', { ns: 'pages' }),
        });
        return;
      }

      // Check duplicate on stats
      const statBonuses = elts.statBonuses !== undefined ? Object.values(elts.statBonuses) : [];
      let duplicateStatBonuses = false;
      if (statBonuses.length > 0) {
        duplicateStatBonuses = isThereDuplicate(statBonuses.map((statBonus) => statBonus.stat));
      }
      if (duplicateStatBonuses) {
        setError('root.serverError', {
          type: 'duplicate',
          message: t('adminNewBackground.errorDuplicateStat', { ns: 'pages' }),
        });
        return;
      }

      // Check duplicate on character param
      const charParamBonuses =
        elts.charParamBonuses !== undefined ? Object.values(elts.charParamBonuses) : [];
      let duplicateCharParamBonuses = false;
      if (charParamBonuses.length > 0) {
        duplicateCharParamBonuses = isThereDuplicate(
          charParamBonuses.map((charParamBonus) => charParamBonus.charParam)
        );
      }
      if (duplicateCharParamBonuses) {
        setError('root.serverError', {
          type: 'duplicate',
          message: t('adminNewBackground.errorDuplicateCharParam', { ns: 'pages' }),
        });
        return;
      }

      const curatedSkillBonuses = skillBonuses.map(({ skill, value }) => ({
        skill,
        value: Number(value),
      }));
      const curatedStatBonuses = statBonuses.map(({ stat, value }) => ({
        stat,
        value: Number(value),
      }));
      const curatedCharParamBonuses = charParamBonuses.map(({ charParam, value }) => ({
        charParam,
        value: Number(value),
      }));

      let html: string | null = introEditor.getHTML();
      const htmlFr = introFrEditor.getHTML();
      if (html === '<p class="ap"></p>') {
        html = null;
      }

      let i18n: any | null = null;

      if (nameFr !== '' || htmlFr !== '<p class="ap"></p>') {
        i18n = {
          fr: {
            title: nameFr,
            summary: htmlFr,
          },
        };
      }

      api.backgrounds
        .create({
          title: name,
          summary: html,
          i18n,
          skillBonuses: curatedSkillBonuses,
          statBonuses: curatedStatBonuses,
          charParamBonuses: curatedCharParamBonuses,
        })
        .then((quote) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminNewBackground.successCreate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
          void navigate(`/admin/background/${quote._id}`);
        })
        .catch(({ response }) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.quoteType.${data.sent}`), 'capitalize'),
              }),
            });
          } else {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.quoteType.${data.sent}`), 'capitalize'),
              }),
            });
          }
        });
    },
    [introEditor, introFrEditor, api, setError, t, getNewId, createAlert, navigate]
  );

  return (
    <div
      className={classTrim(`
        adminNewBackground
        ${displayInt ? 'adminNewBackground--int-visible' : ''}
      `)}
    >
      <form
        className="adminNewBackground__content"
        onSubmit={handleSubmit(onSaveBackground)}
        noValidate
      >
        <Atitle className="adminNewBackground__head" level={1}>
          {t('adminNewBackground.title', { ns: 'pages' })}
        </Atitle>
        {errors.root?.serverError.message !== undefined ? (
          <Aerror>{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminNewBackground__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{
              required: t('nameBackground.required', { ns: 'fields' }),
            }}
            label={t('nameBackground.label', { ns: 'fields' })}
            className="adminNewBackground__basics__name"
          />
        </div>
        <div className="adminNewBackground__details">
          <RichTextElement
            label={t('backgroundSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent={''}
            small
            complete
          />
        </div>
        <Atitle className="adminNewBackground__bonus-title" level={2}>
          {t('adminNewBackground.values', { ns: 'pages' })}
        </Atitle>
        <div className="adminNewBackground__bonuses">
          <div className="adminNewBackground__bonuses__elts">
            {skillBonusIds.map((skillBonusId) => (
              <div className="adminNewBackground__bonus" key={`skill-${skillBonusId}`}>
                <Atitle className="adminNewBackground__bonus__title" level={4}>
                  {t('adminNewBackground.skillBonusTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminNewBackground__bonus__fields">
                  <SmartSelect
                    control={control}
                    inputName={`skillBonuses.skill-${skillBonusId}.skill`}
                    rules={{
                      required: t('skillBonusSkill.required', { ns: 'fields' }),
                    }}
                    label={t('skillBonusSkill.label', { ns: 'fields' })}
                    options={skillSelect}
                    className="adminNewBackground__bonus__select"
                  />
                  <Input
                    control={control}
                    inputName={`skillBonuses.skill-${skillBonusId}.value`}
                    type="number"
                    rules={{
                      required: t('skillBonusValue.required', { ns: 'fields' }),
                    }}
                    label={t('skillBonusValue.label', { ns: 'fields' })}
                    className="adminNewBackground__bonus__value"
                  />
                </div>
                <Button
                  icon="Delete"
                  theme="afterglow"
                  onClick={() => {
                    setSkillBonusIds((prev) =>
                      prev.reduce((result: number[], elt) => {
                        if (elt !== skillBonusId) {
                          result.push(elt);
                        }
                        return result;
                      }, [])
                    );
                    unregister(`skillBonuses.skill-${skillBonusId}`);
                  }}
                  className="adminNewBackground__bonus__button"
                />
              </div>
            ))}
            {statBonusIds.map((statBonusId) => (
              <div className="adminNewBackground__bonus" key={`stat-${statBonusId}`}>
                <Atitle className="adminNewBackground__bonus__title" level={4}>
                  {t('adminNewBackground.statBonusTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminNewBackground__bonus__fields">
                  <SmartSelect
                    control={control}
                    inputName={`statBonuses.stat-${statBonusId}.stat`}
                    rules={{
                      required: t('statBonusStat.required', { ns: 'fields' }),
                    }}
                    label={t('statBonusStat.label', { ns: 'fields' })}
                    options={statSelect}
                    className="adminNewBackground__bonus__select"
                  />
                  <Input
                    control={control}
                    inputName={`statBonuses.stat-${statBonusId}.value`}
                    type="number"
                    rules={{
                      required: t('statBonusValue.required', { ns: 'fields' }),
                    }}
                    label={t('statBonusValue.label', { ns: 'fields' })}
                    className="adminNewBackground__bonus__value"
                  />
                </div>
                <Button
                  icon="Delete"
                  theme="afterglow"
                  onClick={() => {
                    setStatBonusIds((prev) =>
                      prev.reduce((result: number[], elt) => {
                        if (elt !== statBonusId) {
                          result.push(elt);
                        }
                        return result;
                      }, [])
                    );
                    unregister(`statBonuses.stat-${statBonusId}`);
                  }}
                  className="adminNewBackground__bonus__button"
                />
              </div>
            ))}
            {charParamBonusIds.map((charParamBonusId) => (
              <div className="adminNewBackground__bonus" key={`charParam-${charParamBonusId}`}>
                <Atitle className="adminNewBackground__bonus__title" level={4}>
                  {t('adminNewBackground.charParamBonusTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminNewBackground__bonus__fields">
                  <SmartSelect
                    control={control}
                    inputName={`charParamBonuses.charParam-${charParamBonusId}.charParam`}
                    rules={{
                      required: t('charParamBonusStat.required', { ns: 'fields' }),
                    }}
                    label={t('charParamBonusStat.label', { ns: 'fields' })}
                    options={charParamSelect}
                    className="adminNewBackground__bonus__select"
                  />
                  <Input
                    control={control}
                    inputName={`charParamBonuses.charParam-${charParamBonusId}.value`}
                    type="number"
                    rules={{
                      required: t('charParamBonusValue.required', { ns: 'fields' }),
                    }}
                    label={t('charParamBonusValue.label', { ns: 'fields' })}
                    className="adminNewBackground__bonus__value"
                  />
                </div>
                <Button
                  icon="Delete"
                  theme="afterglow"
                  onClick={() => {
                    setCharParamBonusIds((prev) =>
                      prev.reduce((result: number[], elt) => {
                        if (elt !== charParamBonusId) {
                          result.push(elt);
                        }
                        return result;
                      }, [])
                    );
                    unregister(`charParamBonuses.charParam-${charParamBonusId}`);
                  }}
                  className="adminNewBackground__bonus__button"
                />
              </div>
            ))}
          </div>
          <div className="adminNewBackground__bonuses__buttons">
            <Button onClick={onAddSkillBonus}>
              {t('adminNewBackground.createSkillBonusButton', { ns: 'pages' })}
            </Button>
            <Button onClick={onAddStatBonus}>
              {t('adminNewBackground.createStatBonusButton', { ns: 'pages' })}
            </Button>
            <Button onClick={onAddCharParamBonus}>
              {t('adminNewBackground.createCharParamBonusButton', { ns: 'pages' })}
            </Button>
          </div>
        </div>
        <div className="adminNewBackground__intl-title">
          <div className="adminNewBackground__intl-title__content">
            <Atitle className="adminNewBackground__intl-title__title" level={2}>
              {t('adminNewBackground.i18n', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminNewBackground__intl-title__info">
              {t('adminNewBackground.i18nInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <Button
            icon="Arrow"
            theme="afterglow"
            onClick={() => {
              setDisplayInt((prev) => !prev);
            }}
            className="adminNewBackground__intl-title__btn"
          />
        </div>
        <div className="adminNewBackground__intl">
          <div className="adminNewBackground__basics">
            <Input
              control={control}
              inputName="nameFr"
              type="text"
              label={`${t('nameBackground.label', { ns: 'fields' })} (FR)`}
              className="adminNewBackground__basics__name"
            />
          </div>
          <div className="adminNewBackground__details">
            <RichTextElement
              label={`${t('backgroundSummary.title', { ns: 'fields' })} (FR)`}
              editor={introFrEditor}
              rawStringContent={''}
              small
              complete
            />
          </div>
        </div>
        <Button type="submit">{t('adminNewBackground.createButton', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewBackground;
