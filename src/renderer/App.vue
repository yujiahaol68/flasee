<template>
  <div id="app">
    <div class="layout">
      <div class="header">
        <div class="logo">
          Flasee Downloader
        </div>
      </div>
      <div class="content">
        <div class="content-left">
          <div class="container">
            <mu-list>
              <mu-list-item title="进行中" to="/">
                <mu-icon slot="left" value="file_download"/>
              </mu-list-item>
              <mu-list-item title="已完成" to="/done">
                <mu-icon slot="left" value="done"/>
              </mu-list-item>
              <mu-list-item title="边下边播" to="/stream_play">
                <mu-icon slot="left" value="movie"/>
              </mu-list-item>
            </mu-list>
          </div>
        </div>
        <div class="content-right">
          <keep-alive>
            <transition name="fade">
              <router-view></router-view>
            </transition>
          </keep-alive>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'flasee'
  }
</script>

<style>

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

::-webkit-scrollbar {
  display: none;
}

.layout {
  background-color: rgb(236, 236, 236);
  height: 100vh;
  width: 100vw;
}

.header {
  background-color: #26a69a;
}

.logo {
  font-size: 24px;
  color: white;
  display: inline-block;
  padding: 10px 20px;
}

.content {
  overflow: hidden;
}

.content-left {
  width: 20%;
  height: 100vh;
  float: left;
  background-color: white;
  margin-bottom: 0px;
  padding-bottom: 0px;
  word-wrap: break-word;
}

.content-right{
  width: 80%;
  display: inline-block;
  background-color: rgba(0, 0, 0, 0)
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .2s
}

.fade-enter, .fade-leave-to {
  opacity: 0
}
</style>
