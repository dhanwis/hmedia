import React, { lazy, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import ConditionalLayout from "./components/user/ConditionalLayout";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import DefaultSEO from "./components/user/DefaultSEO";
import { Helmet } from "react-helmet-async";
import ArticleCategoryGuard from "./components/user/ArticleCategoryGuard";
import AdminBottomAdvertisement from "./pages/admin/AdminBottomAdvertisement";
import AdminFullScreenAd from "./pages/admin/AdminFullScreenAd";
import AdminPopupAdPage from "./pages/admin/AdminPopupAdPage";
import AdminRecycleBinPage from "./pages/admin/AdminRecycleBinPage";
// import FourNotFour from "./pages/FourNotFour";
const FourNotFour = lazy(() => import("./pages/FourNotFour"));

const Home = lazy(() => import("./pages/Home"));
const LatestNewsPage = lazy(() => import("./pages/LatestNewsPage"));
const CinemaNewsPage = lazy(() => import("./pages/CinemaNewsPage"));
const MeetThePersonPage = lazy(() => import("./pages/MeetThePersonPage"));
const TeaserAndPromoPage = lazy(() => import("./pages/TeaserAndPromoPage"));
const MoreNewsPage = lazy(() => import("./pages/MoreNewsPage"));
const ArticleDetailPage = lazy(() => import("./pages/ArticleDetailPage"));
const LoginPage = lazy(() => import("./pages/admin/LoginPage"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const HomeBannerPage = lazy(() => import("./pages/admin/HomeBannerPage"));
const AdminFlashNewsPage = lazy(() =>
  import("./pages/admin/AdminFlashNewsPage")
);
const AdminTrendingNewsPage = lazy(() =>
  import("./pages/admin/AdminTrendingNewsPage")
);
const AdminLatestPage = lazy(() => import("./pages/admin/AdminLatestPage"));
const AdminCinemaNewsPage = lazy(() =>
  import("./pages/admin/AdminCinemaNewsPage")
);
const AdminMeetpersonPage = lazy(() =>
  import("./pages/admin/AdminMeetpersonPage")
);
const AdminTeaserAndPromoPage = lazy(() =>
  import("./pages/admin/AdminTeaserAndPromoPage")
);
const AdminMoreNewsPage = lazy(() => import("./pages/admin/AdminMoreNewsPage"));
const AdminAdvertisementPage = lazy(() =>
  import("./pages/admin/AdminAdvertisementPage")
);

function App() {
  return (
    <>
      {/* DEFAULT / STATIC META */}
      <Helmet>
        <title>CHANNEL HMEDIA | Every Sector Has a Story. We Tell Them All | Cinema/Business/Life And More</title>
        <meta
          name="description"
          content="Get the latest scoop on the film industry with HMEDIA. Your source for cinema news, celebrity interviews, official teasers, and promotional videos."
        />
        <meta property="og:title" content="CHANNEL HMEDIA" />
        <meta
          property="og:description"
          content="Get the latest scoop on the film industry with HMEDIA. Your source for cinema news, celebrity interviews, official teasers, and promotional videos."
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="CHANNEL HMEDIA" />
      </Helmet>

      <DefaultSEO />
      <ConditionalLayout>
        <Routes>
          {/* User-facing routes */}
          <Route path="/" element={<Home />} />
          <Route path="/latestnews" element={<LatestNewsPage />} />
          <Route path="/cinemanews" element={<CinemaNewsPage />} />
          <Route path="/meettheperson" element={<MeetThePersonPage />} />
          <Route path="/teaserandpromo" element={<TeaserAndPromoPage />} />
          <Route path="/more" element={<MoreNewsPage />} />
          <Route
            path="/:category/:slug"
            element={
              <ArticleCategoryGuard>
                <ArticleDetailPage />
              </ArticleCategoryGuard>
            }
          />
          <Route path="/hmedianews/login" element={<LoginPage />} />
          <Route path="/404" element={<FourNotFour />} />
          <Route path="*" element={<FourNotFour />} />

          {/* Admin routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/hmedianews" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              
              <Route path="homebanner" element={<HomeBannerPage />} />
              <Route path="flashnews" element={<AdminFlashNewsPage />} />
              <Route path="trendingnews" element={<AdminTrendingNewsPage />} />
              <Route path="latestnews" element={<AdminLatestPage />} />
              <Route path="cinemanews" element={<AdminCinemaNewsPage />} />
              <Route path="meettheperson" element={<AdminMeetpersonPage />} />
              <Route
                path="teaserandpromo"
                element={<AdminTeaserAndPromoPage />}
              />
              <Route path="more" element={<AdminMoreNewsPage />} />
              <Route
                path="advertisement"
                element={<AdminAdvertisementPage />}
              />
              <Route
                path="bottomadvertisement"
                element={<AdminBottomAdvertisement />}
              />
              <Route
                path="fullscreenad"
                element={<AdminFullScreenAd />}
              />
              <Route
                path="popupad"
                element={<AdminPopupAdPage />}
              />
              <Route
               path="recyclebin"
               element={<AdminRecycleBinPage />}
              />
            </Route>
          </Route>
        </Routes>
      </ConditionalLayout>
    </>
  );
}

export default App;
