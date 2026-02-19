import { useEffect } from "react";

export default function Mentorship() {
  useEffect(() => {
    // Redirect to external website
    window.location.href = "https://www.neetpeak.in/";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#AFFFFF]/20 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B9B9B] mb-4"></div>
        <p className="text-gray-600 text-lg">Redirecting to NEETPeak Mentorship...</p>
      </div>
    </div>
  );
}
