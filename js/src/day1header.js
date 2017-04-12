
// import inView from 'in-view';
import * as d3 from 'd3';
import CookCountyMap from './fairness.js';

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
        document.querySelector('.effective-tax-rate-legend').classList.remove('effective-tax-rate-legend--visible')
        headerMap.highlightTracts('ratio', 'all');
    } else if (id == 70){
        document.querySelector('.effective-tax-rate-legend').classList.add('effective-tax-rate-legend--visible')
        headerMap.highlightTracts('erate', 'whiz-bang-boom');
    } else if (id == 80){
        

    } else if (id == 90){
        document.querySelector('.map-wrapper').classList.add('map-wrapper--visible');
        document.querySelector('.effective-tax-rate-legend').classList.add('effective-tax-rate-legend--visible')
        headerMap.highlightTracts('erate', 'whiz-bang-boom');
        document.querySelector('#race').classList.remove('header-chart--visible');
        document.querySelector('#income').classList.remove('header-chart--visible');
    } else if (id == 100){

        // first hide the map
        document.querySelector('.map-wrapper').classList.remove('map-wrapper--visible');
        document.querySelector('.effective-tax-rate-legend').classList.remove('effective-tax-rate-legend--visible')
        
        // Then fade in the income chart
        document.querySelector('#race').classList.remove('header-chart--visible');
        document.querySelector('#income').classList.add('header-chart--visible');

    } else if (id == 110){
        document.querySelector('#income').classList.remove('header-chart--visible');
        document.querySelector('#race').classList.add('header-chart--visible');
    } else if (id == 120){
        document.querySelector('#blurb120').classList.add('animate');
        document.querySelector('.map-wrapper').classList.remove('map-wrapper--visible');
        document.querySelector('#race').classList.add('header-chart--visible');
    }
}

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
    });  
}