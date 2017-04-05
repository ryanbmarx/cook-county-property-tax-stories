const pym = require('pym.js');
const boot = require('bootstrap.js');
require('smoothscroll-polyfill').polyfill();

// -------------------------------------------------------------------
// THIS APP.JS ONLY IS FOR CODE NEEDED FOR ALL STORIES!
// -------------------------------------------------------------------

// This allows iteration over an HTMLCollection (as I've done in setting the checkbutton event listeners,
// as outlined in this Stack Overflow question: http://stackoverflow.com/questions/22754315/foreach-loop-for-htmlcollection-elements
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

// TODO: Lazyload pym

function removeSpinner(id){
    const spinner = document.querySelector(`#${id} + .chart__spinner`);
    spinner.parentNode.removeChild(spinner);
}   

function embedGraphics(){
    // Enable all the pym graphics by collecting all the containers, then 
    // instantiating each one after plucking the necessary details from the 
    // element's metadata
    const pymContainers = document.querySelectorAll('.graphic-embed');
    let pymParents = [];
    for (var container of pymContainers){
        const   pymId = container.id,
                pymUrl = container.dataset.iframeUrl;

        let temp = new pym.Parent(pymId, pymUrl, {});
        // temp.onMessage('childLoaded', removeSpinner(pymId) )
        pymParents.push(temp);
    }
}

// Hide/show the mobile navigation menu
document.getElementById('mobile-nav-toggle').addEventListener('click', function(e){
	const mobileNavButton = document.getElementById('nav-buttons-wrapper');
	mobileNavButton.classList.toggle('nav-buttons-wrapper--active');
});

// Listen for the loaded event then run the pym stuff.
window.addEventListener('load', function() {  embedGraphics(); }, false);

// This make a smooth scroll between the charts and their methodologies (and back)
// I'm using a polyfill found on npm
const returnToChartLinks = document.querySelectorAll('.methodology__link')
for (var link of returnToChartLinks){
    link.addEventListener('click', function(e){
        e.preventDefault();
        const   scrollTarget = document.querySelector(`#${e.target.href.split('#')[1]}`),
                box = scrollTarget.offsetParent.getBoundingClientRect();
        console.log(scrollTarget, scrollTarget.offsetParent, box);
        let newTop = window.scrollY + box.top - 100; // this gets up past the navbar
        window.scroll({ top: newTop, left: 0, behavior: 'smooth' });


    })    
}
