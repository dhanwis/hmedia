import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useApi } from "../context/ApiContext";
import { fetchBanners, fetchBannersHome } from "../services/bannerService";
import Hero from "../components/user/Hero";
import {
  fetchTrendingNews,
  fetchTrendingNewsLimit,
} from "../services/trendingNewsService";
import NewsColumn from "../components/user/NewsColumn";
import { fetchMoreNews, fetchMoreNewsLimit } from "../services/moreNewsService";
import {
  fetchTeasers,
  fetchTeasersLimit,
} from "../services/teaserPromoService";
import {
  fetchBannerAds,
  fetchSquareAds,
} from "../services/advertisementService";
import {
  fetchLatestNews,
  fetchLatestNewsLimit,
} from "../services/latestNewsService";
import {
  fetchCinemaNews,
  fetchCinemaNewsLimit,
} from "../services/cinemaNewsService";
import {
  fetchMeetPersons,
  fetchMeetPersonsLimit,
} from "../services/meetPersonService";
import FullWidthAd from "../components/user/FullWidthAd";
import AdList from "../components/user/AdList";
import MediaSlider from "../components/user/MediaSlider";
import CustomLoader from "../components/user/CustomLoader";
import { InlineGoogleAd } from "../components/user/GoogleAd";
import VideoVerticalSlider from "../components/user/VideoVerticalSlider";
import BottomAdBanner from "../components/user/BottomAdBanner";
import FullscreenAd from "../components/user/FullscreenAd";
import PopupAd from "../components/user/PopupAd";
import { fetchBottomAdBanner } from "../services/bottomAdService";
import { fetchPopupAd } from "../services/popupAdService";
import { fetchFullScreenAds } from "../services/fullScreenAdService";

