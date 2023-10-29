import React, { useCallback, type FC, useEffect, useState } from 'react';
import { useEditor } from '@tiptap/react';

import { useTranslation } from 'react-i18next';
import { useApi } from '../../providers/api';
import { useSystemAlerts } from '../../providers/systemAlerts';

import { Ap, Atitle } from '../../atoms';
import { Button } from '../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../organisms';

import { type IRuleBookType } from '../../interfaces';

import './adminNewRuleBook.scss';

const content = `
  <p>
    This is still the text editor you’re used to, but enriched with node views.
  </p>
  <react-component-test count="0"></react-component-test>
  <p>
    Did you see that? That’s a React component. We are really living in the future.
  </p>
`;

const AdminNewRuleBooks: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();

  const [ruleBookTypes, setRuleBookTypes] = useState<IRuleBookType[]>([]);

  console.log('ruleBookTypes', ruleBookTypes);

  const introEditor = useEditor({
    extensions: completeRichTextElementExtentions
  });

  const onSaveTextElt = useCallback((elt) => {
    if (introEditor === null) { return; }
    const html = introEditor.getHTML();
    console.log('html', html);
  }, [introEditor]);

  useEffect(() => {
    if (api !== undefined) {
      api.ruleBookTypes.getAll()
        .then((data: IRuleBookType[]) => {
          setRuleBookTypes(data);
        })
        .catch(({ response }) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert
                key={newId}
                id={newId}
                timer={5}
              >
                <Ap>{t('serverErrors.CYPU-301')}</Ap>
              </Alert>
            )
          });
        });
    }
  }, [api, createAlert, getNewId, t]);

  return (
    <div className="adminNewRuleBook">
      <Atitle level={1}>{t('adminNewRuleBook.title', { ns: 'pages' })}</Atitle>
      <RichTextElement title="Test" editor={introEditor} rawStringContent={content} complete />
      <Button
        onClick={onSaveTextElt}
      >
        Save
      </Button>
    </div>
  );
};

export default AdminNewRuleBooks;
