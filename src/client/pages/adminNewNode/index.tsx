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
  type ICuratedCyberFrame,
  type ICuratedCyberFrameBranch,
  type ICuratedSkill,
  type ICuratedSkillBranch,
  type ICyberFrameBranch,
  type ISkillBranch,
} from '../../types';
import { type InternationalizationType } from '../../types/global';

import './adminNewNode.scss';

interface FormValues {
  name: string;
  nameFr: string;
  quote: string;
  quoteFr: string;
  level: number;
  icon: string;
  branch: string;
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
  // const navigate = useNavigate();
  const { createAlert, getNewId } = useSystemAlerts();

  const params = useMemo(() => new URLSearchParams(search), [search]);

  const [skill, setSkill] = useState<ICuratedSkill | null>(null);
  const [cyberFrame, setCyberFrame] = useState<ICuratedCyberFrame | null>(null);

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
        api.skills
          .get({
            skillId: params.get('skillId') ?? '',
          })
          .then((sentSkill: ICuratedSkill) => {
            setLoading(false);
            setSkill(sentSkill);
          })
          .catch(() => {
            setLoading(false);
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
            setLoading(false);
            setCyberFrame(sentCyberFrame);
          })
          .catch(() => {
            setLoading(false);
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
    }
  }, [api, createAlert, getNewId, params, t]);

  const onSaveNode: SubmitHandler<FormValues> = useCallback(
    (elts) => {
      if (introEditor === null || introFrEditor === null || api === undefined) {
        return;
      }
      console.log('onSaveNode');
      console.log('elts', elts);
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
    <div className="adminNewNode">
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
            rules={{
              required: t('quoteNode.required', { ns: 'fields' }),
            }}
            label={t('quoteNode.label', { ns: 'fields' })}
            className="adminNewNode__details__quote"
          />
        </div>

        <Atitle className="adminNewNode__intl" level={2}>
          {t('adminNewNode.i18n', { ns: 'pages' })}
        </Atitle>
        <Ap className="adminNewNode__intl-info">{t('adminNewNode.i18nInfo', { ns: 'pages' })}</Ap>
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
        <Button type="submit">{t('adminNewNode.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewNode;
