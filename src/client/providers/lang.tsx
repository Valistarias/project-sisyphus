import React, { useContext, useMemo, useState, type FC } from 'react';

import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';

import common_en from '../../i18n/en/common.json';
import components_en from '../../i18n/en/components.json';
import fields_en from '../../i18n/en/fields.json';
import pages_en from '../../i18n/en/pages.json';
import common_fr from '../../i18n/fr/common.json';
import components_fr from '../../i18n/fr/components.json';
import fields_fr from '../../i18n/fr/fields.json';
import pages_fr from '../../i18n/fr/pages.json';

interface ILangContext {
  /** Is the provider loading */
  loading: boolean;
}

interface LangProviderProps {
  /** The childrens of the Providers element */
  children: React.JSX.Element;
}

void i18next.use(initReactI18next).init({
  ns: ['common', 'fields', 'pages', 'components'],
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
    format: function (value, format, lng) {
      if (format === 'uppercase') return value.toUpperCase();
      if (format === 'lowercase') return value.toLowerCase();
      if (format === 'capitalize') return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
      return value;
    },
  },
  lng: 'en',
  resources: {
    en: {
      common: common_en,
      fields: fields_en,
      pages: pages_en,
      components: components_en,
    },
    fr: {
      common: common_fr,
      fields: fields_fr,
      pages: pages_fr,
      components: components_fr,
    },
  },
});

const LangContext = React.createContext<ILangContext | null>(null);

export const LangProvider: FC<LangProviderProps> = ({ children }) => {
  const [loading] = useState<boolean>(false);

  const providerValues = useMemo(
    () => ({
      loading,
    }),
    [loading]
  );

  return (
    <LangContext.Provider value={providerValues}>
      <I18nextProvider i18n={i18next}>{children}</I18nextProvider>
    </LangContext.Provider>
  );
};

export const useLang = (): ILangContext => {
  return useContext(LangContext) as ILangContext;
};
