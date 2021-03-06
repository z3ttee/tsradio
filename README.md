<img src="attachments/project_banner.png" alt="Project Banner" style="display: block; margin: 0 auto 64px auto;" />

The next version of TSRadio. Completely re-written from scratch using modern techniques, enabling a better experience than before.

## Planned Features
To see the current state of development in detail, please visit the following page: [https://github.com/z3ttee/tsradio/projects/2](https://github.com/z3ttee/tsradio/projects/2)
- [x] Play audio streams (Front-end)
- [x] Stream audio to icecast (Back-end)
- [ ] Create / Manage channels through webinterface
- [ ] Create / Manage users through webinterface

## Prerequisites
* OS: Linux (Win will be supported in the late future)
* NodeJS v12
* MySQL as database
* Python installed
* Redis for pub/sub (Is used for exchanging radio meta data in real-time)

## Setup / Installation
1. [Installation](#1-installation)
2. [Setting up SSL](#2-setting-up-ssl)
3. [Setup listener authentication in icecast](#3-setup-listener-authentication-in-icecast)

#### 1. Installation
First, download the newest release.
After unzipping the file, you will find several files of which the folders ``app`` and ``api`` are needed. <br>
Ideally you put all the contents of ``app`` into your webservers's directory.
Because ``api`` is a nodejs project, you have to start the nodejs server as follows:
1. Go into the ``backend`` directory
2. Open the terminal and install all dependencies using ``npm i``
2. Type in ``npm run start`` to start the node app

To ensure all artworks are placed correctly after extracting from mp3 files via the streamer app, make sure the ``api`` folder is placed inside 
the exact root directory the ``streamer.jar`` is in. Otherwise the api will not find the album artworks embedded in mp3 files.

#### 2. Setting up SSL
To use ssl, you need nothing to do but to create the folder ``sslcert`` in the root directory of the api
and place ``privkey.pem`` and ``fullchain.pem`` inside the newly created folder. <br><br>
When setting up SSL on icecast2 using letsencrypt, the following command can come in handy when bundling the certificate:<br>
``sudo bash -c 'cat /etc/letsencrypt/live/example.com/fullchain.pem /etc/letsencrypt/live/example.com/privkey.pem >> /etc/icecast2/cert.bundle.pem' && sudo service icecast2 restart`` <br>
You can write this command in your domains renewal config under ``post_hook``. Example:<br>
```
sudo nano /etc/letsencrypt/renewal/example.com.conf

Add the line:
post_hook = sudo bash -c 'cat /etc/letsencrypt/live/example.com/fullchain.pem /etc/letsencrypt/live/example.com/privkey.pem >> /etc/icecast2/cert.bundle.pem' && sudo service icecast2 restart
```
Now when using ``sudo certbot renew`` the certificate should automatically renew for icecast too.

#### 3. Setup listener authentication in icecast
TSRadio API supports icecast listener authentication through url. It is recommended to setup authentication following the official docs of icecast: 
[Icecast 2.4.1 Listener Authentication Docs](https://icecast.org/docs/icecast-2.4.1/auth.html) <br>
Given the following configuration
```
<mount>
    <mount-name>/example</mount-name>
    <authentication type="url">
        <option name="listener_add" value="<YOUR_URL>"/>
        <option name="headers" value="cookie"/>
    </authentication>
</mount>
```
you only need to adjust ``<YOUR_URL>`` to something that points to the /auth/listener endpoint of TSRadio's API.
This could look something like <br>
* ``https://example.org/api/auth/listener``
* ``http://example.org/auth/listener`` (Non-SSL connections are not recommended, because of missing encryption)
