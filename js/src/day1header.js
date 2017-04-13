var boot = require('bootstrap.js');
import 'swiper';
// import inView from 'in-view';
import * as d3 from 'd3';
import CookCountyMap from './fairness.js';
import barChart from 'bar-chart.js';

// https://github.com/fivethirtyeight/d3-pre
import Prerender from 'd3-pre';
const  prerender = Prerender(d3);


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

function instructions(id, headerMap) {
    
    const   raceChart = document.querySelector('#race'), 
            incomeChart = document.querySelector('#race'),
            mapWrapper = document.querySelector('.map-wrapper'),
            erateLegend = document.querySelector('.effective-tax-rate-legend');

    if (id == 10){
        // headerMap.highlightTracts('ratio', 'none');
        
        headerMap.highlightTracts('ratio', 'none');
    } else if (id == 20){
        
        headerMap.highlightTracts('ratio', 'none');        
    } else if (id == 30){
        
        headerMap.highlightTracts('ratio', 'none');
    } else if (id == 40){
        
        headerMap.highlightTracts('ratio', 'over1');
    } else if (id == 50){
        
        headerMap.highlightTracts('ratio', 'under1');
    } else if (id == 60){
        erateLegend.classList.remove('effective-tax-rate-legend--visible');
        headerMap.highlightTracts('ratio', 'all');
    } else if (id == 70){
        mapWrapper.classList.add('map-wrapper--visible');
        headerMap.highlightTracts('ratio', 'all');
        // erateLegend.classList.add('effective-tax-rate-legend--visible')
        // headerMap.highlightTracts('erate', 'whiz-bang-boom');
    } else if (id == 80){
        

    } else if (id == 90){
        mapWrapper.classList.add('map-wrapper--visible');
        // erateLegend.classList.add('effective-tax-rate-legend--visible')
        headerMap.highlightTracts('erate', 'whiz-bang-boom');
        raceChart.classList.remove('header-chart--visible');
        incomeChart.classList.remove('header-chart--visible');
    } else if (id == 100){

        // first hide the map
        mapWrapper.classList.remove('map-wrapper--visible');
        erateLegend.classList.remove('effective-tax-rate-legend--visible');
        
        // Then fade in the income chart
        raceChart.classList.remove('header-chart--visible');
        incomeChart.classList.add('header-chart--visible');

    } else if (id == 110){
        erateLegend.classList.remove('effective-tax-rate-legend--visible');
        mapWrapper.classList.remove('map-wrapper--visible');
        incomeChart.classList.remove('header-chart--visible');
        raceChart.classList.add('header-chart--visible');
    } else if (id == 120){
        document.querySelector('#blurb120').classList.add('animate');
        mapWrapper.classList.remove('map-wrapper--visible');
        raceChart.classList.add('header-chart--visible');
    }
}

window.onload = function(){
    prerender.start();

    // Make the two bar charts for later in the process
    const race = new barChart({
        root_url:window.ROOT_URL,
        chartType:'filled-line',
        container:document.getElementById('race'),
        dataset:raceData,
        xAttribute:'pctWhite',
        yAttribute:'effectiveTaxRate',
        transitionTime:150,
        innerMargins:{top:10,right:0,bottom:40,left:60},
        barPadding: 0.01,
        barFill:'trib_orange',
        barLabels:false,
        yMin:.0013,
        lineWeight:5,
        formatStrings: {
            yAxis: ".2%",
            xAxis: ".0%"
        },
        maxYValue:false,
        showYAxis:true,
        ticks:{
            yAxis:5,
            // xAxis:2
        },
        meta:{
            // headline:'White Population vs. Effective Tax Rate',
            xAxisLabel: "Percentage white, non-hispanic",
            yAxisLabel: "Effective tax rate",
            // sources: "Source: City of Chicago Wastewater Management and Reclamation District",
            // credit: "ChiTribGraphics"
        }
    });

    // const income = new barChart({
    //     root_url:window.ROOT_URL,
    //     chartType:'filled-line',
    //     container:document.getElementById('income'),
    //     dataset:incomeData,
    //     xAttribute:'medianIncome',
    //     yAttribute:'effectiveTaxRate',
    //     transitionTime:150,
    //     innerMargins:{top:10,right:0,bottom:40,left:60},
    //     barPadding: 0.01,
    //     barFill:'trib_orange',
    //     barLabels:false,
    //     lineWeight:5,
    //     yMin:.0013,
    //     formatStrings: {
    //         yAxis: ".2%",
    //         xAxis: "$.3s"
    //     },
    //     maxYValue:false,
    //     showYAxis:true,
    //     ticks:{
    //         yAxis:5,
    //         // xAxis:2
    //     },
    //     meta:{
    //         // headline:'Income vs. Effective Tax Rate',
    //         xAxisLabel: "Median household income",
    //         yAxisLabel: "Effective tax rate",
    //         // sources: "Source: City of Chicago Wastewater Management and Reclamation District",
    //         // credit: "ChiTribGraphics"
    //     }
    // });





    d3.json(`http://${window.ROOT_URL}/data/day1header.geojson`, (err, data) =>{
        // console.log(data);
        const transitionDuration = 400;
        const headerMap = new CookCountyMap({
            mapContainer: d3.select('#map'),
            data: data,
            transitionDuration: transitionDuration
        });    
     
        const mySwiper = new Swiper ('.swiper-container', {
            // Optional parameters
            direction: 'vertical',
            speed:200,
            loop: false,
            
            // effect:'flip',
            // fade:{
            //     crossfade:true
            // },

            // If we need pagination
            // pagination: '.swiper-pagination',
            // paginationType:'progress',

            // Navigation arrows
            nextButton: '.swiper-button--next',
            prevButton: '.swiper-button--prev',
            paginationClickable: true,
            keyboardControl:true,
            onSlideChangeStart: function(){
                const   activeSlide = document.querySelector('.swiper-slide-active'),
                        activeID = parseInt(activeSlide.id.replace('blurb', ''));
                
                instructions(activeID, headerMap);
                if (mySwiper.isEnd){
                    document.querySelector('body').dataset.fixedHeader = "false"
                }

            },
            // mousewheelControl:true,
            // mousewheelForceToAxis:true

            // And if we need scrollbar
            // scrollbar: '.swiper-scrollbar',
        }); 
    });  
}