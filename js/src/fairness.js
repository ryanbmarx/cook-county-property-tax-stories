import * as d3 from 'd3';
import getTribColors from'./getTribColors.js';
var queue = require('d3-queue').queue;

// https://github.com/fivethirtyeight/d3-pre
import Prerender from 'd3-pre';
const  prerender = Prerender(d3);

// This allows iteration over an HTMLCollection (as I've done in setting the checkbutton event listeners,
// as outlined in this Stack Overflow question: http://stackoverflow.com/questions/22754315/foreach-loop-for-htmlcollection-elements
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

function mapScale(ratio){
	// This is a super-simple custom scale. If the value is greater than 1, return a color. If it
	// is less than 1, return a different color. If it is one, return white, or at least a very light grey;

	const 	aboveOneColor = getTribColors('trib-red2'),
			oneColor = getTribColors('trib-gray4'),
			belowOneColor = getTribColors('trib-blue4');

	if (ratio > 1){
		return aboveOneColor
	} else if (ratio < 1 ){
		return belowOneColor
	} else if (ratio == 1){
		return 'black';
	}
	return 'yellow';
}

class CookCountyMap{
	constructor(options){
		 const app = this;
		 app.options = options;
		 app.mapContainer = options.mapContainer;
		 app.data = options.data;

		// define the layers of map data I want
		// Source of map base layers: http://code.highcharts.com/mapdata/
		 app.mapLayers =[
		 	{
		 		id:'chicago',
		 		url: '/data/chicago.geojson'
		 	},
		 	{
		 		id:'cook',
		 		url: '/data/cook-county.geojson'
		 	}
		 ];

 		const mapDataQueue = queue();

		app.mapLayers.forEach(layer => {
			mapDataQueue.defer(d3.json,layer.url);
		});

		mapDataQueue.awaitAll(app.drawMap.bind(app));
	}

	drawMap(){
		// console.log(prerender);
		prerender.start();

		const 	app = this;
		const 	containerBox = app.mapContainer.node().getBoundingClientRect(),
				width = containerBox.width,
				height = containerBox.height;
		
		// Put the svg inside the passed container
		const svg = app.mapContainer.append('svg')
					.attr("width", width)
					.attr("height", height);

		// Create a unit projection.
		let projection = d3.geoMercator()
			.scale(1)
			.translate([0, 0]);

		const geoPath = d3.geoPath().projection(projection);

		// Compute the bounds of a feature of interest, then derive scale & translate.
		var bounds = geoPath.bounds(app.data),
			dx = bounds[1][0] - bounds[0][0],
			dy = bounds[1][1] - bounds[0][1],
			x = (bounds[0][0] + bounds[1][0]) / 2,
			y = (bounds[0][1] + bounds[1][1]) / 2,
			s = 1 / Math.max(dx / width, dy / height),
			t = [width / 2 - s * x, (height / 2 - s * y) - 0];
  			
		// Update the projection to use computed scale & translate.
		projection
			.scale(s)
			.translate(t);

		// Create a container for the tract data
		const tracts = svg.append('g')
			.classed('tracts', true);

		tracts.selectAll( "path" )
				.data( app.data.features )
			.enter()
				.append( "path" )
					.attr('data-name', d => d.properties.NAME10)
					.attr('class', d => {
						const ratio = d.properties.ratio1;
						if (ratio > 1){
							return 'tract tract--over';
						} else if (ratio < 1 ){
							return 'tract tract--under';
						} else if (ratio == 1){
							return 'tract tract--equal';
						}
						return 'tract tract--none';
					})
					.attr( "d", geoPath);
	}
}

module.exports = CookCountyMap;