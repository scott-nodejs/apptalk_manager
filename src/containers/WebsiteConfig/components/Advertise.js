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
  Tag,
  Alert
} from 'antd'

import {
  getOptionsList,
  createOptions,
  updateOptions,
  deleteOptions
} from '../actions/WebsiteConfigAction'

const Option = Select.Option
const FormItem = Form.Item
const confirm = Modal.confirm
const { TextArea } = Input

@connect(({ stateWebsiteConfig }) => {
  return {
    stateWebsiteConfig
  }
})
class _Advertise extends React.Component {
  state = {
    columns: [
      {
        title: '序号',
        dataIndex: 'index',
        key: 'index',
        render: (text, record, index) => (
          <span
            style={{
              width: '20px',
              display: 'block'
            }}
          >{`${index + 1}`}</span>
        )
      },
      {
        title: '广告标题',
        dataIndex: 'title',
        key: 'title',
        render: (value, record) => {
          return (
            <div className="table-enable">
              {JSON.parse(record.option_value).title}
            </div>
          )
        }
      },
      {
        title: '广告链接',
        dataIndex: 'link',
        key: 'link',
        render: (value, record) => {
          return (
            <div className="table-enable">
              {JSON.parse(record.option_value).link}
            </div>
          )
        }
      },
      {
        title: '背景图片',
        dataIndex: 'img_url',
        key: 'img_url',
        render: (value, record) => {
          return (
            <div className="table-enable">
              {JSON.parse(record.option_value).img_url}
            </div>
          )
        }
      },
      {
        title: '是否可以用',
        dataIndex: 'enable',
        key: 'enable',
        render: (value, record) => {
          return (
            <div className="table-enable">
              {JSON.parse(record.option_value).enable ? (
                <Icon type="check-circle" />
              ) : (
                <Icon type="close-circle" />
              )}
            </div>
          )
        }
      },
      {
        title: '操作',
        key: 'action',
        render: (text, record) => {
          return (
            <div className="operation-btn">
              <button
                onClick={() => {
                  this._edit(record)
                }}
                className="btn btn-info"
                size="small"
                type="primary"
              >
                <Icon type="edit" />
              </button>
              <button
                className="btn btn-light"
                onClick={() => {
                  this._delete(record)
                }}
                size="small"
              >
                <Icon type="delete" />
              </button>
            </div>
          )
        }
      }
    ],
    loading: false,
    modal_visible_edit: false,
    is_create: false,
    option_id: ''
  }

  componentDidMount() {
    this._getOptionsList()
  }
  _getOptionsList = () => {
    this.props.dispatch(getOptionsList({ option_key: 'advertise' }))
  }

  _edit = data => {
    /*修改标签*/
    this.setState({
      modal_visible_edit: true,
      is_create: true,
      option_id: data.option_id
    })

    this.props.form.setFieldsValue({
      ...JSON.parse(data.option_value)
    })
  }

  showModal = () => {
    this.props.form.resetFields()
    this.setState({
      modal_visible_edit: true,
      is_create: false
    })
    /*this.props.form.setFieldsValue({
      authority_parent_title: '11'
    })*/
  }

  handleSubmit = e => {
    e.preventDefault()
    const { is_create } = this.state
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values)
        if (!is_create) {
          this.props.dispatch(
            createOptions(
              {
                option_key: 'advertise',
                option_value: JSON.stringify(values)
              },
              () => {
                this._getOptionsList()
              }
            )
          )
        } else {
          this.props.dispatch(
            updateOptions(
              {
                option_id: this.state.option_id,
                option_key: 'advertise',
                option_value: JSON.stringify(values)
              },
              () => {
                this._getOptionsList()
              }
            )
          )
        }
      }
      this.setState({
        modal_visible_edit: false
      })
    })
  }

  _delete = value => {
    confirm({
      title: '确认要删除此条广告吗？',
      content: '此操作不可逆转',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
        this.props.dispatch(
          deleteOptions({ option_id: value.option_id }, () => {
            this._getOptionsList()
          })
        )
        /*删除此条广告吗*/
      },
      onCancel() {
        console.log('Cancel')
      }
    })
  }

  render() {
    const { stateWebsiteConfig } = this.props
    const { loading, is_create } = this.state
    const { getFieldDecorator } = this.props.form

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 19 }
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
          offset: 5
        }
      }
    }

    return (
      <div className="card layout-main" id="system-config">
        <div className="card-body">
          <h4 class="header-title">系统Banner</h4>
          <button
            className="btn btn-danger"
            icon="plus"
            type="primary"
            style={{ marginBottom: '15px' }}
            onClick={() => this.showModal(0)}
          >
            创建Banner
          </button>

          <Modal
            footer={null}
            onCancel={() => {
              this.setState({
                modal_visible_edit: false
              })
            }}
            title="填写广告"
            visible={this.state.modal_visible_edit}
          >
            <Form className="from-view" onSubmit={this.handleSubmit}>
              <FormItem {...formItemLayout} label="广告标题">
                {getFieldDecorator('title', {
                  rules: [
                    {
                      message: '请输入广告标题！',
                      whitespace: true
                    }
                  ]
                })(<Input placeholder="广告标题" />)}
              </FormItem>

              <FormItem {...formItemLayout} label="广告链接">
                {getFieldDecorator('link', {
                  rules: [
                    {
                      message: '请输入广告链接！',
                      whitespace: true
                    }
                  ]
                })(<Input placeholder="广告链接" />)}
              </FormItem>

              <FormItem {...formItemLayout} hasFeedback label="背景图片">
                {getFieldDecorator('img_url', {
                  rules: [{ message: '请输入背景图片链接' }]
                })(<Input placeholder="背景图片链接" type="text" />)}
              </FormItem>

              <FormItem {...formItemLayout} label="是否有效">
                {getFieldDecorator('enable', { valuePropName: 'checked' })(
                  <Switch />
                )}
              </FormItem>

              <FormItem {...tailFormItemLayout}>
                <Button
                  className="register-btn"
                  htmlType="submit"
                  type="primary"
                >
                  {is_create ? '更新' : '创建广告'}
                </Button>
              </FormItem>
            </Form>
          </Modal>

          <Table
            columns={this.state.columns}
            dataSource={stateWebsiteConfig.advertise}
            loading={loading}
            rowKey="option_id"
          />
        </div>
      </div>
    )
  }
}

const _AdvertiseForm = Form.create()(_Advertise)

export default _AdvertiseForm
