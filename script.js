// ============================================
// Configuration
// ============================================
const apiKey = "65f1c7f625945146f7f0032194220857";

// ============================================
// DOM References
// ============================================
const form = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const weatherCard = document.getElementById("weatherCard");
const emptyState = document.getElementById("emptyState");
const skeleton = document.getElementById("skeleton");
const errorToast = document.getElementById("errorToast");
const errorMessage = document.getElementById("errorMessage");

// Hero elements
const weatherAnim = document.getElementById("weatherAnim");
const bgWeatherAnim = document.getElementById("bgWeatherAnim");
const cityNameEl = document.getElementById("cityName");
const cityTimeEl = document.getElementById("cityTime");
const temperatureEl = document.getElementById("temperature");
const weatherBadge = document.getElementById("weatherBadge");

// Detail values
const feelsLikeEl = document.getElementById("feelsLike");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const visibilityEl = document.getElementById("visibility");
const pressureEl = document.getElementById("pressure");
const sunriseEl = document.getElementById("sunrise");

// Detail cards (for stagger animation)
const detailCards = document.querySelectorAll(".detail-card");

// Autocomplete
const suggestionsList = document.getElementById("suggestionsList");

// ============================================
// Weather Icon Mapping
// ============================================
const animMap = {
  Clear:        { day: "anim-clear-day", night: "anim-clear-night" },
  Clouds:       { day: "anim-clouds",    night: "anim-clouds" },
  Rain:         { day: "anim-rain",      night: "anim-rain" },
  Drizzle:      { day: "anim-drizzle",   night: "anim-drizzle" },
  Mist:         { day: "anim-mist",      night: "anim-mist" },
  Smoke:        { day: "anim-mist",      night: "anim-mist" },
  Haze:         { day: "anim-mist",      night: "anim-mist" },
  Dust:         { day: "anim-dust",      night: "anim-dust" },
  Fog:          { day: "anim-mist",      night: "anim-mist" },
  Sand:         { day: "anim-dust",      night: "anim-dust" },
  Ash:          { day: "anim-dust",      night: "anim-dust" },
  Squall:       { day: "anim-tornado",   night: "anim-tornado" },
  Tornado:      { day: "anim-tornado",   night: "anim-tornado" },
  Snow:         { day: "anim-snow",      night: "anim-snow" },
  Thunderstorm: { day: "anim-thunderstorm", night: "anim-thunderstorm" },
};

// Background accent colors per weather condition
const bgAccents = {
  Clear:        { color1: "#f97316", color2: "#facc15" },
  Clouds:       { color1: "#64748b", color2: "#94a3b8" },
  Rain:         { color1: "#0ea5e9", color2: "#6366f1" },
  Drizzle:      { color1: "#38bdf8", color2: "#818cf8" },
  Mist:         { color1: "#94a3b8", color2: "#64748b" },
  Haze:         { color1: "#a78bfa", color2: "#c084fc" },
  Snow:         { color1: "#e2e8f0", color2: "#bae6fd" },
  Thunderstorm: { color1: "#7c3aed", color2: "#4338ca" },
};

// ============================================
// Utility Helpers
// ============================================

/** Convert Unix timestamp to HH:MM using a timezone offset (seconds) */
function formatTime(unixTimestamp, timezoneOffset) {
  const date = new Date((unixTimestamp + timezoneOffset) * 1000);
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

/** Get the local time string for a city given its UTC offset (seconds) */
function getCityLocalTime(timezoneOffset) {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const cityTime = new Date(utcMs + timezoneOffset * 1000);
  return cityTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/** Convert visibility in metres to km */
function formatVisibility(metres) {
  return (metres / 1000).toFixed(1) + " km";
}

/** Convert country code to flag emoji */
function countryCodeToFlag(code) {
  if (!code) return "";
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  );
}

// ============================================
// Autocomplete — City Suggestions
// ============================================

let debounceTimer = null;
let activeSuggestionIndex = -1;
let currentSuggestions = [];

/** Fetch city suggestions from OpenWeatherMap Geocoding API */
function fetchSuggestions(query) {
  if (query.length < 1) {
    hideSuggestions();
    return;
  }

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${apiKey}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) {
          hideSuggestions();
          return;
        }
        currentSuggestions = data;
        renderSuggestions(data);
      })
      .catch(() => {
        hideSuggestions();
      });
  }, 100);
}

