import { useState, useEffect } from "react";
import { useApi } from "../context/ApiContext";
import {
  fetchTeasers,
  fetchTeasersPaginated,
} from "../services/teaserPromoService";
import NewsPagination from "../components/user/NewsPagination";
import VideoPlayerWrapper from "../components/user/VideoModalWrapper";
import CustomLoader from "../components/user/CustomLoader";

import { useSearchParams } from "react-router-dom";

function TeaserAndPromoPage() {
  const [searchParams] = useSearchParams();
  const { baseURL } = useApi();

  const [teasers, setTeasers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(12);

  const currentPage = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchTeasersPaginated(baseURL, currentPage, limit);

        setTeasers(data.items);
        setTotal(data.total);
        setLimit(data.limit);
      } catch (error) {
        console.log("Teaser And Promo Error");
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
      <div className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <h2
          className="text-lg sm:text-xl md:text-2xl font-black uppercase 
          border-b-2 border-brand-red pb-2 text-brand-dark mb-16"
        >
          Trailers And Previews
        </h2>

        {/* Video Grid */}
        <VideoPlayerWrapper teasers={teasers} />

        {/* Pagination */}
        <NewsPagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </main>
  );
}

export default TeaserAndPromoPage;
