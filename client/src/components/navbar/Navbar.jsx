import { useEffect, useState } from "react";

export default function Navbar() {
  const [dark, setDark] = useState(false);

  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  return (
    <div className="bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center">

      <h1 className="font-bold text-lg text-gray-800 dark:text-white">
        Dashboard
      </h1>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">

        {/* 👤 USER INFO */}
        <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-full text-right">
          {email ? email[0].toUpperCase() : "U"}
        </div>

        {/* 🌙 DARK MODE */}
        <button
          onClick={() => setDark(!dark)}
          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded"
        >
          {dark ? "☀️" : "🌙"}
        </button>

      </div>

    </div>
  );
}