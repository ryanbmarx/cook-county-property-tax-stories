var boot = require('bootstrap.js');
import inView from 'in-view';
import * as d3 from 'd3';
import CookCountyMap from './fairness.js';

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
    d3.json(`http://apps.beta.tribapps.com/property-tax-assessments-map/data/tract-data2.geojson`, (err, data) =>{
        const fairnessMap = new CookCountyMap({
            mapContainer: d3.select('#map'),
            data: data
        });     
    })


    inView('.text')
        .on('enter', el => {
            // Switch out the text blurb by hiding the visible one then turning on the next, hidden one
            const visible = document.querySelector('.text--visible');
            if (visible != null) {
                visible.classList.remove('text--visible')
            }
            el.classList.add('text--visible');
                d3.selectAll('.tract')
                    .classed('tract--highlight', false);

            // Now highlight the tracts. 
            if(el.dataset.tractHighlight){
                const highlight = el.dataset.tractHighlight;
                const tracts = d3.selectAll('.tract');
                
                d3.selectAll('.' + highlight)
                    .classed('tract--highlight', true);
            }

        })
}