var pym = require('pym.js');
var boot = require('bootstrap.js');
import inView from 'in-view'
// This allows iteration over an HTMLCollection (as I've done in setting the checkbutton event listeners,
// as outlined in this Stack Overflow question: http://stackoverflow.com/questions/22754315/foreach-loop-for-htmlcollection-elements
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

// TODO: Lazyload pym

function removeSpinner(id){
    console.log(`Removing spinner from ${id}`);
    const spinner = document.querySelector(`#${id} + .chart__spinner`);
    spinner.parentNode.removeChild(spinner);
}   

inView('#demographics')
    .on('enter', function(){
        console.log('demographics in the house');
    })
    .on('exit', el => {
        console.log('demographics has left the building', el);
    })
window.onload = function(){

    // Enable all the pym graphics by collecting all the containers, then 
    // instantiating each one after plucking the necessary details from the 
    // element's metadata
    const pymContainers = document.querySelectorAll('.graphic-embed');
    let pymParents = [];
    for (var container of pymContainers){
        console.log(container);
        const   pymId = container.id,
                pymUrl = container.dataset.iframeUrl;

        let temp = new pym.Parent(pymId, pymUrl, {});
        temp.onMessage('childLoaded', removeSpinner(pymId) )
        pymParents.push(temp);
    }

    // Hide/show the mobile navigation menu
    document.getElementById('mobile-nav-toggle').addEventListener('click', function(e){
    	const mobileNavButton = document.getElementById('nav-buttons-wrapper');
    	console.log(mobileNavButton, mobileNavButton.classList);
    	mobileNavButton.classList.toggle('nav-buttons-wrapper--active');
    });
}