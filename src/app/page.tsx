"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type CityRecord = {
  geoname_id: string;
  ascii_name: string;
  cou_name_en: string;
  timezone: string;
  population: number;
  coordinates: {
    lat: number;
    lon: number;
  };
};

export default function HomePage() {
  const [data, setData] = useState<CityRecord[]>([]);
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 20;

  const loaderRef = useRef<HTMLDivElement | null>(null);

  // State for autocomplete suggestions (max 5)
  const [suggestions, setSuggestions] = useState<CityRecord[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [allCountries, setAllCountries] = useState<string[]>([]);
  const [allTimezones, setAllTimezones] = useState<string[]>([]);

  



 const fetchCountries = async () => {
  const res = await fetch(
    `https://public.opendatasoft.com/api/records/1.0/search/?dataset=geonames-all-cities-with-a-population-1000&q=&rows=0&facet=cou_name_en`
  
      
  );
  const json = await res.json();
  const uniqueCountries = json.facet_groups?.[0]?.facets.map((f: any) => f.name);
  setAllCountries(uniqueCountries || []);
};

useEffect(() => {
  if (data.length === 0) return;

  const tzSet = new Set<string>();
  data.forEach((city) => {
    if (city.timezone) {
      tzSet.add(city.timezone);
    }
  });

  setAllTimezones(Array.from(tzSet).sort());
}, [data]);


useEffect(() => {
  fetchCountries();
  
}, []);

// Remove duplicates by ascii_name + country
const removeDuplicates = (cities: CityRecord[]) => {
  const seen = new Set<string>();
  return cities.filter((city) => {
    const ascii = city.ascii_name?.toLowerCase?.() || "";
    const country = city.cou_name_en?.toLowerCase?.() || "";
    const key = `${ascii}-${country}`;
    
    if (!ascii || !country) return false; // skip incomplete records
    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
};

  

   // Fetch Data
  const fetchData = async () => {
  setLoading(true);
  try {
    const res = await fetch(
      `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/geonames-all-cities-with-a-population-1000/records?limit=${limit}&offset=${offset}`
    );
    const json = await res.json();

    const newCities: CityRecord[] = json.results;

    // Combine old and new, then deduplicate
    const combined = [...data, ...newCities];
    const deduped = removeDuplicates(combined);

    setData(deduped);
  } catch (error) {
    console.error("Fetch error:", error);
  } finally {
    setLoading(false);
  }
};



  useEffect(() => {
    fetchData();
  }, [offset]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          //This condition ensures we only load more data
          setOffset((prev) => prev + limit); //when the loader is visible AND we’re not already loading.
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [loading]);

  const filteredData = data.filter((city) =>
    city.ascii_name.toLowerCase().includes(search.toLowerCase())
  );

  // Update autocomplete suggestions when search changes
  useEffect(() => {
    if (search.trim() === "") {
      setSuggestions([]);
      return;
    }
    const lowerSearch = search.toLowerCase();
    // Show max 5 suggestions matching start of city name
    const matchedSuggestions = data
      .filter((city) => city.ascii_name.toLowerCase().startsWith(lowerSearch))
      .slice(0, 5);
    setSuggestions(matchedSuggestions);
  }, [search, data]);

  // When user clicks a suggestion, update search and clear suggestions
  const handleSuggestionClick = (cityName: string) => {
    setSearch(cityName);
    setSuggestions([]); // Clear suggestions
    setShowSuggestions(false);
  };

  const [sortKey, setSortKey] = useState<keyof CityRecord | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [filters, setFilters] = useState({
    country: "",
    timezone: "",
  });

  const handleSort = (key: keyof CityRecord) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const processedData = data
    .filter((city) =>
      city.ascii_name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((city) =>
      filters.country ? city.cou_name_en === filters.country : true
    )
      .filter((city) => {
    if (filters.timezone) {
      console.log("Comparing timezones:", city.timezone, filters.timezone);
      return city.timezone?.trim() === filters.timezone?.trim();
    }
    return true;
  })




    .sort((a, b) => {
      if (!sortKey) return 0;

      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

    const isSearching = search.trim().length > 0;


  return (
    <main className="p-6 min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
  <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
    <h1 className="text-4xl font-extrabold text-center mb-10 text-blue-800 tracking-wide">
      🌍 Explore Cities Worldwide
    </h1>

    {/* Search Input + Suggestions */}
    <div className="relative max-w-lg mx-auto mb-10">
      <input
        type="text"
        placeholder="Search city name..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setShowSuggestions(true);
        }}
        className="w-full px-5 py-3 border-2 border-blue-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-300 transition"
      />

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-blue-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {suggestions.map((city) => (
            <li
              key={city.geoname_id}
              onClick={() => handleSuggestionClick(city.ascii_name)}
              className="cursor-pointer px-4 py-2 hover:bg-blue-50 transition"
            >
              <span className="font-medium text-blue-700">{city.ascii_name}</span> –{" "}
              <span className="text-gray-500">{city.cou_name_en}</span>
            </li>
          ))}
        </ul>
      )}
    </div>

    {/* Filters */}
    <div className="flex gap-4 mb-8 justify-center flex-wrap">
      <select
        value={filters.country}
        onChange={(e) => setFilters((f) => ({ ...f, country: e.target.value }))}
        className="px-4 py-2 rounded-lg border border-blue-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="">All Countries</option>
        {allCountries.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>

      <select
        value={filters.timezone}
        onChange={(e) => setFilters((f) => ({ ...f, timezone: e.target.value }))}
        className="px-4 py-2 rounded-lg border border-blue-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="">All Timezones</option>
        {allTimezones.map((tz) => (
          <option key={tz} value={tz}>
            {tz}
          </option>
        ))}
      </select>
    </div>

      {/* Responsive Table (visible on md and up) */}
<div className="hidden md:block overflow-x-auto rounded-xl border border-blue-100">
  <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden">
    <thead className="bg-blue-600 text-white uppercase text-sm tracking-wider">
      <tr>
        <th
          className="py-4 px-6 text-left cursor-pointer hover:bg-blue-700 transition"
          onClick={() => handleSort("ascii_name")}
        >
          City Name{" "}
          {sortKey === "ascii_name"
            ? sortOrder === "asc"
              ? "↑"
              : "↓"
            : ""}
        </th>
        <th
          className="py-4 px-6 text-left cursor-pointer hover:bg-blue-700 transition"
          onClick={() => handleSort("cou_name_en")}
        >
          Country{" "}
          {sortKey === "cou_name_en"
            ? sortOrder === "asc"
              ? "↑"
              : "↓"
            : ""}
        </th>
        <th className="py-4 px-6 text-left">Timezone</th>
        <th className="py-4 px-6 text-left">Population</th>
        <th className="py-4 px-6 text-left">Latitude</th>
        <th className="py-4 px-6 text-left">Longitude</th>
      </tr>
    </thead>
    <tbody className="text-gray-700 divide-y divide-blue-100">
      {processedData.length > 0 ? (
        processedData.map((city) => (
          <tr key={city.geoname_id} className="hover:bg-blue-50 transition">
            <td className="py-3 px-6">
              <Link
                href={`/weather/${encodeURIComponent(city.ascii_name)}`}
                className="text-blue-600 hover:underline font-medium"
              >
                {city.ascii_name}
              </Link>
            </td>
            <td className="py-3 px-6">{city.cou_name_en}</td>
            <td className="py-3 px-6">{city.timezone}</td>
            <td className="py-3 px-6">{city.population.toLocaleString()}</td>
            <td className="py-3 px-6">{city.coordinates.lat}</td>
            <td className="py-3 px-6">{city.coordinates.lon}</td>
          </tr>
        ))
      ) : search ? (
        <tr>
          <td colSpan={6} className="text-center py-6 text-red-500 font-semibold">
            NOT FOUND
          </td>
        </tr>
      ) : null}
    </tbody>
  </table>
</div>

{/* Mobile Card View (visible below md) */}
<div className="md:hidden space-y-4">
  {processedData.length > 0 ? (
    processedData.map((city) => (
      <div
        key={city.geoname_id}
        className="bg-white shadow-md rounded-xl p-4 border border-blue-100"
      >
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-blue-700">
            <Link
              href={`/weather/${encodeURIComponent(city.ascii_name)}`}
              className="hover:underline"
            >
              {city.ascii_name}
            </Link>
          </h2>
          <span className="text-sm text-gray-500">{city.cou_name_en}</span>
        </div>
        <div className="text-sm text-gray-700 space-y-1">
          <p>
            <strong>Timezone:</strong> {city.timezone}
          </p>
          <p>
            <strong>Population:</strong>{" "}
            {city.population.toLocaleString()}
          </p>
          <p>
            <strong>Lat:</strong> {city.coordinates.lat}
            {" | "}
            <strong>Lon:</strong> {city.coordinates.lon}
          </p>
        </div>
      </div>
    ))
  ) : search ? (
    <div className="text-center text-red-500 font-semibold py-6">
      NOT FOUND
    </div>
  ) : null}
</div>

      <div ref={loaderRef} className="h-16 flex justify-center items-center mt-8">
      {!isSearching && loading && filteredData.length > 0 && (
        <span className="text-blue-500 font-medium animate-pulse">Loading more...</span>
      )}
    </div>
    </div>
    </main>
  );
}
