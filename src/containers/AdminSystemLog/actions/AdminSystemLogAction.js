import http from '../../../utils/http'

export const getAdminSystemLogList = (data, callback) => {
  return (dispatch) => {
    http.get('/admin-system-log/list', data)
      .then((res) => {
        if (callback) {
          callback(res)
        }
        return dispatch({
          type: 'GET_ADMIN_SYSTEM_LOG_LIST',
          data: res
        })
      })
  }
}

export const deleteAdminSystemLog = (data, callback) => {
  return () => {
    http.post('/admin-system-log/delete', data)
      .then((res) => {
        if (callback) {
          callback(res)
        }
      })
  }
}