const getYouTubeId = (url) => {
  if (!url) return null;
  const patterns = [
    /[?&]v=([^&]+)/,
    /youtu\.be\/([^?&/]+)/,
    /\/embed\/([^?&/]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m && m[1]) return m[1];
  }
  const m = url.match(/([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
};

const safeImage = (baseURL, image) => {
  if (!image) return null; // or fallback image path
  return `${baseURL}/${image.replace(/\\/g, "/")}`;
};

function Home() {
  const { baseURL } = useApi();
  const [latestNews, setLatestNews] = useState([]);
  const [trendingNews, setTrendingNews] = useState([]);
  const [cinemaNews, setCinemaNews] = useState([]);
  const [meetThePerson, setMeetThePerson] = useState([]);
  const [moreNews, setMoreNews] = useState([]);
  const [banners, setBanners] = useState([]);
  const [teasers, setTeasers] = useState([]);
  const [squareAds, setSquareAds] = useState([]);
  const [bannerAds, setBannerAds] = useState([]);
  const [poupAd, setPopuAd] = useState([]);
  const [fullScreenAd, setFullScreenAd] = useState([]);
  const [loading, setLoading] = useState(true);

  const [loadingLatest, setLoadingLatest] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingCinema, setLoadingCinema] = useState(true);
  const [loadingMeet, setLoadingMeet] = useState(true);

  const [bottomAdBanner, setBottomAdBanner] = useState([]);

  useEffect(() => {
    async function loadData() {
      const promises = [];

      /* -------- Latest News -------- */
      // promises.push(
      //   fetchLatestNews(baseURL)
      //     .then((latestData) => {
      //       latestData.sort(
      //         (a, b) => new Date(b.created_at) - new Date(a.created_at)
      //       );
      //       setLatestNews(
      //         latestData.slice(0, 5).map((item) => ({
      //           title: item.title,
      //           image: `${baseURL}/${item.image.replace(/\\/g, "/")}`,
      //           date: item.date,
      //           slug: item.slug,
      //           content: item.content,
      //         }))
      //       );
      //     })
      //     .catch((err) => console.error("Latest News Error"))
      //     .finally(() => setLoadingLatest(false))
      // );

      promises.push(
        fetchLatestNewsLimit(baseURL)
          .then((latestData) => {
            setLatestNews(
              latestData.map((item) => ({
                title: item.title,
                image: `${baseURL}/${item.image.replace(/\\/g, "/")}`,
                date: item.date,
                slug: item.slug,
                content: item.content,
                trending: item.trending,
                sponsored: item.is_sponsored,
              })),
            );
          })
          .catch(() => console.error("Latest News Error"))
          .finally(() => setLoadingLatest(false)),
      );
      /* -------- Trending News -------- */
      // promises.push(
      //   fetchTrendingNews(baseURL)
      //     .then((trendingData) => {
      //       trendingData.sort(
      //         (a, b) => new Date(b.created_at) - new Date(a.created_at),
      //       );
      //       setTrendingNews(
      //         trendingData.slice(0, 4).map((item) => ({
      //           title: item.title,
      //           image: safeImage(baseURL, item.image),
      //           date: item.date,
      //           slug: item.slug,
      //           content: item.content,
      //         })),
      //       );
      //     })
      //     .catch((err) => console.error("Trending News Error"))
      //     .finally(() => setLoadingTrending(false)),
      // );

      promises.push(
        fetchTrendingNewsLimit(baseURL)
          .then((trendingData) => {
            setTrendingNews(
              trendingData.map((item) => ({
                title: item.title,
                image: `${baseURL}/${item.image.replace(/\\/g, "/")}`,
                date: item.date,
                slug: item.slug,
                content: item.content,
                sponsored: item.is_sponsored,
              })),
            );
          })
          .catch(() => console.error("Trending News Error"))
          .finally(() => setLoadingTrending(false)),
      );

      /* -------- Cinema News -------- */
      promises.push(
        fetchCinemaNewsLimit(baseURL)
          .then((cinemaData) => {
            setCinemaNews(
              cinemaData.map((item) => ({
                title: item.title,
                image: `${baseURL}/${item.image.replace(/\\/g, "/")}`,
                date: item.date,
                slug: item.slug,
                content: item.content,
                trending: item.trending,
                sponsored: item.is_sponsored,
              })),
            );
          })
          .catch((err) => console.error("Cinema News Error"))
          .finally(() => setLoadingCinema(false)),
      );

      /* -------- Meet The Person -------- */
      promises.push(
        fetchMeetPersonsLimit(baseURL)
          .then((meetData) => {
            setMeetThePerson(
              meetData.map((item) => ({
                title: item.title,
                image: `${baseURL}/${item.image.replace(/\\/g, "/")}`,
                date: item.date,
                slug: item.slug,
                content: item.content,
                trending: item.trending,
                sponsored: item.is_sponsored,
              })),
            );
          })
          .catch((err) => console.error("Meet Person Error"))
          .finally(() => setLoadingMeet(false)),
      );

      /* -------- More News -------- */
      // promises.push(
      //   fetchMoreNews(baseURL)
      //     .then((moreData) => {
      //       moreData.sort(
      //         (a, b) => new Date(b.created_at) - new Date(a.created_at),
      //       );
      //       setMoreNews(
      //         moreData.slice(0, 10).map((item) => ({
      //           title: item.title,
      //           image: `${baseURL}/${item.image.replace(/\\/g, "/")}`,
      //           date: item.date,
      //           slug: item.slug,
      //           content: item.content,
      //         })),
      //       );
      //     })
      //     .catch((err) => console.error("More News Error")),
      // );

      promises.push(
        fetchMoreNewsLimit(baseURL)
          .then((moreNewsData) => {
            setMoreNews(
              moreNewsData
              .slice(0, 5) 
              .map((item) => ({
                title: item.title,
                image: `${baseURL}/${item.image.replace(/\\/g, "/")}`,
                date: item.date,
                slug: item.slug,
                content: item.content,
                trending: item.trending,
                sponsored: item.is_sponsored,
              })),
            );
          })
          .catch(() => console.error("More News trending Error")),
      );

      /* -------- Banners -------- */
      promises.push(
        fetchBannersHome(baseURL)
          .then((bannerData) => {
            setBanners(
              bannerData.map((item) => ({
                image: `${baseURL}/${item.image.replace(/\\/g, "/")}`,
                link: item.link,
              })),
            );
          })
          .catch((err) => console.error("Banners Error")),
      );

      /* -------- Teasers -------- */
      promises.push(
        fetchTeasersLimit(baseURL)
          .then((teaserData) => {
            setTeasers(
              teaserData.map((item) => {
                const videoId = getYouTubeId(item.video_url);
                return {
                  title: item.video_title,
                  image: videoId
                    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                    : null,
                  youtubeId: videoId,
                  date: item.published_date,
                  slug: "#",
                };
              }),
            );
          })
          .catch((err) => console.error("Teasers Error")),
      );

      /* -------- Ads -------- */
      promises.push(
        fetchSquareAds(baseURL)
          .then((squareAdsData) => {
            setSquareAds(
              squareAdsData
                .filter(
                  (ad) =>
                    ad.status === true &&
                    ad.page_type?.toLowerCase() === "home",
                )
                .sort((a, b) => a.order - b.order)
                .slice(0, 3)
                .map((ad) => ({
                  image: `${baseURL}/${ad.image.replace(/\\/g, "/")}`,
                  link: ad.link || "#",
                  showContact: ad.show_contact,
                  title: ad.title,
                })),
            );
          })
          .catch((err) => console.error("Square Ads Error")),
      );

      // Banner ads
      promises.push(
        fetchBannerAds(baseURL)
          .then((bannerAdsData) => {
            setBannerAds(
              bannerAdsData
                .filter(
                  (ad) =>
                    ad.status === true &&
                    ad.page_type?.toLowerCase() === "home",
                )
                .sort((a, b) => a.order - b.order)
                .slice(0, 5)
                .map((ad) => ({
                  image: `${baseURL}/${ad.image.replace(/\\/g, "/")}`,
                  link: ad.link,
                  showContact: ad.show_contact,
                  title: ad.title,
                })),
            );
          })
          .catch((err) => console.error("Banner Ads Error")),
      );

      // Bottom Ad Bannner
      promises.push(
        fetchBottomAdBanner(baseURL)
          .then((BottombannerAdsData) => {
            setBottomAdBanner(
              BottombannerAdsData.filter(
                (ad) =>
                  ad.status === true && ad.page_type?.toLowerCase() === "home",
              )
                .sort((a, b) => a.order - b.order)
                .slice(0, 5)
                .map((ad) => ({
                  image: `${baseURL}/${ad.image.replace(/\\/g, "/")}`,
                  link: ad.link,
                  order: ad.order,
                  title: ad.title,
                })),
            );
          })
          .catch((err) => console.error("Bottom Banner Ads Error")),
      );

      // Popup Ad
      promises.push(
        fetchPopupAd(baseURL)
          .then((popupAdData) => {
            setPopuAd(
              popupAdData
                .filter(
                  (ad) =>
                    ad.status === true &&
                    ad.page_type?.toLowerCase() === "home",
                )
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 1)
                .map((ad) => ({
                  image: `${baseURL}/${ad.image.replace(/\\/g, "/")}`,
                  link: ad.link,
                  title: ad.title,
                })),
            );
          })
          .catch((err) => console.error("Popup Ads Error")),
      );

      // Full screen Ad
      promises.push(
        fetchFullScreenAds(baseURL)
          .then((fullScreenAdData) => {
            setFullScreenAd(
              fullScreenAdData
                .filter(
                  (ad) =>
                    ad.status === true &&
                    ad.page_type?.toLowerCase() === "home",
                )
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 1)
                .map((ad) => ({
                  image: `${baseURL}/${ad.image.replace(/\\/g, "/")}`,
                  link: ad.link,
                  title: ad.title,
                })),
            );
          })
          .catch((err) => console.error("Full sreen Ads Error")),
      );

      await Promise.all(promises);
      setLoading(false);
    }

    if (!baseURL) return;
  loadData();
  }, []);

  if (loading)
    return (
      <>
        <CustomLoader />
      </>
    );

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-3 items-start">
          {/* HERO */}
          <div className="lg:col-span-3">
            <Hero banners={banners} />
          </div>

          <div className="mt-6 xl:mt-0 hidden xl:block">
            {/* <NewsColumn
              title="TRENDING NEWS"
              items={trendingNews}
              trending={true}
              loading={loadingTrending}
              category="trending-news"
            /> */}

            <div>
              <VideoVerticalSlider
                title="Trailers And Previews"
                items={teasers}
                autoSlide={true}
                delay={2500}
                loading={loading}
              />
            </div>
          </div>
          <InlineGoogleAd slot="9731498203" />
        </div>

        {/* ---------- Horizontal Ad under Banner & Trending ---------- */}
        <InlineGoogleAd slot="2236151560" />
      </section>
      <section className="w-full">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="mb-6 lg:mb-0">
            <NewsColumn
              title="Cinema News"
              items={cinemaNews}
              loading={loadingCinema}
              category="cinema-news"
            />
          </div>
          <div className="mb-6 xl:mb-0">
            <NewsColumn
              title="LATEST NEWS"
              items={latestNews}
              loading={loadingLatest}
              category="news"
            />
          </div>

          <div className="mb-6 lg:mb-0">
            {/* <MediaSlider
              title="Meet The Person"
              items={meetThePerson}
              loading={loadingMeet}
              category="meet-person"
             
            /> */}
             <NewsColumn
              title="Business Stories"
              items={moreNews}
              loading={false}
              category="more-news"
            />
          </div>
        </div>
      </section>
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* ================= LEFT COLUMN (Content 8/12) ================= */}
        <div className="lg:col-span-9 flex flex-col gap-5">
          <InlineGoogleAd slot="7488478241" />
          <div className="mt-5">
             {/* <NewsColumn
              title="Business Stories"
              items={moreNews}
              loading={false}
              category="more-news"
            /> */}
            <MediaSlider
              title="Meet The Person"
              items={meetThePerson}
              loading={loadingMeet}
              category="meet-person"
             
            />
          </div>

          <div className="flex justify-end">
              <Link
                to="/more"
                className="flex items-center gap-1 text-sm font-bold text-brand-red hover:text-brand-dark transition-colors"
              >
                View More <ArrowRight size={16} />
              </Link>
            </div>
          {bannerAds && <FullWidthAd ads={bannerAds} />}
          <div className="xl:hidden my-5">
            <MediaSlider
              title="Trailers And Previews"
              video={true}
              items={teasers}
            />
            <div className="flex justify-end mt-2">
              <Link
                to="/teaserandpromo"
                className="flex items-center gap-1 text-sm font-bold text-brand-red hover:text-brand-dark transition-colors"
              >
                View More <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          

          <div className="my-6 lg:my-0">
            <div className="mb-6">
              <MediaSlider
                title="TRENDING NEWS"
                items={trendingNews}
                loading={false}
                trending={true}
              />
            </div>

            {/* <div className="flex justify-end mt-2">
              <Link
                to="/more"
                className="flex items-center gap-1 text-sm font-bold text-brand-red hover:text-brand-dark transition-colors"
              >
                View More <ArrowRight size={16} />
              </Link>
            </div> */}
          </div>
          {/* <div>
            <MediaSlider
              title="Teaser And Promo"
              video={true}
              items={teasers}
            />
            <div className="flex justify-end mt-2">
              <Link
                to="/teaserandpromo"
                className="flex items-center gap-1 text-sm font-bold text-brand-red hover:text-brand-dark transition-colors"
              >
                View More <ArrowRight size={16} />
              </Link>
            </div>
          </div> */}
        </div>

        {/* ================= RIGHT COLUMN (Sidebar 4/12) ================= */}
        <aside className="lg:col-span-3 space-y-8 lg:sticky lg:top-24 self-start lg:mt-8 z-50">
          <InlineGoogleAd slot="9923069891" />
          <AdList ads={squareAds} />
        </aside>

        {bottomAdBanner?.length > 0 && <BottomAdBanner ads={bottomAdBanner} />}
        {/* {PopupAd?.length > 0 && <PopupAd ads={poupAd} />} */}
        {poupAd?.length > 0 && <PopupAd ads={poupAd} />}
        {fullScreenAd?.length > 0 && <FullscreenAd ads={fullScreenAd} />}
      </div>
    </main>
  );
}

