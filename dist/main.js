const APPLICATION_ID = localStorage.getItem('_hereAppId');
const APPLICATION_CODE = localStorage.getItem('_hereAppCode');
const OPENWEATHERMAP_APPID = localStorage.getItem('_openWeatherMapAppId');

// this handles the navigation toggle functionality.
$('.nav_handle-container').click(() => {
  if ($('.toggled').is(':visible')) {
    $('.toggled').hide(200);
    return;
  }
  $('.toggled').show(200);
});

function insertSuggestionToTextbox(suggestion) {
  $('.suggestions').remove();
  $('#mainInput').val(suggestion);
  $('#mainInput').focus();
}

function createAndAppendAutoCompleteElements(suggestions) {
  $('.suggestions').remove(); // Remove displayed suggestions
  // early exit input validation
  if (!suggestions) {
    $('suggestions').remove();
    return;
  }
  let id = 0;
  const result = suggestions.map((suggestion) => {
    id += 1;
    return `<div class="suggestions" id=${id} countrycode=${suggestion.countryCode} tabindex="0"> ${suggestion.label} </div>`;
  });
  $('#autocomplete').append(result);
}

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
    throw new Error('Error fetching geocoding information: Invalid value passed as parameter!');
  }

  const GEOCODER_URL = 'https://geocoder.api.here.com/6.2/geocode.json';
  const urlEncodedSearchString = encodeURIComponent(searchString);
  const params = `?app_id=${APPLICATION_ID}&app_code=${APPLICATION_CODE}&searchtext=${urlEncodedSearchString}`;
  return fetch(GEOCODER_URL + params)
    .then((response) => response.json()) // convert response to json object
    .then((response) => fetchGeoCodingInfoSuccessCallback(response))
    .catch((error) => {
      throw new Error(`Error fetching geocoding information: ${error} `);
    });
}

