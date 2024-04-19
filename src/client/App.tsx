import React, { useMemo, type FC } from 'react';

import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';

import { useGlobalVars } from './providers';

import {
  AdminCharParamsPage,
  AdminCyberFramesPage,
  AdminEditChapterPage,
  AdminEditCharParamPage,
  AdminEditCyberFrameBranchPage,
  AdminEditCyberFramePage,
  AdminEditItemModifierPage,
  AdminEditNodePage,
  AdminEditNotionPage,
  AdminEditPage,
  AdminEditRarityPage,
  AdminEditRuleBookPage,
  AdminEditSkillBranchPage,
  AdminEditSkillPage,
  AdminEditStatPage,
  AdminEditWeaponScopePage,
  AdminEditWeaponStylePage,
  AdminEditWeaponTypePage,
  AdminItemModifiersPage,
  AdminNewChapterPage,
  AdminNewCharParamPage,
  AdminNewCyberFrameBranchPage,
  AdminNewCyberFramePage,
  AdminNewItemModifierPage,
  AdminNewNodePage,
  AdminNewNotionPage,
  AdminNewPage,
  AdminNewRarityPage,
  AdminNewRuleBookPage,
  AdminNewSkillBranchPage,
  AdminNewSkillPage,
  AdminNewStatPage,
  AdminNewWeaponScopePage,
  AdminNewWeaponStylePage,
  AdminNewWeaponTypePage,
  AdminPage,
  AdminRaritiesPage,
  AdminRuleBooksPage,
  AdminSkillsPage,
  AdminStatsPage,
  AdminTestDiceCompPage,
  AdminWeaponScopesPage,
  AdminWeaponStylesPage,
  AdminWeaponTypesPage,
  CampaignPage,
  CampaignsPage,
  ChapterPage,
  CharacterEditPage,
  CharacterPage,
  CharactersPage,
  ErrorPage,
  ForgotPassPage,
  HomePage,
  JoinCampaignPage,
  LoginPage,
  NewCampaignPage,
  NewCharacterPage,
  NewPassPage,
  RuleBookPage,
  RuleBooksPage,
  SignupPage,
} from './pages';

// import { socket } from '../socket';

import arrowBackground from './assets/imgs/arrowbg.png';
import mainBackground from './assets/imgs/twinkle.png';
import { HeaderBar } from './organisms';

import './assets/scss/index.scss';

