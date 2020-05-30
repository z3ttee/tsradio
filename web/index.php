<?php
require 'init.php';
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TSRadio :: Der bessere Sound</title>

    <link href="assets/css/style.min.css" rel="stylesheet" />
    <link href="assets/css/elements.min.css" rel="stylesheet" />

    <link rel="shortcut icon" type="image/x-icon" href="assets/img/branding/favicon.png">
    <script src="assets/js/jquery-3.5.1.min.js"></script>
    <script src="assets/js/lottie.min.js"></script>
    <script src="assets/js/vue.js"></script>
</head>

<body>
    <?php include('shared/loader.php'); ?>

    <div id="wrapper">
        <div id="background"><div class="gradient_wrapper"><div class="gradient"></div></div></div>

        <div class="header" id="ui_header">
            <div class="content-container">
                <img src="assets/img/branding/ts_radio_banner.svg" />

                <ul id="mainNavbar">
                    <li><a href="#" class="active">Channels</a></li>
                    <li><a href="#">Dashboard</a></li>
                    <li id="menuItem">Menü<img src="assets/img/icons/menu.svg" width="50px" /></li>
                </ul>
            </div>
        </div>

        <div class="sidebarnav">
            <ul>
                <li><a href="#" class="active">Channels</a></li>
                <li><a href="#">Dashboard</a></li>
            </ul>
        </div>

        <section id="featured">
            <?php include('shared/marqueeTest.php'); ?>


            <div class="content-container"><h1>Featured</h1></div>
            <div class="content-container">
                
                <div class="ui_box ui_box_table ui_listitem_wrapper ui_listitem_large">
                    <div class="ui_box_col ui_listitem_cover">
                        <img class="cover" src="assets/img/covers/tsr_original_dance.png" />
                        <img class="play" src="assets/img/icons/play.svg" />
                    </div>
                    <div class="ui_box_col ui_listitem_content">
                        <h3><span>AutoDJ</span>TSR Dance</h3>
                        <p>DESIGN OF CARD NEEDS TO BE REWORKED</p>
                    </div>
                </div>
            </div>
            
        </section>

        <section id="allchannels">
            <div class="content-container"><h1>Alle Channels</h1></div>
            <div class="content-container">
                <br />
                <h3>TSR Dance</h3>
                <audio controls id="dance_audio" src="">
                    <source src="" />
                </audio>
                <br />
                <h3>Wipfrawelle</h3>
                <audio controls id="wipfrawelle_audio" src="">
                    <source src="" />
                </audio>
                <br />
                <h3>Soundtracks Radio</h3>
                <audio controls id="soundtracks_audio" src="">
                    <source src="" />
                </audio>
                <br />
                <h3>Radio Spiegelpark</h3>
                <audio controls id="mirrorpark_audio" src="">
                    <source src="" />
                </audio>
                <br />
                <h3>Nostalgia Radio</h3>
                <audio controls id="nostalgia_audio" src="">
                    <source src="" />
                </audio>
            </div>
        </section>

        <section id="bycreator-<creator>">
            <div class="content-container"><h1>Created by <emphasize>{{ creator.name }}</emphasize></h1></div>
        </section>

        <div class="footer">
            <div class="content-container">
                <div class="ui_box ui_box_table ui_listitem_wrapper ui_audioplayer_wrapper">
                    <div class="ui_box_col ui_listitem_cover"><img class="play" src="assets/img/icons/play.svg" /></div>
                    <div class="ui_box_col ui_listitem_content">
                        <p>Du hörst auf <span>Wipfrawelle</span>:</p>
                        <p>Ich bin Default - Jan Cas</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script>
        window.onload = function(){
            var audio = document.getElementById("soundtracks_audio");
            audio.volume = 0.1;
            audio.src = 'https://streams.tsradio.live/soundtracks';

            var dance = document.getElementById("dance_audio");
            dance.volume = 0.1;
            dance.src = 'https://streams.tsradio.live/dance';

            var wipfra = document.getElementById("wipfrawelle_audio");
            wipfra.volume = 0.1;
            wipfra.src = 'https://streams.tsradio.live/wipfrawelle';

            var mirror = document.getElementById("mirrorpark_audio");
            mirror.volume = 0.1;
            mirror.src = 'https://streams.tsradio.live/mirrorpark';

            var nostalgia = document.getElementById("nostalgia_audio");
            nostalgia.volume = 0.1;
            nostalgia.src = 'https://streams.tsradio.live/nostalgia';

            console.log('Radio loaded');
        }
        
        $(document).ready(function(){
            console.log('DOM ready.')

            $('#loader_wrapper').delay(400).queue(function(){
                $(this).addClass('ui_loaded');
            });

            $('#wrapper').on('scroll', function(){
                if($(this).scrollTop() > 10) {
                    $('#ui_header').addClass('ui_scrolling');
                } else {
                    $('#ui_header').removeClass('ui_scrolling');
                }
            });
        });
    </script>
</body>
</html>