import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix marker icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

export interface WeatherData {
  name: string;
  sys: { country: string; sunrise: number; sunset: number };
  weather: { description: string; icon: string }[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
    pressure: number;
  };
  wind: { speed: number; deg: number };
  visibility: number;
  clouds: { all: number };
  dt: number;
  timezone: number;
  coord: { lat: number; lon: number };
}

interface WeatherCardProps {
  data: WeatherData;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ data }) => {
  const [tempUnit, setTempUnit] = useState<"C" | "F" | "K">("C");
  const [windUnit, setWindUnit] = useState<"m/s" | "km/h" | "mph">("m/s");

  const convertTemp = (tempC: number) => {
    if (tempUnit === "F") return (tempC * 9) / 5 + 32;
    if (tempUnit === "K") return tempC + 273.15;
    return tempC;
  };

  const convertWind = (speed: number) => {
    if (windUnit === "km/h") return speed * 3.6;
    if (windUnit === "mph") return speed * 2.237;
    return speed;
  };

  const formatTime = (timestamp: number) =>
    new Date(timestamp * 1000).toLocaleTimeString();

  const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
  console.log("Icon URL:", iconUrl);


  const getBackgroundClass = (description: string): string => {
  const desc = description.toLowerCase();

  if (desc.includes("clear")) return 'bg-sky-400 bg-[url("/bg/clear.avif")]';
  if (desc.includes("cloud")) return 'bg-gray-400 bg-[url("/bg/cloudy.jpg")]';
  if (desc.includes("rain")) return 'bg-blue-700 bg-[url("/bg/rainy.webp")]';
  if (desc.includes("thunder")) return 'bg-gray-800 bg-[url("/bg/thunderstorm.jpg")]';
  if (desc.includes("snow")) return 'bg-white bg-[url("/bg/snow.jpg")]';
  if (desc.includes("mist") || desc.includes("fog") || desc.includes("haze"))
    return 'bg-gray-300 bg-[url("/bg/fog.webp")]';

  return 'bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600'; // default fallback
};

const backgroundClass = getBackgroundClass(data.weather[0].description);

  return (
    <div className={`min-h-screen  text-black flex flex-col md:flex-row items-center justify-center p-6 bg-no-repeat bg-cover bg-center ${backgroundClass}`}>

      {/* LEFT: Weather Details */}
      <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-3xl shadow-xl p-10 w-full max-w-2xl md:w-1/2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold">{data.name}</h2>
            <p className="capitalize">{data.weather[0].description}</p>
          </div>
          <img src={iconUrl} alt="Weather Icon" className="w-20 h-20" />
        </div>

        {/* Unit Switches */}
        <div className="flex gap-4 mb-4">
          <div>
            <label className="text-sm font-semibold">Temperature:</label>
            <select value={tempUnit} onChange={e => setTempUnit(e.target.value as any)} className="ml-2 p-1 rounded">
              <option value="C">°C</option>
              <option value="F">°F</option>
              <option value="K">K</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold">Wind:</label>
            <select value={windUnit} onChange={e => setWindUnit(e.target.value as any)} className="ml-2 p-1 rounded">
              <option value="m/s">m/s</option>
              <option value="km/h">km/h</option>
              <option value="mph">mph</option>
            </select>
          </div>
        </div>

        <p className="text-4xl font-bold mb-2">
          {convertTemp(data.main.temp).toFixed(1)}°{tempUnit}
        </p>
        <p className="text-lg mb-4">Feels like {convertTemp(data.main.feels_like).toFixed(1)}°{tempUnit}</p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="font-semibold">Humidity:</span> {data.main.humidity}%</div>
          <div><span className="font-semibold">Pressure:</span> {data.main.pressure} hPa</div>
          <div><span className="font-semibold">Wind:</span> {convertWind(data.wind.speed).toFixed(1)} {windUnit}</div>
          <div><span className="font-semibold">Visibility:</span> {data.visibility} m</div>
          <div><span className="font-semibold">Clouds:</span> {data.clouds.all}%</div>
          <div><span className="font-semibold">High / Low:</span> {convertTemp(data.main.temp_max).toFixed(1)} / {convertTemp(data.main.temp_min).toFixed(1)} °{tempUnit}</div>
          <div><span className="font-semibold">Sunrise:</span> {formatTime(data.sys.sunrise)}</div>
          <div><span className="font-semibold">Sunset:</span> {formatTime(data.sys.sunset)}</div>
          <div><span className="font-semibold">Current time:</span> {formatTime(data.dt)}</div>
        </div>
      </div>

      {/* RIGHT: Map */}
      <div className="w-full h-96 mt-6 md:mt-0 md:ml-6 md:w-1/2 rounded-xl overflow-hidden shadow">
        <MapContainer
          center={[data.coord.lat, data.coord.lon]}
          zoom={10}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[data.coord.lat, data.coord.lon]}>
            <Popup>
              {data.name}
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default WeatherCard;
