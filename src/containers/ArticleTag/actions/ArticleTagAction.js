import http from '../../../utils/http'

export const getArticleTagList = (data, callback) => {
  return (dispatch) => {
    http.post('/admin/tag/list', data)
      .then((res) => {
        if (callback) {
          callback(res)
        }
        return dispatch({
          type: 'GET_ARTICLE_TAGS_LIST',
          data: res
        })
      })
  }
}

export const createArticleTag = (data, callback) => {
  return (dispatch) => {
    http.post('/article-tag/create', data)
      .then((res) => {
        if (callback) {
          callback(res)
        }
      })
  }
}

export const updateArticleTag = (data, callback) => {
  return () => {
    http.post('/admin/tag/update', data)
      .then((res) => {
        if (callback) {
          callback(res)
        }
      })
  }
}

export const deleteArticleTag = (data, callback) => {
  return () => {
    http.post('/admin/tag/delete', data)
      .then((res) => {
        if (callback) {
          callback(res)
        }
      })
  }
}
