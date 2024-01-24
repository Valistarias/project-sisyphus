import React, { useEffect, useMemo, type FC } from 'react';

import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { io } from 'socket.io-client';

import { useGlobalVars } from './providers';

import {
  AdminEditChapterPage,
  AdminEditNotionPage,
  AdminEditPage,
  AdminEditRuleBookPage,
  AdminNewChapterPage,
  AdminNewNotionPage,
  AdminNewPage,
  AdminNewRuleBookPage,
  AdminPage,
  AdminRuleBooksPage,
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

  useEffect(() => {
    const socket = io({ transports: ['websocket'] });

    socket.on('connect', () => {
      console.log('connected');
    });

    return () => {
      socket.off('connect', () => {
        console.log('disconnected');
      });
    };
  }, []);

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
