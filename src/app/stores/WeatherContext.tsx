"use client";
import React, { createContext, useContext } from "react";
import { rootStore } from "./RootStore";

const WeatherContext = createContext(rootStore);

export const WeatherProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WeatherContext.Provider value={rootStore}>
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeatherStore = () => useContext(WeatherContext);
