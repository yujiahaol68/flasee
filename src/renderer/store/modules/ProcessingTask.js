const state = new Map()

const mutations = {
  NEW_TASK_PROCESSING (state, { infoHash, initPosition }) {
    state.set(infoHash, initPosition)
  },
  TASK_PAUSE (state, infoHash) {
    state.delete(infoHash)
  },
  A_TASK_DONE_OR_DEL (state, { infoHash, position }) {
    const removedTaskIndex = state.get(infoHash)
    state.forEach((value, key) => {
      if (value > removedTaskIndex) state.set(key, value - 1)
    }, state)
    state.delete(infoHash)
  }
}

const actions = {
  taskPause ({ commit }, infoHash) {
    commit('TASK_PAUSE', infoHash)
  },
  newTaskProcess ({ commit }, { infoHash, initPosition }) {
    commit('NEW_TASK_PROCESSING', { infoHash, initPosition })
  },
  removedFromProcessing ({ commit }, { infoHash, position }) {
    commit('A_TASK_DONE_OR_DEL', { infoHash, position })
  }
}

const getters = {
  getTaskIndexByHash: (state, getters) => (infoHash) => {
    return state.get(infoHash)
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
