<template>
  <div class="layout">
    <div class="header">
      <div class="logo">
        flasee Downloader
      </div>
    </div>
    <div v-if="inProgress">
      <mu-linear-progress color="blue"/>
    </div>
    <div class="content">
      <div class="content-left">
        <div class="container">
          <mu-flat-button icon="add_box" class="flat-button" @click="toggleNewTaskDialog"/>
        </div>
        <mu-divider/>
        <mu-list @change="handleListChange" :value="taskSelected">
          <mu-sub-header>任务列表</mu-sub-header>
          <mu-list-item v-for="(task, index) in tasks" v-bind:key="index" v-bind:title="task.name" v-bind:value="index" >
            <mu-icon slot="left" value="insert_drive_file" />
            <mu-icon-menu slot="right" icon="more_vert" tooltip="操作" :value="actionSelected" @change="takeAction" v-bind:desktop="true">
              <mu-menu-item value="play" title="播放" />
              <mu-menu-item value="pause" title="暂停任务" />
              <mu-menu-item value="delete" title="删除任务" />
            </mu-icon-menu>
          </mu-list-item>
        </mu-list>
      </div>
      <div class="content-right">
        <transition name="fade">
          <div v-if="showPlayer">
            <mu-sub-header>{{ onPlayTitle }}</mu-sub-header>
            <video class="player" controls></video>
          </div>
        </transition>
      </div>
    </div>

    <div>
      <mu-dialog :open="showAddNewTaskDialog" title="添加新任务" @close="closeNewTaskDialog">
        普通任务<br/>
        <mu-text-field v-model="normalNewTaskUrl" hintText="普通链接地址" fullWidth /><br/>
        磁力任务<br/>
        <mu-text-field v-model="btNewTaskUrl" hintText="磁力链接地址" fullWidth/><br/>
        <mu-flat-button slot="actions" @click="confirmNewTask" label="确定"/>
        <mu-flat-button slot="actions" @click="closeNewTaskDialog" label="取消" secondary/>
      </mu-dialog>
    </div>
  </div>
</template>

<script>
export default {
  name: 'landing-page',
  data () {
    return {
      actionSelected: null,
      taskSelected: null,
      tasks: [
        {
          name: '任务1',
          kind: 'BT',
          canStreamPlay: true,
          torrentId: 'https://rarbg.is/download.php?id=7p93ke2&f=BBC.Drugs.Map.of.Britain.Fentanyl.Deadlier.Than.Heroin.720p.HDTV.x264.AAC.MVGroup.org.mp4-[rarbg.to].torrent'
        },
        {
          name: '任务2',
          kind: 'BT',
          canStreamPlay: true,
          torrentId: 'https://rarbg.is/download.php?id=jkciz3b&f=The.End.of.Memory.1080.HDTV.x264.AAC.MVGroup.org.mp4-[rarbg.to].torrent'
        }
      ],
      onPlayTitle: '影片名',
      onPlayTorrentId: '',
      showPlayer: false,
      inProgress: false,
      showAddNewTaskDialog: false,
      normalNewTaskUrl: '',
      btNewTaskUrl: ''
    }
  },
  methods: {
    handleListChange (val) {
      this.taskSelected = val
    },
    takeAction (actionValue) {
      this.actionSelected = actionValue
      this.onPlayTitle = 'Waiting...'

      if (this.actionSelected === 'play') {
        if (this.onPlayTorrentId) {
          const onPlayTorrent = this.$btClient.get(this.onPlayTorrentId)
          onPlayTorrent.pause()
        }
        this.playVideoStreamInTorrent()
      }
    },
    playVideoStreamInTorrent () {
      console.log(this.taskSelected, this.actionSelected)
      this.showPlayer = this.showPlayer || true
      // TODO: move out of add action
      this.$btClient.add(this.tasks[this.taskSelected].torrentId, torrent => {
        const file = torrent.files.find(file => {
          return file.name.endsWith('.mp4')
        })

        this.onPlayTitle = file.name
        this.onPlayTorrentId = torrent.magnetURI

        const videoElement = document.getElementsByTagName('video')[0]
        if (this.onPlayTorrentId !== '') {
          videoElement.pause()
          videoElement.src = ''
          videoElement.load()
        }
        file.renderTo('.player')
      })
    },
    toggleNewTaskDialog () {
      this.showAddNewTaskDialog = true
    },
    closeNewTaskDialog () {
      this.showAddNewTaskDialog = false
    },
    confirmNewTask () {
      this.showAddNewTaskDialog = false
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

#wrapper {
  background:
    radial-gradient(
      ellipse at top left,
      rgba(255, 255, 255, 1) 40%,
      rgba(229, 229, 229, .9) 100%
    );
  height: 100vh;
  padding: 60px 80px;
  width: 100vw;
}

.layout{
  background-color: rgb(236, 236, 236);
}

.header{
  background-color: #26a69a;
}

.logo{
  font-size: 24px;
  color: white;
  display: inline-block;
  padding: 10px 20px;
}

.nav{
  display: inline-block;
  width: calc(100% - 150px);
  margin: 0 auto;
}

.content{
  overflow: hidden;
}

.content-left{
  width: 30%;
  float: left;
  background-color: white;
  margin-bottom: 0px;
  padding-bottom: 0px;
}

.content-right{
  width: 70%;
  display: inline-block;
  float: right;
  padding: 10px 5px;
  background-color: rgba(0, 0, 0, 0)
}

.player {
  max-width: 100%;
  height: auto;
  padding: 0%;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s
}
.fade-enter, .fade-leave-to /* .fade-leave-active in below version 2.1.8 */ {
  opacity: 0
}

.container{
  display: flex;
}

.flat-button {
  margin: 1px;
}
</style>