/** Render suggestion items in the dropdown */
function renderSuggestions(cities) {
  activeSuggestionIndex = -1;
  suggestionsList.innerHTML = cities
    .map((city, i) => {
      const region = [city.state, city.country].filter(Boolean).join(", ");
      const flag = countryCodeToFlag(city.country);
      return `
        <li class="suggestion-item" data-index="${i}" role="option">
          <span class="suggestion-icon material-symbols-rounded">location_on</span>
          <div class="suggestion-text">
            <div class="suggestion-city">${city.name}</div>
            <div class="suggestion-region">${region}</div>
          </div>
          <span class="suggestion-flag">${flag}</span>
        </li>`;
    })
    .join("");

  suggestionsList.classList.add("active");

  // Attach click handlers
  suggestionsList.querySelectorAll(".suggestion-item").forEach((item) => {
    item.addEventListener("mousedown", (e) => {
      e.preventDefault(); // prevent blur before click registers
      const idx = parseInt(item.dataset.index, 10);
      selectSuggestion(idx);
    });
  });
}

/** Select a suggestion and trigger weather fetch */
function selectSuggestion(index) {
  const city = currentSuggestions[index];
  if (!city) return;
  cityInput.value = city.name;
  hideSuggestions();
  form.dispatchEvent(new Event("submit"));
}

/** Hide suggestions dropdown */
function hideSuggestions() {
  suggestionsList.classList.remove("active");
  activeSuggestionIndex = -1;
  currentSuggestions = [];
}

/** Highlight active suggestion */
function updateActiveItem() {
  const items = suggestionsList.querySelectorAll(".suggestion-item");
  items.forEach((item, i) => {
    item.classList.toggle("active", i === activeSuggestionIndex);
  });
}

// --- Input event: fetch suggestions as user types ---
cityInput.addEventListener("input", () => {
  fetchSuggestions(cityInput.value.trim());
});

// --- Keyboard navigation ---
cityInput.addEventListener("keydown", (e) => {
  const items = suggestionsList.querySelectorAll(".suggestion-item");
  if (!items.length) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    activeSuggestionIndex = Math.min(activeSuggestionIndex + 1, items.length - 1);
    updateActiveItem();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    activeSuggestionIndex = Math.max(activeSuggestionIndex - 1, 0);
    updateActiveItem();
  } else if (e.key === "Enter" && activeSuggestionIndex >= 0) {
    e.preventDefault();
    selectSuggestion(activeSuggestionIndex);
  } else if (e.key === "Escape") {
    hideSuggestions();
  }
});

// --- Hide suggestions when input loses focus ---
cityInput.addEventListener("blur", () => {
  // Small delay to allow mousedown on suggestion to fire first
  setTimeout(hideSuggestions, 150);
});

// ============================================
// UI State Management
// ============================================

function showSkeleton() {
  emptyState.style.display = "none";
  weatherCard.classList.remove("visible");
  weatherCard.style.display = "none";
  skeleton.classList.add("active");
}

function hideSkeleton() {
  skeleton.classList.remove("active");
}

function showWeatherCard() {
  hideSkeleton();
  weatherCard.style.display = "block";

  // Force reflow so the transition triggers
  void weatherCard.offsetWidth;
  weatherCard.classList.add("visible");

  // Stagger detail card animations
  detailCards.forEach((card, i) => {
    card.classList.remove("animate-in");
    setTimeout(() => {
      card.classList.add("animate-in");
    }, 80 + i * 70);
  });
}

