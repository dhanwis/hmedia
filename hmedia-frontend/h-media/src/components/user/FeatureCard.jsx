const FeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <div className="flex flex-col items-center text-center p-4 bg-white rounded-lg border border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="p-4 bg-red-100 rounded-full mb-5">
        <Icon size={28} className="text-brand-red" />
      </div>
      <h3 className="text-lg font-bold text-brand-dark mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard;
