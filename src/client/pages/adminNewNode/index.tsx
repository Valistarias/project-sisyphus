import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { useApi, useSystemAlerts } from '../../providers';

import { Aerror, Ap, Atitle } from '../../atoms';
import { Button, Input } from '../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../organisms';
import {
  type ICuratedCyberFrame,
  type ICuratedCyberFrameBranch,
  type ICuratedSkill,
  type ICuratedSkillBranch,
} from '../../types';

import './adminNewNode.scss';

interface FormValues {
  name: string;
  nameFr: string;
}

const AdminNewNode: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { search } = useLocation();
  const navigate = useNavigate();
  const { createAlert, getNewId } = useSystemAlerts();

  const params = useMemo(() => new URLSearchParams(search), [search]);

  const [skill, setSkill] = useState<ICuratedSkill | null>(null);
  const [cyberFrame, setCyberFrame] = useState<ICuratedCyberFrame | null>(null);

  const [branches, setBranches] = useState<ICuratedSkillBranch[] | ICuratedCyberFrameBranch[]>([]);

  console.log('branches', branches);

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
    control,
    formState: { errors },
  } = useForm<FieldValues>();

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
    ({ name, nameFr }) => {
      if (introEditor === null || introFrEditor === null || api === undefined) {
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

      // api.skillBranches
      //   .create({
      //     title: name,
      //     skill: params.get('skillId'),
      //     summary: html,
      //     i18n,
      //   })
      //   .then((skillBranch) => {
      //     const newId = getNewId();
      //     createAlert({
      //       key: newId,
      //       dom: (
      //         <Alert key={newId} id={newId} timer={5}>
      //           <Ap>{t('adminNewNode.successCreate', { ns: 'pages' })}</Ap>
      //         </Alert>
      //       ),
      //     });
      //     navigate(`/admin/skillbranch/${skillBranch._id}`);
      //   })
      //   .catch(({ response }) => {
      //     const { data } = response;
      //     if (data.code === 'CYPU-104') {
      //       setError('root.serverError', {
      //         type: 'server',
      //         message: t(`serverErrors.${data.code}`, {
      //           field: i18next.format(t(`terms.skillBranchType.${data.sent}`), 'capitalize'),
      //         }),
      //       });
      //     } else {
      //       setError('root.serverError', {
      //         type: 'server',
      //         message: t(`serverErrors.${data.code}`, {
      //           field: i18next.format(t(`terms.skillBranchType.${data.sent}`), 'capitalize'),
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
        </div>
        <div className="adminNewNode__details">
          <RichTextElement
            label={t('skillBranchSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent={''}
            small
            complete
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
            label={`${t('skillBranchSummary.title', { ns: 'fields' })} (FR)`}
            editor={introFrEditor}
            rawStringContent={''}
            small
            complete
          />
        </div>
        <Button type="submit">{t('adminNewNode.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewNode;
