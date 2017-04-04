import * as d3 from 'd3';
var getTribColor = require('./getTribColors.js');

// This allows iteration over an HTMLCollection (as I've done in setting the checkbutton event listeners,
// as outlined in this Stack Overflow question: http://stackoverflow.com/questions/22754315/foreach-loop-for-htmlcollection-elements
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];


class barChart{
	constructor(options){
		// console.log('options: ', options)
		/*
		root_url:'{{ ROOT_URL }}',
		container:document.getElementById('barchart'),
		dataset:window.stations,
		yAttribute:'numberOfTests',
		xAttribute:'id',
		transitionTime:0,
		innerMargins:{top:15,right:0,bottom:40,left:40},
		barPadding: 0.01
		barFill
		startAtZero
		*/
		let app = this;
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
		console.log(yMin);
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
		if(app.options.chartType == "line"){
			app.line = d3.line()
			    .x(d => xScale(d.x))
			    .y(d => yScaleDisplay(d.y));
			// console.log(line)
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
		
		if (app.options.chartType == "line"){
			// if we prefer a line to a bar chart
			chartInner.append("path")
			      .datum(data)
			      .attr("class", "line")
			      .attr("d", app.line)
			      .style('stroke', app.barColor)
			      .style('stroke-width', app.options.lineWeight)
			      .style('fill', 'transparent');

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
				// console.log(app.options.barLabels);
			    
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