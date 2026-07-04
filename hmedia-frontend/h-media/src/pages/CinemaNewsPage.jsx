import { useState, useEffect } from "react";
import { useApi } from "../context/ApiContext";
import {
  fetchCinemaNews,
  fetchCinemaNewsPaginated,
} from "../services/cinemaNewsService";
import {
  fetchBannerAds,
  fetchSquareAds,
} from "../services/advertisementService";
import AdList from "../components/user/AdList";
import FullWidthAd from "../components/user/FullWidthAd";
import NewsPagination from "../components/user/NewsPagination";
import ArticleCard from "../components/user/ArticleCard";
import CustomLoader from "../components/user/CustomLoader";

import { useSearchParams } from "react-router-dom";
import { InlineGoogleAd } from "../components/user/GoogleAd";
import BottomAdBanner from "../components/user/BottomAdBanner";
import FullscreenAd from "../components/user/FullscreenAd";
import { fetchBottomAdBanner } from "../services/bottomAdService";
import { fetchPopupAd } from "../services/popupAdService";
import PopupAd from "../components/user/PopupAd";
import { fetchFullScreenAds } from "../services/fullScreenAdService";

function CinemaNewsPage() {
  const [searchParams] = useSearchParams();
  const { baseURL } = useApi();

  const [cinemaNews, setCinemaNews] = useState([]);
  const [squareAds, setSquareAds] = useState([]);
  const [bannerAds, setBannerAds] = useState([]);
  const [poupAd, setPopuAd] = useState([]);
  const [fullScreenAd, setFullScreenAd] = useState([]);
  const [bottomAdBanner, setBottomAdBanner] = useState([]);

  const [loading, setLoading] = useState(true);

  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(12);

  const currentPage = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        // Fetch cinema news
        const cinemaData = await fetchCinemaNewsPaginated(
          baseURL,
          currentPage,
          limit,
        );

        setCinemaNews(cinemaData.items);
        setTotal(cinemaData.total);
        setLimit(cinemaData.limit);

        // Fetch square ads
        const squareData = await fetchSquareAds(baseURL);
        const filteredSquareAds = squareData
          .filter(
            (ad) => ad.status && ad.page_type?.toLowerCase() === "cinema news",
          )
          .sort((a, b) => a.order - b.order)
          .slice(0, 3)
          .map((ad) => ({
            image: `${baseURL}/${ad.image.replace(/\\/g, "/")}`,
            link: ad.link || "#",
            showContact: ad.show_contact,
            title: ad.title,
          }));
        setSquareAds(filteredSquareAds);

        // Fetch banner ads
        const bannerData = await fetchBannerAds(baseURL);
        const filteredBannerAds = bannerData
          .filter(
            (ad) => ad.status && ad.page_type?.toLowerCase() === "cinema news",
          )
          .sort((a, b) => a.order - b.order)
          .slice(0, 5)
          .map((ad) => ({
            image: `${baseURL}/${ad.image.replace(/\\/g, "/")}`,
            link: ad.link,
            showContact: ad.show_contact,
            title: ad.title,
          }));
        setBannerAds(filteredBannerAds);

        // Fetch bottom banner ads
        const bottomAdBannerData = await fetchBottomAdBanner(baseURL);
        const filteredBottomAdBanner = bottomAdBannerData
          .filter(
            (ad) => ad.status && ad.page_type?.toLowerCase() === "cinema news",
          )
          .sort((a, b) => a.order - b.order)
          .slice(0, 5)
          .map((ad) => ({
            image: `${baseURL}/${ad.image.replace(/\\/g, "/")}`,
            link: ad.link,
            title: ad.title,
          }));
        setBottomAdBanner(filteredBottomAdBanner);

        // Popup ads
        const popupAdData = await fetchPopupAd(baseURL);
        const filteredPopupAd = popupAdData
          .filter(
            (ad) => ad.status && ad.page_type?.toLowerCase() === "cinema news",
          )
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 1)
          .map((ad) => ({
            image: `${baseURL}/${ad.image.replace(/\\/g, "/")}`,
            link: ad.link,
            title: ad.title,
          }));
        setPopuAd(filteredPopupAd);

        // Full screen ads
        const fullScreenAdData = await fetchFullScreenAds(baseURL);
        const filteredFullScreenAd = fullScreenAdData
          .filter(
            (ad) => ad.status && ad.page_type?.toLowerCase() === "cinema news",
          )
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 1)
          .map((ad) => ({
            image: `${baseURL}/${ad.image.replace(/\\/g, "/")}`,
            link: ad.link,
            title: ad.title,
          }));
        setFullScreenAd(filteredFullScreenAd);
      } catch (error) {
        console.log("fetch error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [baseURL, currentPage, limit]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [searchParams]);

  const totalPages = Math.ceil(total / limit);

  if (loading)
    return (
      <>
        <CustomLoader />
      </>
    );
  return (
    <main className="min-h-screen bg-gray-50 text-[#141414]">
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* ================= MAIN CONTENT (Latest News Grid) ================= */}
        <div className="lg:col-span-9 flex flex-col gap-10">
          <h2
            className="text-lg sm:text-xl md:text-2xl font-black uppercase 
        border-b-2 border-brand-red pb-2 text-brand-dark mb-6"
          >
            Cinema News
          </h2>

          <InlineGoogleAd slot="2236151560" />

          <div className="grid md:grid-cols-3 gap-3">
            {/* Map through the sample data to display the articles */}
            {cinemaNews.map((article) => (
              <ArticleCard
                key={article.id}
                category="cinema-news"
                title={article.title}
                image={`${baseURL}/${article.image.replace(/\\/g, "/")}`}
                date={article.date}
                slug={article.slug}
                content={article.content}
                trending={article.trending}
                sponsored={article.is_sponsored}
              />
            ))}
          </div>

          <InlineGoogleAd slot="7488478241" />

          <NewsPagination currentPage={currentPage} totalPages={totalPages} />

          <FullWidthAd ads={bannerAds} />
        </div>

        <aside className="lg:col-span-3 space-y-8 lg:sticky lg:top-24 self-start lg:mt-9 z-50">
          <InlineGoogleAd slot="9923069891" />
          <AdList ads={squareAds} />
        </aside>
      </div>

      {bottomAdBanner?.length > 0 && <BottomAdBanner ads={bottomAdBanner} />}
      {PopupAd?.length > 0 && <PopupAd ads={poupAd} />}
      {fullScreenAd?.length > 0 && <FullscreenAd ads={fullScreenAd} />}
    </main>
  );
}

export default CinemaNewsPage;
