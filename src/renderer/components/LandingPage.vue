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
          <mu-flat-button icon="add" color="#37474f" class="flat-button" @click="toggleNewTaskDialog"/>
          <mu-flat-button icon="history" color="#78909c" class="flat-button"/>
        </div>
        <mu-divider/>
        <mu-list @change="handleListChange" :value="taskSelected">
          <mu-sub-header>进行中的任务</mu-sub-header>
          <mu-list-item v-for="(task, index) in tasks" v-bind:key="index" v-bind:title="task.name" v-bind:value="index" v-bind:describeText="task.speed">
            <mu-icon slot="left" value="insert_drive_file" color="blue"/>
            <mu-icon-menu slot="right" icon="more_vert" tooltip="操作" :value="actionSelected" @change="takeAction" v-bind:desktop="true">
              <mu-menu-item value="play" title="播放" />
              <mu-menu-item v-show="task.downLoading" value="pause" title="暂停下载" />
              <mu-menu-item v-show="!task.downLoading" value="resume" title="继续任务" />
              <mu-menu-item value="delete" title="删除任务" />
            </mu-icon-menu>
            <mu-linear-progress mode="determinate" v-bind:value="task.progress" color="#009688"/>
          </mu-list-item>
        </mu-list>
      </div>
      <div class="content-right">
        <transition name="fade">
          <div v-show="showPlayer">
            <mu-sub-header>{{ onPlayTitle }}</mu-sub-header>
            <video class="player" controls></video>
          </div>
        </transition>
      </div>
    </div>

    <mu-dialog :open="showAddNewTaskDialog" title="添加新任务" @close="closeNewTaskDialog">
      <h3>普通任务</h3><br/>
      <mu-text-field v-model="normalNewTaskUrl" hintText="链接地址" fullWidth /><br/>
      <h3>磁力任务</h3><br/>
      <mu-text-field v-model="btNewTaskUrl" hintText="magnet:" fullWidth/><br/>
      <mu-flat-button @click="openBtFileSelectDialog" label="选择BT种子文件"/>
      <mu-flat-button slot="actions" @click="confirmNewTask" label="确定"/>
      <mu-flat-button slot="actions" @click="closeNewTaskDialog" label="取消" secondary/>
    </mu-dialog>
    <mu-dialog :open="showNewTaskConfigDialog" title="新建BT任务">
      <h3>任务名称</h3>
      <mu-text-field v-bind:fullWidth="true" v-model="newTaskReady.title"/>
      <h4>下载目录</h4>
      <mu-text-field v-bind:fullWidth="true" v-model="newTaskReady.destination"/><br/>
      <mu-raised-button label="选择目录" @click="selectDesDir" icon="folder" />
      <mu-flat-button slot="actions" @click="startToDownloadBT" label="立即下载"/>
      <mu-flat-button slot="actions" @click="cancelDownloadTorrentReady" label="取消" secondary/>
    </mu-dialog>
  </div>
</template>

<script>
import fs from 'fs'
import btParser from 'parse-torrent'

