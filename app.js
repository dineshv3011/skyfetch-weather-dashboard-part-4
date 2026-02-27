function WeatherApp() {
    this.apiKey = "7e4b6ca3868b8ba1d629cfedab7fb32a";
    this.baseUrl = "https://api.openweathermap.org/data/2.5";
}

WeatherApp.prototype.init = function () {
    document.getElementById("searchBtn")
        .addEventListener("click", () => {
            const city = document.getElementById("cityInput").value.trim();
            if (city) {
                this.fetchWeather(city);
            }
        });

    this.loadLastCity();
    this.displayRecentSearches();
};

WeatherApp.prototype.fetchWeather = function (city) {
    const weatherURL = `${this.baseUrl}/weather?q=${city}&appid=${this.apiKey}&units=metric`;
    const forecastURL = `${this.baseUrl}/forecast?q=${city}&appid=${this.apiKey}&units=metric`;

    Promise.all([
        fetch(weatherURL).then(res => res.json()),
        fetch(forecastURL).then(res => res.json())
    ])
    .then(([weatherData, forecastData]) => {

        if (weatherData.cod !== 200) {
            alert("City not found!");
            return;
        }

        this.displayWeather(weatherData);
        this.displayForecast(forecastData);

        this.saveToLocalStorage(city);
    })
    .catch(error => {
        console.error("Error fetching data:", error);
    });
};

WeatherApp.prototype.displayWeather = function (data) {
    const resultDiv = document.getElementById("weatherResult");

    resultDiv.innerHTML = `
        <h2>${data.name}</h2>
        <p>🌡 Temperature: ${data.main.temp} °C</p>
        <p>☁ Condition: ${data.weather[0].description}</p>
        <p>💧 Humidity: ${data.main.humidity}%</p>
    `;
};

WeatherApp.prototype.displayForecast = function (data) {
    const container = document.getElementById("forecastContainer");
    container.innerHTML = "";

    const dailyData = data.list.filter(item =>
        item.dt_txt.includes("12:00:00")
    );

    dailyData.slice(0, 5).forEach(day => {
        const card = document.createElement("div");
        card.classList.add("forecast-card");

        card.innerHTML = `
            <p><strong>${day.dt_txt.split(" ")[0]}</strong></p>
            <p>${day.main.temp} °C</p>
            <p>${day.weather[0].main}</p>
        `;

        container.appendChild(card);
    });
};

WeatherApp.prototype.saveToLocalStorage = function (city) {
    let recent = JSON.parse(localStorage.getItem("recentCities")) || [];

    if (!recent.includes(city)) {
        recent.unshift(city);
    }

    if (recent.length > 5) {
        recent.pop();
    }

    localStorage.setItem("recentCities", JSON.stringify(recent));
    localStorage.setItem("lastCity", city);

    this.displayRecentSearches();
};

WeatherApp.prototype.displayRecentSearches = function () {
    const container = document.getElementById("recentSearches");
    container.innerHTML = "";

    const recent = JSON.parse(localStorage.getItem("recentCities")) || [];

    recent.forEach(city => {
        const btn = document.createElement("button");
        btn.textContent = city;

        btn.addEventListener("click", () => {
            this.fetchWeather(city);
        });

        container.appendChild(btn);
    });
};

WeatherApp.prototype.loadLastCity = function () {
    const lastCity = localStorage.getItem("lastCity");

    if (lastCity) {
        this.fetchWeather(lastCity);
    }
};

document.addEventListener("DOMContentLoaded", function () {
    const app = new WeatherApp();
    app.init();
});