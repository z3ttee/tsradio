<template>
  <app-header-view></app-header-view>
  <div class="content-container">
    <transition name="transition_page" mode="out-in">
      <router-view></router-view>
    </transition>
  </div>
  <app-player-view v-if="$store.state.currentChannel"></app-player-view>
  <app-splash-screen-view></app-splash-screen-view>
</template>

<script>
import AppSplashScreenView from '@/views/AppSplashScreenView.vue'
import AppPlayerView from '@/views/shared/AppPlayerView.vue'
import AppHeaderView from '@/views/shared/AppHeaderView.vue'

export default {
  components: {
    AppSplashScreenView,
    AppHeaderView,
    AppPlayerView
  }
}
</script>

<style lang="scss">
@import "@/assets/scss/animations.scss";
@import "@/assets/scss/style.scss";
</style>