export default Home;



// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { ArrowRight } from "lucide-react";
// import { useApi } from "../context/ApiContext";
// import { fetchBannersHome } from "../services/bannerService";
// import Hero from "../components/user/Hero";
// import { fetchTrendingNewsLimit } from "../services/trendingNewsService";
// import NewsColumn from "../components/user/NewsColumn";
// import { fetchMoreNewsLimit } from "../services/moreNewsService";
// import { fetchTeasersLimit } from "../services/teaserPromoService";
// import { fetchBannerAds, fetchSquareAds } from "../services/advertisementService";
// import { fetchLatestNewsLimit } from "../services/latestNewsService";
// import { fetchCinemaNewsLimit } from "../services/cinemaNewsService";
// import { fetchMeetPersonsLimit } from "../services/meetPersonService";
// import FullWidthAd from "../components/user/FullWidthAd";
// import AdList from "../components/user/AdList";
// import MediaSlider from "../components/user/MediaSlider";
// import { InlineGoogleAd } from "../components/user/GoogleAd";
// import VideoVerticalSlider from "../components/user/VideoVerticalSlider";
// import BottomAdBanner from "../components/user/BottomAdBanner";
// import FullscreenAd from "../components/user/FullscreenAd";
// import PopupAd from "../components/user/PopupAd";
// import { fetchBottomAdBanner } from "../services/bottomAdService";
// import { fetchPopupAd } from "../services/popupAdService";
// import { fetchFullScreenAds } from "../services/fullScreenAdService";