const App: FC = () => {
  const { loading } = useGlobalVars();

  const router = useMemo(
    () =>
      createBrowserRouter([
        {
          element: (
            <>
              <HeaderBar className="app__headerbar" />
              <div className="app__content">
                <Outlet />
              </div>
            </>
          ),
          children: [
            // Unlogged
            {
              path: '/',
              element: <HomePage />,
            },
            {
              path: '/signup',
              element: <SignupPage />,
            },
            {
              path: '/login',
              element: <LoginPage />,
            },
            {
              path: '/reset/password',
              element: <ForgotPassPage />,
            },
            {
              path: '/reset/password/:userId/:token',
              element: <NewPassPage />,
            },
            // Logged
            {
              path: '/rulebooks',
              element: <RuleBooksPage />,
            },
            {
              path: '/rulebook/:id',
              element: <RuleBookPage />,
            },
            {
              path: '/rulebook/:id/:chapterId',
              element: <ChapterPage />,
            },
            {
              path: '/campaigns',
              element: <CampaignsPage />,
            },
            {
              path: '/campaign/new',
              element: <NewCampaignPage />,
            },
            {
              path: '/campaign/join/:id',
              element: <JoinCampaignPage />,
            },
            {
              path: '/campaign/:id',
              element: <CampaignPage />,
            },
            {
              path: '/characters',
              element: <CharactersPage />,
            },
            {
              path: '/character/new',
              element: <NewCharacterPage />,
            },
            {
              path: '/character/:id',
              element: <CharacterPage />,
            },
            {
              path: '/character/:id/edit',
              element: <CharacterEditPage />,
            },
            // Admin
            {
              path: '/admin',
              element: <AdminPage />,
            },
            {
              path: '/admin/dicecomp',
              element: <AdminTestDiceCompPage />,
            },
            {
              path: '/admin/rulebooks',
              element: <AdminRuleBooksPage />,
            },
            {
              path: '/admin/rulebook/new',
              element: <AdminNewRuleBookPage />,
            },
            {
              path: '/admin/rulebook/:id',
              element: <AdminEditRuleBookPage />,
            },
            {
              path: '/admin/notion/new',
              element: <AdminNewNotionPage />,
            },
            {
              path: '/admin/notion/:id',
              element: <AdminEditNotionPage />,
            },
            {
              path: '/admin/chapter/new',
              element: <AdminNewChapterPage />,
            },
            {
              path: '/admin/chapter/:id',
              element: <AdminEditChapterPage />,
            },
            {
              path: '/admin/page/new',
              element: <AdminNewPage />,
            },
            {
              path: '/admin/page/:id',
              element: <AdminEditPage />,
            },
            {
              path: '/admin/cyberframes',
              element: <AdminCyberFramesPage />,
            },
            {
              path: '/admin/cyberframe/new',
              element: <AdminNewCyberFramePage />,
            },
            {
              path: '/admin/cyberframe/:id',
              element: <AdminEditCyberFramePage />,
            },
            {
              path: '/admin/stats',
              element: <AdminStatsPage />,
            },
            {
              path: '/admin/stat/new',
              element: <AdminNewStatPage />,
            },
            {
              path: '/admin/stat/:id',
              element: <AdminEditStatPage />,
            },
            {
              path: '/admin/skills',
              element: <AdminSkillsPage />,
            },
            {
              path: '/admin/skill/new',
              element: <AdminNewSkillPage />,
            },
            {
              path: '/admin/skill/:id',
              element: <AdminEditSkillPage />,
            },
            {
              path: '/admin/charparams',
              element: <AdminCharParamsPage />,
            },
            {
              path: '/admin/charparam/new',
              element: <AdminNewCharParamPage />,
            },
            {
              path: '/admin/charparam/:id',
              element: <AdminEditCharParamPage />,
            },
            {
              path: '/admin/cyberframebranch/new',
              element: <AdminNewCyberFrameBranchPage />,
            },
            {
              path: '/admin/cyberframebranch/:id',
              element: <AdminEditCyberFrameBranchPage />,
            },
            {
              path: '/admin/skillbranch/new',
              element: <AdminNewSkillBranchPage />,
            },
            {
              path: '/admin/skillbranch/:id',
              element: <AdminEditSkillBranchPage />,
            },
            {
              path: '/admin/node/new',
              element: <AdminNewNodePage />,
            },
            {
              path: '/admin/node/:id',
              element: <AdminEditNodePage />,
            },
            {
              path: '/admin/itemmodifiers',
              element: <AdminItemModifiersPage />,
            },
            {
              path: '/admin/itemmodifier/new',
              element: <AdminNewItemModifierPage />,
            },
            {
              path: '/admin/itemmodifier/:id',
              element: <AdminEditItemModifierPage />,
            },
            {
              path: '/admin/rarities',
              element: <AdminRaritiesPage />,
            },
            {
              path: '/admin/rarity/new',
              element: <AdminNewRarityPage />,
            },
            {
              path: '/admin/rarity/:id',
              element: <AdminEditRarityPage />,
            },
            {
              path: '/admin/weaponscopes',
              element: <AdminWeaponScopesPage />,
            },
            {
              path: '/admin/weaponscope/new',
              element: <AdminNewWeaponScopePage />,
            },
            {
              path: '/admin/weaponscope/:id',
              element: <AdminEditWeaponScopePage />,
            },
            {
              path: '/admin/weaponstyles',
              element: <AdminWeaponStylesPage />,
            },
            {
              path: '/admin/weaponstyle/new',
              element: <AdminNewWeaponStylePage />,
            },
            {
              path: '/admin/weaponstyle/:id',
              element: <AdminEditWeaponStylePage />,
            },
            {
              path: '/admin/weapontypes',
              element: <AdminWeaponTypesPage />,
            },
            {
              path: '/admin/weapontype/new',
              element: <AdminNewWeaponTypePage />,
            },
            {
              path: '/admin/weapontype/:id',
              element: <AdminEditWeaponTypePage />,
            },
            // {
            //   path: '/admin/skillbranch/:id',
            //   element: <AdminEditSkillBranchPage />,
            // },
            // All
            {
              path: '/*',
              element: <ErrorPage />,
            },
          ],
        },
      ]),
    []
  );

  return (
    <div
      className={`app${loading ? ' app--loading' : ''}`}
      style={{ backgroundImage: `url(${mainBackground})` }}
    >
      <div className="app__gradient" />
      <div className="app__arrows-bg" style={{ backgroundImage: `url(${arrowBackground})` }} />
      <div className="app__loader"></div>
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