function showError(message) {
  errorMessage.textContent = message;
  errorToast.classList.add("visible");
  setTimeout(() => {
    errorToast.classList.remove("visible");
  }, 3500);
}

function setBackgroundAccent(weatherMain) {
  const accent = bgAccents[weatherMain] || bgAccents.Clear;
  const orbs = document.querySelectorAll(".bg-orb");
  if (orbs[0]) {
    orbs[0].style.background = `radial-gradient(circle, ${accent.color1}, transparent 70%)`;
  }
  if (orbs[1]) {
    orbs[1].style.background = `radial-gradient(circle, ${accent.color2}, transparent 70%)`;
  }
}

// ============================================
// Forecast & AQI — DOM References
// ============================================

const forecastSection = document.getElementById("forecastSection");
const forecastScroll = document.getElementById("forecastScroll");
const aqiSection = document.getElementById("aqiSection");
const aqiBadge = document.getElementById("aqiBadge");
const aqiLevelEl = document.getElementById("aqiLevel");
const aqiLabelEl = document.getElementById("aqiLabel");
const aqiBar = document.getElementById("aqiBar");
const pm25El = document.getElementById("pm25");
const pm10El = document.getElementById("pm10");
const no2El = document.getElementById("no2");
const o3El = document.getElementById("o3");

// AQI level mapping
const aqiData = {
  1: { label: "Good",      class: "aqi-good",      barWidth: "20%" },
  2: { label: "Fair",       class: "aqi-fair",       barWidth: "40%" },
  3: { label: "Moderate",   class: "aqi-moderate",   barWidth: "60%" },
  4: { label: "Poor",       class: "aqi-poor",       barWidth: "80%" },
  5: { label: "Very Poor",  class: "aqi-very-poor",  barWidth: "100%" },
};

// Day names for forecast
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ============================================
// Forecast — Fetch & Render
// ============================================

function fetchForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (!data.list) return;

      // Group by day — pick the entry closest to noon (12:00) for each day
      const dailyMap = {};
      const today = new Date().toISOString().slice(0, 10);

      data.list.forEach((entry) => {
        const date = entry.dt_txt.slice(0, 10);
        if (date === today) return; // skip today

        if (!dailyMap[date]) {
          dailyMap[date] = { entries: [], noon: null };
        }
        dailyMap[date].entries.push(entry);

        // Pick the entry closest to 12:00
        const hour = parseInt(entry.dt_txt.slice(11, 13), 10);
        if (!dailyMap[date].noon || Math.abs(hour - 12) < Math.abs(parseInt(dailyMap[date].noon.dt_txt.slice(11, 13), 10) - 12)) {
          dailyMap[date].noon = entry;
        }
      });

      // Get up to 5 days
      const days = Object.keys(dailyMap).slice(0, 5);

      forecastScroll.innerHTML = days
        .map((date) => {
          const entry = dailyMap[date].noon;
          const allEntries = dailyMap[date].entries;

          // Calc high/low from all entries that day
          const highs = allEntries.map((e) => e.main.temp_max);
          const lows = allEntries.map((e) => e.main.temp_min);
          const high = Math.round(Math.max(...highs));
          const low = Math.round(Math.min(...lows));

          const dayName = dayNames[new Date(date).getDay()];
          const iconUrl = `https://openweathermap.org/img/wn/${entry.weather[0].icon}@2x.png`;
          const desc = entry.weather[0].description;

          return `
            <div class="forecast-card">
              <div class="forecast-day">${dayName}</div>
              <img class="forecast-icon" src="${iconUrl}" alt="${desc}">
              <div class="forecast-temps">
                <span class="forecast-high">${high}°</span>
                <span class="forecast-low">${low}°</span>
              </div>
              <div class="forecast-desc">${desc}</div>
            </div>`;
        })
        .join("");

      // Animate in
      setTimeout(() => {
        forecastSection.classList.add("animate-in");
      }, 500);
    })
    .catch(() => {
      // Silently fail — forecast is supplementary
      forecastScroll.innerHTML = '<div class="forecast-desc" style="padding:16px;text-align:center;width:100%">Forecast unavailable</div>';
      forecastSection.classList.add("animate-in");
    });
}

