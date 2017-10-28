const state = {
  title: '',
  videoFile: null
}

const mutations = {
  ADD_STREAM_TARGET (state, { title, videoFile }) {
    state.title = title
    state.videoFile = videoFile
  }
}

const actions = {
  playNewVideo ({ commit }, newVideo) {
    commit('ADD_STREAM_TARGET', newVideo)
  }
}

const getters = {
  videoTitle: (state, getters) => {
    return state.title
  },
  videoFile: (state, getters) => {
    return state.videoFile
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