// const getYouTubeId = (url) => {
//   if (!url) return null;
//   const patterns = [
//     /[?&]v=([^&]+)/,
//     /youtu\.be\/([^?&/]+)/,
//     /\/embed\/([^?&/]+)/,
//   ];
//   for (const p of patterns) {
//     const m = url.match(p);
//     if (m && m[1]) return m[1];
//   }
//   const m = url.match(/([A-Za-z0-9_-]{11})/);
//   return m ? m[1] : null;
// };

// function Home() {
//   const { baseURL } = useApi();

//   const [latestNews, setLatestNews] = useState([]);
//   const [trendingNews, setTrendingNews] = useState([]);
//   const [cinemaNews, setCinemaNews] = useState([]);
//   const [meetThePerson, setMeetThePerson] = useState([]);
//   const [moreNews, setMoreNews] = useState([]);
//   const [banners, setBanners] = useState([]);
//   const [teasers, setTeasers] = useState([]);

//   const [squareAds, setSquareAds] = useState([]);
//   const [bannerAds, setBannerAds] = useState([]);
//   const [popupAd, setPopupAd] = useState([]);
//   const [fullScreenAd, setFullScreenAd] = useState([]);
//   const [bottomAdBanner, setBottomAdBanner] = useState([]);

//   // Separate loaders
//   const [loadingLatest, setLoadingLatest] = useState(true);
//   const [loadingTrending, setLoadingTrending] = useState(true);
//   const [loadingCinema, setLoadingCinema] = useState(true);
//   const [loadingMeet, setLoadingMeet] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(true);
//   const [loadingBanner, setLoadingBanner] = useState(true);
//   const [loadingTeasers, setLoadingTeasers] = useState(true);

