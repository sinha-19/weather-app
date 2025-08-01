import React, { useState, useEffect } from 'react';
import './WeatherApp.css';

import search_icon from '../Assets/search.png';
import clear_icon from '../Assets/clear.png';
import cloud_icon from '../Assets/cloud.png';
import drizzle_icon from '../Assets/drizzle.png';
import rain_icon from '../Assets/rain.png';
import snow_icon from '../Assets/snow.png';
import wind_icon from '../Assets/wind.png';
import humidity_icon from '../Assets/humidity.png';

const WeatherApp = () => {
  const api_key = "cb3a051c385fa934d6e74650e77d4fbc";

  const [weatherData, setWeatherData] = useState({
    temperature: "24°C",
    location: "London",
    humidity: "64%",
    windSpeed: "18 km/h",
    description: "Clear sky",
    feelsLike: "26°C",
    pressure: "1013 hPa",
    visibility: "10 km",
    uvIndex: "5"
  });
  
  const [wicon, setWicon] = useState(cloud_icon);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Load default weather on component mount
  useEffect(() => {
    searchWeather("London");
  }, []);

  const getWeatherIcon = (iconCode) => {
    const iconMap = {
      "01d": clear_icon, "01n": clear_icon,
      "02d": cloud_icon, "02n": cloud_icon,
      "03d": drizzle_icon, "03n": drizzle_icon,
      "04d": drizzle_icon, "04n": drizzle_icon,
      "09d": rain_icon, "09n": rain_icon,
      "10d": rain_icon, "10n": rain_icon,
      "11d": rain_icon, "11n": rain_icon,
      "13d": snow_icon, "13n": snow_icon,
      "50d": cloud_icon, "50n": cloud_icon
    };
    return iconMap[iconCode] || clear_icon;
  };

  const searchWeather = async (city) => {
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&APPID=${api_key}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(response.status === 404 ? "City not found" : "Weather data unavailable");
      }
      
      const data = await response.json();

      if (!data.main || !data.wind || !data.weather || !data.name) {
        throw new Error("Invalid weather data received");
      }

      setWeatherData({
        temperature: `${Math.round(data.main.temp)}°C`,
        location: data.name,
        humidity: `${data.main.humidity}%`,
        windSpeed: `${Math.round(data.wind.speed * 3.6)} km/h`,
        description: data.weather[0].description,
        feelsLike: `${Math.round(data.main.feels_like)}°C`,
        pressure: `${data.main.pressure} hPa`,
        visibility: `${Math.round(data.visibility / 1000)} km`,
        uvIndex: "N/A" // UV index requires separate API call
      });

      setWicon(getWeatherIcon(data.weather[0].icon));
      setSearchInput("");
      
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError(error.message || "Failed to fetch weather data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    searchWeather(searchInput);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className='container'>
      <div className="top-bar">
        <input 
          type="text" 
          className="cityInput" 
          placeholder='Enter city name...'
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <div className="search-icon" onClick={handleSearch}>
          <img src={search_icon} alt="Search" />
        </div>
      </div>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      )}

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="weather-image">
            <img src={wicon} alt="Weather" />
          </div>
          
          <div className="weather-temp">{weatherData.temperature}</div>
          <div className="weather-location">{weatherData.location}</div>
          <div className="weather-description">{weatherData.description}</div>
          
          <div className="data-container">
            <div className="element">
              <img src={humidity_icon} alt="Humidity" className="icon" />
              <div className="data">{weatherData.humidity}</div>
              <div className="text">Humidity</div>
            </div>
            <div className="element">
              <img src={wind_icon} alt="Wind" className="icon" />
              <div className="data">{weatherData.windSpeed}</div>
              <div className="text">Wind Speed</div>
            </div>
          </div>

          <div className="additional-info">
            <div className="info-card">
              <div className="label">Feels Like</div>
              <div className="value">{weatherData.feelsLike}</div>
            </div>
            <div className="info-card">
              <div className="label">Pressure</div>
              <div className="value">{weatherData.pressure}</div>
            </div>
            <div className="info-card">
              <div className="label">Visibility</div>
              <div className="value">{weatherData.visibility}</div>
            </div>
            <div className="info-card">
              <div className="label">UV Index</div>
              <div className="value">{weatherData.uvIndex}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WeatherApp;