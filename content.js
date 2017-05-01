$(function() {

    // ------------------------------------------------------------------------
    // Utility Functions
    // ------------------------------------------------------------------------
    // Display the infobox with a message
    function infoBoxMessage( message, duration ) {
        // Default of 3 seconds for a message
        duration = (typeof duration !== 'undefined') ?  duration : 3000;
        $('.pd-infobox')
            .finish()      // Stop any current animation
            .fadeOut( 10 ) // Fade out quickly in case there was a message already
            .text( message )
            .fadeIn( 400 )
            .delay( duration )
            .fadeOut( 400 );
    };

    function getSongTitle() {
        // If its a song name that doesn't marquee around
        var ret = $('.nowPlayingTopInfo__current__trackName div div' ).text();

        // If it's a marquee then get the name this way.
        if ( $('.nowPlayingTopInfo__current__trackName .Marquee__wrapper__content__child' ).length > 0 ) {
            ret = $('.nowPlayingTopInfo__current__trackName .Marquee__wrapper__content__child' )[0].innerText;
        }

        return ret;
    }

    // Send the download request/song information to background.js
    function downloadSong() {
        chrome.runtime.sendMessage({
            station  : $('.StationListItem__content--current span').text(),
            title    : getSongTitle(),
            artist   : $('.nowPlayingTopInfo__current__artistName').text(),
            album    : $('.nowPlayingTopInfo__current__albumName' ).text(),
            albumArt : $("div[data-qa='album_active_image']").css('background-image').replace(/^url\(["']?/, '').replace(/["']?\)$/, '')
        }, function( response ) {} );
    }

    // 'sleeps' until the song data updates at which point the song can be downloaded
    lastTimeout = null;
    lastTitle   = "";
    continuous  = false;
    function waitForSongData() {

        // In case we are already looping - possible when skipping a song quickly
        clearTimeout( lastTimeout );

        // If the song data isn't there 'sleep' for a second
        if (lastTitle == getSongTitle()) { lastTimeout = setTimeout( waitForSongData, 1000 ); return; };


        // if we are in continuous mode then download the song
        if ( continuous ){ downloadSong(); }

        // only re-enable the downlaod button if we aren't continuously downloading songs
        else { $('.pd-download-single').prop("disabled", false); }

        // Either way update the text on the download button because it looks nice
        $('.pd-download-single').text("Download - " + getSongTitle() );
    };

    // ------------------------------------------------------------------------
    // I'm Still Listening - Need to wait and see what the new message looks like
    // ------------------------------------------------------------------------
    // Function to click the "I'm still listening" button
    function keepListening() {
        // Need's the [0], which is inconsistant with using the browser console, but oh well.
        $('.still_listening.button.btn_bg')[0].click();
    };

    // Watch the body for when the still listening button is added to it.
    // https://github.com/MiniDude22/jquery-observe
    $('body').observe( 'added', '.still_listening', function( record ){
        setTimeout( keepListening, 3000 );
    });

    // ------------------------------------------------------------------------
    // Add controls
    // ------------------------------------------------------------------------
    // Wait for the controls to load
    $('body').observe( 'added', '.Tuner__Control__ThumbDown', function( record ){

        // Append the continuous download button next to the pandora logo
        $('.Tuner__Control__ThumbDown').before('<button class="pd-download-continuous">Start Continuous Download</button>');

        // Append the download button left of the Thumbs Down
        // initially disabled... Will be enabled when the song loads and is ready to download
        $('.Tuner__Control__ThumbDown').before('<button class="pd-download-single" disabled=disabled>Download</button>');

        // Add the info box to the body which will be displayed later
        $('body').append('<div class="pd-infobox"></div>');

        // Add functionality to the download button.
        $('.pd-download-single').click( function() { downloadSong(); });

        // Make the continuous button toggleable
        $('.pd-download-continuous').click( function() {
            if ( continuous ){
                $('.pd-download-continuous').text( "Start Continuous Download" );
                $('.pd-download-single').prop("disabled", false);
            } else {
                $('.pd-download-continuous').text( "Stop Continuous Download" );
                $('.pd-download-single').prop("disabled", true);
            }
            continuous = !continuous;
        });

        // Message handler for messages from background.js
        chrome.runtime.onMessage.addListener( function( request, sender, sendResponse ) {
            console.log( request );
            if ( request.type == "info" ) { infoBoxMessage( request.data ); };
            if ( request.type == "disableDownloadButton" ) { $('.pd-download-single').prop("disabled", true ); };
            if ( request.type == "enableDownloadButton"  ) { $('.pd-download-single').prop("disabled", false); };
            if ( request.type == "newSong" ) {
                $('.pd-download-single').prop("disabled", true);
                lastTitle = getSongTitle();
                waitForSongData(); 
            };
        });
    });
});
