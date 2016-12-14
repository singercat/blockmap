var map;
var markers = [];
var filter = [];

// Scenic area of Wuhan, China
var locations = [
	{
		title: 'Yellow Crane Tower',
		location: {lat:30.6457183831, lng:114.2945169452}
	},{
		title: 'Guiyuan Buddhist Temple', 
		location: {lat:30.5461040394, lng:114.2608692335}
	},{
		title: 'Magnolia cultural tourism',
		location: {lat:31.1090405966, lng:114.3815294565}
	},{
		title: 'East Lake',
		location: {lat:30.5693497306, lng:114.3732079474}
	},{
		title: 'Museum',
		location: {lat:30.6114887109, lng:114.2567289348}
	},{
		title: 'Magnolia grassland',
		location: {lat:30.9545301389, lng:114.4610336305}
	},{
		title: 'Botanical Garden', 
		location: {lat:30.5451678608, lng:114.4226975236}
	},{
		title: 'Forest Park',
		location: {lat:30.5253123795, lng:114.4346169680}
	},{
		title: 'Shadowless tower',
		location: {lat:30.5335041030, lng:114.3349162184}
	},{
		title: 'Kistler Museum',
		location: {lat:30.5870013959, lng:114.3433959935}
	}
];

// Initialization
initMap = function() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 30.5796849003, lng: 114.3561655547},
          zoom: 14
    });

    var informationWindow = new google.maps.InfoWindow();

    for (var i = 0; i < locations.length; i++) {
        var position = locations[i].location;
        var title = locations[i].title;
    	// create markers for each location.
        var marker = new google.maps.Marker ({
            position: position,
            map: map,
            title: title,
            animation: google.maps.Animation.DROP
        });
        markers.push(marker);
        //this onclick event opens the info window.
        marker.addListener('click', function() {
            bounce(this);
            showInfoWindow(this,informationWindow);
        });
        
    } 

    // Asynchronous loading API
    // Because the site is HTTPS, the data type is set to jsonp
    markers.forEach( function(item) {
        // https://api.map.baidu.com/telematics/v3/weather?location=116.305145,39.982368&output=json&ak=5knAwtLP2VvgPv7hZMs9aQtn
        // console.log("lng" + item.position.lng() + ",lat" + item.position.lat());
        var myurl= "https://api.map.baidu.com/telematics/v3/weather?location=" + item.position.lng() + "," + item.position.lat() + "&output=json&ak=5knAwtLP2VvgPv7hZMs9aQtn";
        $.ajax({
            url: myurl,
            dataType: 'jsonp',
        })
        .done(function(data) {
            if (data['results']) {
                var results = data['results'];
                var current_weather = results[0]['weather_data'][0];
                var imgURL = current_weather['dayPictureUrl'];
                var weather = current_weather['weather'];
                var temp = current_weather['temperature'];
                item.extra = "<ul style='list-style:none;'>";
                item.extra += "<img src='" + imgURL + "'' alt='weatherImg' />";
                item.extra += "<li>Temperature: "+ temp;
                item.extra += "<li>Weather: "+ weather;
                item.extra += "</ul>";
            } else {
                item.extra = "";
            }
        })
        .fail(function() {
            alert('failed to load OpenWeatherMap check your connection');
        })
        .always(function() {
            console.log("complete");
        });
    });
   
   	// Bounce animation
    function bounce(marker) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        window.setTimeout(function(){
            marker.setAnimation(null);
        },1400);
    }

    //We can see all the markers in the map
    function createBounds() {
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < markers.length; i++) {
            bounds.extend(markers[i].position);
        }
        map.fitBounds(bounds);
    }
    createBounds();

    // Mark bomb
    function showInfoWindow(marker,infowindow) {
        if(infowindow.marker != marker) {
            infowindow.marker = marker;
        	infowindow.setContent ('<h3>' + marker.title + '</h3>' + marker.extra);
        	infowindow.open(map,marker);
        }
    }
};

mapError = function() {
    alert('failed to load google check your connection');
}

var ViewModel = function() {
   var self = this;
   this.locationName = ko.observableArray(locations);
   this.searchText = ko.observable("");
   this.markerItem = ko.observableArray(markers);

   this.search = function(value) {
        self.locationName([]);
        for(var x in locations) {
        if(locations[x].title.toLowerCase().indexOf(value.toLowerCase()) >= 0){
            self.locationName.push(locations[x]);
            markers[x].setVisible(true);
        }
        else markers[x].setVisible(false);
        }
   };
   this.searchText.subscribe(self.search);
    
   self.select = function() {                
        for(i = 0; i < locations.length; i++) {
            filter.push(locations[i].title);
        }
        current = filter.indexOf(this.title);
        google.maps.event.trigger(markers[current], 'click');     
   };
};

ko.applyBindings(new ViewModel());