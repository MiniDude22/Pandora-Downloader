import os
import urllib

from flask import Flask, request, jsonify

config = {
    'base_path': 'C:\\Users\\YourUsernameHere\\Music\\Pandora'
}

app = Flask( __name__ )


@app.route( '/download', methods=['POST'] )
def pandoraDownloader():

    song_path = make_song_path( request.form['title'], request.form['artist'] )
    song_dir  = make_song_path( request.form['title'], request.form['artist'], False )

    # check to see if the file has been downloaded before!
    if os.path.exists( song_path ):
        print( 'Song found already' )
        return jsonify( status = 'fail', reason = 'Song has already been saved.' )

    else:
        print( 'Downloading song!' )
        if not os.path.exists( song_dir ): os.makedirs( song_dir )
        urllib.urlretrieve( request.form['url'], song_path )
        return jsonify( status = 'success' )


def make_song_path( title, artist, with_file = True ):
    if with_file:
        return '%s\\%s\\%s.mp4' % ( config['base_path'], artist, title )

    return '%s\\%s' % ( config['base_path'], artist )

if __name__ == '__main__':
    app.run(debug=True)
