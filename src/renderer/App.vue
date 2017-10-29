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
            <mu-list :value="pageSelected" @itemClick="setPage">
              <mu-list-item title="进行中" value="process">
                <mu-icon slot="left" value="file_download"/>
              </mu-list-item>
              <mu-list-item title="已完成" value="done">
                <mu-icon slot="left" value="done"/>
              </mu-list-item>
              <mu-list-item title="边下边播" value="player">
                <mu-icon slot="left" value="movie"/>
              </mu-list-item>
            </mu-list>
          </div>
        </div>
        <div class="content-right">
          <task-process-page v-show="pageShowStatus[0]"></task-process-page>
          <done-task-page v-show="pageShowStatus[1]"></done-task-page>
          <stream-player-page v-show="pageShowStatus[2]"></stream-player-page>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TaskProcessPage from './pages/TaskProcessPage'
import DoneTask from './components/DoneTask'
import StreamPlayer from './components/StreamPlayer'

export default {
  name: 'flasee',
  data () {
    return {
      pageSelected: 'process',
      pageShowStatus: [true, false, false]
    }
  },
  components: {
    TaskProcessPage,
    'done-task-page': DoneTask,
    'stream-player-page': StreamPlayer
  },
  watch: {
    pageSelected: function (newPage) {
      for (let i = 0; i < this.pageShowStatus.length; i++) {
        this.pageShowStatus[i] = false
      }
      switch (newPage) {
        case 'process':
          this.pageShowStatus[0] = true
          break
        case 'done':
          this.pageShowStatus[1] = true
          break
        case 'player':
          this.pageShowStatus[2] = true
          break
      }
    }
  },
  methods: {
    setPage (item) {
      this.pageSelected = item.value
    }
  }
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