//   useEffect(() => {
//     if (!baseURL) return;

//     // Latest News
//     fetchLatestNewsLimit(baseURL)
//       .then((latestData) => {
//         setLatestNews(
//           latestData.map((item) => ({
//             title: item.title,
//             image: `${baseURL}/${item.image.replace(/\\/g, "/")}`,
//             date: item.date,
//             slug: item.slug,
//             content: item.content,
//             trending: item.trending,
//             sponsored: item.is_sponsored,
//           }))
//         );
//       })
//       .catch(() => console.error("Latest News Error"))
//       .finally(() => setLoadingLatest(false));

//     // Trending News
//     fetchTrendingNewsLimit(baseURL)
//       .then((trendingData) => {
//         setTrendingNews(
//           trendingData.map((item) => ({
//             title: item.title,
//             image: `${baseURL}/${item.image.replace(/\\/g, "/")}`,
//             date: item.date,
//             slug: item.slug,
//             content: item.content,
//             sponsored: item.is_sponsored,
//           }))
//         );
//       })
//       .catch(() => console.error("Trending News Error"))
//       .finally(() => setLoadingTrending(false));

//     // Cinema News
//     fetchCinemaNewsLimit(baseURL)
//       .then((cinemaData) => {
//         setCinemaNews(
//           cinemaData.map((item) => ({
//             title: item.title,
//             image: `${baseURL}/${item.image.replace(/\\/g, "/")}`,
//             date: item.date,
//             slug: item.slug,
//             content: item.content,
//             trending: item.trending,
//             sponsored: item.is_sponsored,
//           }))
//         );
//       })
//       .catch(() => console.error("Cinema News Error"))
//       .finally(() => setLoadingCinema(false));

