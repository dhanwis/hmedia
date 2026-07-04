import { Navigate, useParams } from "react-router-dom";

const VALID_CATEGORIES = [
  "news",
  "cinema-news",
  "meet-person",
  "more-news",
  "trending-news",
];

export default function ArticleCategoryGuard({ children }) {
  const { category } = useParams();

  if (!VALID_CATEGORIES.includes(category)) {
    return <Navigate to="/404" replace />;
  }

  return children;
}
