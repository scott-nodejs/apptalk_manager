import React from 'react'
import { connect } from 'react-redux'
import {
  Icon,
  Modal,
  Table,
  Button,
  Form,
  Input,
  Select,
  Switch,
  Tag
} from 'antd'
import { Link } from 'react-router-dom'

import { getSystemConfigInfo, updateSystemConfigInfo } from '../actions'
import alert from '../../../utils/alert'

import { getUserRoleAll } from '../../UserRole/actions/UserRoleAction'

const Option = Select.Option
const FormItem = Form.Item
const confirm = Modal.confirm

@connect(({ stateSystemConfig }) => {
  return {
    stateSystemConfig
  }
})
class SystemConfig extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      is_edit: false,
      loading: false,
      asideList: []
    }
  }

  async componentDidMount() {
    this.system_config_info()
  }

  async system_config_info() {
    await this.props.dispatch(
      getSystemConfigInfo({}, result => {
        this.props.form.setFieldsValue({
          ...result.config
        })
      })
    )
  }

  handleSubmit(e) {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let {
          on_login,
          on_register,
          on_comment,
          admin_url,
          googleCode,
          isBaiduAuthPush
        } = values
        this.props.dispatch(
          updateSystemConfigInfo(
            {
              type: 'config',
              config: {
                on_login,
                on_register,
                on_comment,
                admin_url,
                googleCode,
                isBaiduAuthPush
              }
            },
            result => {
              this.system_config_info()
              this.setState({
                is_edit: false
              })
            }
          )
        )
      }
    })
  }

  render() {
    const { is_edit } = this.state
    const { getFieldDecorator } = this.props.form

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      }
    }
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0
        },
        sm: {
          span: 16,
          offset: 8
        }
      }
    }
    return (
      <div className="layout-main" id="system-config">
        <div className="layout-main-title">
          <h4 class="header-title">网站功能</h4>
        </div>

        <div className="layout-nav-btn" />

        <div className="card layout-card-view">
          <div className="card-body sc-content-view">
            <Form className="from-view" onSubmit={this.handleSubmit.bind(this)}>
              <FormItem {...formItemLayout} label="开启登录">
                {getFieldDecorator('on_login', {
                  rules: [
                    {
                      required: true,
                      message: '请选择是否开启登录！',
                      whitespace: true
                    }
                  ]
                })(
                  <Select
                    disabled={!is_edit}
                    onChange={value => {
                      this.setState({
                        type: value
                      })
                    }}
                  >
                    <Option value="yes">开启</Option>
                    <Option value="no">关闭</Option>
                  </Select>
                )}
              </FormItem>

              <FormItem {...formItemLayout} label="开启注册">
                {getFieldDecorator('on_register', {
                  rules: [
                    {
                      required: true,
                      message: '请选择是否开启注册！',
                      whitespace: true
                    }
                  ]
                })(
                  <Select
                    disabled={!is_edit}
                    onChange={value => {
                      this.setState({
                        type: value
                      })
                    }}
                  >
                    <Option value="yes">开启</Option>
                    <Option value="no">关闭</Option>
                  </Select>
                )}
              </FormItem>

              <FormItem {...formItemLayout} label="开启评论模块">
                {getFieldDecorator('on_comment', {
                  rules: [
                    {
                      required: true,
                      message: '请选择是否开启评论模块！',
                      whitespace: true
                    }
                  ]
                })(
                  <Select
                    disabled={!is_edit}
                    onChange={value => {
                      this.setState({
                        type: value
                      })
                    }}
                  >
                    <Option value="yes">开启</Option>
                    <Option value="no">关闭</Option>
                  </Select>
                )}
              </FormItem>

              <FormItem {...formItemLayout} label="后台管理界面访问地址">
                {getFieldDecorator('admin_url', {
                  rules: [
                    {
                      required: true,
                      message: '请输入后台管理界面访问地址！',
                      whitespace: true
                    }
                  ]
                })(
                  <Input
                    disabled={!is_edit}
                    placeholder="后台管理界面访问地址"
                  />
                )}
              </FormItem>

              <FormItem {...formItemLayout} label="google统计code">
                {getFieldDecorator('googleCode', {
                  rules: [
                    {
                      message: '请输入google统计code！',
                      whitespace: true
                    }
                  ]
                })(<Input disabled={!is_edit} placeholder="google统计code" />)}
              </FormItem>

              <FormItem {...formItemLayout} label="开启百度自动推送">
                {getFieldDecorator('isBaiduAuthPush', {
                  rules: [
                    {
                      message: '请选择是否开启百度自动推送！',
                      whitespace: true
                    }
                  ]
                })(
                  <Select disabled={!is_edit}>
                    <Option value="yes">开启</Option>
                    <Option value="no">关闭</Option>
                  </Select>
                )}
              </FormItem>

              <FormItem {...tailFormItemLayout}>
                {!is_edit ? (
                  <button
                    className="btn btn-info"
                    onClick={() => {
                      this.setState({
                        is_edit: true
                      })
                    }}
                    type="primary"
                  >
                    修改
                  </button>
                ) : (
                  <div>
                    <button
                      className="btn btn-primary"
                      type="primary"
                      style={{ marginRight: '10px' }}
                    >
                      确定
                    </button>

                    <button
                      className="btn btn-light"
                      onClick={() => {
                        this.setState({
                          is_edit: false
                        })
                      }}
                      type="primary"
                    >
                      取消
                    </button>
                  </div>
                )}
              </FormItem>
            </Form>
          </div>
        </div>
      </div>
    )
  }
}

const SystemConfigForm = Form.create()(SystemConfig)

export default SystemConfigForm