function getWeatherInfoOfSearchedPlaceSuccessCallback(result) {
  if (result.cod !== 200) {
    throw new Error(`Error fetching weather information: ${result.type} `);
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

function getWeatherInfoOfSearchedPlace(latLon, currentMetricSystem) {
  if (!latLon || !currentMetricSystem) {
    return new Error('Error fetching weather information. Invalid parameters!');
  }
  const { Latitude, Longitude } = latLon;
  const unit = currentMetricSystem === 'celsius' ? 'metric' : 'imperial';
  const OPENWEATHERMAP_URL = 'http://api.openweathermap.org/data/2.5/weather';
  const params = `?lat=${Latitude}&lon=${Longitude}&appid=${OPENWEATHERMAP_APPID}&units=${unit}`;
  return fetch(OPENWEATHERMAP_URL + params)
    .then((response) => response.json()) // convert response to json object
    .then((result) => getWeatherInfoOfSearchedPlaceSuccessCallback(result))
    .catch((error) => new Error(`Error fetching weather information: ${error} `));
}

function getLandmarksAroundSearchedPlaceSuccessCallBack(result, geoCoord) {
  if ((!result || result.type === 'ApplicationError') || !geoCoord) {
    return new Error(`Error fetching landmarks: ${result.type}`);
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
    return new Error(`Error fetching landmarks: ${geoCoordinates}`);
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
    .catch((error) => new Error(`Error fetching landmarks: ${error}`));
}

// #endregion

// #region map

// Initialize and add the map
function initMap(results) {
  if (!results) {
    return; // exit if there is no data for the map
  }
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
          const { photos = 'No Photos', name = 'No name' } = response[0];
          const htmlPhotos = photos.map((photo) => {
            const photoUrl = photo.getUrl();
            return `<div id="landmark-photo">
          <span>${name}</span>
          <img src="${photoUrl}" alt="${name}" height="${300}" width="${333}">
           </div>`;
          });
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

// #region temperature converter
class TemperatureConverter {
  static getCurrentMetricSystem() {
    return localStorage.getItem('_currMetricSystem');
  }

  static setCurrentMetricSystem(system) {
    try {
      localStorage.setItem('_currMetricSystem', system);
    } catch (error) {
      // do nothing. Use default: celsius
    }
  }

  // function to convert temperature between metric systems (celsius and fahrenheit)
  static convertTo(metricSystem) {
    if (this.getCurrentMetricSystem() === metricSystem) {
      return; // Prevent from clicking same button more than once;
    }
    this.setCurrentMetricSystem(metricSystem);
    // set currentMetricSystem to local storage.
    if (metricSystem === 'celsius') {
      $('input[name=fahrenheit]').prop('checked', false);
      $('input[name="celsius"]').prop('checked', true);
    } else { // must be fahrenheit
      $('input[name="celsius"]').prop('checked', false);
      $('input[name="fahrenheit"]').prop('checked', true);
    }
    const searchString = $('#name-of-place').text(); // grab name of place and fetch info again
    const geoCoordinatesPromise = getGeoCodingInfoOfSearchedPlace(searchString);
    geoCoordinatesPromise.then((param) => {
      const { Latitude, Longitude } = param; // get the geoCoordinates
      const currentMetricSystem = this.getCurrentMetricSystem() || 'celsius';
      // retrieve previously set metric system from localStorage or set 'celsius' if non exists
      return getWeatherInfoOfSearchedPlace({ Latitude, Longitude }, currentMetricSystem);
    })
      .then((res) => {
        const { temperature = 'Nothing here' } = res;
        $('#temperature').html(`${temperature}&deg;`);
      })
      .catch((Error) => Error);
  }
}

$(document).on('click', '#celsius-button', () => {
  TemperatureConverter.convertTo('celsius');
});

$(document).on('click', '#fahrenheit-button', () => {
  TemperatureConverter.convertTo('fahrenheit');
});
// #endregion temperature converter

function fetchAll(searchString) {
  const geoCoordinatesPromise = getGeoCodingInfoOfSearchedPlace(searchString);
  geoCoordinatesPromise.then((param) => {
    const { Latitude, Longitude } = param;
    const currentMetricSystem = TemperatureConverter.getCurrentMetricSystem() || 'celsius';
    // retrieve previously set metric system from localStorage or set 'celsius' if non exists
    return getWeatherInfoOfSearchedPlace({ Latitude, Longitude }, currentMetricSystem);
  })
    .then((res) => {
      const currentMetricSystem = TemperatureConverter.getCurrentMetricSystem() || 'celsius';
      const {
        humidity = 'Nothing here',
        geoCoordinates = 'Nothing here',
        windSpeed = 'Nothing here',
        currentWeather = 'Nothing here',
        temperature = 'Nothing here',
      } = res;
      $('#name-of-place').text(searchString);
      $('#humidity').text(humidity);
      $('#weather').text(currentWeather);
      $('#windspeed').text(windSpeed);
      $(`input[name=${currentMetricSystem}`).attr('checked', 'checked');
      $('#temperature').html(`${temperature}&deg;`);
      return getLandmarksAroundSearchedPlace(geoCoordinates);
    })
    .then((result) => initMap(result))
    .catch((Error) => console.log(`This is from catch: ${Error} `));
}

$('#submit-button').click((event) => {
  event.preventDefault();
  const searchString = $('#mainInput').val(); // grab the user's place of interest
  $('#mainInput').val(''); // clear the text box
  $('.suggestions').remove(); // remove suggestions
  if (!searchString) {
    $('#mainInput').focus(); // remain focused on the textbox
    $('#autocomplete').append('<div class="input-error"> Please type in a name of a place! </div>');
    // display error
    setTimeout(() => {
      $('.input-error').remove();
    }, 3000); // clear error after 3 seconds
    return; // Do nothing if searchString is empty
  }
  fetchAll(searchString);
});

$(document).ready(() => {
  if (!TemperatureConverter.getCurrentMetricSystem()) {
    TemperatureConverter.setCurrentMetricSystem('celsius');
    // Set default metric system for temperature
  }
});
