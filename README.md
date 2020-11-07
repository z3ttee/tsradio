<img src="attachments/project_banner.png" alt="Project Banner" style="display: block; margin: 0 auto 64px auto;" />

# TSRadio NEXT
The next version of TSRadio. Completely re-written from scratch using modern techniques, enabling a better experience than before.

## Planned Features
To see the current state of development in detail, please visit the following page: [https://github.com/z3ttee/tsradio/projects/2](https://github.com/z3ttee/tsradio/projects/2)
- [ ] Play audio streams (Front-end)
- [ ] Stream audio to icecast (Back-end)
- [ ] Create / Manage channels
- [ ] Create / Manage users

## Prerequisites
* NodeJS v12
* MySQL as database

## Setup / Installation
1. Installation
2. Setting up SSL

#### 1. Installation
TBD

First, download the newest release (there is no release yet).
After unzipping the file, you will find several files of which the folders ``frontend`` and ``backend`` are needed. <br>
Ideally you put all the contents of ``frontend`` into your webservers's directory.
Because ``backend`` is a nodejs project, you have to start the nodejs server as follows:
1. Go into the ``backend`` directory
2. Open terminal and type in ``npm run start``

#### 2. Setting up SSL
To use ssl, you need nothing to do but to create the folder ``sslcert`` in the root directory 
and place ``server.key`` and ``server.crt`` inside the newly created folder.