// ============================================
// Air Quality — Fetch & Render
// ============================================

function fetchAirQuality(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (!data.list || !data.list[0]) return;

      const aqi = data.list[0].main.aqi; // 1-5
      const components = data.list[0].components;
      const info = aqiData[aqi] || aqiData[1];

      // Update badge
      aqiLevelEl.textContent = aqi;
      aqiLabelEl.textContent = info.label;

      // Remove old AQI classes, add new
      aqiBadge.className = "aqi-badge";
      const aqiWrapper = aqiSection.querySelector(".aqi-header");
      aqiWrapper.className = "aqi-header " + info.class;

      // Animate bar
      setTimeout(() => {
        aqiBar.style.width = info.barWidth;
      }, 300);

      // Pollutant values
      pm25El.textContent = components.pm2_5 ? components.pm2_5.toFixed(1) : "—";
      pm10El.textContent = components.pm10 ? components.pm10.toFixed(1) : "—";
      no2El.textContent = components.no2 ? components.no2.toFixed(1) : "—";
      o3El.textContent = components.o3 ? components.o3.toFixed(1) : "—";

      // Animate in
      setTimeout(() => {
        aqiSection.classList.add("animate-in");
      }, 700);
    })
    .catch(() => {
      // Silently fail — AQI is supplementary
      aqiLevelEl.textContent = "—";
      aqiLabelEl.textContent = "Unavailable";
      aqiSection.classList.add("animate-in");
    });
}

// ============================================
// Fetch & Render Weather Data
// ============================================

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const city = cityInput.value.trim();
  if (!city) return;

  showSkeleton();

  // Reset forecast & AQI sections
  forecastSection.classList.remove("animate-in");
  aqiSection.classList.remove("animate-in");
  aqiBar.style.width = "0%";

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.cod === "404" || data.cod === 404) {
        hideSkeleton();
        emptyState.style.display = "block";
        showError("City not found — check the spelling and try again");
        return;
      }

      if (data.cod !== 200) {
        hideSkeleton();
        emptyState.style.display = "block";
        showError("Something went wrong — please try again");
        return;
      }

      // --- Populate data ---
      const weatherMain = data.weather[0].main;
      const iconCode = data.weather[0].icon;
      const isNight = iconCode.includes("n");

      // Animation
      const mapping = animMap[weatherMain] || animMap.Clear;
      const animClass = isNight ? mapping.night : mapping.day;
      weatherAnim.className = "weather-anim " + animClass;
      bgWeatherAnim.className = "weather-anim bg-weather-anim " + animClass;
      weatherAnim.title = data.weather[0].description;

      // Hero text
      cityNameEl.textContent = data.name + (data.sys.country ? `, ${data.sys.country}` : "");
      cityTimeEl.textContent = "Local time: " + getCityLocalTime(data.timezone);
      temperatureEl.textContent = Math.round(data.main.temp) + "°C";
      weatherBadge.textContent = data.weather[0].description;

      // Detail cards
      feelsLikeEl.textContent = Math.round(data.main.feels_like) + "°C";
      humidityEl.textContent = data.main.humidity + "%";
      windEl.textContent = (data.wind.speed * 3.6).toFixed(1) + " km/h";
      visibilityEl.textContent = formatVisibility(data.visibility || 0);
      pressureEl.textContent = data.main.pressure + " hPa";
      sunriseEl.textContent = formatTime(data.sys.sunrise, data.timezone);

      // Dynamic background
      setBackgroundAccent(weatherMain);

      // Reveal weather card
      showWeatherCard();

      // Fetch supplementary data (forecast + air quality)
      fetchForecast(city);
      fetchAirQuality(data.coord.lat, data.coord.lon);
    })
    .catch(() => {
      hideSkeleton();
      emptyState.style.display = "block";
      showError("Network error — check your connection");
    });
});

