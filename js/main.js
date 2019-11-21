const APPLICATION_ID = localStorage.getItem('_appId');
const APPLICATION_CODE = localStorage.getItem('_appCode');
const OPENWEATHERMAP_APPID = localStorage.getItem('_openWeatherMapAppId');

function insertSuggestionToTextbox(suggestion) {
  $('.suggestions').remove();
  $('input').val(suggestion);
  $('input').focus();
}

function createAndAppendAutoCompleteElements(suggestions) {
  // early exit function validation
  if (!suggestions) {
    $('suggestions').remove();
    return;
  }

  $('.suggestions').remove();
  let id = 0;
  const result = suggestions.map((suggestion) => {
    id += 1;
    return `<div class="suggestions" id=${id} countrycode=${suggestion.countryCode} tabindex="0"> ${suggestion.label} </div>`;
  });
  $('form').append(result);
}

class TemperatureConverter {
  constructor(temperature = 'no null parameter', metricSystem = 'celsius') {
    this.temperature = temperature;
    this.metricSystem = metricSystem;
  }

  convertToCelsius(temperature) {
    this.celsTemp = (temperature - 32) * (5 / 9);
    return Math.ceil(this.celsTemp * 100) / 100;
  }

  convertToFahrenheit(temperature) {
    this.fahrTemp = temperature * (9 / 5) + 32;
    return Math.ceil(this.fahrTemp * 100) / 100;
  }

  getCurrentMetricSystem() {
    return this.metricSystem;
  }

  setCurrentMetricSystem(system) {
    this.metricSystem = system;
  }
}

// this handles the navigation toggle functionality.
$('.nav_handle-container').click(() => {
  if ($('.toggled').is(':visible')) {
    $('.toggled').hide(200);
    return;
  }
  $('.toggled').show(200);
});

// #region auto suggestion
const AUTOCOMPLETION_URL = 'https://autocomplete.geocoder.api.here.com/6.2/suggest.json';
// click and keyboard events for autosuggestion.

$(document).on('click', '#1', () => {
  const suggestion = $('#1').text();
  insertSuggestionToTextbox(suggestion);
});

$(document).on('click', '#2', () => {
  const suggestion = $('#2').text();
  insertSuggestionToTextbox(suggestion);
});

$(document).on('click', '#3', () => {
  const suggestion = $('#3').text();
  insertSuggestionToTextbox(suggestion);
});

$(document).on('click', '#4', () => {
  const suggestion = $('#4').text();
  insertSuggestionToTextbox(suggestion);
});

$(document).on('click', '#5', () => {
  const suggestion = $('#5').text();
  insertSuggestionToTextbox(suggestion);
});

$(document).on('keyup', '#1', (e) => {
  if (e.which === 13 || e.which === 32) {
    const suggestion = $('#1').text();
    insertSuggestionToTextbox(suggestion);
  }
});

$(document).on('keyup', '#2', (e) => {
  if (e.which === 13 || e.which === 32) {
    const suggestion = $('#2').text();
    insertSuggestionToTextbox(suggestion);
  }
});

$(document).on('keyup', '#3', (e) => {
  if (e.which === 13 || e.which === 32) {
    const suggestion = $('#3').text();
    insertSuggestionToTextbox(suggestion);
  }
});

$(document).on('keyup', '#4', (e) => {
  if (e.which === 13 || e.which === 32) {
    const suggestion = $('#4').text();
    insertSuggestionToTextbox(suggestion);
  }
});

$(document).on('keyup', '#5', (e) => {
  if (e.which === 13 || e.which === 32) {
    const suggestion = $('#5').text();
    insertSuggestionToTextbox(suggestion);
  }
});

$('.autocomplete').keyup((e) => {
  // Exit on esc keypress event
  if (e.which === 27) {
    $('.suggestions').remove();
    return;
  }

  const searchValue = $('.autocomplete').val(); // grab the value in the textbox here
  // The search text which is the basis of the query
  //  Mark the beginning of the match in a token.
  // The upper limit the for number of suggestions to be included
  //  Mark the end of the match in a token.
  // in the response.  Default is set to 5.
  const params = `?query=
  ${encodeURIComponent(searchValue)}
  &beginHighlight=
  ${encodeURIComponent('<mark>')}
  &endHighlight=
  ${encodeURIComponent('</mark>')}
  &maxresults=5&app_id=${APPLICATION_ID}
  &app_code=${APPLICATION_CODE}`;

  fetch(AUTOCOMPLETION_URL + params)
    .then((response) => response.json()) // convert response to json object
    .then((result) => {
      const {
        suggestions,
      } = result;
      createAndAppendAutoCompleteElements(suggestions);
    })
    .catch((error) => error);
});

