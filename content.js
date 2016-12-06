$( function() {
    // Append the download button next to your username
    // initially disabled... Will be enabled when the song loads and is ready to download
    $('#brandingBar .rightcolumn').before('<button class="pd-download-single" disabled=disabled>Download</button>');

    // Append the continuous download button next to the pandora logo
    $('#brandingBar .leftcolumn').after('<button class="pd-download-continuous">Start Continuous Download</button>');

    // Add the info box to the body which will be displayed later
    $('body').append('<div class="pd-infobox"></div>');

    // Click the keep listening button
    var keepListening = function(){
        // Need's the [0], which is inconsistant with using the browser console, but oh well.
        $('.still_listening.button.btn_bg')[0].click();
    };

    // Watch the body for when the still listening button is added to it.
    // https://github.com/MiniDude22/jquery-observe
    $('body').observe( 'added', '.still_listening', function( record ){
        setTimeout( keepListening, 3000 );
    });

    // Display the infobox with a message for a short while
    function infoBoxMessage( message ) {
        $('.pd-infobox')
            .finish()      // Stop any current animation
            .fadeOut( 10 ) // Fade out quickly in case there was a message already
            .text( message )
            .fadeIn( 400 )
            .delay( 3000 )
            .fadeOut( 400 );
    };

    // Send the download request/song information to background.js
    function downloadSong(){
        chrome.runtime.sendMessage({
            station  : $('.stationChangeSelectorNoMenu p').text(),
            title    : $('.playerBarSong').text(),
            artist   : $('.playerBarArtist').text(),
            album    : $('.playerBarAlbum').text(),
            // This gnarly boy gets the url for the active stations album art
            // If there's a cleaner way to do it... Please do a pull request
            albumArt : $('.stationSlides').filter(function(){ return $(this).css('display') == 'block'; }).find('div.slide .art')[1].src
        }, function( response ) {} );
    }

    lastTimeout = null;
    lastTitle   = "";
    continuous  = false;
    // 'sleeps' until the song data updates at which point the song can be downloaded
    function waitForSongData() {

        // In case we are already looping - possible when skipping a song quickly
        clearTimeout( lastTimeout );

        // If the song data isn't there 'sleep' for a second
        if (lastTitle == $('.playerBarSong').text()) { lastTimeout = setTimeout( waitForSongData, 1000 ); return; };


        // if we are in continuous mode then download the song
        if ( continuous ){ downloadSong(); }
        // only re-enable the downlaod button if we aren't continuously downloading songs
        else { $('.pd-download-single').prop("disabled", false); }

        // Either way update the text on the download button because it looks nice
        $('.pd-download-single').text("Download - " + $('.playerBarSong').text() );
    };

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
        // console.log( request );
        if ( request.type == "info" ) { infoBoxMessage( request.data ); };
        if ( request.type == "disableDownloadButton" ) { $('.pd-download-single').prop("disabled", true); };
        if ( request.type == "enableDownloadButton"  ) { $('.pd-download-single').prop("disabled", false); };
        if ( request.type == "newSong" ) {
            $('.pd-download-single').prop("disabled", true);
            lastTitle = $('.playerBarSong').text();
            waitForSongData(); 
        };
    });

})
