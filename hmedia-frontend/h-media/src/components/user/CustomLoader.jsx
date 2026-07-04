import React from "react";

function CustomLoader() {
  return (
    <div className="h-[70vh] flex items-center justify-center">
      <div className="w-9 h-9 lg:w-12 lg:h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default CustomLoader;
