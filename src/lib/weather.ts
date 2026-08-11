const WEATHER_DESCRIPTIONS: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Dense drizzle",
  56: "Freezing drizzle",
  57: "Freezing drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Rain showers",
  81: "Rain showers",
  82: "Violent rain showers",
  85: "Snow showers",
  86: "Snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with hail",
};

export function describeWeatherCode(code: number): string {
  return WEATHER_DESCRIPTIONS[code] ?? "Unknown";
}

export interface WeatherForecast {
  date: string;
  weatherCode: number;
  description: string;
  maxTempC: number;
  minTempC: number;
  precipitationProbability: number;
}

// Open-Meteo's forecast API only covers roughly the next 16 days.
export const FORECAST_HORIZON_DAYS = 16;

export async function getForecastForDate(
  lat: number,
  lng: number,
  date: string
): Promise<WeatherForecast | null> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
    `&timezone=auto&start_date=${date}&end_date=${date}`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  const daily = data.daily;
  if (!daily?.time?.length) return null;

  return {
    date: daily.time[0],
    weatherCode: daily.weathercode[0],
    description: describeWeatherCode(daily.weathercode[0]),
    maxTempC: daily.temperature_2m_max[0],
    minTempC: daily.temperature_2m_min[0],
    precipitationProbability: daily.precipitation_probability_max[0],
  };
}

export function contingencySuggestion(forecast: WeatherForecast): string | null {
  if (forecast.precipitationProbability >= 50) {
    return `There's a ${forecast.precipitationProbability}% chance of rain forecast for the wedding day — consider letting guests know about an indoor backup plan.`;
  }
  if (forecast.maxTempC >= 35) {
    return `Forecast high of ${Math.round(forecast.maxTempC)}°C — consider warning guests to bring water and sun protection for outdoor parts of the day.`;
  }
  if (forecast.minTempC <= 5) {
    return `Forecast low of ${Math.round(forecast.minTempC)}°C — consider letting guests know to dress warmly for any outdoor portions.`;
  }
  return null;
}
