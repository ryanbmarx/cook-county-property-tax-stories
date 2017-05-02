var boot = require('bootstrap.js');
import 'swiper';
// import inView from 'in-view';
import * as d3 from 'd3';
import CookCountyMap from './fairness.js';
// import barChart from 'bar-chart.js';

// https://github.com/fivethirtyeight/d3-pre
import Prerender from 'd3-pre';
const  prerender = Prerender(d3);
import $ from "jquery";


// This allows iteration over an HTMLCollection (as I've done in setting the checkbutton event listeners,
// as outlined in this Stack Overflow question: http://stackoverflow.com/questions/22754315/foreach-loop-for-htmlcollection-elements
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

function instructions(id, headerMap) {
    
    const mapWrapper = document.querySelector('.map-wrapper');
    if (id == 10){
        headerMap.highlightTracts('ratio', 'none');
    // } else if (id == 20){
        
    //     headerMap.highlightTracts('ratio', 'none');        
    // } else if (id == 30){
        
    //     headerMap.highlightTracts('ratio', 'none');
    } else if (id == 40){        
        headerMap.highlightTracts('ratio', 'over1');
    } else if (id == 50){
        headerMap.highlightTracts('ratio', 'under1');
    } else if (id == 70){
        mapWrapper.classList.add('map-wrapper--visible');
        headerMap.highlightTracts('ratio', 'all');
    // } else if (id == 80){

    // } else if (id == 90){
    //     mapWrapper.classList.add('map-wrapper--visible');
    //     headerMap.highlightTracts('erate', 'whiz-bang-boom');
    // } else if (id == 100){

    //     // first hide the map
    //     mapWrapper.classList.remove('map-wrapper--visible');

    // } else if (id == 110){

    }
}

document.getElementById('close-prologue').addEventListener('click', function(e){
    console.log('skipping');
    document.querySelector('body').dataset.fixedHeader = false;
    document.querySelector('.day1-header-background').style.maxHeight = 0;
    document.querySelector('.day1-header-background').style.overflow = 'hidden';

});

window.org = {

    init:function(termsJson, ROOT_URL){
        console.log(termsJson);
        this._ROOT_URL = ROOT_URL;
        var term = (termsJson[Object[0].term]);

        $.each(termsJson, function(term) {
            console.log(term);
            var targetString = (document.documentElement.textContent).indexOf(term);
            if ((targetString) > -1) {
                $('.modal').css('display','block');
            }
        });
    }

    // findString: function(termsJson, data, ROOT_URL){
    //     console.log(termsJson);
    // }
},

window.onload = function(){
    prerender.start();

    //for term in json
    //if term exists on current view of page,
    //highlight string
    //place a modal in the margin
    //when term disappears from current view of page
    //remove modal
    // function findString(termsJson){
        
    //     $.each(termsJson, function(key, value) {
    //         var targetString = (document.documentElement.textContent).indexOf(key);
    //         if ((targetString) > -1) {
    //             $('.modal').css('display','block');
    //         }
    //     });
    // }findString(); 


    // Make the two bar charts for later in the process
    // const race = new barChart({
    //     root_url:window.ROOT_URL,
    //     chartType:'filled-line',
    //     container:document.getElementById('race'),
    //     dataset:raceData,
    //     xAttribute:'pctWhite',
    //     yAttribute:'effectiveTaxRate',
    //     transitionTime:150,
    //     innerMargins:{top:10,right:0,bottom:40,left:60},
    //     barPadding: 0.01,
    //     barFill:'trib_orange',
    //     barLabels:false,
    //     yMin:.0013,
    //     lineWeight:5,
    //     formatStrings: {
    //         yAxis: ".2%",
    //         xAxis: ".0%"
    //     },
    //     maxYValue:false,
    //     showYAxis:true,
    //     ticks:{
    //         yAxis:5,
    //         // xAxis:2
    //     },
    //     meta:{
    //         // headline:'White Population vs. Effective Tax Rate',
    //         xAxisLabel: "Percentage white, non-hispanic",
    //         yAxisLabel: "Effective tax rate",
    //         // sources: "Source: City of Chicago Wastewater Management and Reclamation District",
    //         // credit: "ChiTribGraphics"
    //     }
    // });

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
            mousewheelControl:true,
            mousewheelForceToAxis:true

            // And if we need scrollbar
            // scrollbar: '.swiper-scrollbar',
        }); 
    });  
}