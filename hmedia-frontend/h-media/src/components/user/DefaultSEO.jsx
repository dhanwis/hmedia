import { Helmet } from "react-helmet-async";

const DEFAULT_KEYWORDS =
  "Latest cinema news updates India, Upcoming movie teasers and promos, Exclusive interviews with film stars, Trending entertainment news today, Behind the scenes movie updates, Watch Movie Teasers, Read Cinema News, Subscribe to H Media, Follow Movie Updates, Malayalam Cinema, Mollywood, Kerala Film Industry, New Malayalam Movies, Malayalam Movie Industry, Malayalam Movie Reviews, Mollywood Box Office Collection, Malayalam OTT Release Dates, Friday Release Malayalam, Theatre Response Malayalam Movies";

export default function DefaultSEO() {
  return (
    <Helmet>
      <meta name="keywords" content={DEFAULT_KEYWORDS} />
    </Helmet>
  );
}
