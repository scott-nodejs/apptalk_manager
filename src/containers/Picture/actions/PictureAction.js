import http from '../../../utils/http'

export const getPictureList = (data, callback) => {
  return (dispatch) => {
    http.get('/admin/image/pageList', data)
      .then((res) => {
        if (callback) {
          callback(res)
        }
        return dispatch({
          type: 'GET_PICTURE_LIST',
          data: res
        })
      })
  }
}

export const createPicture = (data, callback) => {
  return (dispatch) => {
    http.post('/admin/image/create', data)
      .then((res) => {
        if (callback) {
          callback(res)
        }
      })
  }
}

export const updatePicture = (data, callback) => {
  return () => {
    http.post('/admin/image/update/'+data.id, data)
      .then((res) => {
        if (callback) {
          callback(res)
        }
      })
  }
}

export const deletePicture = (data, callback) => {
  return () => {
    http.post('/admin/image/delete/'+data.id, data)
      .then((res) => {
        if (callback) {
          callback(res)
        }
      })
  }
}
