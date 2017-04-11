import * as d3 from 'd3';
import * as _ from 'underscore';
// const textures = require('textures');
import textures from 'textures';
const getTribColor = require('./getTribColors.js');

// import Prerender from 'd3-pre';
// const  prerender = Prerender(d3);
// import * as d3-annotation from 'd3-svg-annotation';

// TODO: Make annotations smaller on mobile

// This allows iteration over an HTMLCollection (as I've done in setting the checkbutton event listeners,
// as outlined in this Stack Overflow question: http://stackoverflow.com/questions/22754315/foreach-loop-for-htmlcollection-elements
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];


class barChart{
	constructor(options){
		const app = this;
		app.options = options;
		app._container = options.container
		app.data = app.filterData(options.dataset);
		app.barColor = app.getColor(app.options.barFill);
		app.meta = app.options.meta;


		app.initChart(app.data);
	}

	getColor(colorString){
		if(colorString.indexOf('#') > -1){
			return colorString
		} else {
			return getTribColor(colorString);
		}
	}

	filterData(rawData){
		let app = this;
		let filteredData = [],
			x = app.options.xAttribute,
			y = app.options.yAttribute;
		
		rawData.forEach(d => {
			let t = {
				x:`${d[x]}`,
				y:`${d[y]}`
			}
			filteredData.push(t);
		})
		return filteredData;
	}

