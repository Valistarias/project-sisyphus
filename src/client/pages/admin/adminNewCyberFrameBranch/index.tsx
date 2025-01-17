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
  useLocation, useNavigate
} from 'react-router-dom';

import {
  useApi, useSystemAlerts
} from '../../../providers';

import {
  Aerror, Ap, Atitle
} from '../../../atoms';
import {
  Button, Input
} from '../../../molecules';
import {
  Alert, RichTextElement, completeRichTextElementExtentions
} from '../../../organisms';

import type { ErrorResponseType, ICuratedCyberFrame } from '../../../types';
import type { InternationalizationType } from '../../../types/global';

import './adminNewCyberFrameBranch.scss';

interface FormValues {
  name: string
  nameFr: string
}

const AdminNewCyberFrameBranch: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { search } = useLocation();
  const navigate = useNavigate();
  const {
    createAlert, getNewId
  } = useSystemAlerts();

  const params = useMemo(() => new URLSearchParams(search), [search]);

  const [cyberFrame, setCyberFrame] = useState<ICuratedCyberFrame | null>(null);

  const [, setLoading] = useState(true);
  const calledApi = useRef(false);

  const introEditor = useEditor(
    { extensions: completeRichTextElementExtentions }
  );

  const introFrEditor = useEditor(
    { extensions: completeRichTextElementExtentions }
  );

  const {
    handleSubmit,
    setError,
    control,
    formState: { errors }
  } = useForm();

  const getCyberFrame = useCallback(() => {
    if (api !== undefined) {
      api.cyberFrames
        .get({ cyberFrameId: params.get('cyberFrameId') ?? '' })
        .then((sentCyberFrame) => {
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
            )
          });
        });
    }
  }, [
    api,
    createAlert,
    getNewId,
    params,
    t
  ]);

  const onSaveCyberFrameBranch: SubmitHandler<FormValues> = useCallback(
    ({
      name, nameFr
    }) => {
      if (
        introEditor === null
        || introFrEditor === null
        || api === undefined
      ) {
        return;
      }
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

      api.cyberFrameBranches
        .create({
          title: name,
          cyberFrame: params.get('cyberFrameId'),
          summary: html,
          i18n
        })
        .then((cyberFrameBranch) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminNewCyberFrameBranch.successCreate', { ns: 'pages' })}</Ap>
              </Alert>
            )
          });
          void navigate(`/admin/cyberFrameBranch/${cyberFrameBranch._id}`);
        })
        .catch(({ response }: ErrorResponseType) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.cyberFrameBranchType.${data.sent}`), 'capitalize') })
            });
          } else {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.cyberFrameBranchType.${data.sent}`), 'capitalize') })
            });
          }
        });
    },
    [
      introEditor,
      introFrEditor,
      api,
      params,
      getNewId,
      createAlert,
      t,
      navigate,
      setError
    ]
  );

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      setLoading(true);
      calledApi.current = true;
      getCyberFrame();
    }
  }, [
    api,
    createAlert,
    getNewId,
    getCyberFrame,
    t
  ]);

  return (
    <div className="adminNewCyberFrameBranch">
      <form
        className="adminNewCyberFrameBranch__content"
        onSubmit={() => handleSubmit(onSaveCyberFrameBranch)}
        noValidate
      >
        <Atitle className="adminNewCyberFrameBranch__head" level={1}>
          {t('adminNewCyberFrameBranch.title', { ns: 'pages' })}
        </Atitle>
        <div className="adminNewCyberFrameBranch__ariane">
          <Ap className="adminNewCyberFrameBranch__ariane__elt">
            {`${t(`terms.cyberFrame.name`)}: ${cyberFrame?.cyberFrame.title}`}
          </Ap>
        </div>
        {errors.root?.serverError.message !== undefined
          ? (
              <Aerror>{errors.root.serverError.message}</Aerror>
            )
          : null}
        <div className="adminNewCyberFrameBranch__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameCyberFrameBranch.required', { ns: 'fields' }) }}
            label={t('nameCyberFrameBranch.label', { ns: 'fields' })}
            className="adminNewCyberFrameBranch__basics__name"
          />
        </div>
        <div className="adminNewCyberFrameBranch__details">
          <RichTextElement
            label={t('cyberFrameBranchSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent=""
            small
            complete
          />
        </div>

        <Atitle className="adminNewCyberFrameBranch__intl" level={2}>
          {t('adminNewCyberFrameBranch.i18n', { ns: 'pages' })}
        </Atitle>
        <Ap className="adminNewCyberFrameBranch__intl-info">
          {t('adminNewCyberFrameBranch.i18nInfo', { ns: 'pages' })}
        </Ap>
        <div className="adminNewCyberFrameBranch__basics">
          <Input
            control={control}
            inputName="nameFr"
            type="text"
            label={`${t('nameCyberFrameBranch.label', { ns: 'fields' })} (FR)`}
            className="adminNewCyberFrameBranch__basics__name"
          />
        </div>
        <div className="adminNewCyberFrameBranch__details">
          <RichTextElement
            label={`${t('cyberFrameBranchSummary.title', { ns: 'fields' })} (FR)`}
            editor={introFrEditor}
            rawStringContent=""
            small
            complete
          />
        </div>
        <Button type="submit">{t('adminNewCyberFrameBranch.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewCyberFrameBranch;
