/*

sample usage in an NPM script
"getData": "mkdir -p data && node scripts/downloadCSV.js 'https://docs.google.com/spreadsheets/d/1U40ZNM-KgqoJvR0T0CIVhcdzDQkvLRaWTnxWLIasIvE/pub?gid=889875857&single=true&output=csv' './data/lost-gdp.csv'"


*/

var fs = require('fs'),
  request = require('request');

var url = process.argv[2],
	outputPath = process.argv[3];

request
  .get(url)
  .on('error', function(err) {
    // handle error
  })
  .pipe(fs.createWriteStream(outputPath));