export default {
  name: 'landing-page',
  data () {
    return {
      actionSelected: null,
      taskSelected: null,
      newTaskReady: {
        torrentId: '',
        title: '',
        files: [],
        destination: ''
      },
      tasks: [
        {
          name: '任务1',
          kind: 'BT',
          canStreamPlay: true,
          torrentId: 'https://rarbg.is/download.php?id=7p93ke2&f=BBC.Drugs.Map.of.Britain.Fentanyl.Deadlier.Than.Heroin.720p.HDTV.x264.AAC.MVGroup.org.mp4-[rarbg.to].torrent',
          progress: 30,
          downLoading: true,
          speed: '0 kb/s',
          destination: ''
        },
        {
          name: '任务2',
          kind: 'BT',
          canStreamPlay: true,
          torrentId: 'https://rarbg.is/download.php?id=jkciz3b&f=The.End.of.Memory.1080.HDTV.x264.AAC.MVGroup.org.mp4-[rarbg.to].torrent',
          progress: 60,
          downLoading: false,
          speed: '0 kb/s',
          destination: ''
        }
      ],
      onPlayTitle: '影片名',
      onPlayTorrentId: '',
      showPlayer: false,
      inProgress: false,
      showAddNewTaskDialog: false,
      showNewTaskConfigDialog: false,
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

      if (this.actionSelected === 'play') {
        this.showPlayer = this.showPlayer || true
        this.onPlayTitle = 'Waiting...'

        this.playVideoStreamInTorrent()
      } else if (this.actionSelected === 'pause') {
        this.pauseBtTask()
      } else if (this.actionSelected === 'resume') {
        this.resumeBtTask()
      }
    },
    getSelectedTask () {
      if (this.tasks[this.taskSelected].kind === 'BT') {
        return this.$btClient.get(this.tasks[this.taskSelected].torrentId)
      } else {
        // TODO: return no-bt task
      }
    },
    playVideoStreamInTorrent () {
      const torrent = this.getSelectedTask()
      const file = torrent.files.find(file => {
        return file.name.endsWith('.mp4')
      })

      if (file) {
        this.onPlayTitle = file.name
        this.onPlayTorrentId = torrent.infoHash

        file.renderTo('.player')
      } else {
        console.log('Only support mp4 file')
      }
    },
    toggleNewTaskDialog () {
      this.showAddNewTaskDialog = true
    },
    closeNewTaskDialog () {
      this.showAddNewTaskDialog = false
    },
    confirmNewTask () {
      this.showAddNewTaskDialog = false
    },
    selectDesDir () {
      this.$electron.remote.dialog.showOpenDialog({
        title: '下载至',
        properties: ['openDirectory']
      }, desPaths => {
        if (desPaths) {
          this.newTaskReady.destination = desPaths[0]
        }
      })
    },
    openBtFileSelectDialog () {
      this.$electron.remote.dialog.showOpenDialog({
        title: '选择BT文件',
        properties: ['openFile'],
        filters: [
          {name: 'BT种子文件', extensions: ['torrent']}
        ]
      }, btFilesPath => {
        if (btFilesPath) {
          console.log(btFilesPath)
          this.showAddNewTaskDialog = false
          const fileData = fs.readFileSync(btFilesPath[0])
          this.getTorrentFileMeta(btParser(fileData))
        }
      })
    },
    getTorrentFileMeta (torrentInfo) {
      console.log(torrentInfo)
      this.newTaskReady.torrentId = torrentInfo.infoHash
      this.newTaskReady.title = torrentInfo.name
      this.newTaskReady.files = torrentInfo.files
      this.showAddNewTaskDialog = false
      this.confirmBtDownload()
    },
    confirmBtDownload () {
      this.showNewTaskConfigDialog = true
    },
    addTorrentToClient (taskIndex, torrentId, destination) {
      this.$btClient.add(torrentId, { path: destination }, torrent => {
        torrent.on('download', bytes => {
          this.tasks[taskIndex].speed = this.prettyBytes(torrent.downloadSpeed)
          this.tasks[taskIndex].progress = torrent.progress * 100
        })
      })
    },
    startToDownloadBT () {
      const { torrentId, destination, title } = this.newTaskReady
      if (!this.$btClient.get(torrentId)) {
        const taskIndex = this.tasks.length
        this.tasks.push({
          name: title,
          kind: 'BT',
          torrentId: torrentId,
          canStreamPlay: false,
          progress: 0,
          downLoading: true,
          speed: '0 kb/s',
          destination: destination
        })
        this.showNewTaskConfigDialog = false
        this.$btClient.add(torrentId, { path: destination }, torrent => {
          torrent.on('download', bytes => {
            this.tasks[taskIndex].speed = this.prettyBytes(torrent.downloadSpeed)
            this.tasks[taskIndex].progress = torrent.progress * 100
          })
        })
      }
    },
    pauseBtTask () {
      const torrent = this.getSelectedTask()
      torrent.destroy(err => {
        if (err) throw err
        this.tasks[this.taskSelected].downLoading = false
        this.tasks[this.taskSelected].speed = '0 kb/s'
      })
    },
    resumeBtTask () {
      const taskIndex = this.taskSelected
      const { torrentId, destination } = this.tasks[taskIndex]
      console.log(taskIndex, torrentId, destination)
      this.tasks[taskIndex].downLoading = true

      this.addTorrentToClient(torrentId, torrentId, destination)
    },
    cancelDownloadTorrentReady () {
      console.log('user do not want to download this')
    },
    prettyBytes (num) {
      const units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      if (num < 1) return num + ' B'
      const exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1)
      num = Number((num / Math.pow(1000, exponent)).toFixed(2))
      const unit = units[exponent]
      return num + ' ' + unit + '/s'
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
