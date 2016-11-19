$( function() {

    // Variable to hold the url for the last song to play
    var currentSongUrl = undefined;

    // Setup the listener for pandora's outgoing requests
    chrome.webRequest.onBeforeRequest.addListener( function( details ) {

        console.log( details.url );

        // Test the url against a regex of the different locations the songs live!
        if ( details.url.match( /(https?.*.com\/access\/.*)/i ) ) {
            
            // Save the url
            currentSongUrl = details.url;

            // Let content.js know that we have a new song url
            sendMessage( "newSong" );
        }
    }, { urls: ['<all_urls>'] } );


    // Send a message to content.js
    function sendMessage( type, data ) {
        // chrome.tabs.query( {active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.query( {url: "*://www.pandora.com/*"}, function(tabs) {
            chrome.tabs.sendMessage( tabs[0].id, {
                type: type,
                data: data
            }, function( response ) {});
        });
    }

    // Message handler for content.js which downlaods a song
    chrome.runtime.onMessage.addListener( function( request, sender, sendResponse ) {

        var song = '(' + request.title + ' - ' + request.artist + ')';

        // This shouldn't be possible anymore
        // If the information isn't available yet, don't do anything
        if ( request.title == "" ) {
            sendMessage( "info", 'The song info wasn\'t passed in! Wait for the page to finish loading.' );
            return 0;
        }

        // sendMessage( "info", "Should be trying to download " + request.title );

        // This shouldn't be possible anymore
        // If no song url has been captured don't do anything
        if ( currentSongUrl === undefined ) {
            sendMessage( "info", 'The song url hasn\'t been captured! Skip to the next song, and get this one later.' );
            return 0;
        }

        // The song url has been captured, lets download it!
        sendMessage( "info", 'Starting download for - ' + song );

        sendMessage( "disableDownloadButton" );

        // Send the url to a python server to download the song!
        $.ajax({
            type: 'POST',
            url: 'http://127.0.0.1:5000/download',
            data: $.extend( request, {url: currentSongUrl} ),
            // data: {
            //     url      : currentSongUrl,
            //     station  : request.station,
            //     title    : request.title,
            //     artist   : request.artist,
            //     album    : request.album,
            //     albumArt : request.albumArt
            // },
            // Handle the responses we can get
            success: function( data ) {
                if ( data.status == 'alreadyDownloaded' ) {
                    sendMessage( "info", 'Song has already been downloaded!' )
                }
                if ( data.status == 'success' ) {
                    sendMessage( "info", 'Successfully downloaded - ' + song )
                }
            },
            dataType: 'json',
            // async: false
        })
        .fail(function(){
            sendMessage( "info", "The web server isn't running!" );
            sendMessage( "enableDownloadButton" );
        });

    });

})