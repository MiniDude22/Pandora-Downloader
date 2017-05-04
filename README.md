Pandora Downloader
==================
This is a simple project that uses a google chrome extension to interface with Pandora, to add the ability to download the songs for offline listening.

It uses a small python Flask web server to handle the downloading and tagging of the songs

I started this project to implement a known method of getting the song into a Chrome extension so that I could learn how they work.

Please note that use of this extension is a violation of Pandora's [Terms of Use](https://www.pandora.com/legal).


Update 2.0!
===========
 - Updated the request regular expression to match new server urls, so it works again
 - Now uses the Mutagen library to add tags to the songs including album art
 - Added a continuous mode that will download all songs that play
 - Made the download button more responsive:
   - Is disabled when a song is not ready to download
   - Displays the title of the song so you know it's collected the info properly
 - Now works if Pandora isn't the active tab ( Needed for continuous downloading )
 - Unicode support
 - Code is a bit more organized 

Remove Chrome Developer Warning
===============================
Follow the instructions [here](http://stackoverflow.com/a/30361260).

Installation
============
If you don't have python and pip installed, install them.

> [python 2.7](http://www.python.org/download/)

> [setuptools](https://pypi.python.org/pypi/setuptools#installation-instructions)

> [pip](http://www.pip-installer.org/en/latest/installing.html)

Install Flask and Mutagen with pip ( if you're on Windows, make sure you have your python scripts directory in your PATH )
```
pip install flask
pip install mutagen
```

Setting up the Chrome Extension
===============================

Navigate to **chrome://extensions**

Check the *Developer Mode* box.

Click*Load unpacked extension...*

Navigate to the Pandora-Downloader folder

Starting the Flask server
=========================
Open a terminal/CMD window and run the *flask_server.py* file
```
python flask_server.py
```

You should get the flask output of:
```
* Running on http://127.0.0.1:5000/
```

If you want an extra test, visit [http://localhost:5000/download](http://localhost:5000/download) and you should see:
```
Method Not Allowed

The method is not allowed for the requested URL.
```

Configuration
=============
You can change where songs are saved by editing flask_server.py on line 12.

This defines the save structure. It has different keywords you can use to organize your songs. Here an example using all the keywords:
```
save_template = os.sep.join((
    os.path.expanduser("~"),
    'Music',
    'Pandora',
    "{station}",
    "{artist}",
    "{album} - {title}.m4a"
))
```
**You should also be able to re-use keywords if desired*

Screenshot
==========
![Displaying the download button](http://i.imgur.com/CQxRWXS.png "Download Button")