//     // Meet Person
//     fetchMeetPersonsLimit(baseURL)
//       .then((meetData) => {
//         setMeetThePerson(
//           meetData.map((item) => ({
//             title: item.title,
//             image: `${baseURL}/${item.image.replace(/\\/g, "/")}`,
//             date: item.date,
//             slug: item.slug,
//             content: item.content,
//             trending: item.trending,
//             sponsored: item.is_sponsored,
//           }))
//         );
//       })
//       .catch(() => console.error("Meet Person Error"))
//       .finally(() => setLoadingMeet(false));

//     // More News
//     fetchMoreNewsLimit(baseURL)
//       .then((moreNewsData) => {
//         setMoreNews(
//           moreNewsData.map((item) => ({
//             title: item.title,
//             image: `${baseURL}/${item.image.replace(/\\/g, "/")}`,
//             date: item.date,
//             slug: item.slug,
//             content: item.content,
//             trending: item.trending,
//             sponsored: item.is_sponsored,
//           }))
//         );
//       })
//       .catch(() => console.error("More News Error"))
//       .finally(() => setLoadingMore(false));

//     // Banners
//     fetchBannersHome(baseURL)
//       .then((bannerData) => {
//         setBanners(
//           bannerData.map((item) => ({
//             image: `${baseURL}/${item.image.replace(/\\/g, "/")}`,
//             link: item.link,
//           }))
//         );
//       })
//       .catch(() => console.error("Banners Error"))
//       .finally(() => setLoadingBanner(false));

//     // Teasers
//     fetchTeasersLimit(baseURL)
//       .then((teaserData) => {
//         setTeasers(
//           teaserData.map((item) => {
//             const videoId = getYouTubeId(item.video_url);
//             return {
//               title: item.video_title,
//               image: videoId
//                 ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
//                 : null,
//               youtubeId: videoId,
//               date: item.published_date,
//               slug: "#",
//             };
//           })
//         );
//       })
//       .catch(() => console.error("Teasers Error"))
//       .finally(() => setLoadingTeasers(false));

//     // Square Ads
//     fetchSquareAds(baseURL)
//       .then((squareAdsData) => {
//         setSquareAds(
//           squareAdsData
//             .filter(
//               (ad) =>
//                 ad.status === true && ad.page_type?.toLowerCase() === "home"
//             )
//             .sort((a, b) => a.order - b.order)
//             .slice(0, 3)
//             .map((ad) => ({
//               image: `${baseURL}/${ad.image.replace(/\\/g, "/")}`,
//               link: ad.link || "#",
//               showContact: ad.show_contact,
//               title: ad.title,
//             }))
//         );
//       })
//       .catch(() => console.error("Square Ads Error"));

//     // Banner Ads
//     fetchBannerAds(baseURL)
//       .then((bannerAdsData) => {
//         setBannerAds(
//           bannerAdsData
//             .filter(
//               (ad) =>
//                 ad.status === true && ad.page_type?.toLowerCase() === "home"
//             )
//             .sort((a, b) => a.order - b.order)
//             .slice(0, 5)
//             .map((ad) => ({
//               image: `${baseURL}/${ad.image.replace(/\\/g, "/")}`,
//               link: ad.link,
//               showContact: ad.show_contact,
//               title: ad.title,
//             }))
//         );
//       })
//       .catch(() => console.error("Banner Ads Error"));

//     // Bottom Banner Ads
//     fetchBottomAdBanner(baseURL)
//       .then((data) => {
//         setBottomAdBanner(
//           data
//             .filter(
//               (ad) =>
//                 ad.status === true && ad.page_type?.toLowerCase() === "home"
//             )
//             .sort((a, b) => a.order - b.order)
//             .slice(0, 5)
//             .map((ad) => ({
//               image: `${baseURL}/${ad.image.replace(/\\/g, "/")}`,
//               link: ad.link,
//               order: ad.order,
//               title: ad.title,
//             }))
//         );
//       })
//       .catch(() => console.error("Bottom Banner Ads Error"));

//     // Popup Ads
//     fetchPopupAd(baseURL)
//       .then((data) => {
//         setPopupAd(
//           data
//             .filter(
//               (ad) =>
//                 ad.status === true && ad.page_type?.toLowerCase() === "home"
//             )
//             .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
//             .slice(0, 1)
//             .map((ad) => ({
//               image: `${baseURL}/${ad.image.replace(/\\/g, "/")}`,
//               link: ad.link,
//               title: ad.title,
//             }))
//         );
//       })
//       .catch(() => console.error("Popup Ads Error"));

