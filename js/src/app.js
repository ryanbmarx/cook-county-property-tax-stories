
var boot = require('bootstrap.js');


function toggleMobileNavMenu(){
	console.log('menu!');
		const mobileMenu = document.querySelector('.nav-buttons-wrapper');
		console.log(mobileMenu);
		mobileMenu.classList.toggle('nav-buttons-wrapper--visible')
}

window.onload = function(){

}