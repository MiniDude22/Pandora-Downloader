$( function() {
    // Append the download button next to your username
    $('#brandingBar .rightcolumn').before('<div class="pandora-downloader"><button>Download</button></div>');

    // The info box!
    $('body').append('<div class="pandora-downloader-infobox"></div>')

    // Add functionality to the download button.
    $('#brandingBar').on( 'click', '.pandora-downloader button', function() {

        // Send the download request/song information to the background manager
        chrome.runtime.sendMessage({
            title:  $('.songTitle')    .first().text(),
            artist: $('.artistSummary').first().text(),
            album:  $('.albumTitle')   .first().text(),
        }, function( response ) {} );
    });

    chrome.runtime.onMessage.addListener( function( request, sender, sendResponse ) {

        display_info( request );

    });

    function display_info( message ) {
        $('.pandora-downloader-infobox')
            .finish()
            .fadeOut( 10 )
            .text( message )
            .fadeIn( 400 )
            .delay( 3000 )
            .fadeOut( 400 );
    }

})