//     // Full Screen Ads
//     fetchFullScreenAds(baseURL)
//       .then((data) => {
//         setFullScreenAd(
//           data
//             .filter(
//               (ad) =>
//                 ad.status === true && ad.page_type?.toLowerCase() === "home"
//             )
//             .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
//             .slice(0, 1)
//             .map((ad) => ({
//               image: `${baseURL}/${ad.image.replace(/\\/g, "/")}`,
//               link: ad.link,
//               title: ad.title,
//             }))
//         );
//       })
//       .catch(() => console.error("Full Screen Ads Error"));
//   }, [baseURL]);

//   return (
//     <main className="min-h-screen bg-gray-50 text-gray-900">
//       <section className="container mx-auto px-4 py-8">
//         <div className="grid grid-cols-1 xl:grid-cols-4 gap-3 items-start">
//           <div className="lg:col-span-3">
//             <Hero banners={banners} loading={loadingBanner} />
//           </div>

//           <div className="mt-6 xl:mt-0 hidden xl:block">
//             <VideoVerticalSlider
//               title="Trailers And Previews"
//               items={teasers}
//               autoSlide={true}
//               delay={2500}
//               loading={loadingTeasers}
//             />
          
//           </div>

//           <InlineGoogleAd slot="9731498203" />
//         </div>

//         <InlineGoogleAd slot="2236151560" />
//       </section>

//       <section className="w-full">
//         <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
//           <div className="mb-6 lg:mb-0">
//             <NewsColumn
//               title="Cinema News"
//               items={cinemaNews}
//               loading={loadingCinema}
//               category="cinema-news"
//             />
//           </div>

//           <div className="mb-6 xl:mb-0">
//             <NewsColumn
//               title="LATEST NEWS"
//               items={latestNews}
//               loading={loadingLatest}
//               category="news"
//             />
//           </div>

//           <div className="mb-6 lg:mb-0">
//             <NewsColumn
//               title="Meet The Person"
//               items={meetThePerson}
//               loading={loadingMeet}
//               category="meet-person"
//             />
//           </div>
//         </div>
//       </section>

//       <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-10">
//         <div className="lg:col-span-9 flex flex-col gap-5">
//           <InlineGoogleAd slot="7488478241" />

//           <div className="mt-5">
//             <MediaSlider
//               title="Business Stories"
//               items={moreNews}
//               loading={loadingMore}
//             />
//           </div>

//           <div className="flex justify-end">
//             <Link
//               to="/more"
//               className="flex items-center gap-1 text-sm font-bold text-brand-red hover:text-brand-dark transition-colors"
//             >
//               View More <ArrowRight size={16} />
//             </Link>
//           </div>

//           {bannerAds?.length > 0 && <FullWidthAd ads={bannerAds} />}

//           <div className="xl:hidden my-5">
//             <MediaSlider
//               title="Trailers And Previews"
//               video={true}
//               items={teasers}
//               loading={loadingTeasers}
//             />
//             <div className="flex justify-end mt-2">
//               <Link
//                 to="/teaserandpromo"
//                 className="flex items-center gap-1 text-sm font-bold text-brand-red hover:text-brand-dark transition-colors"
//               >
//                 View More <ArrowRight size={16} />
//               </Link>
//             </div>
//           </div>

//           <div className="my-6 lg:my-0">
//             <div className="mb-6">
//               <MediaSlider
//                 title="TRENDING NEWS"
//                 items={trendingNews}
//                 loading={loadingTrending}
//                 trending={true}
//               />
//             </div>
//           </div>
//         </div>

//         <aside className="lg:col-span-3 space-y-8 lg:sticky lg:top-24 self-start lg:mt-8 z-50">
//           <InlineGoogleAd slot="9923069891" />
//           <AdList ads={squareAds} />
//         </aside>

//         {bottomAdBanner?.length > 0 && (
//           <BottomAdBanner ads={bottomAdBanner} />
//         )}

//         {/* FIXED CONDITION */}
//         {popupAd?.length > 0 && <PopupAd ads={popupAd} />}

//         {fullScreenAd?.length > 0 && <FullscreenAd ads={fullScreenAd} />}
//       </div>
//     </main>
//   );
// }

// export default Home;
