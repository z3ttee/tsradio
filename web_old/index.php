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
    <noscript>
        <h4>Javascript wird benötigt, um diese Seite nutzen zu können.</h4>
        <p>Die Seite arbeitet mit Javascript, um Inhalte dynamisch zu laden. Das verbessert die Performance der Seite und sorgt für eine bessere Nutzererfahrung.</p>
    </noscript>
    <?php include('shared/loader.php'); ?>

    <div id="wrapper">
        <div id="background"><div class="gradient_wrapper"><div class="gradient"></div></div></div>

        <div class="header" id="ui_header">
            <div class="content-container">
                <img src="assets/img/branding/ts_radio_banner.svg" />

                <ul id="mainNavbar">
                    <li><a href="#" class="active">Channels</a></li>
                    <!--<li><a href="#">Dashboard</a></li>-->
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
                
                <div class="ui_box ui_box_table ui_listitem_wrapper ui_listitem_large" v-for="channel in channels" v-if="channel.isActive" @click="channelClicked" :data-id="channel.id" :data-position="channel.posInArray">
                    <div class="ui_box_col ui_listitem_cover">
                        <img class="cover" :src="channel.cover" onerror="loadDefault(this)" />
                        <img class="play" src="assets/img/icons/play.svg" />
                    </div>
                    <div class="ui_box_col ui_listitem_content">
                        <h3><span>AutoDJ</span>{{ channel.name }}</h3>
                        <p v-if="channel.isActive" v-html="channel.info.title + ' - ' + channel.info.artist"></p>
                    </div>
                </div>
            </div>
        </section>

        <section id="inactive">
            <div class="content-container"><h1>Inaktive Channels</h1></div>
            <div class="content-container">
                <div class="ui_box ui_box_table ui_listitem_wrapper ui_listitem_large clickableChannel" v-for="channel in channels" v-if="!channel.isActive" @click="channelClicked" :data-id="channel.id" :data-position="channel.posInArray">
                    <div class="ui_box_col ui_listitem_cover">
                        <img class="cover" :src="channel.cover" onerror="loadDefault(this)" />
                        <img class="play" src="assets/img/icons/play.svg" />
                    </div>
                    <div class="ui_box_col ui_listitem_content">
                        <h3><span>AutoDJ</span>{{ channel.name }}</h3>
                        <p v-if="channel.isActive" v-html="channel.info.title + ' - ' + channel.info.artist"></p>
                    </div>
                </div>
            </div>
        </section>

        <div class="footer">
            <div class="content-container">
                <div id="audioplayer" class="ui_box ui_box_table ui_listitem_wrapper ui_audioplayer_wrapper">
                    <div class="ui_box_col ui_listitem_cover">
                        <img class="play" src="assets/img/icons/play.svg" />
                        <lottie-player id="player_loader" class="hidden" src="assets/img/animated/loader.json"  background="rgba(0, 0, 0, 0)"  speed="1"  loop autoplay></lottie-player> 
                    </div>
                    <div class="ui_box_col ui_listitem_content" >
                        <p v-if="currentChannel">Du hörst auf <span>{{ currentChannel.name }}</span>:</p>
                        <p v-if="currentChannel && currentChannel.info" v-html="currentChannel.info.title + ' - ' + currentChannel.info.artist"></p>
                    </div>
                </div>

                <audio id="audioplayersrc" style="visibility: hidden;"></audio>
            </div>
        </div>

    </div>
    <script>
        $(document).ready(function(){
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

        function loadDefault(img) {
            img.src = "https://tsradio.live/assets/img/covers/tsr_dance.png";
        }

        var vm = new Vue({
                el: '#wrapper',
                data: {
                    channels: [],
                    currentChannel: null
                },
                methods: {
                    channelClicked: function(event){
                        var pos = event.target.getAttribute("data-position");
                        var channel = this.channels[pos];
                        this.currentChannel = channel;
                        this.play();
                    },
                    play: function(){
                        var audioPlayerSrc = document.getElementById("audioplayersrc")
                        var audioPlayer = document.getElementById("audioplayer")

                        var playerLoader = document.getElementById("player_loader");
                        playerLoader.classList.remove("hidden");
                
                        var streamSrc = "https://streams.tsradio.live"+this.currentChannel.mountpoint;
                
                        audioPlayerSrc.setAttribute("src", streamSrc);
                        audioPlayerSrc.load();
                
                        function startPlaying() {
                            audioPlayerSrc.play();
                            audioPlayerSrc.volume = 0.1;
                            playerLoader.classList.add("hidden");
                        }

                        audioPlayerSrc.oncanplay = function(){
                            startPlaying();
                        }
                
                        if (audioPlayerSrc.readyState && audioPlayerSrc.readyState > 3) {
                            startPlaying();
                        }
                    }
                }
            });

            getChannelData()
            setInterval(getChannelData, 1000*10); // Every 15 seconds

            function getChannelData() {
                console.log("getting channel data...");
                $.get("https://tsradio.live/api/v1/getchannels").done(function(response){
                    var status = response.meta.status;

                    if(status == 200){
                        var channels = [];
                        for(id in response.payload) {
                            var channel = response.payload[id];

                            var coverPath = 'https://tsradio.live/assets/img/covers/'+channel.name.replace(" ", "_").toLowerCase()+'.png';
                            console.log(coverPath);

                            channel.cover = coverPath;
                            channel.posInArray = channels.length;
                            channels.push(channel);

                            if(vm.currentChannel && vm.currentChannel.id == channel.id) {
                                vm.currentChannel = channel
                            }
                        } 

                        vm.channels = channels;
                    } else {
                        console.log(response.meta);
                    }
                });
            }
    </script>
    <script src="assets/js/radio.js"></script>
</body>
</html>