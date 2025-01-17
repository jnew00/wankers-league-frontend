import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloud,
  faCloudRain,
  faCloudSun,
  faSun,
  faWind,
  faTemperatureHigh,
  faTemperatureLow,
} from "@fortawesome/free-solid-svg-icons";

import axios from "axios";

const fetchWeatherForecast = async (latitude, longitude, date) => {
  try {
    const formattedDate = new Date(date).toISOString().split("T")[0];
    console.log("date:", formattedDate);
    const response = await axios.get("https://api.open-meteo.com/v1/forecast", {
      params: {
        latitude: latitude,
        longitude: longitude,
        daily: "temperature_2m_max,temperature_2m_min,precipitation_sum,cloudcover_mean,windspeed_10m_max",
        temperature_unit: "fahrenheit",
        windspeed_unit: "mph",
        timezone: "auto",
      },
    });

    const forecastIndex = response.data.daily.time.findIndex((time) => time === formattedDate);
    if (forecastIndex === -1) return null;

    return {
      tempMax: response.data.daily.temperature_2m_max[forecastIndex],
      tempMin: response.data.daily.temperature_2m_min[forecastIndex],
      precipitation: response.data.daily.precipitation_sum[forecastIndex],
      cloudCover: response.data.daily.cloudcover_mean[forecastIndex],
      windSpeed: response.data.daily.windspeed_10m_max[forecastIndex],
    };
  } catch (error) {
    console.error("Error fetching weather forecast:", error.message);
    return null;
  }
};

const EventWeather = ({ latitude, longitude, date }) => {
  const [weather, setWeather] = useState(null);

  console.log("stuff:",longitude, latitude, date);
  useEffect(() => {
    const loadWeather = async () => {
      if (latitude && longitude && date) {
        const weatherData = await fetchWeatherForecast(latitude, longitude, date);
        setWeather(weatherData);
      }
    };

    loadWeather();
  }, [latitude, longitude, date]);

  const convertRainToInches = (mm) => (mm / 25.4).toFixed(2);

  const getCloudIcon = (cloudCover) => {
    if (cloudCover < 20) return { icon: faSun, color: "gold" };
    if (cloudCover < 50) return { icon: faCloudSun, color: "orange" };
    if (cloudCover < 80) return { icon: faCloud, color: "gray" };
    return { icon: faCloudRain, color: "blue" };
  };

  const getWindIcon = (windSpeed) => {
    const color = windSpeed > 20 ? "red" : windSpeed > 10 ? "orange" : "green";
    return { icon: faWind, color };
  };

  return (
    <div className="weather-card bg-white shadow-md rounded-lg p-4 w-full max-w-md">
      {weather ? (
        <div className="space-y-4">
          {/* Weather Header */}
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-lg font-bold text-gray-800">Weather Forecast</h3>
            <FontAwesomeIcon
              icon={getCloudIcon(weather.cloudCover).icon}
              color={getCloudIcon(weather.cloudCover).color}
              size="2x"
            />
          </div>

          {/* Weather Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left Column: Temperature */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faTemperatureHigh} className="text-red-500" />
                <p>
                  <strong>High:</strong> {weather.tempMax}°F
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faTemperatureLow} className="text-blue-500" />
                <p>
                  <strong>Low:</strong> {weather.tempMin}°F
                </p>
              </div>
            </div>

            {/* Right Column: Wind and Rain */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={getWindIcon(weather.windSpeed).icon} className="text-gray-600" />
                <p>
                  <strong>Wind:</strong> {weather.windSpeed} mph
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faCloudRain} color="blue" />
                <p>
                  <strong>Rain:</strong> {convertRainToInches(weather.precipitation)} inches
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-center">Loading weather data...</p>
      )}
    </div>
  );
};

export default EventWeather;
