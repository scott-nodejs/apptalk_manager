import http from '../../../utils/http'

export const getAdminIndexStatistics = (data, callback) => {
  return (dispatch) => {
    http.get('/admin/statistics', data)
      .then((res) => {
        if (callback) {
          callback(res)
        }
        return dispatch({
          type: 'SET_ADMIN_COUNT',
          data: res
        })
      })
  }
}
