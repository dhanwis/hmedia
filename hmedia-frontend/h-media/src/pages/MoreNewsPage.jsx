import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useApi } from "../context/ApiContext";
import {
  fetchMoreNews,
  fetchMoreNewsPaginated,
} from "../services/moreNewsService";
import {
  fetchBannerAds,
  fetchSquareAds,
} from "../services/advertisementService";
import ArticleCard from "../components/user/ArticleCard";
import NewsPagination from "../components/user/NewsPagination";
import AdList from "../components/user/AdList";
import FullWidthAd from "../components/user/FullWidthAd";
import CustomLoader from "../components/user/CustomLoader";
import { InlineGoogleAd } from "../components/user/GoogleAd";
import BottomAdBanner from "../components/user/BottomAdBanner";
import FullscreenAd from "../components/user/FullscreenAd";
import { fetchBottomAdBanner } from "../services/bottomAdService";
import { fetchPopupAd } from "../services/popupAdService";
import PopupAd from "../components/user/PopupAd";
import { fetchFullScreenAds } from "../services/fullScreenAdService";

function MoreNewsPage() {
  const { baseURL } = useApi();

  const [searchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const [articles, setArticles] = useState([]);
  const [squareAds, setSquareAds] = useState([]);
  const [bannerAds, setBannerAds] = useState([]);
  const [bottomAdBanner, setBottomAdBanner] = useState([]);
  const [poupAd, setPopuAd] = useState([]);
  const [fullScreenAd, setFullScreenAd] = useState([]);
  const [loading, setLoading] = useState(true);

  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(12);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        /* ----------------- NEWS ----------------- */
        const moreNews = await fetchMoreNewsPaginated(
          baseURL,
          currentPage,
          limit,
        );

        setArticles(moreNews.items);
        setTotal(moreNews.total);
        setLimit(moreNews.limit);

        /* ----------------- SQUARE ADS ----------------- */
        const squareAdsData = await fetchSquareAds(baseURL);
        const filteredSquareAds = squareAdsData
          .filter(
            (ad) =>
              ad.status === true &&
              (ad.page_type?.toLowerCase() === "more news" ||
                ad.page_type?.toLowerCase() === "business stories"),
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

        /* ----------------- BANNER ADS ----------------- */
        const bannerAdsData = await fetchBannerAds(baseURL);
        const filteredBannerAds = bannerAdsData
          .filter(
            (ad) =>
              ad.status === true &&
              (ad.page_type?.toLowerCase() === "more news" ||
                ad.page_type?.toLowerCase() === "business stories"),
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
            (ad) =>
              ad.status === true &&
              (ad.page_type?.toLowerCase() === "more news" ||
                ad.page_type?.toLowerCase() === "business stories"),
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
            (ad) =>
              ad.status === true &&
              (ad.page_type?.toLowerCase() === "more news" ||
                ad.page_type?.toLowerCase() === "business stories"),
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
            (ad) =>
              ad.status === true &&
              (ad.page_type?.toLowerCase() === "more news" ||
                ad.page_type?.toLowerCase() === "business stories"),
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
        console.error("More page error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [baseURL, currentPage, limit]);

  /* ----------------- PAGINATION ----------------- */
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  if (loading) {
    return (
      <>
        <CustomLoader />
      </>
    );
  }
  return (
    <main className="min-h-screen bg-gray-50 text-[#141414]">
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* ================= MAIN CONTENT (Latest News Grid) ================= */}
        <div className="lg:col-span-9 flex flex-col gap-10">
          <h2
            className="text-lg sm:text-xl md:text-2xl font-black uppercase 
        border-b-2 border-brand-red pb-2 text-brand-dark mb-6"
          >
            Business Stories
          </h2>

          <InlineGoogleAd slot="2236151560" />

          <div className="grid md:grid-cols-3 gap-3">
            {/* Map through the sample data to display the articles */}
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                category="more-news"
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

export default MoreNewsPage;
