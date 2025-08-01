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

  // Popular cities for suggestions
  const popularCities = [
    { name: "London", country: "United Kingdom" },
    { name: "New York", country: "United States" },
    { name: "Tokyo", country: "Japan" },
    { name: "Paris", country: "France" },
    { name: "Sydney", country: "Australia" },
    { name: "Dubai", country: "United Arab Emirates" },
    { name: "Singapore", country: "Singapore" },
    { name: "Mumbai", country: "India" },
    { name: "Berlin", country: "Germany" },
    { name: "Toronto", country: "Canada" },
    { name: "Barcelona", country: "Spain" },
    { name: "Rome", country: "Italy" },
    { name: "Amsterdam", country: "Netherlands" },
    { name: "Bangkok", country: "Thailand" },
    { name: "Cairo", country: "Egypt" },
    { name: "Moscow", country: "Russia" },
    { name: "Beijing", country: "China" },
    { name: "Seoul", country: "South Korea" },
    { name: "Mexico City", country: "Mexico" },
    { name: "Buenos Aires", country: "Argentina" },
    { name: "Lagos", country: "Nigeria" },
    { name: "Istanbul", country: "Turkey" },
    { name: "Jakarta", country: "Indonesia" },
    { name: "Manila", country: "Philippines" },
    { name: "Karachi", country: "Pakistan" }
  ];

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
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

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

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    
    if (value.length > 0) {
      const filteredSuggestions = popularCities.filter(city =>
        city.name.toLowerCase().includes(value.toLowerCase()) ||
        city.country.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 8); // Limit to 8 suggestions
      
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
      setSelectedSuggestionIndex(-1);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (cityName) => {
    setSearchInput(cityName);
    setShowSuggestions(false);
    searchWeather(cityName);
  };

  const handleSearch = () => {
    searchWeather(searchInput);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
        handleSuggestionClick(suggestions[selectedSuggestionIndex].name);
      } else {
        handleSearch();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }, 200);
  };

  const handleInputFocus = () => {
    if (searchInput.length > 0 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className='container'>
      <div className="top-bar">
        <div className="suggestions-container">
          <input 
            type="text" 
            className="cityInput" 
            placeholder='Enter city name...'
            value={searchInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleInputBlur}
            onFocus={handleInputFocus}
            autoComplete="off"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {suggestions.map((city, index) => (
                <div
                  key={`${city.name}-${city.country}`}
                  className={`suggestion-item ${index === selectedSuggestionIndex ? 'highlighted' : ''}`}
                  onClick={() => handleSuggestionClick(city.name)}
                >
                  <span className="city-name">{city.name}</span>
                  <span className="country-name">{city.country}</span>
                </div>
              ))}
            </div>
          )}
        </div>
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