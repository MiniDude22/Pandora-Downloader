import os
import re
import urllib

from flask import Flask, request, jsonify

from mutagen.mp4 import MP4, MP4Cover

# Modify this line to change where the songs are saved
# Possible Variables - Mix and match as desired
# {station} {artist} {album} {title}
save_template = os.sep.join((
    os.path.expanduser("~"),
    'Music',
    'Pandora',
    "{station}",
    "{artist}",
    # "{album} - {title}.mp4"
    "{title}.mp4"
))

app = Flask( "Pandora Downloader Server" )

@app.route( '/download', methods=['POST'] )
def pandoraDownloader():

    # Build the song's path - remove any invalid characters
    song_path = save_template.format(
        station = re.sub('[<>\*:\\/\"|?]', '', request.form['station'] ),
        artist  = re.sub('[<>\*:\\/\"|?]', '', request.form['artist' ] ),
        album   = re.sub('[<>\*:\\/\"|?]', '', request.form['album'  ] ),
        title   = re.sub('[<>\*:\\/\"|?]', '', request.form['title'  ] )
    )

    # check to see if the file has been downloaded before!
    if os.path.exists( song_path ):
        print( 'Song found already' )
        return jsonify( status = 'alreadyDownloaded' )

    else:
        print( 'Downloading ""' + request.form['title'] + '"' )

        # Create the directories if they don't exist
        if not os.path.isdir( os.path.split(song_path)[0] ): os.makedirs( os.path.split(song_path)[0] )

        # Download the song
        urllib.urlretrieve( request.form['url'], song_path )

        song = MP4( song_path )

        song['\xa9nam'] = [ request.form['title']  ]
        song['\xa9ART'] = [ request.form['artist'] ]
        song['\xa9alb'] = [ request.form['album']  ]

        albumArtRequest = urllib.urlopen( request.form['albumArt'] )
        albumArt = MP4Cover( albumArtRequest.read() )
        albumArtRequest.close()

        song['covr'] = [ albumArt ]

        song.save()

        print( 'Download Complete!' )
        return jsonify( status = 'success' )

if __name__ == '__main__':
    app.run(debug=True)
