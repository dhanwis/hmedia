import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function RouteLoader() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  /* -------------------------------------------------
    ROUTE CHANGE (Link / Router / Back / Forward)
  --------------------------------------------------*/
  useEffect(() => {
    // show loader immediately on route change
    setLoading(true);

    // hide loader after page paints
    const timer = setTimeout(() => {
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  /* -------------------------------------------------
    MANUAL TRIGGER (Link click before navigation)
  --------------------------------------------------*/
  useEffect(() => {
    const handleShowLoader = () => setLoading(true);
    window.addEventListener("show-loader", handleShowLoader);
    return () => window.removeEventListener("show-loader", handleShowLoader);
  }, []);

  /* -------------------------------------------------
    MANUAL HIDE (components can hide the loader)
  --------------------------------------------------*/
  useEffect(() => {
    const handleHideLoader = () => setLoading(false);
    window.addEventListener("hide-loader", handleHideLoader);
    return () => window.removeEventListener("hide-loader", handleHideLoader);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-[9999] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
