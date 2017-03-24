var pym = require('pym.js');
var boot = require('bootstrap.js');


function toggleMobileNavMenu(){
	console.log('menu!');
		const mobileMenu = document.querySelector('.nav-buttons-wrapper');
		console.log(mobileMenu);
		mobileMenu.classList.toggle('nav-buttons-wrapper--visible')
}

window.onload = function(){
    var pymParent = new pym.Parent('lookup', 'http://graphics.chicagotribune.com/property-tax-assessments-map/lookup.html', {});

    // Hide/show the mobile navigation menu
    document.getElementById('mobile-nav-toggle').addEventListener('click', function(e){
    	const mobileNavButton = document.getElementById('nav-buttons-wrapper');
    	console.log(mobileNavButton, mobileNavButton.classList);
    	mobileNavButton.classList.toggle('nav-buttons-wrapper--active');
    });
}