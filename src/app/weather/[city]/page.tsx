

"use client";

import { useParams } from "next/navigation";
import { observer } from "mobx-react-lite";
import { useEffect} from "react";
import { useWeatherStore } from "@/app/stores/WeatherContext";
import WeatherCard from "@/app/components/WeatherCard";
import { getSnapshot } from "mobx-state-tree";
import type { WeatherData } from "@/app/components/WeatherCard"; // adjust the path if needed


const WeatherPage = observer(() => {
  const { city } = useParams();
  const store = useWeatherStore();

  useEffect(() => {
    if (typeof city === "string") {
      store.fetchWeather(city);
    }
  }, [city]);

  function mapToWeatherData(snapshot: any): WeatherData {
  return {
    name: snapshot.city ?? "Unknown",
    dt: snapshot.dt ?? 0,
    visibility: snapshot.visibility ?? 0,
    sys: { country: "N/A", sunrise: 0, sunset: 0 }, // fill accordingly
    weather: [{ description: snapshot.description ?? "", icon: "01d" }],
    main: {
      temp: snapshot.temperature ?? 0,
      feels_like: snapshot.feelsLike ?? snapshot.temperature ?? 0,
      temp_min: snapshot.low ?? snapshot.temperature ?? 0,
      temp_max: snapshot.high ?? snapshot.temperature ?? 0,
      humidity: snapshot.humidity ?? 0,
      pressure: snapshot.pressure ?? 0,
    },
    wind: { speed: snapshot.windSpeed ?? 0, deg: 0 },
    timezone: snapshot.timezone ?? 0,
    clouds: {
      all: snapshot.clouds ?? 0,
    },
    coord: {
      lat: snapshot.lat ?? 0,
      lon: snapshot.lon ?? 0,
    },
  };
}


  if (store.loading) return <p className="p-4">Loading weather...</p>;
  if (store.error) return <p className="p-4 text-red-500">Error: {store.error}</p>;
  if (!store.currentWeather?.city) return <p className="p-4">No weather data found.</p>;

  if (!store.currentWeather) return <p className="p-4">No weather data found.</p>;

const snapshot = getSnapshot(store.currentWeather!);
const weatherData = mapToWeatherData(snapshot);

return <div className="w-full "><WeatherCard data={weatherData} /></div>;


});

export default WeatherPage;
