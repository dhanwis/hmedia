import { Link } from "react-router-dom";

export default function FourNotFour() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-5xl">
        <div className="relative overflow-hidden rounded-lg bg-white/80 backdrop-blur-xl shadow-md p-8 sm:p-14 text-center">

          {/* Decorative blur */}
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-brand-red/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-black/10 blur-3xl" />

          {/* Content */}
          <div className="relative">
            <h1 className="text-[6rem] sm:text-[9rem] font-extrabold tracking-tight text-brand-red leading-none">
              404
            </h1>

            <h2 className="mt-2 text-xl sm:text-3xl font-semibold text-gray-800">
              Page not found
            </h2>

            <p className="mt-4 text-sm sm:text-base text-gray-500 max-w-xl mx-auto">
              Sorry, the page you’re looking for doesn’t exist or may have been
              moved. Let’s get you back on track.
            </p>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-brand-red text-white font-medium shadow-md hover:opacity-90 transition"
              >
                Go to Home
              </Link>

              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <p className="mt-6 text-center text-xs sm:text-sm text-gray-400">
          Channel <span className="text-brand-red">HMedia</span> • The Complete Film Magazine
        </p>
      </div>
    </div>
  );
}
