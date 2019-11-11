let AUTOCOMPLETION_URL = 'https://autocomplete.geocoder.api.here.com/6.2/suggest.json';

$(document).ready(console.log("We are live!"));
<<<<<<< HEAD
<<<<<<< HEAD
=======

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
            icon: 'minImages/flag-red.png'
        },
        landmarks: {
            icon: 'minImages/flag-blue.png'
        }
    };
    // The map, centered at Uluru
    var map = new google.maps.Map(
        document.getElementById('map'), {
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

    google.maps.event.addListener(landmark, 'click', function () {
        console.log("Landmark marker clicked!");
    });
    google.maps.event.addListener(anotherLandmark, 'click', function () {
        console.log("anotherLandmark marker clicked!");
    });

    google.maps.event.addListener(centerMarker, 'click', function () {
        console.log("center marker clicked!");
    });
}
=======
>>>>>>> 86dd088... still working on it. This is not a major commit

// var countries = {
//     "source": ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Anguilla", "Antigua &amp; Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia &amp; Herzegovina", "Botswana", "Brazil", "British Virgin Islands", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central Arfrican Republic", "Chad", "Chile", "China", "Colombia", "Congo", "Cook Islands", "Costa Rica", "Cote D Ivoire", "Croatia", "Cuba", "Curacao", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Islands", "Faroe Islands", "Fiji", "Finland", "France", "French Polynesia", "French West Indies", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauro", "Nepal", "Netherlands", "Netherlands Antilles", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russia", "Rwanda", "Saint Pierre &amp; Miquelon", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "St Kitts &amp; Nevis", "St Lucia", "St Vincent", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor L'Este", "Togo", "Tonga", "Trinidad &amp; Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks &amp; Caicos", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Virgin Islands (US)", "Yemen", "Zambia", "Zimbabwe"]
// }

$(".autocomplete").keyup(() => {

    let searchValue = $(".autocomplete").val(); //grab the value in the textbox here
    let params = '?' +
        'query=' + encodeURIComponent(searchValue) + // The search text which is the basis of the query
        '&beginHighlight=' + encodeURIComponent('<mark>') + //  Mark the beginning of the match in a token. 
        '&endHighlight=' + encodeURIComponent('</mark>') + //  Mark the end of the match in a token. 
        '&maxresults=5' + // The upper limit the for number of suggestions to be included 
        // in the response.  Default is set to 5.
        '&app_id=' + APPLICATION_ID +
        '&app_code=' + APPLICATION_CODE;


    fetch(AUTOCOMPLETION_URL + params).then((result) => {
        console.log(result);
    });
});


<<<<<<< HEAD
>>>>>>> 597dfe7... style(map marker):customize map marker
=======
>>>>>>> 86dd088... still working on it. This is not a major commit
// const images = [{
//         src: "minImages/237-536x354.jpg",
//         alt: "a cute dog"
//     }, {
//         src: "minImages/866-536x354.jpg",
//         alt: "mountainous landscape"
//     },
//     {
//         src: "minImages/870-536x354-blur_2-grayscale.jpg",
//         alt: "a gray colour lighthouse"
//     }
// ]

// $(".welcome-image").ready(() => {
//     console.log("image is ready....");
//     setInterval(() => {
//         console.log(images[1].src);
//         console.log('image is sliding.....')
//         $("welcome-image > img").attr('src', images[1].src);
//     }, 4000);

// });

$(".nav_handle-container").click(() => {
    if ($(".toggled").is(":visible")) {
        $(".toggled").hide(200);
        return;
    }
    $(".toggled").show(200);
});

//Click event to scroll to top
$('#search').click(function () {
    $('html, body').animate({
        scrollBottom: 0
    }, 800);
    return false;
});