// #endregion

// #region fetch APIs

function fetchGeoCodingInfoSuccessCallback(result) {
  if (!result || result.type === 'ApplicationError') {
    throw new Error(`Error fetching geocoding information: ${result.type} `);
  }
  const geoCoordinates = {};
  const {
    Result = 'Oops! No coordinates for this location',
    // the array which contains geocoordinates
  } = result.Response.View[0];

  Result.forEach((res) => {
    const {
      Latitude = 'Oops! No coordinates for this location',
      // an array containing the geocoordinate,
      Longitude = 'Oops! No coordinates for this location',

    } = res.Location.NavigationPosition[0];
    geoCoordinates.Latitude = Latitude;
    geoCoordinates.Longitude = Longitude;
    // insert the geocoordinates to the geoCoordinates object
  });
  return geoCoordinates;
}

function getGeoCodingInfoOfSearchedPlace(searchString) {
  if (!searchString) {
    return 'Invalid value passed as parameter!';
  }

  const GEOCODER_URL = 'https://geocoder.api.here.com/6.2/geocode.json';
  const urlEncodedSearchString = encodeURIComponent(searchString);
  const params = `?app_id=${APPLICATION_ID}&app_code=${APPLICATION_CODE}&searchtext=${urlEncodedSearchString}`;
  return fetch(GEOCODER_URL + params)
    .then((response) => response.json()) // convert response to json object
    .then((response) => fetchGeoCodingInfoSuccessCallback(response))
    .catch((error) => error);
}

function fetchWeatherInfoOfSearchedPlaceSuccessCallback(result) {
  if (result.cod !== 200) {
    throw new Error(`Error fetching geocoding information: ${result.type} `);
  }
  const weatherInfo = {};
  const {
    coord = {},
    weather = [],
    main = {},
    wind = {},
  } = result; // get only weather, main and wind from returned json;
  weatherInfo.geoCoordinates = coord;

  weather.forEach((obj) => {
    const {
      main: currentWeather = 'Main weather not found.',
      // get only main from obj in the weather array and rename it 'currentWeather'
    } = obj;
    weatherInfo.currentWeather = currentWeather; // insert currentWeather into weatherInfo obj
  });
  const {
    humidity = 'Humidity not found.',
    temp: temperature = 'Temperature not found.',
  } = main; // select only humidity and temp (renamed 'temperature') from the 'main' object
  weatherInfo.humidity = humidity;
  weatherInfo.temperature = temperature;
  // insert them into the weatherInfo object

  const {
    speed: windSpeed = 'Wind speed not found.',
  } = wind; // select only speed (renamed windSpeed)from the wind obj
  weatherInfo.windSpeed = windSpeed; // insert windSpeed into weatherInfo obj
  return weatherInfo;
}

function getWeatherInfoOfSearchedPlace(lat, lon) {
  if (!lat || !lon) {
    throw new Error('Error fetching weather information.');
  }
  const OPENWEATHERMAP_URL = 'http://api.openweathermap.org/data/2.5/weather';
  const params = `?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_APPID}`;
  return fetch(OPENWEATHERMAP_URL + params)
    .then((response) => response.json()) // convert response to json object
    .then((result) => fetchWeatherInfoOfSearchedPlaceSuccessCallback(result))
    .catch((error) => error);
}

function getLandmarksAroundSearchedPlaceSuccessCallBack(result, geoCoord) {
  if ((!result || result.type === 'ApplicationError') || !geoCoord) {
    throw new Error(`Error fetching geocoding information: ${result.type} `);
  }
  const landmarks = [];
  const { Result } = result.Response.View[0];
  Result.forEach((obj) => {
    const landmark = {};
    const {
      Location: {
        LocationType = 'Nothing here.',
        Name = 'Nothing here',
        DisplayPosition = 'Nothing here.',
        Address: {
          Label = 'Nothing here.',
          Country = 'Nothing here',
          State = 'Nothing here',
          City = 'Nothing here',
        },
      },
    } = obj;

    landmark.locationType = LocationType;
    landmark.name = Name;
    landmark.displayPosition = DisplayPosition;
    landmark.label = Label;
    landmark.country = Country;
    landmark.state = State;
    landmark.city = City;

    landmarks.push(landmark);
  });
  return {
    Landmarks: landmarks,
    mainGeoCoord: geoCoord,
  };
}

