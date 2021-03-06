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

function displayNotification(message) {
  if (!message || message === '') {
    return; // take no action
  }
  $('#modal').html(`<div id="notifier"><span>${message}</span><button id="close-notifier" class="button">Ok</button></div>`);
  $('#modal').show();

  setTimeout(() => {
    $('#modal').hide();
  }, 3000);
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
      description: currentWeather = 'Main weather not found.',
      icon,
      // get weather details and icon from obj in the weather array and rename it 'currentWeather'
    } = obj;
    weatherInfo.currentWeather = currentWeather; // insert currentWeather into weatherInfo obj
    weatherInfo.icon = icon;
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
    deg: windDirection = 'Wind direction not found.',
  } = wind; // select only speed (renamed windSpeed)from the wind obj
  weatherInfo.windSpeed = windSpeed;
  weatherInfo.windDirection = windDirection; // insert windDirection into weatherInfo obj
  return weatherInfo;
}

function getWeatherInfoOfSearchedPlace(latLon, currentMetricSystem) {
  if (!latLon || !currentMetricSystem) {
    return new Error('Error fetching weather information. Invalid parameters!');
  }
  const { Latitude, Longitude } = latLon;
  const unit = currentMetricSystem === 'celsius' ? 'metric' : 'imperial';
  const OPENWEATHERMAP_URL = 'https://api.openweathermap.org/data/2.5/weather';
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
  const params = `?app_id=${APPLICATION_ID}&app_code=${APPLICATION_CODE}&mode=retrieveLandmarks&prox=${lat},${lon},3000`;
  return fetch(GEOCODER_LANDMARKS_URL + params)
    .then((response) => response.json()) // convert response to json object
    .then((result) => getLandmarksAroundSearchedPlaceSuccessCallBack(result, geoCoordinates))
    .catch(() => {
      displayNotification('No landmarks found for this location!');
      return {
        Landmarks: [], // return empty landmarks array
        mainGeoCoord: geoCoordinates,
      };
    });
}

// #endregion

// #region map

