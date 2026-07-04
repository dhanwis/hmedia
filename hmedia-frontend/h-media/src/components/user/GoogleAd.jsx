import { useEffect, useRef, useState } from "react";

export function InlineGoogleAd({ slot, style = { minHeight: "250px" } }) {
  const adRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!adRef.current) return;

    // NEW: Prevent duplicate ad loading
    if (adRef.current.innerHTML.trim() !== "") return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});

      const observer = new MutationObserver(() => {
        const status = adRef.current.getAttribute("data-ad-status");
        if (status === "filled") setVisible(true);
        else if (status === "unfilled") setVisible(false);
      });

      observer.observe(adRef.current, {
        attributes: true,
        attributeFilter: ["data-ad-status"],
      });

      return () => observer.disconnect();
    } catch (e) {
      console.error("Adsense error");
    }
  }, []);

  if (!visible) return null; // <-- will NOT take space if ad is unfilled

  return (
    <div className="my-4 w-full flex justify-center">
      <ins
        ref={adRef}
        className="adsbygoogle block"
        style={style}
        data-ad-client="ca-pub-6937835186358603"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
