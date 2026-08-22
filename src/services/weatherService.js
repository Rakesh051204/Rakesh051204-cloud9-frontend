// src/services/weatherService.js
// Free weather API – no API key required (wttr.in)

const WEATHER_API = 'https://wttr.in';

// Default location (change to your city)
const DEFAULT_CITY = 'Avalapalli';

/**
 * Fetch current weather and forecast for a city
 * @param {string} city - City name (e.g., 'Avalapalli', 'Bengaluru', 'Delhi')
 * @returns {Object} weather data
 */
export const getWeather = async (city = DEFAULT_CITY) => {
  try {
    const response = await fetch(`${WEATHER_API}/${encodeURIComponent(city)}?format=j1`);
    if (!response.ok) throw new Error('Weather API error');
    const data = await response.json();

    // Current conditions
    const current = data.current_condition[0] || {};
    const tempC = current.temp_C || '--';
    const condition = current.weatherDesc?.[0]?.value || 'Unknown';
    const humidity = current.humidity || '--';
    const windSpeed = current.windspeedKmph || '--';
    const feelsLike = current.FeelsLikeC || tempC;
    const uvIndex = current.uvIndex || '--';
    const visibility = current.visibility || '--';
    const pressure = current.pressure || '--';
    const cloudcover = current.cloudcover || '--';
    const icon = current.weatherCode || '113'; // 113 = Clear/Sunny

    // Forecast (next 4 days)
    const forecastDays = data.weather || [];
    const forecast = forecastDays.slice(0, 5).map(day => ({
      date: day.date || '',
      dayTemp: day.avgtempC || '--',
      high: day.maxtempC || '--',
      low: day.mintempC || '--',
      condition: day.hourly?.[0]?.weatherDesc?.[0]?.value || 'Unknown',
      icon: day.hourly?.[0]?.weatherCode || '113',
    }));

    // Location
    const location = data.nearest_area?.[0] || {};
    const cityName = location.areaName?.[0]?.value || city;
    const region = location.region?.[0]?.value || '';
    const country = location.country?.[0]?.value || '';

    return {
      city: cityName,
      region,
      country,
      temp: tempC,
      condition,
      humidity,
      windSpeed,
      feelsLike,
      uvIndex,
      visibility,
      pressure,
      cloudcover,
      icon,
      forecast,
      lastUpdated: new Date().toLocaleString(),
    };
  } catch (error) {
    console.error('Weather fetch error:', error);
    return null;
  }
};

/**
 * Get weather by IP location (auto-detects city)
 * Falls back to default city if geolocation fails
 */
export const getWeatherByIP = async () => {
  try {
    // Get approximate location from IP
    const geoResponse = await fetch('https://ipapi.co/json/');
    const geoData = await geoResponse.json();
    const city = geoData.city || DEFAULT_CITY;
    return getWeather(city);
  } catch (error) {
    console.error('IP geolocation error, using default city');
    return getWeather(DEFAULT_CITY);
  }
};