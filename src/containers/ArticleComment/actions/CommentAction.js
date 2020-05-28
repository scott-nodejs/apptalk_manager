import http from '../../../utils/http'
import qs from 'qs'

export const getCommentList = (data, callback) => {
  return dispatch => {
    http.post('/admin/comment/list', qs.stringify(data)).then(res => {
      if (callback) {
        callback(res)
      }
      return dispatch({
        type: 'GET_COMMENT_LIST',
        data: res
      })
    })
  }
}

export const updateComment = (data, callback) => {
  return () => {
    http.post('/admin/comment/update/'+data.id, qs.stringify(data)).then(res => {
      if (callback) {
        callback(res)
      }
    })
  }
}

export const deleteComment = (data, callback) => {
  return () => {
    http.delete('/admin/comment/delete/'+data.id).then(res => {
      if (callback) {
        callback(res)
      }
    })
  }
}
