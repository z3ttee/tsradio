<template>
    <div class="tsr_list_item_wrapper">
        <div :class="'tsr_list_item '">
            <div class="tsr_list_item_col">
                <div class="tsr_list_cover" :style="(channel ? 'background-image: url(\''+channel.coverURL+'\');' : '')"></div>
            </div>
            <div class="tsr_list_item_col tsr_list_item_content">
                <p class="name" v-html="'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+formattedTime+' Uhr'"></p>
                <div class="tsr_info">
                    <p class="title" v-html="'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+track.title"></p>
                    <p class="artist" v-html="'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+track.artist"></p>
                </div>
            </div>
        </div>
   </div>
</template>

<script>

export default {
    props: ['track','time', 'channel'],
    computed: {
        formattedTime() {
            var date = new Date(parseInt(this.time));
            var hours = this.formatInt(date.getHours());
            var mins = this.formatInt(date.getMinutes());
            return hours+":"+mins;
        }
    },
    methods: {
        formatInt(val) {
            var s = val+"";
            while (s.length < 2) s = "0" + s;
            return s;
        }
    }
}
</script>