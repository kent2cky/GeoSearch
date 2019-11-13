const APPLICATION_ID = localStorage.getItem("_appId");
const APPLICATION_CODE = localStorage.getItem("_appCode");

$(document).ready(() => {
  console.log("We are live!");
});

// this handles the navigation toggle functionality.
$(".nav_handle-container").click(() => {
  if ($(".toggled").is(":visible")) {
    $(".toggled").hide(200);
    return;
  }
  $(".toggled").show(200);
});

//#region auto suggestion
let AUTOCOMPLETION_URL =
  "https://autocomplete.geocoder.api.here.com/6.2/suggest.json";
// click and keyboard events for autosuggestion.

$(document).on("click", "#1", () => {
  const suggestion = $("#1").text();
  insertSuggestionToTextbox(suggestion);
});

$(document).on("click", "#2", () => {
  const suggestion = $("#2").text();
  insertSuggestionToTextbox(suggestion);
});

$(document).on("click", "#3", () => {
  const suggestion = $("#3").text();
  insertSuggestionToTextbox(suggestion);
});

$(document).on("click", "#4", () => {
  const suggestion = $("#4").text();
  insertSuggestionToTextbox(suggestion);
});

$(document).on("click", "#5", () => {
  const suggestion = $("#5").text();
  insertSuggestionToTextbox(suggestion);
});

$(document).on("keyup", "#1", e => {
  if (e.which == 13 || e.which == 32) {
    const suggestion = $("#1").text();
    insertSuggestionToTextbox(suggestion);
  }
});

$(document).on("keyup", "#2", e => {
  if (e.which == 13 || e.which == 32) {
    const suggestion = $("#2").text();
    insertSuggestionToTextbox(suggestion);
  }
});

$(document).on("keyup", "#3", e => {
  if (e.which == 13 || e.which == 32) {
    const suggestion = $("#3").text();
    insertSuggestionToTextbox(suggestion);
  }
});

$(document).on("keyup", "#4", e => {
  if (e.which == 13 || e.which == 32) {
    const suggestion = $("#4").text();
    insertSuggestionToTextbox(suggestion);
  }
});

$(document).on("keyup", "#5", e => {
  if (e.which == 13 || e.which == 32) {
    const suggestion = $("#5").text();
    insertSuggestionToTextbox(suggestion);
  }
});

function insertSuggestionToTextbox(suggestion) {
  $(".suggestions").remove();
  $("input").val(suggestion);
  $("input").focus();
}

function createAndAppendAutoCompleteElements(suggestions) {
  // early exit
  if (!suggestions) {
    $(".suggestions").remove();
    console.log("suggestions is: " + suggestions);
    return;
  }

  $(".suggestions").remove();
  console.log(suggestions);
  let id = 0;
  let suggestion = suggestions.map(suggestions => {
    id++;
    return `<div class="suggestions" id=${id} tabindex="0"> ${suggestions.label} </div>`;
  });
  $("form").append(suggestion);
}

$(".autocomplete").keyup(e => {
  // Exit on esc keypress event
  if (e.which == 27) {
    $(".suggestions").remove();
    return;
  }

  let searchValue = $(".autocomplete").val(); //grab the value in the textbox here

  let params =
    "?" +
    "query=" +
    encodeURIComponent(searchValue) + // The search text which is the basis of the query
    "&beginHighlight=" +
    encodeURIComponent("<mark>") + //  Mark the beginning of the match in a token.
    "&endHighlight=" +
    encodeURIComponent("</mark>") + //  Mark the end of the match in a token.
    "&maxresults=5" + // The upper limit the for number of suggestions to be included
    // in the response.  Default is set to 5.
    "&app_id=" +
    APPLICATION_ID +
    "&app_code=" +
    APPLICATION_CODE;

  fetch(AUTOCOMPLETION_URL + params)
    .then(response => response.json()) // convert response to json object
    .then(result => {
      const { suggestions } = result;
      createAndAppendAutoCompleteElements(suggestions);
    })
    .catch(error => {
      console.log("error fetching autocompletion data.");
    });
});

//#endregion

//#region map

// Initialize and add the map
function initMap() {
  // The location of Uluru
  var uluru = {
    lat: 9.08,
    lng: 6.02
  };

  var onitsha = {
    lat: 6.15,
    lng: 6.79
  };
  var abuja = {
    lat: 9.06,
    lng: 7.49
  };

  var icons = {
    center: {
      icon: "minImages/flag-red.png"
    },
    landmarks: {
      icon: "minImages/flag-blue.png"
    }
  };
  // The map, centered at Uluru
  var map = new google.maps.Map(document.getElementById("map"), {
    zoom: 5,
    center: uluru
  });
  // The marker, positioned at Uluru
  var centerMarker = new google.maps.Marker({
    position: uluru,
    animation: google.maps.Animation.BOUNCE,
    icon: icons.center.icon,
    map: map
  });

  var landmark = new google.maps.Marker({
    position: onitsha,
    animation: google.maps.Animation.DROP,
    icon: icons.landmarks.icon,
    map: map
  });

  var anotherLandmark = new google.maps.Marker({
    position: abuja,
    animation: google.maps.Animation.DROP,
    icon: icons.landmarks.icon,
    map: map
  });

  google.maps.event.addListener(landmark, "click", function() {
    console.log("Landmark marker clicked!");
  });
  google.maps.event.addListener(anotherLandmark, "click", function() {
    console.log("anotherLandmark marker clicked!");
  });

  google.maps.event.addListener(centerMarker, "click", function() {
    console.log("center marker clicked!");
  });
}

//#endregion
