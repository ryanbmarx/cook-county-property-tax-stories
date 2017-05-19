
var termAppears = function(termsJson){

    // We'll use a body class to make the terms look clickable. That way if 
    // the JS fails there is  no erroneous styling and nobody is any the wiser.

    document.querySelector('body').classList.add('glossary');

    // Select all our term buttons.
    const   buttons = document.querySelectorAll('.target-term'),
            modal = document.querySelector('#modal');
    
    // Assign the event handler to each so they display the proper modal when clicked/tapped;
    for (var button of buttons){
        button.addEventListener('click', function(e){
            const termID = e.target.dataset.term;
            
            //loops through termsJson and adds appropriate definition into modal div
            for (let i = 0; i < termsJson.length; i++) {
                if (termsJson[i].ID == termID) {
                    const   term = termsJson[i].term,
                            definition = termsJson[i].definition;

                    // let termDef = ('<p>'+ termsJson[termID].definition + '<p>');
                    document.getElementById("term").innerHTML = term;
                    document.getElementById("definition").innerHTML = definition;
                    modal.classList.add("modal--active");
                }
            }
            
            //exit button re-adds hide-this class
            document.querySelector('.modal__exit, #modal').addEventListener('click', function(){
                console.log('exiting');
                modal.classList.remove("modal--active");

            })
        });
    }
};

module.exports = termAppears