const pym = require('pym.js');
const boot = require('bootstrap.js');

// http://iamdustan.com/smoothscroll/
require('smoothscroll-polyfill').polyfill();

// -------------------------------------------------------------------
// THIS APP.JS ONLY IS FOR CODE NEEDED FOR ALL STORIES!
// -------------------------------------------------------------------

// This allows iteration over an HTMLCollection (as I've done in setting the checkbutton event listeners,
// as outlined in this Stack Overflow question: http://stackoverflow.com/questions/22754315/foreach-loop-for-htmlcollection-elements
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

// TODO: Lazyload pym

function isMobile(){
    // returns true if I think we're on mobile.
    if(window.innerWidth < 850){
        return true;
    }
    return false;
}


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

// Init/activate comments
document.getElementById('comments-button').addEventListener('click', function(e){
    document.querySelector(`.trb_cm_so[data-role="cm_container"]`).style.maxHeight = "10000000vh";
    (window.registration || (registration = [])).push('solidopinion');
}, false);

// Hide/show the mobile navigation menu
document.getElementById('mobile-nav-toggle').addEventListener('click', function(e){
	const mobileNavButton = document.getElementById('nav-buttons-wrapper');
	mobileNavButton.classList.toggle('nav-buttons-wrapper--active');
}, false);

function pauseVideo(video){
    pause.classList.toggle('video-control--visible');
    play.classList.toggle('video-control--visible');
    video.pause();
}

function playVideo(video){
    pause.classList.toggle('video-control--visible');
    play.classList.toggle('video-control--visible');
    video.play();
}

// Listen for the loaded event 
window.addEventListener('load', function() {  
    // Init the pym stuff
    embedGraphics(); 

    if (!isMobile() && document.createElement('video').canPlayType('video/mp4') != ""){
        // Prep the pause button, if video is supported and we are not on mobile.
        const   play = document.getElementById('play'),
                pause = document.getElementById('pause'),
                video = document.getElementById('background-video');
        
        // // make the pause button appear
        pause.classList.add('video-control--visible');
    
        const controlButtons = document.querySelectorAll('.video-control');
        for (var button of controlButtons){
            button.addEventListener('click', function(e){    
                if (e.target.id == "play"){
                    playVideo(video)
                } else {
                    pauseVideo(video)
                }
            })
        }
    // Also, let's kill the video after 45 seconds.
    var videoKill = setTimeout(function(){
        pauseVideo(video)
    }, 4500);
    }
}, false);


// This make a smooth scroll between the charts and their methodologies (and back)
// I'm using a polyfill found on npm
const returnToChartLinks = document.querySelectorAll('.methodology__link')
for (var link of returnToChartLinks){
    link.addEventListener('click', function(e){
        e.preventDefault();
        const   scrollTarget = document.querySelector(`#${e.target.href.split('#')[1]}`),
                box = scrollTarget.offsetParent.getBoundingClientRect();
        let newTop = window.scrollY + box.top - 100; // this gets up past the navbar
        window.scroll({ top: newTop, left: 0, behavior: 'smooth' });


    })    
}