	initChart(data){
		let app = this;

		// ----------------------------------
		// GET THE KNOW THE CONTAINER
		// ----------------------------------

		const container = d3.select(app._container);
		const bbox = container.node().getBoundingClientRect(), 
			height=bbox.height,
			width=bbox.width,
			margin=app.options.innerMargins,
			innerHeight = height - margin.top - margin.bottom,
			innerWidth = width - margin.right - margin.left;

		// ----------------------------------
		// MAKE SCALES
		// ----------------------------------

		const yMax = app.options.maxYValue ? app.options.maxYValue : d3.max(data, d => parseFloat(d["y"]));
		let yMin;
		if (app.options.yMin){
			yMin = parseFloat(app.options.yMin);
		} else {
			yMin = d3.min(data, d => parseFloat(d["y"]));
		}
		//Scale functions
		//This is the y scale used to size and position the bars
		const yScale = d3.scaleLinear()
			.domain([yMin, yMax])
			.nice()
			.range([0,innerHeight]);

		//this y scale is used to generate the y axis because the coordinate system is flipped in svgs, which causes the axis to be reversed
		const yScaleDisplay = d3.scaleLinear()
			.domain([yMax,yMin])
			.nice()
			.range([0,innerHeight]);

		// Define the y axis and add a tick formatter if a format string is define in the options.
		const yAxis = d3.axisLeft(yScaleDisplay);

		// If the user has defined a # format string
		if (app.options.formatStrings.yAxis){
			const yFormatter = d3.format(app.options.formatStrings.yAxis);
			yAxis.tickFormat(yFormatter)
		}
		// If the user has defined the desired # ticks ...
		if (app.options.ticks.yAxis){
			yAxis.ticks(app.options.ticks.yAxis);
		}

		// Make the x scale
		const xScale = d3.scaleBand()
			.domain(data.map(d => d.x))
			.range([0, innerWidth])
			.padding(app.options.barPadding);

		// Define the x axis and add a tick formatter if a format string is define in the options.
		const xAxis = d3.axisBottom(xScale)
		if (app.options.formatStrings.xAxis){
			const xFormatter = d3.format(app.options.formatStrings.xAxis);
			xAxis.tickFormat(xFormatter)
		}

		// If the user has defined the desired # ticks ...
		if (app.options.ticks.xAxis){
			xAxis.ticks(app.options.ticks.xAxis);
		}
		if(app.options.chartType == "line" || app.options.chartType == "filled-line"){
			app.line = d3.line()
			    .x(d => xScale(d.x))
			    .y(d => yScaleDisplay(d.y));
		}


		// ----------------------------------
		// START MESSING WITH SVGs
		// ----------------------------------

		//Inserts svg and sizes it
		const svg = container
            .append("svg")
            .attr("width", width)
            .attr("height", height);

		const chartInner = svg.append('g')
			.classed('chartInner', true)
			.attr("width",innerWidth)
			.attr("height",innerHeight)
			.attr(`transform`,`translate(${margin.left},${margin.top})`);

		// ----------------------------------
		// APPEND <g> ELEMENTS FOR SCALES 
		// ----------------------------------

	if (app.options.showYAxis){
		   svg.append('g')
				.classed("axis", true)
				.classed("y", true)
				.attr(`transform`,`translate(${margin.left},${margin.top})`)
				.transition()
					.duration(app.options.transitionTime)
					.call(yAxis);
				}

	   svg.append('g')
			.classed("x", true)
			.classed("axis", true)
			.attr(`transform`,`translate(${ margin.left },${ margin.top + innerHeight })`)
			.transition()
				.duration(app.options.transitionTime)
				.call(xAxis);
		
		if (app.options.chartType == "line" || app.options.chartType == "filled-line"){
			if (app.options.chartType == "filled-line"){
				// https://riccardoscalco.github.io/textures/
				// This is the filled area
				var t = textures.lines()
					.size(4)
					.strokeWidth(1)
					.background(app.barColor)
					.stroke('white');

				svg.call(t);

				const area = d3.area()
				    .y0(innerHeight)
				    .x(d => xScale(d.x))
				    .y1(d => yScaleDisplay(d.y));

				chartInner.append("path")
				      .datum(data)
				      .attr("class", "area")
				      .attr("d", area)
				      .style('fill', t.url())
	  			      // .style('fill-opacity', .5);
			}

  			// if we prefer a line to a bar chart
			chartInner.append("path")
			      .datum(data)
			      .attr("class", "line")
			      .attr("d", app.line)
			      .style('stroke', app.barColor)
			      .style('stroke-width', app.options.lineWeight)
			      .style('fill', 'transparent');


			const annotations = svg.append("g")
				.attr("class", "annotations")
				.attr(`transform`,`translate(${ margin.left },${ margin.top})`);

			const 	sortedData = _.sortBy(app.data, d => d.y),
					firstAnnotation = sortedData[0],
					lastAnnotation = sortedData[sortedData.length - 1],
					circleRadius = 20;

			// LABEL THE HIGHEST RATE
			annotations.append('circle')
				.attr('r', circleRadius)
				.attr('cx', xScale(lastAnnotation.x))
				.attr('cy', yScaleDisplay(lastAnnotation.y))
				.style('stroke', 'black')
				.style('stroke-width', 2)
				.style('fill', 'transparent')

			annotations.append('line')
					.attr('x1', xScale(lastAnnotation.x))
					.attr('y1', yScaleDisplay(lastAnnotation.y) + circleRadius)
					.attr('x2', xScale(lastAnnotation.x))
					.attr('y2', yScaleDisplay(lastAnnotation.y) + circleRadius + 50)
					.style('stroke', 'black')
					.style('stroke-width', 2);
					
			annotations.append('text')
					.attr('x', xScale(lastAnnotation.x))
					.attr('y', yScaleDisplay(lastAnnotation.y) + circleRadius + 55)
					.attr('dy', '1em')
					.attr('text-anchor', 'middle')
					.text(lastAnnotation.y);

			annotations.append('text')
					.attr('x', xScale(lastAnnotation.x))
					.attr('y', yScaleDisplay(lastAnnotation.y) + circleRadius + 55)
					.attr('dy', '2.1em')
					.attr('text-anchor', 'middle')
					.text(lastAnnotation.x);

			// LABEL THE LOWEST RATE
			annotations.append('circle')
				.attr('r', 20)
				.attr('cx', xScale(firstAnnotation.x))
				.attr('cy', yScaleDisplay(firstAnnotation.y))
				.style('stroke', 'black')
				.style('stroke-width', 2)
				.style('fill', 'transparent')


			annotations.append('line')
					.attr('x1', xScale(firstAnnotation.x))
					.attr('y1', yScaleDisplay(firstAnnotation.y) - circleRadius)
					.attr('x2', xScale(firstAnnotation.x))
					.attr('y2', yScaleDisplay(firstAnnotation.y) - circleRadius - 50)
					.style('stroke', 'black')
					.style('stroke-width', 2);

			annotations.append('text')
					.attr('x', xScale(firstAnnotation.x))
					.attr('y', yScaleDisplay(firstAnnotation.y) - circleRadius - 55)
					.attr('dy', '-2.1em')
					.attr('text-anchor', 'middle')
					.text(firstAnnotation.y);

			annotations.append('text')
					.attr('x', xScale(firstAnnotation.x))
					.attr('y', yScaleDisplay(firstAnnotation.y) - circleRadius - 55)
					.attr('dy', '-1em')
					.attr('text-anchor', 'middle')
					.text(firstAnnotation.x);


		} else {

			// ----------------------------------
			// DRAW THE BARS
			// ----------------------------------

			chartInner.selectAll("rect")
				.data(data)
				.enter()
				.append("rect")
					.classed('bar', true)
					.attr("height", d => yScale(d["y"]))
					.attr("y", d => innerHeight - yScale(d["y"]))
					.attr("x", (d, i) => xScale(d['x']))
					.attr("width", xScale.bandwidth())
					.style("fill", app.barColor);
			    
			    if (app.options.barLabels){
					// ----------------------------------
					// DRAW THE LABELS
					// ----------------------------------
			    	chartInner.selectAll("text")
						.data(data)
						.enter()
						.append("text")
							.text(d => d["y"])
							.classed('bar-label', true)
							.attr("y", d => innerHeight - yScale(d["y"]))
							.attr("dy", '-.15em')
							.attr("x", d => (xScale.bandwidth() / 2) + xScale(d['x']))
							.attr('text-anchor', 'middle')
			     }
		}
		// ----------------------------------
		// ADD THE META LABELING
		// ----------------------------------
		
		if (app.meta){

		const labels = svg.append('g')
			.classed('chart-labels', true);
			if (app.meta.headline){
				labels.append('text')
					.classed('chart-labels__headline', true)
					.text(`${app.meta.headline}`)
					.style('font-family','Arial, sans-serif')
					.style('font-size','19px')
					.style('font-weight','bold')
					.attr('x', 0)
					.attr('y', 0)
					.attr('dy', '1em')
					.attr('text-anchor', 'left')
			}
			if (app.meta.xAxisLabel){
				labels.append('text')
					.classed('chart-labels__xAxisLabel', true)
					.text(`${app.meta.xAxisLabel}`)
					.style('font-family','Arial, sans-serif')
					.style('font-size','13px')
					.style('font-weight','bold')
					.attr('x', margin.left + (innerWidth / 2))
					.attr('y', height)
					.attr('dy', '-.3em')
					.attr('text-anchor', 'middle')
			}
			if (app.meta.yAxisLabel){
				labels.append('text')
					.classed('chart-labels__yAxisLabel', true)
					.text(`${app.meta.yAxisLabel}`)
					.style('font-family','Arial, sans-serif')
					.style('font-size','13px')
					.style('font-weight','bold')
					.attr('x', 0)
					.attr('y', margin.top + (innerHeight / 2))
					.attr('text-anchor', 'middle')
					.attr('dy', '1em')
					.attr('transform', `rotate(-90, 0, ${margin.top + (innerHeight / 2)})`)
			}

			if (app.meta.sources){
				container.append('p')
					.classed('chart-labels__source', true)
					.text(`${app.meta.sources}`)
					.style('font-family','Arial, sans-serif')
					.style('font-size','13px')
					.style('margin','0 0 0 0')
					.style('line-height', '1.3em')
			}

			if(app.meta.credit){
				container.append('p')
					.classed('chart-labels__credit', true)
					.text(`${app.meta.credit}`)
					.style('font-family','Arial, sans-serif')
					.style('font-size','13px')
					.style('margin','7px 0 0 0')
					.style('line-height', '1.3em')

			}
		}

     }
}


module.exports = barChart;