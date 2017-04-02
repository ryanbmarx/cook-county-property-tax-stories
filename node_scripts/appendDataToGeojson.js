var fs = require('fs');
var _ = require ('underscore');


// var csv is the CSV file with headers, 
// from http://techslides.com/convert-csv-to-json-in-javascript
// returns an array of JS objects

function csvJSON(csv){

  var lines=csv.split("\n");
  var result = [];

  var headers=lines[0].split(",");
  headers[headers.length-1] = headers[headers.length-1].replace('\r', '');
  
  for(var i=1;i<lines.length;i++){

	  var obj = {};
	  var currentline=lines[i].split(",");

	  for(var j=0;j<headers.length;j++){
		  obj[headers[j]] = currentline[j];
	  }

	  result.push(obj);
  }
  
  return result; //JavaScript object
  // return JSON.stringify(result); //JSON
}
/*
example usage

`node node_scripts/appendDataToGeojson.js _storage/tract_erate.csv tract2010 data/tract-map.geojson tract2010`

To output the file, use the output redirect thingy ... ">" 

ex:
`node node_scripts/appendDataToGeojson.js _storage/tract_erate.csv tract2010 data/tract-map.geojson tract2010 > data.geojson`
*/

var fileToAppend = process.argv[2],
	fileToAppendJoinAttribute = process.argv[3],
	geojsonToReceiveData = process.argv[4],
	geojsonJoinAttribute = process.argv[5];

fs.readFile(fileToAppend, 'utf8', (err, data) => {
	if (err) throw err;

	// This is our csv we want to insert into the geojson
	const dataToAppend = csvJSON(data);
	var keys = Object.keys(dataToAppend['0']);

	fs.readFile(geojsonToReceiveData, 'utf8', (err, data) => {
		if (err) throw err;

		// this is the geojson
		const jsonData = JSON.parse(data);

		// For each feature in the geojson (state, county, etc.), do this ...
		jsonData.features.forEach((feature, feature_idx) => {
			// Filter the list of data to just the matching fips
			var filteredDataToAppend = _.filter(dataToAppend, function(feature_obj){
				return feature_obj[fileToAppendJoinAttribute] == feature.properties[geojsonJoinAttribute];
			})[0];

			// Loop through the keys and add the key/value pair
			// to the properties object inside each GEOJSON feature
			keys.forEach((val, idx)=>{
				feature.properties[val] = filteredDataToAppend[val];
			})
		})

		console.log(JSON.stringify(jsonData))
		// fs.writeFile(`updated-${geojsonToReceiveData}`, JSON.stringify(jsonData), (err) => {
			
		// 	if(err) {
		// 		return console.log(err);
		// 	} else {
		// 		return console.log('done writing file');
		// 	}
		// }); 
	});
})

