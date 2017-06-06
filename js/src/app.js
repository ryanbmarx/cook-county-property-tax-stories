import "babel-polyfill";
const inView = require('in-view');
const pym = require('pym.js');
// const boot = require('bootstrap.js');

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
    return window.innerWidth < 850 ? true : false;
}


function removeSpinner(id){
    const spinner = document.querySelector(`#${id} + .spinner`);
    spinner.parentNode.removeChild(spinner);
}   

if (document.getElementById('comments-button')){
    // If there is a comments button, then init comments on click. Otherwise, skip it. the sidebars 
    // have no comments thus no comments button.
    document.getElementById('comments-button').addEventListener('click', function(e){
        document.querySelector(`.trb_cm_so[data-role="cm_container"]`).style.maxHeight = "10000000vh";
        (window.registration || (registration = [])).push('solidopinion');
    }, false);
}

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

// // ACtivate brightcove videos
// const embeddedVideos = document.querySelectorAll(".video");
// for (const video of embeddedVideos){
//     video.addEventListener('click', function(e){
//         e.preventDefault();
//         e.stopPropagation();

//         this.querySelector('.video__thumb').style.display = 'none';
//         this.querySelector('.video__play-icon').style.display = 'none';
//         this.querySelector('.video__object-wrapper').style.display = 'block';
        
//     }, false)
// }


// Listen for the loaded event 
window.addEventListener('load', function() {  
    
    // First, let's load the not lazy graphics
    let pymParents = {};

    const graphics = document.querySelectorAll(".chart:not(.chart--lazy) .graphic-embed");
    
    for (var graphic of graphics){
        const   pymId = graphic.id,
                pymUrl = graphic.dataset.iframeUrl;

        pymParents[pymId] = new pym.Parent(pymId, pymUrl, {});
        pymParents[pymId].onMessage('childLoaded', graphic.parentNode.querySelector('.spinner').style.display = 'none');
    }
    
    // Let's set our lazyload offset to 200px. The iframe should be loaded once it's 200px frmo being seen.
    inView.offset(-500);
    

    // Let's lazyload the pym
    inView('.chart--lazy')
        .on('enter', el => {
            const   chartContainer = el.querySelector('.graphic-embed'),
                    pymId = chartContainer.id,
                    pymUrl = chartContainer.dataset.iframeUrl;
            if (!pymParents[pymId]){
                pymParents[pymId] = new pym.Parent(pymId, pymUrl, {});
                pymParents[pymId].onMessage('childLoaded', function() {
                    el.querySelector('.spinner').style.display = 'none'
                });
            }
        })
    // Also, let's lazyload the images
    inView('.image--lazy img')
        .on('enter', el => {
            const src = el.dataset.fullResSrc;
            el.setAttribute('src', src);
        });

    if (!isMobile() && document.createElement('video').canPlayType('video/mp4') != "" && document.querySelectorAll('.header-video').length > 0){
        // Prep the pause button, if video is supported and we are not on mobile and there is a video header on the page.
        const   play = document.getElementById('play'),
                pause = document.getElementById('pause'),
                video = window.innerWidth > 1100 ? document.querySelector('.header-video--large') : document.querySelector('.header-video--small');
        
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
        // Also, let's kill the video after 30 seconds.
        var videoKill = setTimeout(function(){
            pauseVideo(video)
        }, 30000);
    }
}, false);
