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
)).encode('utf-8')

app = Flask( "Pandora Downloader Server" )

@app.route( '/download', methods=['POST'] )
def pandoraDownloader():

    # Build the song's path - remove any invalid characters
    song_path = save_template.format(
        station = re.sub(u'[<>\*:\\/\"|?]', '', request.form['station'].encode('utf-8') ),
        artist  = re.sub(u'[<>\*:\\/\"|?]', '', request.form['artist' ].encode('utf-8') ),
        album   = re.sub(u'[<>\*:\\/\"|?]', '', request.form['album'  ].encode('utf-8') ),
        title   = re.sub(u'[<>\*:\\/\"|?]', '', request.form['title'  ].encode('utf-8') )
    ).decode('utf-8')

    # check to see if the file has been downloaded before!
    if os.path.exists( song_path ):
        print( 'Song found already' )
        return jsonify( status = 'alreadyDownloaded' )

    else:
        print( 'Downloading ""' + request.form['title'].encode('utf-8') + '"' )

        # Create the directories if they don't exist
        if not os.path.isdir( os.path.split(song_path)[0] ): os.makedirs( os.path.split(song_path)[0] )

        # Download the song
        urllib.urlretrieve( request.form['url'], song_path )

        song = MP4( song_path )

        song['\xa9nam'] = [ request.form['title'].encode('utf-8')  ]
        song['\xa9ART'] = [ request.form['artist'].encode('utf-8') ]
        song['\xa9alb'] = [ request.form['album'].encode('utf-8')  ]

        albumArtRequest = urllib.urlopen( request.form['albumArt'] )
        albumArt = MP4Cover( albumArtRequest.read() )
        albumArtRequest.close()

        song['covr'] = [ albumArt ]

        song.save()

        print( 'Download Complete!' )
        return jsonify( status = 'success' )

if __name__ == '__main__':
    app.run(debug=True)
