window.org = {

    //when first term appears on page, modal gets the class hidden for the rest of the story

    init:function(termsJson, ROOT_URL){
        this._ROOT_URL = ROOT_URL;
        console.log(termsJson);
        var termAppears = function(){

            const buttons = document.querySelectorAll('.target-term');
            
            for (var button of buttons){
                button.addEventListener('click', function(e){
                    const termID = e.target.dataset.term;
                    let modals = (document.getElementById("modal"));
                    // let modalSelect = modals.classList[1];
                    
                    //loops through termsJson and adds appropriate definition into modal div
                    for (let i = 0; i < termsJson.length; i++) {
                        if (termsJson[i].ID == termID) {
                            const   term = termsJson[i].term,
                                    definition = termsJson[i].definition;

                            // let termDef = ('<p>'+ termsJson[termID].definition + '<p>');
                            document.getElementById("term").innerHTML = term;
                            document.getElementById("definition").innerHTML = definition;
                            modals.classList.add("modal--active");
                        }
                    }
                    
                    //exit button re-adds hide-this class
                    document.getElementById('exit-button').addEventListener('click', function(){
                        document.getElementById("append-here").innerHTML = "";
                        modals.classList.remove("active");
                        modals.classList.add("hide-this");
                    })
                });

            }
        };
        
        termAppears(termsJson);

    }
}
