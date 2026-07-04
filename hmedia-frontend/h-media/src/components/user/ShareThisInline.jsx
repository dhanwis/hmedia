import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ShareThisInline = ({ title, description, image }) => {
  const location = useLocation();

  useEffect(() => {
    const loadButtons = () => {
      if (window.__sharethis__) {
        window.__sharethis__.load("sticky-share-buttons", {
          alignment: "left",     // Keep it on the left
          position: "left",      // Explicitly define side position
          color: "social",
          enabled: true,
          font_size: 14,
          hide_desktop: false,
          labels: "none",
          language: "en",
          networks: ["facebook", "whatsapp", "telegram", "twitter", "blogger"],
          padding: 10,
          radius: 4,
          show_mobile: true,     
          show_toggle: true,
          size: 40,
          top: 180,              // Distance from the top of the mobile screen
          
// changed today 3/26

          // Article Data
          url: window.location.origin + location.pathname,
          // url: "https://hmedia-api.channelhmedia.in" + location.pathname,


          title: title,
          description: description,
          image: image,
        });
      }
    };

    const interval = setInterval(() => {
      if (window.__sharethis__) {
        loadButtons();
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [location.pathname, title, description, image]);

  return <div className="sharethis-sticky-share-buttons" style={{ zIndex: 9999 }}></div>;
};

export default ShareThisInline;