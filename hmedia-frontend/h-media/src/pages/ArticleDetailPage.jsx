import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import { Clock, User, FileQuestion, Eye } from "lucide-react";
import { useApi } from "../context/ApiContext";
import { fetchArticleBySlug } from "../services/fetchArticleBySlug";
import {
  fetchBannerAds,
  fetchSquareAds,
} from "../services/advertisementService";
import AdList from "../components/user/AdList";
import FullWidthAd from "../components/user/FullWidthAd";
import ShareButtons from "../components/user/ShareButtons";
import CustomLoader from "../components/user/CustomLoader";
import { InlineGoogleAd } from "../components/user/GoogleAd";
import ShareThisInline from "../components/user/ShareThisInline";
import BottomAdBanner from "../components/user/BottomAdBanner";
import FullscreenAd from "../components/user/FullscreenAd";
import { fetchBottomAdBanner } from "../services/bottomAdService";
import { fetchPopupAd } from "../services/popupAdService";
import PopupAd from "../components/user/PopupAd";
import { fetchFullScreenAds } from "../services/fullScreenAdService";

const decodeHTML = (html = "") => {
  if (typeof window === "undefined") return html;

  const textarea = document.createElement("textarea");
  textarea.innerHTML = html;
  return textarea.value;
};

const stripHTML = (html = "") =>
  decodeHTML(html)
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

const truncate = (text = "", limit = 120) =>
  text.length > limit ? text.slice(0, limit) + "…" : text;

const formatDate = (dateString) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
      .replace(",", "");
  } catch {
    return dateString;
  }
};

