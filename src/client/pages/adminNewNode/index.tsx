import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { useApi, useSystemAlerts } from '../../providers';

import { Aerror, Ap, Atitle } from '../../atoms';
import { Button, Input, NodeIconSelect, SmartSelect } from '../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../organisms';
import {
  type ICuratedCharParam,
  type ICuratedCyberFrame,
  type ICuratedCyberFrameBranch,
  type ICuratedSkill,
  type ICuratedSkillBranch,
  type ICuratedStat,
  type ICyberFrameBranch,
  type ISkillBranch,
} from '../../types';
import { type InternationalizationType } from '../../types/global';

import { classTrim, isThereDuplicate } from '../../utils';

import './adminNewNode.scss';

interface FormValues {
  name: string;
  nameFr: string;
  quote: string;
  quoteFr: string;
  level: number;
  icon: string;
  branch: string;
  skillBonuses?: Record<
    string,
    {
      id: number;
      skill: string;
      value: number;
    }
  >;
  statBonuses?: Record<
    string,
    {
      id: number;
      stat: string;
      value: number;
    }
  >;
  charParamBonuses?: Record<
    string,
    {
      id: number;
      charParam: string;
      value: number;
    }
  >;
}

const generalRange = [...Array(2)].map((_, i) => ({
  value: i + 1,
  label: String(i + 1),
}));

const branchRange = [...Array(8)].map((_, i) => ({
  value: i + 3,
  label: String(i + 3),
}));

