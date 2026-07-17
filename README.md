# 🌦️ Real-Time Weather Monitoring

A sleek, modern weather app that provides real-time weather data for any city worldwide. Built with vanilla HTML, CSS, and JavaScript.

![Dark Theme](https://img.shields.io/badge/Theme-Dark_Glassmorphism-0a0e1a?style=flat-square)
![Responsive](https://img.shields.io/badge/Responsive-Mobile_First-38bdf8?style=flat-square)
![API](https://img.shields.io/badge/API-OpenWeatherMap-f97316?style=flat-square)

## ✨ Features

- **Live City Autocomplete** — Suggestions appear as you type with country flags
- **Real-Time Weather Data** — Temperature, feels-like, humidity, wind, visibility, pressure, and sunrise
- **Dynamic Backgrounds** — Background colors change based on weather conditions
- **Day/Night Icons** — Automatically switches icons based on time of day
- **Loading Skeleton** — Shimmer animation while data loads
- **Error Handling** — Inline toast notifications (no alerts)
- **Responsive Design** — Works on mobile, tablet, and desktop
- **Glassmorphism UI** — Modern frosted-glass design with animations

## 🛠️ Tech Stack

- **HTML5** — Semantic markup with ARIA accessibility
- **CSS3** — Custom properties, glassmorphism, CSS Grid, animations
- **JavaScript** — Vanilla JS, Fetch API, DOM manipulation
- **API** — [OpenWeatherMap](https://openweathermap.org/api) (Weather + Geocoding)
- **Fonts** — [Inter](https://fonts.google.com/specimen/Inter) + [Material Symbols](https://fonts.google.com/icons)

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Brus36/Real-Time-Weather-Monitoring.git
   cd Real-Time-Weather-Monitoring
   ```

2. **Open in browser**
   - Simply open `index.html` in any modern browser
   - No build step or server required

3. **Optional: Use your own API key**
   - Sign up at [OpenWeatherMap](https://openweathermap.org/api)
   - Replace the `apiKey` value in `script.js` (line 4)

## 📁 Project Structure

```
├── index.html       # Main page structure
├── style.css        # Design system & all styles
├── script.js        # App logic, API calls, animations
├── README.md        # This file
└── images/          # Weather condition icons
    ├── clear.png
    ├── clouds.png
    ├── drizzle.png
    ├── half-moon.png
    ├── haze.png
    ├── mist.png
    ├── moon.png
    ├── rain.png
    ├── snow.png
    └── thunderstorm.png
```

## 📊 Weather Data Displayed

| Data Point | Source |
|---|---|
| Temperature | `main.temp` |
| Feels Like | `main.feels_like` |
| Humidity | `main.humidity` |
| Wind Speed | `wind.speed` (converted to km/h) |
| Visibility | `visibility` (converted to km) |
| Pressure | `main.pressure` |
| Sunrise | `sys.sunrise` (localized to city time) |
| City Local Time | Calculated from `timezone` offset |

## 📱 Screenshots

> Open `index.html` in your browser to see the app in action!

