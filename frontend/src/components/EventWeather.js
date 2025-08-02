import React, { useEffect, useState, memo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faCloud,
  faCloudRain,
  faWind,
  faThermometerEmpty,
  faThermometerQuarter,
  faThermometerHalf,
  faThermometerThreeQuarters,
  faThermometerFull,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const EventWeather = memo(({ latitude, longitude, teeTime, date }) => {

  const [weather, setWeather] = useState({
    teeTimeTemp: null,
    maxTemp: null,
    cloudCover: null,
    precipitation: null,
    windSpeed: null,
  });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        if (!latitude || !longitude || !date || !teeTime) {
          return;
        }

        const formattedDate = new Date(date).toISOString().split("T")[0];
        const formattedTeeTime = `${formattedDate}T${teeTime}-05:00`; // Assume EST (GMT-5)
        const teeTimeDateTime = new Date(formattedTeeTime);

        if (isNaN(teeTimeDateTime)) {
          return;
        }

        // Fetch weather data
        const response = await axios.get("https://api.open-meteo.com/v1/forecast", {
          params: {
            latitude,
            longitude,
            hourly: "temperature_2m,cloud_cover,precipitation,wind_speed_10m",
            start_date: formattedDate,
            end_date: formattedDate,
            temperature_unit: "fahrenheit",
            windspeed_unit: "mph",
            timezone: "auto",
          },
        });

        const hourlyData = response.data.hourly;
        const hourlyTimes = hourlyData.time.map((t) => new Date(t).getTime());

        // Find the closest time index
        const teeTimeIndex = hourlyTimes.findIndex((time) => {
          const diff = Math.abs(time - teeTimeDateTime.getTime());
          return diff < 3600000; // Within 1 hour
        });

        if (teeTimeIndex === -1) {
          return;
        }

        setWeather({
          teeTimeTemp: hourlyData.temperature_2m[teeTimeIndex].toFixed(0),
          maxTemp: hourlyData.temperature_2m[teeTimeIndex + 4].toFixed(0),

          cloudCover: Math.max(
            ...hourlyData.cloud_cover.slice(teeTimeIndex, teeTimeIndex + 4)
          ).toFixed(0),
          precipitation: Math.max(
            ...hourlyData.precipitation.slice(teeTimeIndex, teeTimeIndex + 4)
          ).toFixed(0),
          // cloudCover: hourlyData.cloud_cover[teeTimeIndex],
          // precipitation: hourlyData.precipitation[teeTimeIndex],
          windSpeed: hourlyData.wind_speed_10m[teeTimeIndex].toFixed(0),
        });
      } catch (error) {
        // Silently handle weather fetch error
      }
    };

    fetchWeather();
  }, [latitude, longitude, teeTime, date]);

  const convertRainToInches = (mm) => (mm / 25.4).toFixed(2);

  const getCloudIcon = (cloudCover) => {
    if (cloudCover < 20) return { icon: faSun, color: "gold" };
    if (cloudCover < 50) return { icon: faCloud, color: "lightblue" };
    if (cloudCover < 80) return { icon: faCloud, color: "gray" };
    return { icon: faCloudRain, color: "blue" };
  };

  const getWindIcon = (windSpeed) => {
    const color = windSpeed > 20 ? "red" : windSpeed > 10 ? "orange" : "green";
    return { icon: faWind, color };
  };

  const getTemperatureIcon = (temperature) => {
    if (temperature < 32) {
      return { icon: faThermometerEmpty, color: "#1E90FF" }; // Bright Blue for Freezing
    } else if (temperature < 50) {
      return { icon: faThermometerQuarter, color: "#4682B4" }; // Steel Blue for Cold
    } else if (temperature < 70) {
      return { icon: faThermometerHalf, color: "#FFA500" }; // Bright Orange for Mild
    } else if (temperature < 90) {
      return { icon: faThermometerThreeQuarters, color: "#FF4500" }; // Orange-Red for Warm
    } else {
      return { icon: faThermometerFull, color: "#FF0000" }; // Bright Red for Hot
    }
  };
  
  
  

  return (
    <div className="weather-card bg-white shadow-md rounded-lg p-4 w-full max-w-md">
      {weather ? (
        <div className="space-y-4">
          {/* Weather Header */}
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="text-base font-bold text-gray-800">Weather Forecast</h4>
            <FontAwesomeIcon
              icon={getCloudIcon(weather.cloudCover).icon}
              color={getCloudIcon(weather.cloudCover).color}
              size="1x"
            />
          </div>

          {/* Weather Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left Column: Temperature */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
              <FontAwesomeIcon
                  icon={getTemperatureIcon(weather.teeTimeTemp).icon}
                  style={{ color: getTemperatureIcon(weather.teeTimeTemp).color }}
                />
                <p>
                  <strong>Tee Time:</strong> {weather.teeTimeTemp}°F
                </p>
              </div>
              <div className="flex items-center space-x-2">
              <FontAwesomeIcon
                  icon={getTemperatureIcon(weather.maxTemp).icon}
                  style={{ color: getTemperatureIcon(weather.maxTemp).color }}
                />
                <p>
                  <strong>+4 Hrs Later:</strong> {weather.maxTemp}°F
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
  // <div className="weather-card bg-white shadow-md rounded-lg p-4 w-full max-w-md">

  //     {weather.teeTimeTemp !== null ? (
  //       <div className="space-y-4">
  //         <div className="flex items-center space-x-2">
  //           <FontAwesomeIcon icon={faThermometerHalf} className="text-blue-500" />
  //           <p>
  //             <strong>Tee Time Temp:</strong> {weather.teeTimeTemp}°F
  //           </p>
  //         </div>

  //         <div className="flex items-center space-x-2">
  //           <FontAwesomeIcon icon={faSun} className="text-yellow-500" />
  //           <p>
  //             <strong>Max Temp (5 hrs):</strong> {weather.maxTemp}°F
  //           </p>
  //         </div>

  //         <div className="flex items-center space-x-2">
  //           <FontAwesomeIcon
  //             icon={getCloudIcon(weather.cloudCover).icon}
  //             color={getCloudIcon(weather.cloudCover).color}
  //           />
  //           <p>
  //             <strong>Cloud Cover:</strong> {weather.cloudCover}%
  //           </p>
  //         </div>

  //         <div className="flex items-center space-x-2">
  //           <FontAwesomeIcon icon={faCloudRain} color="blue" />
  //           <p>
  //             <strong>Rain:</strong> {convertRainToInches(weather.precipitation)} inches
  //           </p>
  //         </div>

  //         <div className="flex items-center space-x-2">
  //           <FontAwesomeIcon icon={faWind} className="text-gray-600" />
  //           <p>
  //             <strong>Wind Speed:</strong> {weather.windSpeed} mph
  //           </p>
  //         </div>
  //       </div>
  //     ) : (
  //       <p className="text-gray-500 text-center">Loading weather data...</p>
  //     )}
  //   </div>
  );
});

export default EventWeather;
