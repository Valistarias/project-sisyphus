import type React from 'react';
import { useMemo, useState, type FC } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { RouterProvider, createBrowserRouter, useLocation, useOutlet } from 'react-router-dom';

import { useGlobalVars } from './providers';

import {
  AdminAmmosPage,
  AdminArmorTypesPage,
  AdminArmorsPage,
  AdminBackgroundsPage,
  AdminBagsPage,
  AdminBodyPartsPage,
  AdminCharParamsPage,
  AdminCyberFramesPage,
  AdminDamageTypesPage,
  AdminEditAmmoPage,
  AdminEditArmorPage,
  AdminEditArmorTypePage,
  AdminEditBackgroundPage,
  AdminEditBagPage,
  AdminEditBodyPartPage,
  AdminEditChapterPage,
  AdminEditCharParamPage,
  AdminEditCyberFrameBranchPage,
  AdminEditCyberFramePage,
  AdminEditDamageTypePage,
  AdminEditGlobalValuePage,
  AdminEditImplantPage,
  AdminEditItemModifierPage,
  AdminEditItemPage,
  AdminEditItemTypePage,
  AdminEditNPCPage,
  AdminEditNodePage,
  AdminEditNotionPage,
  AdminEditPage,
  AdminEditProgramPage,
  AdminEditProgramScopePage,
  AdminEditRarityPage,
  AdminEditRuleBookPage,
  AdminEditSkillBranchPage,
  AdminEditSkillPage,
  AdminEditStatPage,
  AdminEditTipTextPage,
  AdminEditWeaponPage,
  AdminEditWeaponScopePage,
  AdminEditWeaponStylePage,
  AdminEditWeaponTypePage,
  AdminGlobalValuesPage,
  AdminImplantsPage,
  AdminItemModifiersPage,
  AdminItemTypesPage,
  AdminItemsPage,
  AdminNPCsPage,
  AdminNewAmmoPage,
  AdminNewArmorPage,
  AdminNewArmorTypePage,
  AdminNewBackgroundPage,
  AdminNewBagPage,
  AdminNewBodyPartPage,
  AdminNewChapterPage,
  AdminNewCharParamPage,
  AdminNewCyberFrameBranchPage,
  AdminNewCyberFramePage,
  AdminNewDamageTypePage,
  AdminNewGlobalValuePage,
  AdminNewImplantPage,
  AdminNewItemModifierPage,
  AdminNewItemPage,
  AdminNewItemTypePage,
  AdminNewNPCPage,
  AdminNewNodePage,
  AdminNewNotionPage,
  AdminNewPage,
  AdminNewProgramPage,
  AdminNewProgramScopePage,
  AdminNewRarityPage,
  AdminNewRuleBookPage,
  AdminNewSkillBranchPage,
  AdminNewSkillPage,
  AdminNewStatPage,
  AdminNewTipTextPage,
  AdminNewWeaponPage,
  AdminNewWeaponScopePage,
  AdminNewWeaponStylePage,
  AdminNewWeaponTypePage,
  AdminPage,
  AdminProgramScopesPage,
  AdminProgramsPage,
  AdminRaritiesPage,
  AdminRuleBooksPage,
  AdminSkillsPage,
  AdminStatsPage,
  AdminTestDiceCompPage,
  AdminTipTextsPage,
  AdminWeaponScopesPage,
  AdminWeaponStylesPage,
  AdminWeaponTypesPage,
  AdminWeaponsPage,
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

const AnimatedOutlet: React.FC = () => {
  const o = useOutlet();
  const [outlet] = useState(o);

  return <>{outlet}</>;
};

const RootContainer: FC = () => {
  const location = useLocation();
  return (
    <>
      <HeaderBar className="app__headerbar" />
      <AnimatePresence mode="popLayout">
        <motion.div
          className="app__content"
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ ease: 'ease', duration: 0.3 }}

          // className="app__content"
          // key={location.pathname}
          // initial={{ height: 0, opacity: 0, overflowY: 'hidden' }}
          // animate={{
          //   height: '100%',
          //   opacity: 1,
          //   transitionEnd: {
          //     overflowY: 'auto',
          //   },
          // }}
          // exit={{ height: 0, opacity: 0 }}
          // transition={{ ease: 'easeIn', duration: 0.5 }}
        >
          <AnimatedOutlet />
        </motion.div>
      </AnimatePresence>
    </>
  );
};

