var fs = require('fs');
const googleMapsClient = require('@google/maps').createClient({
  key: 'GOOGLEMAPAPIKEY',
  Promise: Promise
});
var file = __dirname + '/data/steam_countries.json';
var totalObj = {};
fs.readFile( file, function (err, data) {
  if (err) {
    throw err; 
  }
  totalObj = JSON.parse(data);
  loop(totalObj, "");
  
});
async function loop(obj, erlyName) {
	for (var key in obj) {
		if (obj.hasOwnProperty(key)) {
			var value = obj[key];
			var name = erlyName + value.name;
			if(!value.coordinates){
				saveSafe();
				try {
					value.coordinates = await getCords(name);
				} catch (error) {
					console.log(error);
				}
			}
			var child = null;
			if(value.states)
				child = value.states;
			if(value.cities)
				child = value.cities;

			if(child != null){
				await loop(child, name + " ");
			}
		}
	}
	if(erlyName == "")
		saveSafe(true);
}

var loops = 0
function saveSafe(force = false) {
	if(loops > 10 || force){
		//save obj to file
		fs.writeFileSync(file, JSON.stringify(totalObj, null, 4));
		loops = 0;
	}
	++loops;
}
function getCords(address) {
   	return new Promise(function (resolve) {
	   console.log(address);
		googleMapsClient.geocode({address: address})
		.asPromise()
		.then((response) => {
			if(response.json.results[0].geometry.location){
				resolve(response.json.results[0].geometry.location);
			}
			else{
				resolve(null);
			}
		})
		.catch((err) => {
			resolve({err:err});
		});
   	})

}

//https://nominatim.openstreetmap.org/search?format=json&q=United%20States%20Alaska%20Anchorage

