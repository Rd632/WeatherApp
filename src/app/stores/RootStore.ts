import { WeatherStore } from "./WeatherStore";

export const rootStore = WeatherStore.create({
  currentWeather: {},
  loading: false,
});
