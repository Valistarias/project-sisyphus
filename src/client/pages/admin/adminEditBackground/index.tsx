import React, {
  useCallback, useEffect, useMemo, useRef, useState, type FC
} from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import {
  useForm, type SubmitHandler
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  useNavigate, useParams
} from 'react-router-dom';

import {
  useApi, useConfirmMessage, useGlobalVars, useSystemAlerts
} from '../../../providers';

import {
  Aerror, Ap, Atitle
} from '../../../atoms';
import {
  Button, Input, SmartSelect
} from '../../../molecules';
import {
  Alert, RichTextElement, completeRichTextElementExtentions
} from '../../../organisms';

import type { ICuratedBackground } from '../../../types';

import {
  classTrim, isThereDuplicate
} from '../../../utils';

import './adminEditBackground.scss';

interface FormValues {
  name: string
  nameFr: string
  skillBonuses?: Record<
    string,
    {
      skill: string
      value: number
    }
  >
  statBonuses?: Record<
    string,
    {
      stat: string
      value: number
    }
  >
  charParamBonuses?: Record<
    string,
    {
      charParam: string
      value: number
    }
  >
}

const AdminEditBackground: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { id } = useParams();
  const {
    setConfirmContent,
    removeConfirmEventListener,
    addConfirmEventListener
  } = useConfirmMessage();
  const {
    skills, stats, charParams
  } = useGlobalVars();
  const {
    createAlert, getNewId
  } = useSystemAlerts();
  const navigate = useNavigate();

  const [displayInt, setDisplayInt] = useState(false);

  // General elements, for bonuses
  const skillSelect = useMemo(
    () =>
      skills.map(({ skill }) => ({
        value: skill._id,
        // TODO : Handle Internationalization
        label: skill.title
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
        label: stat.title
      })),
    [stats]
  );
  const [statBonusIds, setStatBonusIds] = useState<number[]>([]);

  const charParamSelect = useMemo(
    () =>
      charParams.map(({ charParam }) => ({
        value: charParam._id,
        // TODO : Handle Internationalization
        label: charParam.title
      })),
    [charParams]
  );
  const [charParamBonusIds, setCharParamBonusIds] = useState<number[]>([]);

  const calledApi = useRef(false);

  const [backgroundData, setBackgroundData] = useState<ICuratedBackground | null>(null);

  const [backgroundText, setBackgroundText] = useState('');
  const [backgroundTextFr, setBackgroundTextFr] = useState('');

  const introEditor = useEditor(
    { extensions: completeRichTextElementExtentions }
  );

  const introFrEditor = useEditor(
    { extensions: completeRichTextElementExtentions }
  );

  const createDefaultData = useCallback((backgroundData: ICuratedBackground | null) => {
    if (backgroundData == null) {
      return {};
    }
    const {
      background, i18n
    } = backgroundData;
    const defaultData: Partial<FormValues> = {};
    defaultData.name = background.title;
    if (i18n.fr !== undefined) {
      defaultData.nameFr = i18n.fr.title ?? '';
    }

    // Init Bonus Skill
    const tempSkillBonusId: number[] = [];
    background.skillBonuses?.forEach((skillBonus) => {
      if (defaultData.skillBonuses === undefined) {
        defaultData.skillBonuses = {};
      }
      defaultData.skillBonuses[`skill-${idIncrement.current}`] = {
        skill: skillBonus.skill,
        value: skillBonus.value
      };

      tempSkillBonusId.push(idIncrement.current);
      idIncrement.current += 1;
    });
    setSkillBonusIds(tempSkillBonusId);

    // Init Bonus Stat
    const tempStatBonusId: number[] = [];
    background.statBonuses?.forEach((statBonus) => {
      if (defaultData.statBonuses === undefined) {
        defaultData.statBonuses = {};
      }
      defaultData.statBonuses[`stat-${idIncrement.current}`] = {
        stat: statBonus.stat,
        value: statBonus.value
      };

      tempStatBonusId.push(idIncrement.current);
      idIncrement.current += 1;
    });
    setStatBonusIds(tempStatBonusId);

    // Init Bonus CharParam
    const tempCharParamBonusId: number[] = [];
    background.charParamBonuses?.forEach((charParamBonus) => {
      if (defaultData.charParamBonuses === undefined) {
        defaultData.charParamBonuses = {};
      }
      defaultData.charParamBonuses[`charParam-${idIncrement.current}`] = {
        charParam: charParamBonus.charParam,
        value: charParamBonus.value
      };

      tempCharParamBonusId.push(idIncrement.current);
      idIncrement.current += 1;
    });
    setCharParamBonusIds(tempCharParamBonusId);

    return defaultData;
  }, []);

  const {
    handleSubmit,
    setError,
    unregister,
    control,
    formState: { errors },
    reset
  } = useForm({ defaultValues: useMemo(
    () => createDefaultData(backgroundData),
    [createDefaultData, backgroundData]
  ) });

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
    ({
      name, nameFr, ...elts
    }) => {
      if (introEditor === null || introFrEditor === null || api === undefined) {
        return;
      }
      // Check duplicate on skills
      const skillBonuses = elts.skillBonuses !== undefined ? Object.values(elts.skillBonuses) : [];
      let duplicateSkillBonuses = false;
      if (skillBonuses.length > 0) {
        duplicateSkillBonuses = isThereDuplicate(
          skillBonuses.map(skillBonus => skillBonus.skill)
        );
      }
      if (duplicateSkillBonuses) {
        setError('root.serverError', {
          type: 'duplicate',
          message: t('adminEditBackground.errorDuplicateSkill', { ns: 'pages' })
        });

        return;
      }
      // Check duplicate on stats
      const statBonuses = elts.statBonuses !== undefined ? Object.values(elts.statBonuses) : [];
      let duplicateStatBonuses = false;
      if (statBonuses.length > 0) {
        duplicateStatBonuses = isThereDuplicate(statBonuses.map(statBonus => statBonus.stat));
      }
      if (duplicateStatBonuses) {
        setError('root.serverError', {
          type: 'duplicate',
          message: t('adminEditBackground.errorDuplicateStat', { ns: 'pages' })
        });

        return;
      }
      // Check duplicate on character param
      const charParamBonuses
        = elts.charParamBonuses !== undefined ? Object.values(elts.charParamBonuses) : [];
      let duplicateCharParamBonuses = false;
      if (charParamBonuses.length > 0) {
        duplicateCharParamBonuses = isThereDuplicate(
          charParamBonuses.map(charParamBonus => charParamBonus.charParam)
        );
      }
      if (duplicateCharParamBonuses) {
        setError('root.serverError', {
          type: 'duplicate',
          message: t('adminEditBackground.errorDuplicateCharParam', { ns: 'pages' })
        });

        return;
      }
      const curatedSkillBonuses = skillBonuses.map(({
        skill, value
      }) => ({
        skill,
        value: Number(value)
      }));
      const curatedStatBonuses = statBonuses.map(({
        stat, value
      }) => ({
        stat,
        value: Number(value)
      }));
      const curatedCharParamBonuses = charParamBonuses.map(({
        charParam, value
      }) => ({
        charParam,
        value: Number(value)
      }));

      let html: string | null = introEditor.getHTML();
      const htmlFr = introFrEditor.getHTML();
      if (html === '<p class="ap"></p>') {
        html = null;
      }
      let i18n: InternationalizationType | null = null;
      if (nameFr !== '' || htmlFr !== '<p class="ap"></p>') {
        i18n = { fr: {
          title: nameFr,
          summary: htmlFr
        } };
      }
      api.backgrounds
        .update({
          id,
          title: name,
          summary: html,
          i18n,
          skillBonuses: curatedSkillBonuses,
          statBonuses: curatedStatBonuses,
          charParamBonuses: curatedCharParamBonuses
        })
        .then((quote) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminEditBackground.successUpdate', { ns: 'pages' })}</Ap>
              </Alert>
            )
          });
        })
        .catch(({ response }: ErrorResponseType) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.quoteType.${data.sent}`), 'capitalize') })
            });
          } else {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.quoteType.${data.sent}`), 'capitalize') })
            });
          }
        });
    },
    [
      introEditor,
      introFrEditor,
      api,
      id,
      setError,
      t,
      getNewId,
      createAlert
    ]
  );

  const onAskDelete = useCallback(() => {
    if (api === undefined || backgroundData === null || confMessageEvt === null) {
      return;
    }
    setConfirmContent(
      {
        title: t('adminEditBackground.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditBackground.confirmDeletion.text', {
          ns: 'pages',
          elt: backgroundData.background.title
        }),
        confirmCta: t('adminEditBackground.confirmDeletion.confirmCta', { ns: 'pages' })
      },
      (evtId: string) => {
        const confirmDelete = (
          { detail }: { detail: ConfirmMessageDetailData }
        ): void => {
          if (detail.proceed) {
            api.backgrounds
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditBackground.successDelete', { ns: 'pages' })}</Ap>
                    </Alert>
                  )
                });
                void navigate('/admin/backgrounds');
              })
              .catch(({ response }: ErrorResponseType) => {
                const { data } = response;
                if (data.code === 'CYPU-104') {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.skillBranch.name`), 'capitalize') })
                  });
                } else {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.skillBranch.name`), 'capitalize') })
                  });
                }
              });
          }
          removeConfirmEventListener(evtId, confirmDelete);
        };
        addConfirmEventListener(evtId, confirmDelete);
      }
    );
  }, [
    api,
    backgroundData,
    confMessageEvt,
    t,
    id,
    getNewId,
    createAlert,
    navigate,
    setError
  ]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.backgrounds
        .get({ backgroundId: id })
        .then((curatedBackground) => {
          const {
            background, i18n
          } = curatedBackground;
          setBackgroundData(curatedBackground);
          setBackgroundText(background.summary);
          if (i18n.fr !== undefined) {
            setBackgroundTextFr(i18n.fr.summary ?? '');
          }
        })
        .catch(() => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('serverErrors.CYPU-301')}</Ap>
              </Alert>
            )
          });
        });
    }
  }, [
    api,
    createAlert,
    getNewId,
    id,
    t
  ]);

  // To affect default data
  useEffect(() => {
    reset(createDefaultData(backgroundData));
  }, [
    backgroundData,
    reset,
    createDefaultData
  ]);

  return (
    <div
      className={classTrim(`
        adminEditBackground
        ${displayInt ? 'adminEditBackground--int-visible' : ''}
      `)}
    >
      <form
        className="adminEditBackground__content"
        onSubmit={() => handleSubmit(onSaveBackground)}
        noValidate
      >
        <div className="adminEditBackground__head">
          <Atitle className="adminEditBackground__head" level={1}>
            {t('adminEditBackground.title', { ns: 'pages' })}
          </Atitle>
          <Button onClick={onAskDelete} color="error">
            {t('adminEditBackground.delete', { ns: 'pages' })}
          </Button>
        </div>
        <Button className="adminEditBackground__return-btn" href="/admin/backgrounds" size="small">
          {t('adminEditBackground.return', { ns: 'pages' })}
        </Button>
        {errors.root?.serverError.message !== undefined
          ? (
              <Aerror>{errors.root.serverError.message}</Aerror>
            )
          : null}
        <div className="adminEditBackground__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameBackground.required', { ns: 'fields' }) }}
            label={t('nameBackground.label', { ns: 'fields' })}
            className="adminEditBackground__basics__name"
          />
        </div>
        <div className="adminEditBackground__details">
          <RichTextElement
            label={t('backgroundSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent={backgroundText}
            small
            complete
          />
        </div>
        <Atitle className="adminEditBackground__bonus-title" level={2}>
          {t('adminEditBackground.values', { ns: 'pages' })}
        </Atitle>
        <div className="adminEditBackground__bonuses">
          <div className="adminEditBackground__bonuses__elts">
            {skillBonusIds.map(skillBonusId => (
              <div className="adminEditBackground__bonus" key={`skill-${skillBonusId}`}>
                <Atitle className="adminEditBackground__bonus__title" level={4}>
                  {t('adminEditBackground.skillBonusTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminEditBackground__bonus__fields">
                  <SmartSelect
                    control={control}
                    inputName={`skillBonuses.skill-${skillBonusId}.skill`}
                    rules={{ required: t('skillBonusSkill.required', { ns: 'fields' }) }}
                    label={t('skillBonusSkill.label', { ns: 'fields' })}
                    options={skillSelect}
                    className="adminEditBackground__bonus__select"
                  />
                  <Input
                    control={control}
                    inputName={`skillBonuses.skill-${skillBonusId}.value`}
                    type="number"
                    rules={{ required: t('skillBonusValue.required', { ns: 'fields' }) }}
                    label={t('skillBonusValue.label', { ns: 'fields' })}
                    className="adminEditBackground__bonus__value"
                  />
                </div>
                <Button
                  icon="Delete"
                  theme="afterglow"
                  onClick={() => {
                    setSkillBonusIds(prev =>
                      prev.reduce((result: number[], elt) => {
                        if (elt !== skillBonusId) {
                          result.push(elt);
                        }

                        return result;
                      }, [])
                    );
                    unregister(`skillBonuses.skill-${skillBonusId}`);
                  }}
                  className="adminEditBackground__bonus__button"
                />
              </div>
            ))}
            {statBonusIds.map(statBonusId => (
              <div className="adminEditBackground__bonus" key={`stat-${statBonusId}`}>
                <Atitle className="adminEditBackground__bonus__title" level={4}>
                  {t('adminEditBackground.statBonusTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminEditBackground__bonus__fields">
                  <SmartSelect
                    control={control}
                    inputName={`statBonuses.stat-${statBonusId}.stat`}
                    rules={{ required: t('statBonusStat.required', { ns: 'fields' }) }}
                    label={t('statBonusStat.label', { ns: 'fields' })}
                    options={statSelect}
                    className="adminEditBackground__bonus__select"
                  />
                  <Input
                    control={control}
                    inputName={`statBonuses.stat-${statBonusId}.value`}
                    type="number"
                    rules={{ required: t('statBonusValue.required', { ns: 'fields' }) }}
                    label={t('statBonusValue.label', { ns: 'fields' })}
                    className="adminEditBackground__bonus__value"
                  />
                </div>
                <Button
                  icon="Delete"
                  theme="afterglow"
                  onClick={() => {
                    setStatBonusIds(prev =>
                      prev.reduce((result: number[], elt) => {
                        if (elt !== statBonusId) {
                          result.push(elt);
                        }

                        return result;
                      }, [])
                    );
                    unregister(`statBonuses.stat-${statBonusId}`);
                  }}
                  className="adminEditBackground__bonus__button"
                />
              </div>
            ))}
            {charParamBonusIds.map(charParamBonusId => (
              <div className="adminEditBackground__bonus" key={`charParam-${charParamBonusId}`}>
                <Atitle className="adminEditBackground__bonus__title" level={4}>
                  {t('adminEditBackground.charParamBonusTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminEditBackground__bonus__fields">
                  <SmartSelect
                    control={control}
                    inputName={`charParamBonuses.charParam-${charParamBonusId}.charParam`}
                    rules={{ required: t('charParamBonusStat.required', { ns: 'fields' }) }}
                    label={t('charParamBonusStat.label', { ns: 'fields' })}
                    options={charParamSelect}
                    className="adminEditBackground__bonus__select"
                  />
                  <Input
                    control={control}
                    inputName={`charParamBonuses.charParam-${charParamBonusId}.value`}
                    type="number"
                    rules={{ required: t('charParamBonusValue.required', { ns: 'fields' }) }}
                    label={t('charParamBonusValue.label', { ns: 'fields' })}
                    className="adminEditBackground__bonus__value"
                  />
                </div>
                <Button
                  icon="Delete"
                  theme="afterglow"
                  onClick={() => {
                    setCharParamBonusIds(prev =>
                      prev.reduce((result: number[], elt) => {
                        if (elt !== charParamBonusId) {
                          result.push(elt);
                        }

                        return result;
                      }, [])
                    );
                    unregister(`charParamBonuses.charParam-${charParamBonusId}`);
                  }}
                  className="adminEditBackground__bonus__button"
                />
              </div>
            ))}
          </div>
          <div className="adminEditBackground__bonuses__buttons">
            <Button onClick={onAddSkillBonus}>
              {t('adminEditBackground.createSkillBonusButton', { ns: 'pages' })}
            </Button>
            <Button onClick={onAddStatBonus}>
              {t('adminEditBackground.createStatBonusButton', { ns: 'pages' })}
            </Button>
            <Button onClick={onAddCharParamBonus}>
              {t('adminEditBackground.createCharParamBonusButton', { ns: 'pages' })}
            </Button>
          </div>
        </div>
        <div className="adminEditBackground__intl-title">
          <div className="adminEditBackground__intl-title__content">
            <Atitle className="adminEditBackground__intl-title__title" level={2}>
              {t('adminEditBackground.i18n', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminEditBackground__intl-title__info">
              {t('adminEditBackground.i18nInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <Button
            icon="Arrow"
            theme="afterglow"
            onClick={() => {
              setDisplayInt(prev => !prev);
            }}
            className="adminEditBackground__intl-title__btn"
          />
        </div>
        <div className="adminEditBackground__intl">
          <div className="adminEditBackground__basics">
            <Input
              control={control}
              inputName="nameFr"
              type="text"
              label={`${t('nameBackground.label', { ns: 'fields' })} (FR)`}
              className="adminEditBackground__basics__name"
            />
          </div>
          <div className="adminEditBackground__details">
            <RichTextElement
              label={`${t('backgroundSummary.title', { ns: 'fields' })} (FR)`}
              editor={introFrEditor}
              rawStringContent={backgroundTextFr}
              small
              complete
            />
          </div>
        </div>
        <Button type="submit">{t('adminEditBackground.createButton', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminEditBackground;
