import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchLatestNews } from "../../services/latestNewsService";
import { fetchCinemaNews } from "../../services/cinemaNewsService";
import { fetchMeetPersons } from "../../services/meetPersonService";
import { fetchMoreNews } from "../../services/moreNewsService";
import { fetchTeasers } from "../../services/teaserPromoService";
import { fetchBanners } from "../../services/bannerService";
import { useApi } from "../../context/ApiContext";

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-lg border border-brand-dark/10 shadow-xs hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
    <div className="flex justify-between items-start mb-4">
      {/* Icon Badge */}
      <div className={`p-3 rounded-md ${color} bg-opacity-15 shadow-inner`}>
        <Icon size={24} className={color.replace("bg-", "text-")} />
      </div>
    </div>

    <h3 className="text-brand-dark/70 text-sm font-medium tracking-wide">
      {title}
    </h3>
    <p className="text-4xl font-extrabold text-brand-dark mt-1">{value}</p>
  </div>
);

export default function AdminDashboard() {
  const { baseURL } = useApi();

  const [stats, setStats] = useState({
    latest: 0,
    cinema: 0,
    meet: 0,
    more: 0,
    teasers: 0,
    banners: 0,
  });

  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [recentArticles, setRecentArticles] = useState([]);

  useEffect(() => {
    async function loadStats() {
      try {
        const [latest, cinema, meet, more, teasers, banners] =
          await Promise.all([
            fetchLatestNews(baseURL),
            fetchCinemaNews(baseURL),
            fetchMeetPersons(baseURL),
            fetchMoreNews(baseURL),
            fetchTeasers(baseURL),
            fetchBanners(baseURL),
          ]);

        // 🔹 Stats
        setStats({
          latest: latest.length,
          cinema: cinema.length,
          meet: meet.length,
          more: more.length,
          teasers: teasers.length,
          banners: banners.length,
        });

        // 🔹 Graph
        setChartData([
          { name: "Latest News", count: latest.length },
          { name: "Cinema News", count: cinema.length },
          { name: "Meet Person", count: meet.length },
          { name: "Business Stories", count: more.length },
          { name: "Teasers", count: teasers.length },
          { name: "Banners", count: banners.length },
        ]);

        // 🔹 Recent Articles (latest 5 from all categories)
        const allArticles = [...latest, ...cinema, ...meet, ...more];
        const sortedRecent = allArticles.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setRecentArticles(sortedRecent.slice(0, 3));
      } catch (err) {
        console.error("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [baseURL]);

  return (
    <div className="space-y-10 text-brand-dark">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-4xl font-extrabold text-brand-dark mb-2">
          Admin Panel
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard
          title="Latest News"
          value={loading ? "—" : stats.latest}
          icon={FileText}
          color="bg-blue-500"
        />

        <StatCard
          title="Cinema News"
          value={loading ? "—" : stats.cinema}
          icon={FileText}
          color="bg-purple-500"
        />

        <StatCard
          title="Meet The Person"
          value={loading ? "—" : stats.meet}
          icon={FileText}
          color="bg-green-500"
        />

        <StatCard
          title="Business Stories"
          value={loading ? "—" : stats.more}
          icon={FileText}
          color="bg-orange-500"
        />

        <StatCard
          title="Teasers & Promo"
          value={loading ? "—" : stats.teasers}
          icon={FileText}
          color="bg-rose-500"
        />

        <StatCard
          title="Banners"
          value={loading ? "—" : stats.banners}
          icon={FileText}
          color="bg-yellow-500"
        />
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Recent Articles */}
        <div className="bg-white p-6 rounded-md border border-brand-dark/10 shadow-xs">
          <h3 className="text-xl font-bold mb-6 text-brand-dark">
            Recent News
          </h3>

          <div className="space-y-5">
            {recentArticles.map((article) => (
              <div
                key={article.id}
                className="flex items-center justify-between pb-5 border-b border-brand-dark/10 last:border-none"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={
                      article.image
                        ? `${baseURL}/${article.image.replace(/\\/g, "/")}`
                        : "/placeholder.jpg"
                    }
                    alt={article.title}
                    className="w-14 h-14 object-cover rounded-xl shadow-inner"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-brand-dark line-clamp-1">
                      {article.title}
                    </h4>
                    <p className="text-xs text-brand-dark/50">
                      Published{" "}
                      {new Date(article.date).toLocaleDateString("en-CA")}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-green-600 bg-green-600/10 px-2 py-1 rounded-full shadow-sm">
                  Live
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Chart */}
        <div className="bg-white p-6 rounded-md border border-brand-dark/10 shadow-xs">
          <h3 className="text-xl font-bold mb-6 text-brand-dark">
            News Articles Overview
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <XAxis
                dataKey="name"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                // Ensure the chart scales with the highest value and add some top padding
                domain={[0, "dataMax * 1.2"]}
                tickFormatter={(val) =>
                  Number.isInteger(val) ? val : Math.round(val)
                }
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
