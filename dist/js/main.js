window.addEventListener("load", function () {
  (function init() {
    // api request
    const config = {
      api: "https://serene-tundra-03072.herokuapp.com/https://www.metaweather.com/api/location/",
      units: "celsius",
      cityID: "44418",
      tempData: null,
    };

    // DOM UI reference
    const DOM = {
      searchForPlacesBtn: document.getElementById("search_btn"),
      modalEl: document.getElementById("search_modal"),
      closeBtn: document.querySelector(".close-btn span"),
      gpsBtn: document.getElementById("gps_btn"),
      searchBtn: document.getElementById("search"),
      inputSearch: document.getElementById("searchInput"),
      resultsList: document.querySelector(".city-list"),
      // current weather display function references
      currentIcon: document.getElementById("current_w_icon"),
      currentTemp: document.getElementById("current-w-temp"),
      // tempSymbol: document.querySelectorAll(".temp_symbol"), selekciju ovoga vrsimo dole pre dodele template-a, jebiga
      currentType: document.getElementById("current_w_type"),
      currentDate: document.getElementById("current_w_date"),
      currentLocation: document.getElementById("current_w_location"),
      tempSymbol: document.getElementById('temp_symbol'),
      // todays highlights
      windSpeed: document.getElementById("wind_speed"),
      windDirection: document.getElementById("wind_direction"),
      windCompass: document.getElementById("wind_compass"),
      humidity: document.getElementById("humidity"),
      humidityPercentage: document.getElementById("humidity_percentage"),
      visibility: document.getElementById("visibility"),
      airPressure: document.getElementById("air_pressure"),
      // daily list
      days: document.getElementById("days"),
      // change units c and f
      unitBtn: document.querySelectorAll("button.icon-btn"),
    };

    console.log("Ucitano");
    onFetchData(config.cityID);

    // set date
    DOM.currentDate.innerHTML = moment().format("ddd, D MMM");

    // call and set all event listeners
    setEventListeners();

    // ********** Initialize for events *******************//

    function setEventListeners() {
      // open search modal event
      DOM.searchForPlacesBtn.addEventListener("click", openSearchModal);

      // close search modal event
      DOM.closeBtn.addEventListener("click", closeSearchModal);

      // active gps
      DOM.gpsBtn.addEventListener("click", getGeolocation);

      // on search in modal
      DOM.searchBtn.addEventListener("click", getSearchResults);

      // on input enter
      DOM.inputSearch.addEventListener("keypress", getSearchResults);

      // click on unit button
      DOM.unitBtn.forEach((btn) => btn.addEventListener("click", changeUnits));
    }

    // ************** Helper functions ****************** //

    function openSearchModal() {
      DOM.modalEl.style.display = "block";
      DOM.modalEl.classList.remove("animate__slideOutLeft");
      DOM.modalEl.classList.add("animate__slideInLeft");
    }

    function closeSearchModal() {
      DOM.modalEl.classList.remove("animate__slideInLeft");
      DOM.modalEl.classList.add("animate__slideOutLeft");
    }

    // Get Geolocation function
    function getGeolocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(fetchGeolocation);
      } else {
        alert("Geolocation not supported by this browser.");
      }
    }

    function fetchGeolocation(position) {
      openSearchModal();
      const lat = position.coords.latitude;
      const long = position.coords.longitude;
      onSearch(`${lat},${long}`, "lattlong");
    }

    // fetch data from server for the next 6 days
    function onFetchData(cityId) {
      config.cityID = cityId;
      fetch(`${config.api}${cityId}`)
        .then((response) => response.json())
        .then((data) => {
          printResults(data);
          config.tempData = data;
        });
    }

    // same thijg but data for city string that is forwarded argument
    function onSearch(query, type = "query") {
      fetch(`${config.api}search/?${type}=${query}`)
        .then((response) => response.json())
        .then((data) => printSearchResults(data));
    }

    function getSearchResults(e = null) {
      if (e.keyCode == 13 || e.type === "click") {
        const inputValue = DOM.inputSearch.value;
        onSearch(inputValue);
      }
    }

    function onSelected(event) {
      const woeid = event.target.getAttribute("data-woeid");
      onFetchData(woeid);
      closeSearchModal();
    }

    // print search results
    function printSearchResults(results) {
      DOM.resultsList.innerHTML = "";
      results.forEach((city) => {
        const li = document.createElement("li");
        li.innerText = city.title;
        li.setAttribute("data-woeid", city.woeid);
        DOM.resultsList.appendChild(li);
        li.addEventListener("click", onSelected);
      });
    }

    // print all data about weather
    function printResults(data) {
      // ovde zove tri metode
      displayCurrentWeather(data);
      displayHighlights(data.consolidated_weather[0]);
      displayDailyCards(data.consolidated_weather);
    }

    // left content display current weather
    function displayCurrentWeather(data) {
      const weatherData = data.consolidated_weather[0];
      const weatherIconName = weatherData.weather_state_name.replace(/\s/g, "");
      DOM.currentIcon.setAttribute("src",`./img/${weatherIconName}.png`);
      DOM.currentTemp.innerText = parseInt(convertNumber(weatherData.the_temp));
      DOM.currentType.innerText = weatherData.weather_state_name;
      DOM.currentLocation.innerText = data.title;
      DOM.tempSymbol.innerHTML = displayUnit();
    }

    // todays highlights
    function displayHighlights(data) {
      // wind speed
      DOM.windSpeed.innerText = parseInt(data.wind_speed);
      DOM.windDirection.style.transform = `rotate(${parseInt(
        data.wind_direction
      )}deg)`;
      DOM.windCompass.innerText = data.wind_direction_compass;

      // humidity
      DOM.humidity.innerText = data.humidity;
      DOM.humidityPercentage.style.width = `${data.humidity}%`;

      // visibility
      DOM.visibility.innerText = parseInt(data.visibility);

      // air pressure
      DOM.airPressure.innerText = parseInt(data.air_pressure);
    }

    // next 6 days
    function displayDailyCards(data) {
      const dailyData = [...data]; // moramo da napravimo ovako kopiju da ne bismo menjali originalni niz
      dailyData.splice(0, 1); // niz bez prvog dana posto pocinju kartice od sutrasnjeg dana
      DOM.days.innerHTML = "";

      dailyData.forEach((daily, index) => {
        const weatherIconName = daily.weather_state_name.replace(/\s/g, "");
        const template = `<div class="card">
        <div class="title">${
          index === 0
            ? "Tomorrow"
            : moment(daily.applicable_date).format("ddd, D MMM")
        }</div>
        <div class="icon">
          <img src="./img/${weatherIconName}.png">
        </div>
        <div class="temps">
          <div class="max">${parseInt(
            convertNumber(daily.max_temp)
          )} <span class="temp_symbol">${displayUnit()}</span></div>
          <div class="min">${parseInt(
            convertNumber(daily.min_temp)
          )} <span class="temp_symbol">${displayUnit()}</span></div>
        </div>
      </div>`;
        DOM.days.insertAdjacentHTML("beforeend", template);
      });
    }

    // convert function from c to f and viceversa
    function convertNumber(num) {
      if (config.units === "celsius") {
        return num;
      }
      return (num * 9) / 5 + 32;
    }

    // change units
    function changeUnits(e) {
      const target = e.target;
      const tempSymbol = document.querySelectorAll(".temp_symbol");
      DOM.unitBtn.forEach((btn) => btn.classList.remove("active"));
      target.classList.add("active");
      config.units = target.dataset.unit;
      printResults(config.tempData);
    }
    function displayUnit() {
      if(config.units === 'celsius') {
        return '&#176;C';
      } else {
        return '&#176;F';
      }
    }

  })();
});
