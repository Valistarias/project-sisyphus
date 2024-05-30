import React, { useCallback, useMemo, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useApi, useGlobalVars, useSystemAlerts } from '../providers';

import { Aa, Ap } from '../atoms';
import { Button, DropDownMenu } from '../molecules';

import Alert from './alert';

import { classTrim } from '../utils';

import './headerBar.scss';

interface IHeaderBar {
  /** The class of the HeaderBar */
  className?: string;
}

const HeaderBar: FC<IHeaderBar> = ({ className }) => {
  const { api } = useApi();
  const { user, setUser } = useGlobalVars();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { createAlert, getNewId } = useSystemAlerts();
  const { ruleBooks } = useGlobalVars();

  const [menuOpened, setMenuOpened] = useState<null | string>(null);

  const userState = useMemo(() => {
    if (user === null) {
      return 'unlogged';
    }
    if (user.roles.find((role) => role.name === 'admin') !== undefined) {
      return 'admin';
    }
    return 'logged';
  }, [user]);

  const cleanedRuleBooks = useMemo(
    () => ruleBooks.filter(({ ruleBook }) => !ruleBook.archived),
    [ruleBooks]
  );

  const onLogout = useCallback(() => {
    if (api !== undefined) {
      api.auth
        .signout()
        .then((res) => {
          setUser(null);
          navigate('/');
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
  }, [api, createAlert, getNewId, navigate, setUser, t]);

  return (
    <div
      className={classTrim(`
        headerbar
          ${className ?? ''}
        `)}
    >
      <div className="headerbar__content">
        <div className="headerbar__content__top">
          <Aa
            className="headerbar__menu"
            onClick={() => {
              setMenuOpened(null);
            }}
            href="/"
          >
            {t('home.title', { ns: 'pages' })}
          </Aa>
          {userState !== 'unlogged' ? (
            <>
              <Aa
                className="headerbar__menu"
                onClick={() => {
                  setMenuOpened(null);
                }}
                href="/characters"
              >
                {t('characters.title', { ns: 'pages' })}
              </Aa>
              <Aa
                className="headerbar__menu"
                onClick={() => {
                  setMenuOpened(null);
                }}
                href="/campaigns"
              >
                {t('campaigns.title', { ns: 'pages' })}
              </Aa>
              <DropDownMenu
                title={{
                  href: '/rulebooks',
                  text: t('ruleBooks.title', { ns: 'pages' }),
                }}
                content={cleanedRuleBooks.map(({ ruleBook }) => ({
                  href: `/rulebook/${ruleBook._id}`,
                  // TODO: Handle Internationalization
                  text: ruleBook.title,
                }))}
                className="headerbar__menu-list"
                onOpen={() => {
                  setMenuOpened('rulebooks');
                }}
                onClose={() => {
                  setMenuOpened(null);
                }}
                isOpen={menuOpened === 'rulebooks'}
              />
            </>
          ) : null}

          {userState === 'admin' ? (
            <DropDownMenu
              title={{
                href: '/admin',
                text: t('admin.title', { ns: 'pages' }),
              }}
              content={[
                {
                  title: t('headerBar.cat.texts', { ns: 'components' }),
                  list: [
                    {
                      href: '/admin/rulebooks',
                      text: t('adminRuleBooks.title', { ns: 'pages' }),
                    },
                    {
                      href: '/admin/tiptexts',
                      text: t('adminTipTexts.title', { ns: 'pages' }),
                    },
                  ],
                },
                {
                  title: t('headerBar.cat.core', { ns: 'components' }),
                  list: [
                    {
                      href: '/admin/stats',
                      text: t('adminStats.title', { ns: 'pages' }),
                    },
                    {
                      href: '/admin/skills',
                      text: t('adminSkills.title', { ns: 'pages' }),
                    },
                    {
                      href: '/admin/charparams',
                      text: t('adminCharParams.title', { ns: 'pages' }),
                    },
                    {
                      href: '/admin/damagetypes',
                      text: t('adminDamageTypes.title', { ns: 'pages' }),
                    },
                    {
                      href: '/admin/rarities',
                      text: t('adminRarities.title', { ns: 'pages' }),
                    },
                    {
                      href: '/admin/cyberframes',
                      text: t('adminCyberFrames.title', { ns: 'pages' }),
                    },
                    {
                      href: '/admin/backgrounds',
                      text: t('adminBackgrounds.title', { ns: 'pages' }),
                    },
                    {
                      href: '/admin/globalvalues',
                      text: t('adminGlobalValues.title', { ns: 'pages' }),
                    },
                  ],
                },
                {
                  title: t('headerBar.cat.item', { ns: 'components' }),
                  list: [
                    {
                      href: '/admin/items',
                      text: t('adminItems.title', { ns: 'pages' }),
                    },
                    {
                      href: '/admin/itemtypes',
                      text: t('adminItemTypes.title', { ns: 'pages' }),
                    },
                    {
                      href: '/admin/itemmodifiers',
                      text: t('adminItemModifiers.title', { ns: 'pages' }),
                    },
                  ],
                },
                {
                  title: t('headerBar.cat.weapon', { ns: 'components' }),
                  list: [
                    {
                      href: '/admin/weapons',
                      text: t('adminWeapons.title', { ns: 'pages' }),
                    },
                    {
                      href: '/admin/weaponscopes',
                      text: t('adminWeaponScopes.title', { ns: 'pages' }),
                    },
                    {
                      href: '/admin/weaponstyles',
                      text: t('adminWeaponStyles.title', { ns: 'pages' }),
                    },
                    {
                      href: '/admin/weapontypes',
                      text: t('adminWeaponTypes.title', { ns: 'pages' }),
                    },
                    {
                      href: '/admin/ammos',
                      text: t('adminAmmos.title', { ns: 'pages' }),
                    },
                  ],
                },
                {
                  title: t('headerBar.cat.armor', { ns: 'components' }),
                  list: [
                    {
                      href: '/admin/armors',
                      text: t('adminArmors.title', { ns: 'pages' }),
                    },
                    {
                      href: '/admin/armortypes',
                      text: t('adminArmorTypes.title', { ns: 'pages' }),
                    },
                  ],
                },
                {
                  title: t('headerBar.cat.inventory', { ns: 'components' }),
                  list: [
                    {
                      href: '/admin/bags',
                      text: t('adminBags.title', { ns: 'pages' }),
                    },
                    {
                      href: '/admin/programs',
                      text: t('adminPrograms.title', { ns: 'pages' }),
                    },
                    {
                      href: '/admin/implants',
                      text: t('adminImplants.title', { ns: 'pages' }),
                    },
                  ],
                },
                {
                  title: t('headerBar.cat.npc', { ns: 'components' }),
                  list: [
                    {
                      href: '/admin/npcs',
                      text: t('adminNPCs.title', { ns: 'pages' }),
                    },
                  ],
                },
                {
                  title: t('headerBar.cat.character', { ns: 'components' }),
                  list: [
                    {
                      href: '/admin/bodyparts',
                      text: t('adminBodyParts.title', { ns: 'pages' }),
                    },
                  ],
                },
                {
                  title: t('headerBar.cat.tools', { ns: 'components' }),
                  list: [
                    {
                      href: '/admin/dicecomp',
                      text: t('adminTestDiceComp.title', { ns: 'pages' }),
                    },
                  ],
                },
              ]}
              className="headerbar__menu-list"
              onOpen={() => {
                setMenuOpened('admin');
              }}
              onClose={() => {
                setMenuOpened(null);
              }}
              isOpen={menuOpened === 'admin'}
            />
          ) : null}
        </div>
        <div className="headerbar__content__bottom">
          {userState === 'unlogged' ? (
            <>
              <Aa className="headerbar__menu" href="/login">
                {t('login.title', { ns: 'pages' })}
              </Aa>
              <Aa className="headerbar__menu" href="/signup">
                {t('signup.title', { ns: 'pages' })}
              </Aa>
            </>
          ) : null}
          {userState !== 'unlogged' ? (
            <DropDownMenu
              title={{
                href: '#',
                text: t('profile.title', { ns: 'pages' }),
              }}
              content={[
                {
                  onClick: onLogout,
                  text: t('headerBar.logout', { ns: 'components' }),
                },
              ]}
              className="headerbar__menu-list"
              onOpen={() => {
                setMenuOpened('profile');
              }}
              onClose={() => {
                setMenuOpened(null);
              }}
              isOpen={menuOpened === 'profile'}
            />
          ) : null}
          <Button
            onClick={() => {
              const link = window.open('https://discord.gg/MFWrD4r9Rm', '_blank');
              if (link !== null) {
                link.focus();
              }
            }}
            icon="discord"
            theme="text-only"
          />
        </div>
      </div>
      <div
        className={classTrim(`
          headerbar__shadow
            ${menuOpened !== null ? 'headerbar__shadow--visible' : ''}
          `)}
        onClick={() => {
          setMenuOpened(null);
        }}
      />
    </div>
  );
};

export default HeaderBar;
