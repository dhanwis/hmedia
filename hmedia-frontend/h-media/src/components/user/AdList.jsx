import AdBanner from "./AdBanner";

export default function AdList({ ads }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-4">
      {ads.map((ad, index) => (
        <AdBanner
          key={index}
          image={ad.image}
          link={ad.link}
          onContact={ad.showContact}
        />
      ))}
    </div>
  );
}
