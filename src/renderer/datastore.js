import Datastore from 'nedb'
import path from 'path'
import { remote } from 'electron'

export const task = new Datastore({
  autoload: true,
  filename: path.join(remote.app.getPath('userData'), '/tasks.db')
})

export const setting = new Datastore({
  autoload: true,
  filename: path.join(remote.app.getPath('userData'), '/setting.db')
})
