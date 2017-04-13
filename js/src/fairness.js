import * as d3 from 'd3';
import getTribColors from'./getTribColors.js';
var queue = require('d3-queue').queue;
import * as topojson from 'topojson';

// https://github.com/fivethirtyeight/d3-pre
// import Prerender from 'd3-pre';
// const  prerender = Prerender(d3);

const 	aboveOneColor = getTribColors('trib-red2'),
		otherColor = 'rgba(255,255,255,.3)',
		belowOneColor = getTribColors('trib-orange');

// This allows iteration over an HTMLCollection (as I've done in setting the checkbutton event listeners,
// as outlined in this Stack Overflow question: http://stackoverflow.com/questions/22754315/foreach-loop-for-htmlcollection-elements
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

function buildErateLegend(ramp, containerID){
	// Accepts an array of containers (as selection strings). It builds inside the first container
	// then dupes the legend into the others.

	// Select the first container, and append the wrapper div and list
	const container = d3.select(containerID)
		.append('div')
		.classed('effective-tax-rate-legend', true)
			.append('ul')
			.classed('effective-tax-rate-legend__list', true)

	// For each color in the provided ramp, append a list item that is exactly as wide as 100% / buckets
	ramp.forEach((color, index) => {
		const bucket = container.append('li')
			.classed('effective-tax-rate-legend__bucket', true)
			.attr('style',`background-color:${color};width:${100 / ramp.length}%`)
			
			// If it is the first or last, append the proper text.
			if (index == 0){
				bucket.append('span')
					.classed('effective-tax-rate-legend__text', true)
					.html("&laquo; Lower tax rate");
			} else if (index == (ramp.length - 1)){
				bucket.append('span')
					.classed('effective-tax-rate-legend__text', true)
					.html("Higher tax rate &raquo;");
			}
	})
}

function valueMapScale(ratio){
	// This is a super-simple custom scale. If the value is greater than 1, return a color. If it
	// is less than 1, return a different color. If it is one, return white, or at least a very light grey;

	if (ratio > 1){
		return aboveOneColor
	} else if (ratio < 1 ){
		return belowOneColor
	}
	return otherColor;
}

function valueMapAbove1(ratio){
	return ratio > 1 ? aboveOneColor : 'rgba(255,255,255,.9)';
}

function valueMapBelow1(ratio){
	return ratio < 1 ? belowOneColor : 'rgba(255,255,255,.9)';
}

class CookCountyMap{
	constructor(options){

		 const app = this;
		 app.options = options;
		 app.mapContainer = options.mapContainer;
		 app.data = options.data;
		 console.log(app.data);
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
		// const erateExtent = d3.extent(app.data.features, d => d.properties.erate);
		// const erateColorRamp=['#fef0d9', '#fdcc8a', '#fc8d59', '#e34a33', '#b30000'];
		// app.erateScale = d3.scaleQuantile()
		// 	.domain(app.data.features.map(d => d.properties.erate))
		// 	.range(erateColorRamp);
		// buildErateLegend(erateColorRamp, '#day1-header-display');
	}

	drawMap(error){


		const 	app = this;
		const 	containerBox = app.mapContainer.node().getBoundingClientRect(),
				width = containerBox.width,
				height = containerBox.height;

		// Nudge the map down to the center if we are one "desktop mode", which is 
		// when the window is wider than the map-wrapper's maximum width, which, 
		// at the time of this writing, is 600px;
		// const 	mapWrapper = app.mapContainer.node().parentElement,
		// 		mapMaxWidth = 600;
		
		// if (window.innerWidth >= mapMaxWidth){
		// 	// console.log('desktop');
		// 	mapWrapper.style.top = '50%';
		// 	mapWrapper.style.marginTop = `${height / -2}px`;
		// } else {
		// 	// console.log('mobile');
		// }
		// d3.select(mapWrapper).attr('style', `top: ${top}px;`);
		// console.log(height / -2, marginTop, mapWrapper);	
		
		

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
		// topojson.mesh takes the topo and converts it to geojson, which is used to make the projection.
		var bounds = geoPath.bounds(topojson.mesh(app.data, app.data.objects.day1header)),
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
			// topojson.feature, per the docs, returns the GeoJSON Feature or FeatureCollection 
			// for the specified object in the given topology. In this case, it's a collection,
			// which is why we call the features attribute after it.
			.data( topojson.feature(app.data, app.data.objects.day1header).features);

		tracts.enter()
			.append( "path" )
				.attr('data-name', d => d.properties.TRACT)
				.attr('class', 'tract')
				.attr( "d", geoPath)
				.style('fill', d => valueMapScale(d.properties.ratio));
		
		svg.append('g')
			.classed('chicago', true)
			.selectAll('path')
			.data(app.mapLayers[0].data.features)
			.enter()
				.append( "path" )
				.attr( "d", geoPath)
				.style('fill', 'transparent')
				.style('stroke', 'black')
				.style('stroke-width', 3);

	}

	highlightTracts(attribute, value){
		const app = this;
		// This method highlights specific tracts based on input. It's not super extensible. It's
		// mostly a bespoke piece of code JUST for this project.

		const tracts = d3.selectAll('.tract')
			.data(app.data.features)

		if (attribute == 'ratio') {			
			// Depending on the value passed in, highlight the necessary tracts
			if (value == 'under1') {
				tracts
					.transition()
					.duration(app.options.transitionDuration)
					.style('fill', d => valueMapBelow1(d.properties.ratio));
			} else if (value == 'over1') {
				tracts
					.transition()
					.duration(app.options.transitionDuration)
					.style('fill', d => valueMapAbove1(d.properties.ratio));
			} else if (value == 'all') {
				tracts
					.transition()
					.duration(app.options.transitionDuration)
					.style('fill', d => valueMapScale(d.properties.ratio));
			} else {
				tracts
					.transition()
					.duration(app.options.transitionDuration)
					.style('fill', otherColor);
			}
		} else if (attribute == 'erate'){
			tracts
				.transition()
				.duration(app.options.transitionDuration)
				.style('fill', d => app.erateScale(d.properties.erate));
		}
	}
}

module.exports = CookCountyMap;