Pandora Downloader
==================
This is a simple project that uses a google chrome extension to interface with Pandora, to add a little download button to download songs.

It uses a small python Flask web server to handle the downloading and sorting of the song

Installation
============
If you don't have python and pip installed, install them.

> [python 2.7](http://www.python.org/download/)

> [setuptools](https://pypi.python.org/pypi/setuptools#installation-instructions)

> [pip](http://www.pip-installer.org/en/latest/installing.html)

Install Flask with pip ( if you're on Windows, make sure you have your python scripts directory in your PATH )
```
pip install flask
```

Then, to run the server run the command
```
python flask_server.py
```

You should get the flask output of:
```
* Running on http://127.0.0.1:5000/
```

And if you visit [http://localhost:5000/download](http://localhost:5000/download), you should see:
```
Method Not Allowed

The method is not allowed for the requested URL.
```

Good, got the server running. *You can modify the little config in the flask_server.py to change where the files are saved to.*
```
7. 'base_path': 'C:\\Users\\YourUsernameHere\\Music\\Pandora'
```

Now lets get the folder loaded as a chrome extension!

Navigate to **chrome://extensions**

Check the *Developer Mode* box.

Click *Load unpacked extension...*

Navigate to the pandora-downloader folder, and viola you've got the extension running.

Pictures
========

The download button on the page
![Displaying the download button](http://i.imgur.com/Z3iBxT4.png "Download Button")

The message box letting you know the song was downloaded
![Message box displaying that the song was downloaded](http://i.imgur.com/fYyJz5g.png "Message box")

Notes
=====

By default songs are organized in the folder by base_path\\Artist_name\\Song_name.mp4