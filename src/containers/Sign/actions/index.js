import http from '../../../utils/http'
import { message } from 'antd'
import axios from 'axios'

export const signIn = (data, func) => {
  return dispatch => {
    axios.post('/api-admin/v1/sign-in', data).then(res => {
      if (func) {
        func(res.data)
      }
    })
  }
}

export const signUp = (data, func) => {
  return dispatch => {
    http.post('/api-admin/v1/admin-user/create', data).then(res => {
      if (func) {
        func(res.data)
      }
    })
  }
}
