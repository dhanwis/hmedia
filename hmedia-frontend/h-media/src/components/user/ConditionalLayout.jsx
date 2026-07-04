import { useLocation } from "react-router-dom";
import Header from "./Header";
import FlashNews from "./FlashNews";
import Footer from "./Footer";
import CustomLoader from "./CustomLoader";

export default function ConditionalLayout({ children, loading }) {
  const location = useLocation();

  const isAdminPage = location.pathname.startsWith("/hmedianews");

  // PUBLIC ROUTES ONLY
  const publicRoutes = [
    "/",
    "/latestnews",
    "/cinemanews",
    "/meettheperson",
    "/teaserandpromo",
    "/more",
  ];

  const isArticlePage = location.pathname.split("/").length === 3;

  const is404 =
    !publicRoutes.includes(location.pathname) &&
    !isArticlePage &&
    !isAdminPage;

  if (loading) {
    return <CustomLoader />;
  }

  // Admin & 404 → no layout
  if (isAdminPage || is404) {
    return <>{children}</>;
  }

  // Public pages → full layout
  return (
    <>
      <Header />
      <FlashNews />
      {children}
      <Footer />
    </>
  );
}
