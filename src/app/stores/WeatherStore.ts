import { types, flow, applySnapshot } from "mobx-state-tree";

const WeatherInfo = types.model("WeatherInfo", {
  temperature: types.maybe(types.number),
  feelsLike: types.maybe(types.number),
  high: types.maybe(types.number),
  low: types.maybe(types.number),

  description: types.maybe(types.string),
  icon: types.maybe(types.string),

  humidity: types.maybe(types.number),
  pressure: types.maybe(types.number),

  windSpeed: types.maybe(types.number),
  windDeg: types.maybe(types.number),

  city: types.maybe(types.string),
  country: types.maybe(types.string),

  sunrise: types.maybe(types.number),
  sunset: types.maybe(types.number),
  timezone: types.maybe(types.number),

  visibility: types.maybe(types.number),
  clouds: types.maybe(types.number),
  dt: types.maybe(types.number),
  lat: types.maybe(types.number),
  lon: types.maybe(types.number),
});

export const WeatherStore = types
  .model("WeatherStore", {
    currentWeather: types.maybe(WeatherInfo),
    loading: types.boolean,
    error: types.maybe(types.string),
  })
  .actions((self) => ({
    fetchWeather: flow(function* (cityName: string) {
      self.loading = true;
      self.error = undefined;
      try {
        const response = yield fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${process.env.NEXT_PUBLIC_YOUR_API_KEY}&units=metric`
          //`https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude={part}&appid=e5f28b2c0300fdc1ef3b3103e1ee378f`
        );
        const data = yield response.json();

        if (data.cod !== 200) {
          throw new Error(data.message || "Weather fetch failed");
        }

        if (self.currentWeather) {
          applySnapshot(self.currentWeather, {
            temperature: data.main.temp,
          feelsLike: data.main.feels_like,
          high: data.main.temp_max,
          low: data.main.temp_min,
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          windSpeed: data.wind.speed,
          windDeg: data.wind.deg,
          city: data.name,
          country: data.sys.country,
          sunrise: data.sys.sunrise,
          sunset: data.sys.sunset,
          timezone: data.timezone,
          visibility: data.visibility,
  clouds: data.clouds.all,
  dt: data.dt,
  lat: data.coord.lat,
  lon: data.coord.lon,
            
          });
        } else {
          self.currentWeather = {
            temperature: data.main.temp,
          feelsLike: data.main.feels_like,
          high: data.main.temp_max,
          low: data.main.temp_min,
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          windSpeed: data.wind.speed,
          windDeg: data.wind.deg,
          city: data.name,
          country: data.sys.country,
          sunrise: data.sys.sunrise,
          sunset: data.sys.sunset,
          timezone: data.timezone,
          visibility: data.visibility,
  clouds: data.clouds.all,
  dt: data.dt,
  lat: data.coord.lat,
  lon: data.coord.lon,
          } as any;
        }
      } catch (err: any) {
        self.error = err.message;
      } finally {
        self.loading = false;
      }
    }),
  }));
