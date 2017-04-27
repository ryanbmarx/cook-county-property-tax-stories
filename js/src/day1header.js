var boot = require('bootstrap.js');
import 'swiper';
// import inView from 'in-view';
import * as d3 from 'd3';
import CookCountyMap from './fairness.js';
// import barChart from 'bar-chart.js';

// https://github.com/fivethirtyeight/d3-pre
import Prerender from 'd3-pre';
const  prerender = Prerender(d3);


// This allows iteration over an HTMLCollection (as I've done in setting the checkbutton event listeners,
// as outlined in this Stack Overflow question: http://stackoverflow.com/questions/22754315/foreach-loop-for-htmlcollection-elements
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

function instructions(id, headerMap) {
    
    const mapWrapper = document.querySelector('.map-wrapper');
    if (id == 10){
        headerMap.highlightTracts('ratio', 'none');
    } else if (id == 40){        
        headerMap.highlightTracts('ratio', 'over1');
    } else if (id == 50){
        headerMap.highlightTracts('ratio', 'under1');
    } else if (id == 70){
        mapWrapper.classList.add('map-wrapper--visible');
        headerMap.highlightTracts('ratio', 'all');
    }
}

document.getElementById('close-prologue').addEventListener('click', function(e){
    console.log('skipping');
    document.querySelector('body').dataset.fixedHeader = false;
    document.querySelector('.day1-header-background').style.maxHeight = 0;
    document.querySelector('.day1-header-background').style.padding = 0;
    document.querySelector('.day1-header-background').style.margin = 0;
    document.querySelector('.day1-header-background').style.overflow = 'hidden';

});

window.onload = function(){
    prerender.start();

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
                    console.log('isEnd')
                    document.querySelector('body').dataset.fixedHeader = "false"
                }

            },
            // mousewheelControl:true,
            mousewheelForceToAxis:true

            // And if we need scrollbar
            // scrollbar: '.swiper-scrollbar',
        }); 
    });  
}