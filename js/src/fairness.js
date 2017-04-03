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

function valueMapScale(ratio){
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

function valueMapAbove1(ratio){
	return ratio > 1 ? getTribColors('trib-red2') : '#EFEFEF';
}

function valueMapBelow1(ratio){
	return ratio < 1 ? getTribColors('trib-blue4') : '#EFEFEF';
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
		 		url: `http://${window.ROOT_URL}/data/chicago-boundary.geojson`
		 	}
		 ];

 		const mapDataQueue = queue();
		app.mapLayers.forEach(layer => {
			mapDataQueue.defer(d3.json,layer.url);
		});

		mapDataQueue.awaitAll(app.drawMap.bind(app));

		// Generate a scale for the effective tax rate.
		const erateExtent = d3.extent(app.data.features, d => d.properties.mean);
		const erateColorRamp=['#fef0d9', '#fdcc8a', '#fc8d59', '#e34a33', '#b30000'];
		app.erateScale = d3.scaleQuantize()
			.domain(erateExtent)
			.range(erateColorRamp);

	}

	drawMap(error){

		prerender.start();

		const 	app = this;
		const 	containerBox = app.mapContainer.node().getBoundingClientRect(),
				width = containerBox.width,
				height = containerBox.height;

		// Insert our extra map layers/add-ons into the array 
		for (var i=0; i < arguments[1].length; i++ ){
			app.mapLayers[i].data = arguments[1][i];
		}
				
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
			.classed('tracts', true)
			.selectAll('.tracts')
			.data( app.data.features, d => d.properties.ratio1);

		tracts.enter()
			.append( "path" )
				.attr('data-name', d => d.properties.NAME10)
				.attr('data-erate', d => d.mean)
				.attr('class', 'tract')
				.attr( "d", geoPath)
				.attr('fill', '#efefef');
		
		console.log(app.mapLayers);

		svg.append('g')
			.classed('chicago', true)
			.selectAll('path')
			.data(app.mapLayers[0].data.features)
			.enter()
				.append( "path" )
				.attr( "d", geoPath)
				.style('fill', 'transparent')
				.style('stroke', getTribColors('trib-gray4'))
				.style('stroke-width', 1);

	}

	highlightTracts(attribute, value){
		const app = this;
		// This method highlights specific tracts based on input. It's not super extensible. It's
		// mostly a bespoke piece of code JUST for this project.

		const tracts = d3.selectAll('.tract')
			.data(app.data.features, d => d['properties'][attribute])

		if (attribute == 'ratio1') {			
			// Depending on the value passed in, highlight the necessary tracts
			if (value == 'under1') {
				tracts
					.transition()
					.duration(app.options.transitionDuration)
					.attr('fill', d => valueMapBelow1(d.properties.ratio1));
			} else if (value == 'over1') {
				tracts
					.transition()
					.duration(app.options.transitionDuration)
					.attr('fill', d => valueMapAbove1(d.properties.ratio1));
			} else if (value == 'all') {
				tracts
					.transition()
					.duration(app.options.transitionDuration)
					.attr('fill', d => valueMapScale(d.properties.ratio1));
			} else {
				tracts
					.transition()
					.duration(app.options.transitionDuration)
					.attr('fill', '#EFEFEF');
			}
		} else if (attribute == 'erate'){
			tracts
				.transition()
				.duration(app.options.transitionDuration)
				.attr('fill', d => app.erateScale(d.properties.mean));
		}
	}
}

module.exports = CookCountyMap;