const AdminNewNode: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { search } = useLocation();
  const { createAlert, getNewId } = useSystemAlerts();

  const params = useMemo(() => new URLSearchParams(search), [search]);

  const [displayInt, setDisplayInt] = useState(false);

  // Selected element via ID in url
  const [skill, setSkill] = useState<ICuratedSkill | null>(null);
  const [cyberFrame, setCyberFrame] = useState<ICuratedCyberFrame | null>(null);

  // General elements, for bonuses
  const [skillSelect, setSkillSelect] = useState<
    Array<{
      value: string;
      label: string;
    }>
  >([]);
  const [skillBonusIds, setSkillBonusIds] = useState<number[]>([]);
  const skillBonusIncrement = useRef(0);

  const [statSelect, setStatSelect] = useState<
    Array<{
      value: string;
      label: string;
    }>
  >([]);
  const [statBonusIds, setStatBonusIds] = useState<number[]>([]);
  const statBonusIncrement = useRef(0);

  const [charParamSelect, setCharParamSelect] = useState<
    Array<{
      value: string;
      label: string;
    }>
  >([]);
  const [charParamBonusIds, setCharParamBonusIds] = useState<number[]>([]);
  const charParamBonusIncrement = useRef(0);

  const [branches, setBranches] = useState<ICuratedSkillBranch[] | ICuratedCyberFrameBranch[]>([]);

  const [levelSelect, setLevelSelect] = useState<
    Array<{
      value: number;
      label: string;
    }>
  >([]);

  const [, setLoading] = useState(true);
  const calledApi = useRef(false);

  const introEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const introFrEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const {
    handleSubmit,
    setError,
    setValue,
    unregister,
    control,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      icon: 'default',
    },
  });

  const branchSelect = useMemo(() => {
    return branches.reduce(
      (
        result: Array<{
          value: string;
          label: string;
        }>,
        elt: {
          i18n: InternationalizationType;
          skillBranch?: ISkillBranch;
          cyberFrameBranch?: ICyberFrameBranch;
        }
      ) => {
        const data = elt.skillBranch ?? elt.cyberFrameBranch;
        if (data !== undefined) {
          result.push({
            value: data._id,
            // TODO : Handle Internationalization
            label: data.title === '_general' ? t('terms.node.generalBranch') : data.title,
          });
        }
        return result;
      },
      []
    );
  }, [branches, t]);

  const onAddSkillBonus = useCallback(() => {
    setSkillBonusIds((prev) => {
      const next = [...prev];
      next.push(skillBonusIncrement.current);
      skillBonusIncrement.current += 1;
      return next;
    });
  }, []);

  const onAddStatBonus = useCallback(() => {
    setStatBonusIds((prev) => {
      const next = [...prev];
      next.push(statBonusIncrement.current);
      statBonusIncrement.current += 1;
      return next;
    });
  }, []);

  const onAddCharParamBonus = useCallback(() => {
    setCharParamBonusIds((prev) => {
      const next = [...prev];
      next.push(charParamBonusIncrement.current);
      charParamBonusIncrement.current += 1;
      return next;
    });
  }, []);

  const getData = useCallback(() => {
    if (api !== undefined) {
      const skillId = params.get('skillId');
      const cyberFrameId = params.get('cyberFrameId');
      if (skillId !== null) {
        api.skillBranches
          .getAllBySkill({ skillId })
          .then((curatedSkillBranches: ICuratedSkillBranch[]) => {
            setBranches(curatedSkillBranches ?? []);
          })
          .catch(() => {
            const newId = getNewId();
            createAlert({
              key: newId,
              dom: (
                <Alert key={newId} id={newId} timer={5}>
                  <Ap>{t('serverErrors.CYPU-301')}</Ap>
                </Alert>
              ),
            });
          });
        // api.skills
        //   .get({
        //     skillId: params.get('skillId') ?? '',
        //   })
        //   .then((sentSkill: ICuratedSkill) => {
        //     setLoading(false);
        //     setSkill(sentSkill);
        //   })
        //   .catch(() => {
        //     setLoading(false);
        //     const newId = getNewId();
        //     createAlert({
        //       key: newId,
        //       dom: (
        //         <Alert key={newId} id={newId} timer={5}>
        //           <Ap>{t('serverErrors.CYPU-301')}</Ap>
        //         </Alert>
        //       ),
        //     });
        //   });
      } else if (cyberFrameId !== null) {
        api.cyberFrameBranches
          .getAllByCyberFrame({ cyberFrameId })
          .then((curatedSkillBranches: ICuratedCyberFrameBranch[]) => {
            setBranches(curatedSkillBranches ?? []);
          })
          .catch(() => {
            const newId = getNewId();
            createAlert({
              key: newId,
              dom: (
                <Alert key={newId} id={newId} timer={5}>
                  <Ap>{t('serverErrors.CYPU-301')}</Ap>
                </Alert>
              ),
            });
          });
        api.cyberFrames
          .get({
            cyberFrameId: params.get('cyberFrameId') ?? '',
          })
          .then((sentCyberFrame: ICuratedCyberFrame) => {
            // setLoading(false);
            setCyberFrame(sentCyberFrame);
          })
          .catch(() => {
            // setLoading(false);
            const newId = getNewId();
            createAlert({
              key: newId,
              dom: (
                <Alert key={newId} id={newId} timer={5}>
                  <Ap>{t('serverErrors.CYPU-301')}</Ap>
                </Alert>
              ),
            });
          });
      }
      api.skills
        .getAll()
        .then((curatedSkills: ICuratedSkill[]) => {
          if (skillId !== null) {
            const foundSkill = curatedSkills.find(({ skill }) => skill._id === skillId);
            if (foundSkill !== undefined) {
              setSkill(foundSkill);
            }
          }
          const curatedSelect = curatedSkills.map(({ skill }) => ({
            value: skill._id,
            // TODO : Handle Internationalization
            label: skill.title,
          }));
          setSkillSelect(curatedSelect);
        })
        .catch(() => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('serverErrors.CYPU-301')}</Ap>
              </Alert>
            ),
          });
        });
      api.stats
        .getAll()
        .then((curatedStats: ICuratedStat[]) => {
          const curatedSelect = curatedStats.map(({ stat }) => ({
            value: stat._id,
            // TODO : Handle Internationalization
            label: stat.title,
          }));
          setStatSelect(curatedSelect);
        })
        .catch(() => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('serverErrors.CYPU-301')}</Ap>
              </Alert>
            ),
          });
        });
      api.charParams
        .getAll()
        .then((curatedCharParams: ICuratedCharParam[]) => {
          const curatedSelect = curatedCharParams.map(({ charParam }) => ({
            value: charParam._id,
            // TODO : Handle Internationalization
            label: charParam.title,
          }));
          setCharParamSelect(curatedSelect);
        })
        .catch(() => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('serverErrors.CYPU-301')}</Ap>
              </Alert>
            ),
          });
        });
    }
  }, [api, createAlert, getNewId, params, t]);

  const onSaveNode: SubmitHandler<FormValues> = useCallback(
    (elts) => {
      if (introEditor === null || introFrEditor === null || api === undefined) {
        return;
      }
      console.log('elts', elts);

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
          message: t('adminNewNode.errorDuplicateSkill', { ns: 'pages' }),
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
          message: t('adminNewNode.errorDuplicateStat', { ns: 'pages' }),
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
          message: t('adminNewNode.errorDuplicateCharParam', { ns: 'pages' }),
        });
        return;
      }
      console.log('onSaveNode');
      // let html: string | null = introEditor.getHTML();
      // const htmlFr = introFrEditor.getHTML();
      // if (html === '<p class="ap"></p>') {
      //   html = null;
      // }

      // let i18n: any | null = null;

      // if (nameFr !== '' || htmlFr !== '<p class="ap"></p>') {
      //   i18n = {
      //     fr: {
      //       title: nameFr,
      //       summary: htmlFr,
      //     },
      //   };
      // }

      // api.quotees
      //   .create({
      //     title: name,
      //     skill: params.get('skillId'),
      //     summary: html,
      //     i18n,
      //   })
      //   .then((quote) => {
      //     const newId = getNewId();
      //     createAlert({
      //       key: newId,
      //       dom: (
      //         <Alert key={newId} id={newId} timer={5}>
      //           <Ap>{t('adminNewNode.successCreate', { ns: 'pages' })}</Ap>
      //         </Alert>
      //       ),
      //     });
      //     navigate(`/admin/skillbranch/${quote._id}`);
      //   })
      //   .catch(({ response }) => {
      //     const { data } = response;
      //     if (data.code === 'CYPU-104') {
      //       setError('root.serverError', {
      //         type: 'server',
      //         message: t(`serverErrors.${data.code}`, {
      //           field: i18next.format(t(`terms.quoteType.${data.sent}`), 'capitalize'),
      //         }),
      //       });
      //     } else {
      //       setError('root.serverError', {
      //         type: 'server',
      //         message: t(`serverErrors.${data.code}`, {
      //           field: i18next.format(t(`terms.quoteType.${data.sent}`), 'capitalize'),
      //         }),
      //       });
      //     }
      //   });
    },
    [introEditor, introFrEditor, api]
  );

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      setLoading(true);
      calledApi.current = true;
      getData();
    }
  }, [api, createAlert, getNewId, getData, t]);

  useEffect(() => {
    if (levelSelect.length > 0) {
      setValue('level', levelSelect[0].value);
    }
  }, [levelSelect, setValue]);

  return (
    <div
      className={classTrim(`
        adminNewNode
        ${displayInt ? 'adminNewNode--int-visible' : ''}
      `)}
    >
      <form className="adminNewNode__content" onSubmit={handleSubmit(onSaveNode)} noValidate>
        <Atitle className="adminNewNode__head" level={1}>
          {t('adminNewNode.title', { ns: 'pages' })}
        </Atitle>
        <div className="adminNewNode__ariane">
          <Ap className="adminNewNode__ariane__elt">
            {skill !== null
              ? `${t(`terms.skill.name`)}: ${skill?.skill.title}`
              : `${t(`terms.cyberFrame.name`)}: ${cyberFrame?.cyberFrame.title}`}
          </Ap>
        </div>
        {errors.root?.serverError?.message !== undefined ? (
          <Aerror>{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminNewNode__visual">
          <NodeIconSelect
            label={t('iconNode.label', { ns: 'fields' })}
            control={control}
            inputName="icon"
            rules={{
              required: t('iconNode.required', { ns: 'fields' }),
            }}
          />
        </div>
        <div className="adminNewNode__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{
              required: t('nameNode.required', { ns: 'fields' }),
            }}
            label={t('nameNode.label', { ns: 'fields' })}
            className="adminNewNode__basics__name"
          />
          <SmartSelect
            control={control}
            inputName="branch"
            rules={{
              required: t('branchNode.required', { ns: 'fields' }),
            }}
            label={t('branchNode.label', { ns: 'fields' })}
            options={branchSelect}
            onChange={(e) => {
              let titleBranch: string | null = null;
              branches.forEach(
                (branch: {
                  i18n: InternationalizationType;
                  skillBranch?: ISkillBranch;
                  cyberFrameBranch?: ICyberFrameBranch;
                }) => {
                  const data = branch.skillBranch ?? branch.cyberFrameBranch;
                  if (data !== undefined && data._id === e) {
                    titleBranch = data.title;
                  }
                }
              );
              if (titleBranch === '_general') {
                setLevelSelect(generalRange);
              } else {
                setLevelSelect(branchRange);
              }
            }}
            className="adminNewNode__basics__type"
          />
          <SmartSelect
            control={control}
            placeholder={'0'}
            inputName="level"
            rules={{
              required: t('levelNode.required', { ns: 'fields' }),
            }}
            label={t('levelNode.label', { ns: 'fields' })}
            options={levelSelect}
            className="adminNewNode__basics__level"
            disabled={levelSelect.length === 0}
          />
        </div>
        <div className="adminNewNode__details">
          <RichTextElement
            label={t('nodeSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent={''}
            small
            complete
          />
          <Input
            control={control}
            inputName="quote"
            type="text"
            label={t('quoteNode.label', { ns: 'fields' })}
            className="adminNewNode__details__quote"
          />
        </div>
        <Atitle className="adminNewNode__bonus-title" level={2}>
          {t('adminNewNode.effects', { ns: 'pages' })}
        </Atitle>
        <div className="adminNewNode__bonuses">
          <div className="adminNewNode__bonuses__elts">
            {skillBonusIds.map((skillBonusId) => (
              <div className="adminNewNode__bonus" key={`skill-${skillBonusId}`}>
                <Atitle className="adminNewNode__bonus__title" level={4}>
                  {t('adminNewNode.skillBonusTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminNewNode__bonus__fields">
                  <SmartSelect
                    control={control}
                    inputName={`skillBonuses.skill-${skillBonusId}.skill`}
                    rules={{
                      required: t('skillBonusSkill.required', { ns: 'fields' }),
                    }}
                    label={t('skillBonusSkill.label', { ns: 'fields' })}
                    options={skillSelect}
                    className="adminNewNode__bonus__select"
                  />
                  <Input
                    control={control}
                    inputName={`skillBonuses.skill-${skillBonusId}.value`}
                    type="number"
                    rules={{
                      required: t('skillBonusValue.required', { ns: 'fields' }),
                    }}
                    label={t('skillBonusValue.label', { ns: 'fields' })}
                    className="adminNewNode__bonus__value"
                  />

                  <Button
                    icon="delete"
                    theme="afterglow"
                    color="tertiary"
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
                  />
                </div>
              </div>
            ))}
            {statBonusIds.map((statBonusId) => (
              <div className="adminNewNode__bonus" key={`stat-${statBonusId}`}>
                <Atitle className="adminNewNode__bonus__title" level={4}>
                  {t('adminNewNode.statBonusTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminNewNode__bonus__fields">
                  <SmartSelect
                    control={control}
                    inputName={`statBonuses.stat-${statBonusId}.stat`}
                    rules={{
                      required: t('statBonusStat.required', { ns: 'fields' }),
                    }}
                    label={t('statBonusStat.label', { ns: 'fields' })}
                    options={statSelect}
                    className="adminNewNode__bonus__select"
                  />
                  <Input
                    control={control}
                    inputName={`statBonuses.stat-${statBonusId}.value`}
                    type="number"
                    rules={{
                      required: t('statBonusValue.required', { ns: 'fields' }),
                    }}
                    label={t('statBonusValue.label', { ns: 'fields' })}
                    className="adminNewNode__bonus__value"
                  />

                  <Button
                    icon="delete"
                    theme="afterglow"
                    color="tertiary"
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
                  />
                </div>
              </div>
            ))}
            {charParamBonusIds.map((charParamBonusId) => (
              <div className="adminNewNode__bonus" key={`charParam-${charParamBonusId}`}>
                <Atitle className="adminNewNode__bonus__title" level={4}>
                  {t('adminNewNode.charParamBonusTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminNewNode__bonus__fields">
                  <SmartSelect
                    control={control}
                    inputName={`charParamBonuses.charParam-${charParamBonusId}.charParam`}
                    rules={{
                      required: t('charParamBonusStat.required', { ns: 'fields' }),
                    }}
                    label={t('charParamBonusStat.label', { ns: 'fields' })}
                    options={charParamSelect}
                    className="adminNewNode__bonus__select"
                  />
                  <Input
                    control={control}
                    inputName={`charParamBonuses.charParam-${charParamBonusId}.value`}
                    type="number"
                    rules={{
                      required: t('charParamBonusValue.required', { ns: 'fields' }),
                    }}
                    label={t('charParamBonusValue.label', { ns: 'fields' })}
                    className="adminNewNode__bonus__value"
                  />

                  <Button
                    icon="delete"
                    theme="afterglow"
                    color="tertiary"
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
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="adminNewNode__bonuses__buttons">
            <Button onClick={onAddSkillBonus}>
              {t('adminNewNode.createSkillBonusButton', { ns: 'pages' })}
            </Button>
            <Button onClick={onAddStatBonus}>
              {t('adminNewNode.createStatBonusButton', { ns: 'pages' })}
            </Button>
            <Button onClick={onAddCharParamBonus}>
              {t('adminNewNode.createCharParamBonusButton', { ns: 'pages' })}
            </Button>
          </div>
        </div>
        <div className="adminNewNode__intl-title">
          <div className="adminNewNode__intl-title__content">
            <Atitle className="adminNewNode__intl-title__title" level={2}>
              {t('adminNewNode.i18n', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminNewNode__intl-title__info">
              {t('adminNewNode.i18nInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <Button
            icon="arrow"
            theme="afterglow"
            onClick={() => {
              setDisplayInt((prev) => !prev);
            }}
            className="adminNewNode__intl-title__btn"
          />
        </div>
        <div className="adminNewNode__intl">
          <div className="adminNewNode__basics">
            <Input
              control={control}
              inputName="nameFr"
              type="text"
              label={`${t('nameNode.label', { ns: 'fields' })} (FR)`}
              className="adminNewNode__basics__name"
            />
          </div>
          <div className="adminNewNode__details">
            <RichTextElement
              label={`${t('nodeSummary.title', { ns: 'fields' })} (FR)`}
              editor={introFrEditor}
              rawStringContent={''}
              small
              complete
            />
            <Input
              control={control}
              inputName="quoteFr"
              type="text"
              label={`${t('quoteNode.label', { ns: 'fields' })} (FR)`}
              className="adminNewNode__details__quote"
            />
          </div>
        </div>
        <Button type="submit">{t('adminNewNode.createButton', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewNode;
