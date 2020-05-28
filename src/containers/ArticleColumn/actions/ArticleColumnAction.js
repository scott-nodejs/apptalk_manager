import http from '../../../utils/http'

export const getArticleColumnList = (data, callback) => {
  return (dispatch) => {
    http.post('/admin/column/list', data)
      .then((res) => {
        if (callback) {
          callback(res)
        }
        return dispatch({
          type: 'GET_ARTICLE_COLUMN_LIST',
          data: res
        })
      })
  }
}

export const createArticleColumn = (data, callback) => {
  return (dispatch) => {
    http.post('/admin/column/add', data)
      .then((res) => {
        if (callback) {
          callback(res)
        }
      })
  }
}

export const updateArticleColumn = (data, callback) => {
  return () => {
    http.post('/admin/column/update', data)
      .then((res) => {
        if (callback) {
          callback(res)
        }
      })
  }
}

export const deleteArticleColumn = (data, callback) => {
  return () => {
    http.post('/admin/column/delete/'+data.column_id)
      .then((res) => {
        if (callback) {
          callback(res)
        }
      })
  }
}

export const getArticleTagAll = (data, callback) => {
  return () => {
    http.get('/allTags')
      .then((res) => {
        if (callback) {
          callback(res)
        }
      })
  }
}
