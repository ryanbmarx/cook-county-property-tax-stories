var boot = require('bootstrap.js');
import inView from 'in-view';
import * as d3 from 'd3';
import CookCountyMap from './fairness.js';
import barChart from 'bar-chart.js';

// These datasets are so small, might as well just stash them here.
const raceData = [
    {
        pctWhite:0.005929698,
        effectiveTaxRate:0.001504947
    }, {
        pctWhite:0.035360346,
        effectiveTaxRate:0.001620912
    }, {
        pctWhite:0.222306254,
        effectiveTaxRate:0.001562355
    }, {
        pctWhite:0.436557575,
        effectiveTaxRate:0.001650268
    }, {
        pctWhite:0.53454596,
        effectiveTaxRate:0.001559606
    }, {
        pctWhite:0.625016195,
        effectiveTaxRate:0.001504193
    }, {
        pctWhite:0.719726671,
        effectiveTaxRate:0.001448783
    }, {
        pctWhite:0.804212131,
        effectiveTaxRate:0.001446426
    }, {
        pctWhite:0.868830586,
        effectiveTaxRate:0.001427821
    }, {
        pctWhite:0.922517962,
        effectiveTaxRate:0.001429144
    },
];

const incomeData =  [
    {
        medianIncome:20960.14504,
        effectiveTaxRate:0.001556964 
    }, {
        medianIncome:29959.42748,
        effectiveTaxRate: 0.001615476
    }, {
        medianIncome:37293.69466,
        effectiveTaxRate:0.001634373 
    }, {
        medianIncome:42970.9,
        effectiveTaxRate: 0.001562163
    }, {
        medianIncome:48618.07634,
        effectiveTaxRate: 0.001528585
    }, {
        medianIncome:54610.80916,
        effectiveTaxRate: 0.001528787
    }, {
        medianIncome:61576.21538,
        effectiveTaxRate: 0.00149307
    }, {
        medianIncome:70556.24427    ,
        effectiveTaxRate: 0.001453903
    }, {
        medianIncome:84008.51908,
        effectiveTaxRate: 0.001408863
    }, {
        medianIncome:115557.5462,
        effectiveTaxRate:0.001371498 
    }
];

// This allows iteration over an HTMLCollection (as I've done in setting the checkbutton event listeners,
// as outlined in this Stack Overflow question: http://stackoverflow.com/questions/22754315/foreach-loop-for-htmlcollection-elements
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

// We'll use a variable to trigger our scroll events and use a setInterval to periodically check for scroll movement
// This protexts page performance.
let didScroll = false;

// Capture the dimenstions of the map. We continually will reference this to determine whether the header is in view or not
const mapBox = document.querySelector('#day1-header-display .map-wrapper').getBoundingClientRect();

window.onscroll = doThisStuffOnScroll;
function doThisStuffOnScroll() { didScroll = true; }

setInterval(function() {
    if(didScroll) {
        didScroll = false;
        const   header = document.querySelector('#day1-header-display'),
                headerBox = header.getBoundingClientRect();

        // console.log(mapBox.bottom, headerBox.bottom, mapBox.bottom >= headerBox.bottom );

        if (mapBox.bottom >= headerBox.bottom) {
            // If the header has scrolled to the bottom of the map, make the map not sticky by toggling
            // the data-* attribute on the <body>

            // console.log('>>>>>>> make not stick');
            document.querySelector('body').dataset.fixedMap = false;
         
        } else {
            // If the user has scrolled back up, then make the map fixed again.
            // console.log('>>>>>>> make stick');
            document.querySelector('body').dataset.fixedMap = true;
        }

    }
}, 100);