function ArticleDetailPage() {
  const { category, slug } = useParams();
  const { baseURL } = useApi();

  const [article, setArticle] = useState(null);
  const [squareAds, setSquareAds] = useState([]);
  const [bannerAds, setBannerAds] = useState([]);
  const [bottomAdBanner, setBottomAdBanner] = useState([]);
  const [poupAd, setPopuAd] = useState([]);
  const [fullScreenAd, setFullScreenAd] = useState([]);
  const [loading, setLoading] = useState(true);
  const [articleShare, setArticleShare] = useState(null);

  //old
  // useEffect(() => {
  //   const loadData = async () => {
  //     try {
  //       setLoading(true);

  //       const articleData = await fetchArticleBySlug(baseURL, category, slug);
  //       setArticle(articleData);

  //       // const articleDataForShare = await fetchArticleBySlugForShare(
  //       //   baseURL,
  //       //   category,
  //       //   slug
  //       // );

  //       // setArticleShare(articleDataForShare);

  //       /* ---------- Square Ads ---------- */
  //       const squareAdsData = await fetchSquareAds(baseURL);
  //       setSquareAds(
  //         squareAdsData
  //           .filter(
  //             (ad) =>
  //               ad.status === true &&
  //               ad.page_type?.toLowerCase() === "news detail",
  //           )
  //           .sort((a, b) => a.order - b.order)
  //           .slice(0, 3)
  //           .map((ad) => ({
  //             image: `${baseURL}/${ad.image.replace(/\\/g, "/")}`,
  //             link: ad.link || "#",
  //             showContact: ad.show_contact,
  //             title: ad.title,
  //           })),
  //       );

  //       /* ---------- Banner Ads ---------- */
  //       const bannerAdsData = await fetchBannerAds(baseURL);
  //       setBannerAds(
  //         bannerAdsData
  //           .filter(
  //             (ad) =>
  //               ad.status === true &&
  //               ad.page_type?.toLowerCase() === "news detail",
  //           )
  //           .sort((a, b) => a.order - b.order)
  //           .slice(0, 5)
  //           .map((ad) => ({
  //             image: `${baseURL}/${ad.image.replace(/\\/g, "/")}`,
  //             link: ad.link,
  //             showContact: ad.show_contact,
  //             title: ad.title,
  //           })),
  //       );

  //       // Fetch bottom banner ads
  //       const bottomAdBannerData = await fetchBottomAdBanner(baseURL);
  //       const filteredBottomAdBanner = bottomAdBannerData
  //         .filter(
  //           (ad) => ad.status && ad.page_type?.toLowerCase() === "news detail",
  //         )
  //         .sort((a, b) => a.order - b.order)
  //         .slice(0, 5)
  //         .map((ad) => ({
  //           image: `${baseURL}/${ad.image.replace(/\\/g, "/")}`,
  //           link: ad.link,
  //           title: ad.title,
  //         }));
  //       setBottomAdBanner(filteredBottomAdBanner);

  //       // Popup ads
  //       const popupAdData = await fetchPopupAd(baseURL);
  //       const filteredPopupAd = popupAdData
  //         .filter(
  //           (ad) => ad.status && ad.page_type?.toLowerCase() === "news detail",
  //         )
  //         .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  //         .slice(0, 1)
  //         .map((ad) => ({
  //           image: `${baseURL}/${ad.image.replace(/\\/g, "/")}`,
  //           link: ad.link,
  //           title: ad.title,
  //         }));
  //       setPopuAd(filteredPopupAd);

  //       // Full screen ads
  //       const fullScreenAdData = await fetchFullScreenAds(baseURL);
  //       const filteredFullScreenAd = fullScreenAdData
  //         .filter(
  //           (ad) => ad.status && ad.page_type?.toLowerCase() === "news detail",
  //         )
  //         .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  //         .slice(0, 1)
  //         .map((ad) => ({
  //           image: `${baseURL}/${ad.image.replace(/\\/g, "/")}`,
  //           link: ad.link,
  //           title: ad.title,
  //         }));
  //       setFullScreenAd(filteredFullScreenAd);
  //     } catch (error) {
  //       console.error("Article detail error");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   loadData();
  // }, [baseURL, category, slug]);
  
 //new
  useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch Article
      const articleData = await fetchArticleBySlug(baseURL, category, slug);
      console.log("Article Data:", articleData); // ✅ log article
      setArticle(articleData);

      // Square Ads
      const squareAdsData = await fetchSquareAds(baseURL);
      console.log("Square Ads Data:", squareAdsData); // ✅ log square ads
      setSquareAds(
        squareAdsData
          .filter(
            (ad) =>
              ad.status === true &&
              ad.page_type?.toLowerCase() === "news detail"
          )
          .sort((a, b) => a.order - b.order)
          .slice(0, 3)
          .map((ad) => ({
            image: `${baseURL}/${ad.image.replace(/\\/g, "/")}`,
            link: ad.link || "#",
            showContact: ad.show_contact,
            title: ad.title,
          }))
      );

      // Banner Ads
      const bannerAdsData = await fetchBannerAds(baseURL);
      console.log("Banner Ads Data:", bannerAdsData); // ✅ log banner ads
      setBannerAds(
        bannerAdsData
          .filter(
            (ad) =>
              ad.status === true &&
              ad.page_type?.toLowerCase() === "news detail"
          )
          .sort((a, b) => a.order - b.order)
          .slice(0, 5)
          .map((ad) => ({
            image: `${baseURL}/${ad.image.replace(/\\/g, "/")}`,
            link: ad.link,
            showContact: ad.show_contact,
            title: ad.title,
          }))
      );

      // Bottom Banner Ads
      const bottomAdBannerData = await fetchBottomAdBanner(baseURL);
      console.log("Bottom Banner Ads Data:", bottomAdBannerData); // ✅ log bottom banner
      const filteredBottomAdBanner = bottomAdBannerData
        .filter(
          (ad) => ad.status && ad.page_type?.toLowerCase() === "news detail"
        )
        .sort((a, b) => a.order - b.order)
        .slice(0, 5)
        .map((ad) => ({
          image: `${baseURL}/${ad.image.replace(/\\/g, "/")}`,
          link: ad.link,
          title: ad.title,
        }));
      setBottomAdBanner(filteredBottomAdBanner);

      // Popup Ads
      const popupAdData = await fetchPopupAd(baseURL);
      console.log("Popup Ads Data:", popupAdData); // ✅ log popup ads
      const filteredPopupAd = popupAdData
        .filter(
          (ad) => ad.status && ad.page_type?.toLowerCase() === "news detail"
        )
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 1)
        .map((ad) => ({
          image: `${baseURL}/${ad.image.replace(/\\/g, "/")}`,
          link: ad.link,
          title: ad.title,
        }));
      setPopuAd(filteredPopupAd);

      // Full Screen Ads
      const fullScreenAdData = await fetchFullScreenAds(baseURL);
      console.log("Full Screen Ads Data:", fullScreenAdData); // ✅ log fullscreen ads
      const filteredFullScreenAd = fullScreenAdData
        .filter(
          (ad) => ad.status && ad.page_type?.toLowerCase() === "news detail"
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
      console.error("Article detail error:", error);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, [baseURL, category, slug]);
  const sanitizeHTML = (html) => {
    if (!html) return "";

    const textarea = document.createElement("textarea");
    textarea.innerHTML = html;
    let decoded = textarea.value;

    decoded = decoded.replace(/\s+/g, " ").trim();

    return decoded;
  };

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <>
        <CustomLoader />
      </>
    );
  }

  /* ---------------- 404 ---------------- */
  if (!article) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center space-y-6 bg-white p-12 rounded-lg shadow-xl">
          <FileQuestion className="mx-auto h-16 w-16 text-brand-red" />
          <h1 className="text-4xl font-extrabold text-brand-dark">
            404 - News Not Found
          </h1>
          <p className="text-gray-600">
            Sorry, we couldn't find the News you were looking for.
          </p>
          <Link
            to="/"
            className="inline-block bg-brand-red text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-dark transition"
          >
            Go back to Homepage
          </Link>
        </div>
      </main>
    );
  }

  const normalizeTags = (rawTags) => {
    if (!rawTags) return "";

    let parsedTags = [];

    if (Array.isArray(rawTags)) {
      // Case: ['["a","b"]']
      if (rawTags.length === 1 && typeof rawTags[0] === "string") {
        try {
          const parsed = JSON.parse(rawTags[0]);
          if (Array.isArray(parsed)) parsedTags = parsed;
          else parsedTags = rawTags;
        } catch {
          parsedTags = rawTags;
        }
      } else {
        parsedTags = rawTags;
      }
    } else if (typeof rawTags === "string") {
      try {
        const parsed = JSON.parse(rawTags);
        if (Array.isArray(parsed)) parsedTags = parsed;
        else parsedTags = [rawTags];
      } catch {
        parsedTags = [rawTags];
      }
    }

    // Remove empty strings, trim, and join with commas
    return parsedTags
      .map((t) => t.trim())
      .filter(Boolean)
      .join(",");
  };

  return (
    <>
      <Helmet>
        <title>{article.title}</title>

        <meta
          name="description"
          content={truncate(stripHTML(article.content), 160)}
        />

        <meta
          name="keywords"
          content={[
            "Latest cinema news updates India, Upcoming movie teasers and promos, Exclusive interviews with film stars, Trending entertainment news today, Behind the scenes movie updates, Watch Movie Teasers, Read Cinema News, Subscribe to H Media, Follow Movie Updates, Malayalam Cinema, Mollywood, Kerala Film Industry, New Malayalam Movies, Malayalam Movie Industry, Malayalam Movie Reviews, Mollywood Box Office Collection, Malayalam OTT Release Dates, Friday Release Malayalam, Theatre Response Malayalam Movies",
            normalizeTags(article?.tags),
          ]
            .filter(Boolean)
            .join(", ")}
        />

        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={article.title} />
        <meta
          property="og:description"
          content={truncate(stripHTML(article.content), 160)}
        />
        <meta
          property="og:image"
          content={`${baseURL.replace(/\/$/, "")}/${article.image
            .replace(/^\//, "")
            .replace(/\\/g, "/")}`}
        />
        <meta
          property="og:url"
          content={`${window.location.origin}/${category}/${slug}`}
        />
        <meta property="og:site_name" content="Channel H Media" />

        {/* Required for WhatsApp */}
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta
          name="twitter:description"
          content={truncate(stripHTML(article.content), 160)}
        />
        <meta
          name="twitter:image"
          content={`${baseURL.replace(/\/$/, "")}/${article.image
            .replace(/^\//, "")
            .replace(/\\/g, "/")}`}
        />
      </Helmet>

      <main className="min-h-screen bg-gray-50 text-[#141414]">
        <div className="container mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT CONTENT */}
          <div className="lg:col-span-9">
            <header className="mb-6">
              <h1 className="text-xl md:text-3xl font-extrabold mb-4 font-mal">
                {article.title}
              </h1>
              {/* <div className="flex items-center space-x-4 text-gray-600 text-sm">
                <span className="flex items-center">
                  <User size={16} className="mr-1" />
                  {article.author}
                </span>
                <span className="flex items-center">
                  <Clock size={16} className="mr-1" />
                  {formatDate(article.date)}
                </span>
              </div> */}
              <div className="flex items-center space-x-4 text-gray-600 text-sm">
  <span className="flex items-center">
    <User size={16} className="mr-1" />
    {article.author}
  </span>

  <span className="flex items-center">
    <Clock size={16} className="mr-1" />
    {formatDate(article.date)}
  </span>
  {/* <span className="flex items-center">
      <Eye size={16} className="mr-1" />
      {article.view_count}
    </span>
   */}

  {/* 👁 View Count (only if admin enabled) */}
{article.show_view_count && (
  <span className="flex items-center">
    <Eye size={16} className="mr-1" />
    {article.view_count ?? 0}
  </span>
)}
</div>
            </header>

            {/* IMAGE */}
            <div className="mb-8 aspect-video rounded-lg overflow-hidden">
              <img
                src={`${baseURL.replace(/\/$/, "")}/${article.image.replace(
                  /^\//,
                  "",
                )}`}
                alt={article.title}
                className="w-full h-full object-fill"
              />
            </div>

            <InlineGoogleAd slot="2236151560" />

            {/* CONTENT */}
            <article
              className="article-content w-full text-gray-700 font-mal text-sm sm:text-lg"
              dangerouslySetInnerHTML={{
                __html: sanitizeHTML(article.content),
              }}
            />

            <InlineGoogleAd slot="6015807995" />

            <InlineGoogleAd slot="7488478241" />

            {/* SHARE */}
            <div className="flex justify-end mt-10">
              <ShareButtons
                title={article.title}
                slug={slug}
                category={category}
                image={`${baseURL.replace(/\/$/, "")}/${article.image
                  .replace(/^\//, "")
                  .replace(/\\/g, "/")}`}
                description={truncate(stripHTML(article?.content || ""), 120)}
                date={formatDate(article?.date)}
              />
            </div>

            <div className="mt-10 xl:mt-0">
              <FullWidthAd ads={bannerAds} />
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className="lg:col-span-3 space-y-8 lg:sticky lg:top-24 self-start lg:mt-9 z-50">
            <InlineGoogleAd slot="9923069891" />
            <AdList ads={squareAds} />
          </aside>
        </div>

        {bottomAdBanner?.length > 0 && <BottomAdBanner ads={bottomAdBanner} />}
        {PopupAd?.length > 0 && <PopupAd ads={poupAd} />}
        {fullScreenAd?.length > 0 && <FullscreenAd ads={fullScreenAd} />}
      </main>

      <div>
        <ShareThisInline
          title={article.title}
          description={truncate(stripHTML(article?.content || ""), 120)}
          image={`${baseURL.replace(/\/$/, "")}/${article.image
            .replace(/^\//, "")
            .replace(/\\/g, "/")}`}
        />
      </div>
    </>
  );
}

export default ArticleDetailPage;