const App: FC = () => {
  const { loading } = useGlobalVars();

  const router = useMemo(
    () =>
      createBrowserRouter([
        {
          element: <RootContainer />,
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
              path: '/character/:id/continue',
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
            {
              path: '/admin/damagetypes',
              element: <AdminDamageTypesPage />,
            },
            {
              path: '/admin/damagetype/new',
              element: <AdminNewDamageTypePage />,
            },
            {
              path: '/admin/damagetype/:id',
              element: <AdminEditDamageTypePage />,
            },
            {
              path: '/admin/weapons',
              element: <AdminWeaponsPage />,
            },
            {
              path: '/admin/weapon/new',
              element: <AdminNewWeaponPage />,
            },
            {
              path: '/admin/weapon/:id',
              element: <AdminEditWeaponPage />,
            },
            {
              path: '/admin/itemtypes',
              element: <AdminItemTypesPage />,
            },
            {
              path: '/admin/itemtype/new',
              element: <AdminNewItemTypePage />,
            },
            {
              path: '/admin/itemtype/:id',
              element: <AdminEditItemTypePage />,
            },
            {
              path: '/admin/bags',
              element: <AdminBagsPage />,
            },
            {
              path: '/admin/bag/new',
              element: <AdminNewBagPage />,
            },
            {
              path: '/admin/bag/:id',
              element: <AdminEditBagPage />,
            },
            {
              path: '/admin/ammos',
              element: <AdminAmmosPage />,
            },
            {
              path: '/admin/ammo/new',
              element: <AdminNewAmmoPage />,
            },
            {
              path: '/admin/ammo/:id',
              element: <AdminEditAmmoPage />,
            },
            {
              path: '/admin/npcs',
              element: <AdminNPCsPage />,
            },
            {
              path: '/admin/npc/new',
              element: <AdminNewNPCPage />,
            },
            {
              path: '/admin/npc/:id',
              element: <AdminEditNPCPage />,
            },
            {
              path: '/admin/programscopes',
              element: <AdminProgramScopesPage />,
            },
            {
              path: '/admin/programscope/new',
              element: <AdminNewProgramScopePage />,
            },
            {
              path: '/admin/programscope/:id',
              element: <AdminEditProgramScopePage />,
            },
            {
              path: '/admin/programs',
              element: <AdminProgramsPage />,
            },
            {
              path: '/admin/program/new',
              element: <AdminNewProgramPage />,
            },
            {
              path: '/admin/program/:id',
              element: <AdminEditProgramPage />,
            },
            {
              path: '/admin/bodyparts',
              element: <AdminBodyPartsPage />,
            },
            {
              path: '/admin/bodypart/new',
              element: <AdminNewBodyPartPage />,
            },
            {
              path: '/admin/bodypart/:id',
              element: <AdminEditBodyPartPage />,
            },
            {
              path: '/admin/implants',
              element: <AdminImplantsPage />,
            },
            {
              path: '/admin/implant/new',
              element: <AdminNewImplantPage />,
            },
            {
              path: '/admin/implant/:id',
              element: <AdminEditImplantPage />,
            },
            {
              path: '/admin/armortypes',
              element: <AdminArmorTypesPage />,
            },
            {
              path: '/admin/armortype/new',
              element: <AdminNewArmorTypePage />,
            },
            {
              path: '/admin/armortype/:id',
              element: <AdminEditArmorTypePage />,
            },
            {
              path: '/admin/armors',
              element: <AdminArmorsPage />,
            },
            {
              path: '/admin/armor/new',
              element: <AdminNewArmorPage />,
            },
            {
              path: '/admin/armor/:id',
              element: <AdminEditArmorPage />,
            },
            {
              path: '/admin/items',
              element: <AdminItemsPage />,
            },
            {
              path: '/admin/item/new',
              element: <AdminNewItemPage />,
            },
            {
              path: '/admin/item/:id',
              element: <AdminEditItemPage />,
            },
            {
              path: '/admin/tiptexts',
              element: <AdminTipTextsPage />,
            },
            {
              path: '/admin/tiptext/new',
              element: <AdminNewTipTextPage />,
            },
            {
              path: '/admin/tiptext/:id',
              element: <AdminEditTipTextPage />,
            },
            {
              path: '/admin/globalvalues',
              element: <AdminGlobalValuesPage />,
            },
            {
              path: '/admin/globalvalue/new',
              element: <AdminNewGlobalValuePage />,
            },
            {
              path: '/admin/globalvalue/:id',
              element: <AdminEditGlobalValuePage />,
            },
            {
              path: '/admin/backgrounds',
              element: <AdminBackgroundsPage />,
            },
            {
              path: '/admin/background/new',
              element: <AdminNewBackgroundPage />,
            },
            {
              path: '/admin/background/:id',
              element: <AdminEditBackgroundPage />,
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