// Initialize and add the map
function initMap(results) {
  if (!results) {
    return; // exit if there is no data for the map
  }
  const { Landmarks, mainGeoCoord } = results;
  const nameOfPlace = $('#name-of-place').text();
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
    title: nameOfPlace,
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
      title: placeName,
    });

    // Add a click event to each marker.
    ((param, placeName) => {
      function findPlaceFromQueryCallback(response, status) {
        $('#modal').hide(); // remove already displayed image
        if (status !== 'OK') {
          // if there is no photo
          displayNotification('No photo here!');
        }
        try {
          const { photos = 'No Photos', name = 'No name' } = response[0];
          const htmlPhotos = photos.map((photo) => {
            const photoUrl = photo.getUrl();
            return `
            <div id="landmark">
          <div>${name}</div>
          <img src="${photoUrl}" alt="${name}">
          <button class="button btn-close">Close</button>
          </div>
          `;
          });
          $('#modal').html(htmlPhotos);
          $('#modal').show();
        } catch (error) {
          // if there is no photo
          displayNotification('No photo here!');
        }
      }
      const request = {
        query: `${placeName}`,
        fields: ['name', 'photos'],
      };
      google.maps.event.addListener(param, 'click', () => {
        $('#modal').html('<div id="preloader"><img src="minImages/Spinner-1s-200px.gif"></div>');
        $('#modal').show();
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
    const searchString = $('#name-of-place').text(); // grab name of place and fetch info again
    const geoCoordinatesPromise = getGeoCodingInfoOfSearchedPlace(searchString);
    geoCoordinatesPromise.then((param) => {
      const { Latitude, Longitude } = param; // get the geoCoordinates
      return getWeatherInfoOfSearchedPlace({ Latitude, Longitude }, metricSystem);
    })
      .then((res) => {
        this.setCurrentMetricSystem(metricSystem); // set new metricSystem to local storage.
        let metricSystemSuffix; // Use to suffix the temperature according to metric system
        if (metricSystem === 'celsius') {
          metricSystemSuffix = 'C';
          $('#celsius-button').prop('checked', true);
          $('#fahrenheit-button').prop('checked', false);
        } else { // must be fahrenheit
          metricSystemSuffix = 'F';
          $('#fahrenheit-button').prop('checked', true);
          $('#celsius-button').prop('checked', false);
        }
        const { temperature = 'Nothing here' } = res;
        $('#temperature').html(`${temperature}&deg;${metricSystemSuffix}`);
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

// A utility function to parse wind direction from integer to words
function parseWindDirection(windDirection) {
  if (windDirection < 0 || windDirection > 360) {
    return 'Invalid direction';
  }
  let direction = 'north';
  if ((windDirection >= 90) && (windDirection < 180)) {
    direction = 'east';
  } else if ((windDirection >= 180) && (windDirection < 270)) {
    direction = 'south';
  } else if ((windDirection >= 270) && (windDirection < 360)) {
    direction = 'west';
  }
  return direction;
}

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
      const metricSystem = currentMetricSystem === 'celsius' ? 'C' : 'F'; // used to suffix the temperature
      const {
        humidity = 'Nothing here',
        geoCoordinates = 'Nothing here',
        windSpeed = 'Nothing here',
        icon = ' ',
        windDirection = 'Nothing here',
        currentWeather = 'Nothing here',
        temperature = 'Nothing here',
      } = res;
      const parsedWindDirection = parseWindDirection(windDirection);
      const weatherIconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

      $('#name-of-place').text(searchString);
      $('#humidity').text(`${humidity}%`);
      $('#weather').text(currentWeather);
      $('#weather-icon').html(
        `
          <img src="${weatherIconUrl}" alt="${currentWeather}">

        `,
      );
      $('#windspeed').text(`${windSpeed}knots`);
      $('#windDirection').text(parsedWindDirection);
      $(`#${currentMetricSystem}-button`).attr('checked', 'checked');
      $('#temperature').html(`${temperature}&deg;${metricSystem}`);
      $('#search-results').show(); // Display results
      $('#search-section').hide(); // Hide search section
      $('.welcome').hide();
      return getLandmarksAroundSearchedPlace(geoCoordinates);
    })
    .then((result) => {
      initMap(result);
      $('#modal').hide();
    })
    .catch(() => {
      $('#modal').hide();
      displayNotification(`
      Could not get information about the place you searched for.
      Please add more details like the city and country and try again.
      `);
      $('#mainInput').focus(); // still the search textbox
      $('.suggestions').remove(); // remove suggestions
      $('#search-section').show(); // Hide search section
      $('#search-results').hide(); // Display results
    });
}

$('#submit-button').click((event) => {
  event.preventDefault();
  const searchString = $('#mainInput').val(); // grab the user's place of interest
  $('#mainInput').val(''); // clear the text box
  $('.suggestions').remove(); // remove suggestions
  if (!searchString) {
    $('#mainInput').focus(); // remain focused on the textbox
    if ($('.input-error').is(':visible')) {
      return;
    }
    $('#autocomplete').append('<div class="input-error"> Please type in a name of a place! </div>');
    // display error
    setTimeout(() => {
      $('.input-error').remove();
    }, 3000); // clear error after 3 seconds
    return; // Do nothing if searchString is empty
  }

  $('#modal').html('<div id="preloader"><img src="minImages/Spinner-1s-200px.gif"></div>');
  $('#modal').show();
  fetchAll(searchString);
  $('.suggestions').remove(); // remove suggestions
});

// #region facebook share funcitonality
const fbAppID = localStorage.getItem('_fbAppId');
window.fbAsyncInit = () => {
  // init the FB JS SDK
  FB.init({
    appId: fbAppID,
    status: true,
    xfbml: true,
  });
};

function FBShareOp(weatherInfo) {
  const {
    city = 'null',
    humidity = 'null',
    windSpeed = 'null',
    windDirection = 'null',
    temp = 'null',
    weather = 'null',
  } = weatherInfo;

  FB.ui({
    method: 'share',
    app_id: fbAppID,
    redirect_uri: 'https://kent2cky.github.io/GeoSearch/',
    display: 'popup',
    href: 'https://kent2cky.github.io/GeoSearch/',
    quote:
      `
                Local weather conditions at ${city}: 
                Humidity - ${humidity}, 
                Wind Speed - ${windSpeed},
                Wind Direction - ${windDirection} 
                Temperature - ${temp}, 
                Current Weather - ${weather}   
                `,
  }, (response) => {
    if (response) {
      displayNotification('Successfully shared to facebook!');
    } else {
      displayNotification('Facebook share cancelled!');
    }
  });
}

$(document).on('click', '#fb-share', () => {
  const weatherInfo = {};
  weatherInfo.city = $('#name-of-place').text();
  weatherInfo.humidity = $('#humidity').text();
  weatherInfo.weather = $('#weather').text();
  weatherInfo.windSpeed = $('#windspeed').text();
  weatherInfo.windDirection = $('#windDirection').text();
  weatherInfo.temp = `${$('#temperature').text()}`;
  FBShareOp(weatherInfo);
});
// #endregion facebook

$(document).ready(() => {
  if (!TemperatureConverter.getCurrentMetricSystem()) {
    TemperatureConverter.setCurrentMetricSystem('celsius');
    // Set default metric system for temperature
  }
  localStorage.setItem('_fbAppId', '2698742886856960');
  localStorage.setItem('_googleApiKey', 'AIzaSyAlJLXsOXejTeu7G6fEvh5d_HK4B8tDAsc');
  localStorage.setItem('_hereAppCode', 'RReyGHAdvyqxdS3NS_RpSg');
  localStorage.setItem('_hereAppId', 'GH3eunoNaCk0CltN1nYB');
  localStorage.setItem('_openWeatherMapAppId', 'a30ca121ed1c4c7c5f67f742615dc20e');
});

$(document)
  .on('click', '.btn-back', () => {
    $('.suggestions').remove(); // remove suggestions
    $('#search-section').show(); // Hide search section
    $('#search-results').hide(); // Display results
    $('#mainInput').focus(); // focus on the search textbox
    $('#map').html(' ');
  })
  .on('click', '.btn-close', () => {
    $('#modal').hide(); // hide landmark image
  })
  .on('click', '#search', () => {
    $('.suggestions').remove(); // remove suggestions
    $('#search-section').show(); // Hide search section
    $('#search-results').hide(); // Display results
    $('#mainInput').focus(); // focus on the search textbox
    $('#map').html(' ');
  })
  .on('click', '#close-notifier', () => {
    $('#modal').hide(); // hide notifier
  });