function getLandmarksAroundSearchedPlace(geoCoordinates) {
  if (!geoCoordinates) {
    throw new Error(`Error fetching geocoding information: ${geoCoordinates} `);
  }
  const {
    lat = '',
    lon = '',
  } = geoCoordinates;
  const GEOCODER_LANDMARKS_URL = 'https://reverse.geocoder.api.here.com/6.2/reversegeocode.json';
  // Mark the end of the match in a token.
  const params = `?app_id=${APPLICATION_ID}&app_code=${APPLICATION_CODE}&mode=retrieveLandmarks&prox=${lat},${lon},1000`;
  return fetch(GEOCODER_LANDMARKS_URL + params)
    .then((response) => response.json()) // convert response to json object
    .then((result) => getLandmarksAroundSearchedPlaceSuccessCallBack(result, geoCoordinates))
    .catch((error) => error);
}

// #endregion

// #region map

// Initialize and add the map
function initMap(results) {
  console.log(results);
  const { Landmarks, mainGeoCoord } = results;

  const icons = {
    centerIcon: 'minImages/flag-red.png',
    landmarkIcon: 'minImages/flag-blue.png',
  };

  const center = {
    lat: mainGeoCoord.lat,
    lng: mainGeoCoord.lon,
  };

  // The map, centered at mainCoordinate
  // mainCoordinate is the location the user searched for
  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 11,
    center,
  });
  // The marker, positioned at center
  const centerMarker = new google.maps.Marker({
    position: center,
    animation: google.maps.Animation.BOUNCE,
    icon: icons.centerIcon,
    map,
  });

  google.maps.event.addListener(centerMarker, 'click', () => {
    console.log('marker clicked');
  });

  Landmarks.forEach((result) => {
    const { Latitude, Longitude } = result.displayPosition;
    const { name: placeName } = result;

    const marker = new google.maps.Marker({
      position: {
        lat: Latitude,
        lng: Longitude,
      },
      animation: google.maps.Animation.DROP,
      icon: icons.landmarkIcon,
      map,
    });

    // Add a click event to each marker.
    ((param, placeName) => {
      function findPlaceFromQueryCallback(response, status) {
        $('#landmark-photo').remove(); // remove already displayed image
        if (status !== 'OK') {
          $('#search-results').append('<div id="landmark-photo"><span> No photo here!</span></div>');
          // if there is no photo
          return;
        }
        try {
          console.log(response, status);
          const { photos = 'No Photos', name = 'No name' } = response[0];
          const htmlPhotos = photos.map((photo) => {
            console.log(photo, name);
            const photoUrl = photo.getUrl();
            return `<div id="landmark-photo">
          <span>${name}</span>
          <img src="${photoUrl}" alt="${name}" height="${300}" width="${333}">
           </div>`;
          });
          console.log(htmlPhotos);
          $('#search-results').append(htmlPhotos);
        } catch (error) {
          $('#search-results').append('<div id="landmark-photo"><span>No photo here!</span></div>');
          // if there is no photo 
        }
      }
      const request = {
        query: `${placeName}`,
        fields: ['name', 'photos'],
      };
      google.maps.event.addListener(param, 'click', () => {
        const service = new google.maps.places.PlacesService(map);
        service.findPlaceFromQuery(request, findPlaceFromQueryCallback);
      });
    })(marker, placeName);
  });
}
// #endregion map

$(document).ready(() => {
  const geoCoordinatesPromise = getGeoCodingInfoOfSearchedPlace('Oman,     Ash     Sharqiyah South');
  geoCoordinatesPromise.then((params) => {
    const { Latitude, Longitude } = params;
    return getWeatherInfoOfSearchedPlace(Latitude, Longitude);
  })
    .then((res) => getLandmarksAroundSearchedPlace(res.geoCoordinates))
    .then((result) => initMap(result))
    .catch((Error) => console.log(`This is from catch: ${Error} `));
});
