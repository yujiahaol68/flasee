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
      <mu-text-field v-model="normalNewTaskUrl" hintText="链接地址" @focus="btNewTaskUrl=''" fullWidth /><br/>
      <h3>磁力任务</h3><br/>
      <mu-text-field v-model="btNewTaskUrl" hintText="magnet:" @focus="normalNewTaskUrl=''" fullWidth/><br/>
      <mu-flat-button @click="openBtFileSelectDialog" label="选择BT种子文件"/>
      <mu-flat-button slot="actions" @click="confirmNewTask" label="确定"/>
      <mu-flat-button slot="actions" @click="closeNewTaskDialog" label="取消" secondary/>
    </mu-dialog>
    <mu-dialog :open="showNewTaskConfigDialog" title="新建BT任务">
      <h3>任务名称</h3>
      <mu-text-field v-bind:fullWidth="true" v-model="newTaskReady.title"/>
      <h4>下载目录</h4>
      <mu-text-field v-bind:fullWidth="true" v-model="newTaskReady.destination"/><br/>
      <mu-raised-button label="选择目录" labelPosition="after" @click="selectDesDir">
        <i class="iconfont icon-folder mu-icon" style="color:#fdd835;"></i>
      </mu-raised-button>
      <mu-flat-button slot="actions" @click="startToDownloadBT" label="立即下载"/>
      <mu-flat-button slot="actions" @click="cancelDownloadTorrentReady" label="取消" secondary/>
    </mu-dialog>
    <mu-toast v-if="toastShowed" :message="toastMsg" @close="hideToast"/>
  </div>
</template>

<script>
import fs from 'fs'
import rimraf from 'rimraf'
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
      completedTasks: [],
      onPlayTitle: '影片名',
      onPlayTorrentId: '',
      showPlayer: false,
      inProgress: false,
      showAddNewTaskDialog: false,
      showNewTaskConfigDialog: false,
      normalNewTaskUrl: '',
      btNewTaskUrl: '',
      toastShowed: false,
      toastMsg: ''
    }
  },
  methods: {
    handleListChange (val) {
      this.taskSelected = val
    },
    takeAction (actionValue) {
      this.actionSelected = actionValue

      switch (this.actionSelected) {
        case 'play':
          this.showPlayer = this.showPlayer || true
          this.onPlayTitle = 'Waiting...'

          this.playVideoStreamInTorrent()
          break
        case 'pause':
          this.pauseBtTask()
          break
        case 'resume':
          this.resumeBtTask()
          break
        case 'delete':
          this.deleteTaskUnFinished()
          break
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
      const newTask = this.analysisUri()

      if (newTask.kind === 'BT') {
        this.newTaskReady.torrentId = newTask.meta.infoHash
        this.newTaskReady.title = newTask.meta.name
        this.btNewTaskUrl = ''

        this.confirmBtDownload()
      }
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
        if (btFilesPath && fs.existsSync(btFilesPath)) {
          console.log(btFilesPath)
          this.showAddNewTaskDialog = false
          const fileData = fs.readFileSync(btFilesPath[0])
          this.getTorrentFileMeta(btParser(fileData))
        } else {
          this.showToast('无效下载路径，请重试')
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
        if (torrent) this.showToast('任务开始下载')

        torrent.on('download', bytes => {
          this.tasks[taskIndex].speed = this.prettyBytes(torrent.downloadSpeed)
          this.tasks[taskIndex].progress = torrent.progress * 100
        })

        torrent.on('done', () => {
          const completedTask = this.tasks.splice(taskIndex, 1)
          const { name, kind, destination } = completedTask

          this.completedTasks.push({
            name,
            kind,
            destination
          })

          const doneNotification = new Notification('任务完成', { body: name + ' 下载成功' })
          setTimeout(() => doneNotification.close(), 5000)
        })
      })
    },
    startToDownloadBT () {
      const { torrentId, destination, title } = this.newTaskReady
      if (!this.$btClient.get(torrentId)) {
        this.showNewTaskConfigDialog = false
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

        this.addTorrentToClient(taskIndex, torrentId, destination)
        this.clearNewBtTask()
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
    deleteTaskUnFinished () {
      const taskIndex = this.taskSelected
      const { destination, name } = this.tasks[taskIndex]
      const absPath = destination + '/' + name

      if (fs.existsSync(absPath)) {
        if (fs.lstatSync(absPath).isDirectory()) {
          rimraf(absPath, err => {
            if (err) throw err
            this.showToast('任务已删除')
          })
        } else {
          fs.unlink(absPath, err => {
            if (err) throw err
            this.showToast('任务已删除')
          })
        }
      } else {
        this.showToast('任务已删除')
      }

      this.removeFromTasks(taskIndex)
    },
    removeFromTasks (index) {
      return this.tasks.splice(index, 1)
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
    },
    analysisUri () {
      // TODO: Normal task uri
      if (this.btNewTaskUrl && this.btNewTaskUrl.substr(0, 7) === 'magnet:') {
        return {
          kind: 'BT',
          meta: btParser(this.btNewTaskUrl)
        }
      }
    },
    clearNewBtTask () {
      this.newTaskReady.title = ''
      this.newTaskReady.destination = ''
      this.newTaskReady.files = []
      this.newTaskReady.torrentId = ''
    },
    showToast (msg) {
      this.toastMsg = msg
      this.toastShowed = true
      if (this.toastTimer) clearTimeout(this.toastTimer)
      this.toastTimer = setTimeout(() => {
        this.toastShowed = false
        this.toastMsg = ''
      }, 2000)
    },
    hideToast () {
      this.toastShowed = false
      if (this.toastTimer) clearTimeout(this.toastTimer)
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
  height: 100vh;
  width: 100vw;
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
  height: 100vh;
  float: left;
  background-color: white;
  margin-bottom: 0px;
  padding-bottom: 0px;
  word-wrap: break-word;
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
