import { useState, useEffect } from "react";
import { useApi } from "../context/ApiContext";
import {
  fetchBannerAds,
  fetchSquareAds,
} from "../services/advertisementService";
import {
  fetchLatestNews,
  fetchLatestNewsPaginated,
} from "../services/latestNewsService";
import ArticleCard from "../components/user/ArticleCard";
import NewsPagination from "../components/user/NewsPagination";
import FullWidthAd from "../components/user/FullWidthAd";
import AdList from "../components/user/AdList";
import CustomLoader from "../components/user/CustomLoader";

import { useSearchParams } from "react-router-dom";
import { InlineGoogleAd } from "../components/user/GoogleAd";
import BottomAdBanner from "../components/user/BottomAdBanner";
import FullscreenAd from "../components/user/FullscreenAd";
import PopupAd from "../components/user/PopupAd";
import { fetchBottomAdBanner } from "../services/bottomAdService";
import { fetchPopupAd } from "../services/popupAdService";
import { fetchFullScreenAds } from "../services/fullScreenAdService";

function LatestNewsPage() {
  const [searchParams] = useSearchParams();
  const { baseURL } = useApi();

  const [latestNews, setLatestNews] = useState([]);
  const [squareAds, setSquareAds] = useState([]);
  const [bannerAds, setBannerAds] = useState([]);
  const [bottomAdBanner, setBottomAdBanner] = useState([]);
  const [poupAd, setPopuAd] = useState([]);
  const [fullScreenAd, setFullScreenAd] = useState([]);
  const [loading, setLoading] = useState(true);

  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(12);

  const currentPage = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        // Fetch latest news
        const paginatedData = await fetchLatestNewsPaginated(
          baseURL,
          currentPage,
          limit,
        );

        setLatestNews(paginatedData.items);
        setTotal(paginatedData.total);
        setLimit(paginatedData.limit);

        // Fetch square ads
        const squareData = await fetchSquareAds(baseURL);
        const filteredSquareAds = squareData
          .filter(
            (ad) => ad.status && ad.page_type?.toLowerCase() === "latest news",
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
            (ad) => ad.status && ad.page_type?.toLowerCase() === "latest news",
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
            (ad) => ad.status && ad.page_type?.toLowerCase() === "latest news",
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
            (ad) => ad.status && ad.page_type?.toLowerCase() === "latest news",
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
            (ad) => ad.status && ad.page_type?.toLowerCase() === "latest news",
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
        console.log("Latest News Error");
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
        <div className="lg:col-span-9 flex flex-col gap-10">
          <h2 className="text-lg sm:text-xl md:text-2xl font-black uppercase border-b-2 border-brand-red pb-2 text-brand-dark mb-6">
            Latest News
          </h2>

          <InlineGoogleAd slot="2236151560" />

          <div className="grid md:grid-cols-3 gap-3">
            {latestNews.map((article) => (
              <ArticleCard
                key={article.id}
                category="news"
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
      {fullScreenAd?.length > 0 && <FullscreenAd ads={fullScreenAd} />}
      {PopupAd?.length > 0 && <PopupAd ads={poupAd} />}
    </main>
  );
}

export default LatestNewsPage;
