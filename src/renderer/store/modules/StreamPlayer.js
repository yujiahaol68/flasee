const state = {
  title: '',
  videoFile: null
}

const mutations = {
  ADD_STREAM_TARGET (state, newVideo) {
    state = Object.assign({}, newVideo)
  }
}

const actions = {
  playNewVideo ({ commit }, newVideo) {
    commit('ADD_STREAM_TARGET', newVideo)
  }
}

const getters = {
  videoTitle: state => state.title,
  videoFile: state => state.videoFile
}

export default {
  state,
  mutations,
  actions,
  getters
}
