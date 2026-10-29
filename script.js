
const form = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const locationBtn = document.getElementById("locationBtn");
const message = document.getElementById("message");
const weatherCard = document.getElementById("weatherCard");

function showMessage(text) {
  message.textContent = text;
}

function getWeatherInfo(code) {
  const weatherTypes = {
    0: ["Clear Sky", "☀️"],
    1: ["Mainly Clear", "🌤️"],
    2: ["Partly Cloudy", "⛅"],
    3: ["Overcast", "☁️"],
    45: ["Foggy", "🌫️"],
    48: ["Foggy", "🌫️"],
    51: ["Light Drizzle", "🌦️"],
    53: ["Drizzle", "🌦️"],
    55: ["Heavy Drizzle", "🌧️"],
    61: ["Light Rain", "🌦️"],
    63: ["Rain", "🌧️"],
    65: ["Heavy Rain", "🌧️"],
    71: ["Light Snow", "🌨️"],
    73: ["Snow", "❄️"],
    75: ["Heavy Snow", "❄️"],
    80: ["Rain Showers", "🌦️"],
    81: ["Rain Showers", "🌧️"],
    82: ["Heavy Showers", "⛈️"],
    95: ["Thunderstorm", "⛈️"],
    96: ["Thunderstorm with Hail", "⛈️"],
    99: ["Thunderstorm with Hail", "⛈️"]
  };

  return weatherTypes[code] || ["Unknown Condition", "🌡️"];
}

async function loadWeather(latitude, longitude, place) {
  showMessage("Loading weather...");
  weatherCard.hidden = true;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Weather data is unavailable.");
    }

    const data = await response.json();
    const current = data.current;

    if (!current) {
      throw new Error("No weather data found.");
    }

    const [condition, icon] = getWeatherInfo(current.weather_code);

    document.getElementById("cityName").textContent = place;
    document.getElementById("weatherIcon").textContent = icon;
    document.getElementById("temperature").textContent =
      `${Math.round(current.temperature_2m)}°C`;
    document.getElementById("condition").textContent = condition;
    document.getElementById("feelsLike").textContent =
      `${Math.round(current.apparent_temperature)}°C`;
    document.getElementById("humidity").textContent =
      `${current.relative_humidity_2m}%`;
    document.getElementById("windSpeed").textContent =
      `${current.wind_speed_10m} km/h`;

    weatherCard.hidden = false;
    showMessage("");
  } catch (error) {
    showMessage("Could not load weather. Please try again.");
  }
}

async function searchCity(city) {
  showMessage("Searching for city...");
  weatherCard.hidden = true;

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Search failed");

    const data = await response.json();
    const place = data.results?.[0];

    if (!place) {
      showMessage("City not found. Please check the spelling.");
      return;
    }

    const locationName = [place.name, place.admin1, place.country]
      .filter(Boolean)
      .filter((item, index, array) => array.indexOf(item) === index)
      .join(", ");

    await loadWeather(place.latitude, place.longitude, locationName);
  } catch (error) {
    showMessage("Unable to search. Check your internet connection.");
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();

  if (city) {
    searchCity(city);
  }
});

locationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showMessage("Location is not supported by this browser.");
    return;
  }

  showMessage("Please allow location access...");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      loadWeather(
        position.coords.latitude,
        position.coords.longitude,
        "Your Current Location"
      );
    },
    () => {
      showMessage("Location access denied. Please search by city.");
    }
  );
});

searchCity("Pune");