window.onload = function(){
    // Make the two bar charts for later in the process
    const race = new barChart({
        root_url:window.ROOT_URL,
        chartType:'bar',
        container:document.getElementById('race'),
        dataset:raceData,
        xAttribute:'pctWhite',
        yAttribute:'effectiveTaxRate',
        transitionTime:150,
        innerMargins:{top:0,right:0,bottom:40,left:60},
        barPadding: 0.01,
        barFill:'trib_orange',
        barLabels:false,
        startAtZero:true,
        formatStrings: {
            yAxis: ".2%",
            xAxis: ".0%"
        },
        maxYValue:false,
        showYAxis:true,
        xTicks:{
            // At these breakpoints, only run a tick every nth time. The value is the interval.
            mobile:5,
            tablet:2,
            desktop:1
        },
        meta:{
            // headline:'White Population vs. Effective Tax Rate',
            xAxisLabel: "Percentage white, non-hispanic",
            yAxisLabel: "Effective tax rate",
            // sources: "Source: City of Chicago Wastewater Management and Reclamation District",
            // credit: "ChiTribGraphics"
        }
    });

    const income = new barChart({
        root_url:window.ROOT_URL,
        chartType:'bar',
        container:document.getElementById('income'),
        dataset:incomeData,
        xAttribute:'medianIncome',
        yAttribute:'effectiveTaxRate',
        transitionTime:150,
        innerMargins:{top:0,right:0,bottom:40,left:60},
        barPadding: 0.01,
        barFill:'trib_orange',
        barLabels:false,
        startAtZero:true,
        formatStrings: {
            yAxis: ".2%",
            xAxis: "$.3s"
        },
        maxYValue:false,
        showYAxis:true,
        xTicks:{
            // At these breakpoints, only run a tick every nth time. The value is the interval.
            mobile:5,
            tablet:2,
            desktop:1
        },
        meta:{
            // headline:'Income vs. Effective Tax Rate',
            xAxisLabel: "Median household income",
            yAxisLabel: "Effective tax rate",
            // sources: "Source: City of Chicago Wastewater Management and Reclamation District",
            // credit: "ChiTribGraphics"
        }
    });





    d3.json(`data/data.geojson`, (err, data) =>{
        console.log(data);
        const transitionDuration = 400;
        const headerMap = new CookCountyMap({
            mapContainer: d3.select('#map'),
            data: data,
            transitionDuration: transitionDuration
        });    

        inView('.text')
            .on('enter', el => {
                // Switch out the text blurb by hiding the visible one then turning on the next one
                const visible = document.querySelector('.text--visible');
                if (visible != null) {
                    visible.classList.remove('text--visible')
                }
                el.classList.add('text--visible');

                // Now here are a list of specific code blocks for specific text blocks, identified by the 
                // text block's id.
                if (el.id == 'blurb20'){
                    // console.log('EEEEEEEEE-RATE!');
                    // headerMap.highlightTracts('erate', 'whiz-bang-boom');
                } else if (el.id == 'blurb30'){
                    headerMap.highlightTracts('ratio1', 'none');
                } else if (el.id == 'blurb40'){
                    headerMap.highlightTracts('ratio1', 'over1');
                } else if (el.id == 'blurb50'){
                    headerMap.highlightTracts('ratio1', 'under1');
                } else if (el.id == 'blurb60'){
                    headerMap.highlightTracts('ratio1', 'all');
                } else if (el.id == 'blurb70'){
                    console.log('showing erate map')
                    // TODO Fix this render
                    headerMap.highlightTracts('erate', 'whiz-bang-boom');
                } else if (el.id == 'blurb100'){
                    // first hide the map
                    d3.select('#map')
                        .transition()
                        .duration(transitionDuration)
                        .style('opacity',0);
                    // Then fade in the income chart
                    document.querySelector('#race').classList.remove('header-chart--visible');
                    document.querySelector('#income').classList.add('header-chart--visible');

                    
                } else if (el.id == 'blurb110'){
                    document.querySelector('#income').classList.remove('header-chart--visible');
                    document.querySelector('#race').classList.add('header-chart--visible');
                } else if (el.id == 'blurb120'){
                    console.log('hiding everything')
                }
            })
    })
}