<template>
  <div>
    <mu-sub-header>{{ title }}</mu-sub-header>
    <video class="player" controls></video>
  </div>
</template>

<script>
export default {
  data () {
    return {

    }
  },
  props: ['videoFile'],
  computed: {
    title () {
      return this.$store.getters.videoTitle
    }
  },
  beforeRouteEnter (to, from, next) {
    // TODO: make it render file props
    next(vm => vm.renderPlayer())
  },
  methods: {
    renderPlayer () {
      this.videoFile.renderTo('.player')
    }
  }
}
</script>

<style scoped>
.player {
  max-width: 100%;
  height: auto;
  padding: 0%;
}
</style>
