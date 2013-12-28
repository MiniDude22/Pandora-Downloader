$( function() {

    // Variable to hold the url for the last song to play
    var currentSongUrl = undefined;

    // Setup the listener for pandora's outgoing requests
    chrome.webRequest.onCompleted.addListener( function( details ) {

        // Test the url against a regex of the different locations the songs live!
        if ( details.url.match( /(http.*\.pandora.com\/access\/.*)/i ) ) {

            // Save the url for later
            currentSongUrl = details.url
        }
    },
    { urls: ['<all_urls>'] });


    function send_info( message ) {
        var d = new Date();
        // Log out the information so when debugging, we can see what was happening
        console.log( d.toLocaleString() + ' - ' + message );
        chrome.tabs.query( {active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage( tabs[0].id, message, function( response ) {});
        });
    }

    // Listen to the message from the content script to attempt to download a song!
    chrome.runtime.onMessage.addListener( function( request, sender, sendResponse ) {

        var song = '(' + request.title + ' - ' + request.artist + ')';

        // If the information isn't available yet, don't do anything
        if ( request.title == "" ) {
            send_info( 'The song info wasn\'t passed in! Wait for the page to finish loading.' );
            return 0;
        }

        // If no song url has been captured don't do anything
        if ( currentSongUrl === undefined ) {
            send_info( 'The song url hasn\'t been captured! Skip to the next song, and get this one later.' );
            return 0;
        }

        // The song url has been captured, lets download it!
        send_info( 'Attempting download for ' + song )

        // Send the url to a python server we're running to download the song!
        $.ajax({
            type: 'POST',
            url: 'http://127.0.0.1:5000/download',
            data: {
                url   : currentSongUrl,
                title : request.title,
                artist: request.artist,
                album : request.album
            },
            success: function( data ) {
                if ( data.status == 'fail' ) {
                    send_info( song + ' has already been downloaded!' )
                }
                if ( data.status == 'success' ) {
                    send_info( song + ' has been successfully downloaded!' )
                }
            },
            dataType: 'json',
            async: false
        })
        .fail(function(){
            send_info( 'The web server isn\'t running!' );
        });

    });

})