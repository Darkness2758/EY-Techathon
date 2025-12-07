"use client";
import { useState } from "react";
import { Search } from "lucide-react";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 w-full max-w-md p-2 border rounded-xl shadow-sm"
    >
      <Search className="w-5 h-5 text-gray-500" />

      <input
        type="text"
        placeholder="Search something..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 outline-none bg-transparent"
      />

      <button
        type="submit"
        className="px-3 py-1 bg-black text-white rounded-lg hover:bg-gray-800 transition"
      >
        Search
      </button>
    </form>
  );
}
