import os
import re
import urllib

from flask import Flask, request, jsonify

from mutagen.mp4 import MP4, MP4Cover

# =============================================================================
# Config
# =============================================================================

# Modify These lines to change where the songs are saved
base_path = os.sep.join(( os.path.expanduser("~"), 'Music', 'Pandora' ))

# Possible Variables - Mix and match as desired
# {station} {artist} {album} {title}
save_template = os.sep.join((
    "{station}",
    "{artist}",
    "{album} - {title}.m4a"
    # "{title}.m4a"
)).encode('utf-8')

# =============================================================================

app = Flask( "Pandora Downloader Server" )

@app.route( '/download', methods=['POST'] )
def pandoraDownloader():

    playlist_path = os.sep.join((
        base_path,
        re.sub(u'[<>\*:\\/\"|?]', '', request.form['station'].encode('utf-8') ) + ".m3u"
    ))

    # Build the song's path - remove any invalid characters
    relative_song_path = save_template.format(
        station = re.sub(u'[<>\*:\\/\"|?]', '', request.form['station'].encode('utf-8') ),
        artist  = re.sub(u'[<>\*:\\/\"|?]', '', request.form['artist' ].encode('utf-8') ),
        album   = re.sub(u'[<>\*:\\/\"|?]', '', request.form['album'  ].encode('utf-8') ),
        title   = re.sub(u'[<>\*:\\/\"|?]', '', request.form['title'  ].encode('utf-8') )
    ).decode('utf-8')

    song_path = os.sep.join(( base_path, relative_song_path ))

    # check to see if the file has been downloaded before!
    if os.path.exists( song_path ):
        print( 'Song found already' )
        return jsonify( status = 'alreadyDownloaded' )

    else:

        print( 'Downloading "' + request.form['title'].encode('utf-8') + '"' )

        # Create the directories if they don't exist
        if not os.path.isdir( os.path.split(song_path)[0] ): os.makedirs( os.path.split(song_path)[0] )

        # Download the song
        urllib.urlretrieve( request.form['url'], song_path )

        # Open the song with mutagen so we can tag it and put the album art in it
        song = MP4( song_path )

        # Set the tags
        song['\xa9nam'] = [ request.form['title'].encode('utf-8')  ]
        song['\xa9ART'] = [ request.form['artist'].encode('utf-8') ]
        song['\xa9alb'] = [ request.form['album'].encode('utf-8')  ]

        # Download the album art and put it in the file
        albumArtRequest = urllib.urlopen( request.form['albumArt'] )
        albumArt = MP4Cover( albumArtRequest.read() )
        albumArtRequest.close()

        song['covr'] = [ albumArt ]

        song.save()

        # Append the song in the playlist
        with open( playlist_path, 'a+' ) as playlist:
            playlist.write(( relative_song_path + "\n" ).encode("utf-8"))
        
        print( 'Download Complete!' )
        return jsonify( status = 'success' )

if __name__ == '__main__':
    app.run(debug=True)
