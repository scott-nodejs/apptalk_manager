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
  Breadcrumb,
  Tag,
  Upload
} from 'antd'

import './Picture.scss'
import {
  getPictureList,
  createPicture,
  updatePicture,
  deletePicture
} from '../actions/PictureAction'
import alert from '../../../utils/alert'

const Option = Select.Option
const FormItem = Form.Item
const confirm = Modal.confirm
const { TextArea } = Input

class Picture extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
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
            >
              {Number((this.state.pagination.current - 1) * 10) + index + 1}
            </span>
          )
        },
        {
          title: '图片标题',
          dataIndex: 'picture_title',
          key: 'picture_title'
        },
        {
          title: '图片说明',
          dataIndex: 'description',
          key: 'description'
        },
        {
          title: '图片地址',
          dataIndex: 'picture_url',
          key: 'picture_url'
        },
        {
          title: '图片演示',
          dataIndex: 'picture_url',
          key: 'picture_show',
          render: (value, record) => {
            return (
              <div className="admin-table-img-show">
                <img src={record.picture_url} alt="" />
              </div>
            )
          }
        },
        {
          title: '是否可用',
          dataIndex: 'enable',
          key: 'enable',
          render: (value, record) => {
            return (
              <div className="table-is-login">
                {value ? (
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
                  size="small"
                  type="primary"
                  className="btn btn-info"
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
      pagination: {
        current: 1
      },
      loading: false,
      confirmDirty: false,
      modal_visible_edit: false,
      modal_visible_authority: false,
      is_create: true,
      menu_text: ['', '首页轮播图', '首页广告'],
      upload_prop: {
        name: 'file',
        action: '/api-admin/v1/upload/picture',
        headers: {
          'x-access-token': localStorage.box_tokens
        },
        onChange: this.handleChange,
        listType: 'picture-card'
      },
      fileList: []
    }
  }

  componentDidMount() {
    this.fetchPictureList()
  }

  _edit = data => {
    /*修改图片*/
    this.setState({
      modal_visible_edit: true,
      is_create: false
    })
    this.props.dispatch({ type: 'SET_PICTURE_INFO', data: data })
    this.props.form.setFieldsValue({
      picture_title: data.picture_title,
      description: data.description,
      picture_url: data.picture_url,
      enable: data.enable
    })
    let fileList = [
      {
        uid: -1,
        status: 'done',
        url: data.picture_url
      }
    ]
    this.setState({
      fileList
    })
  }

  _delete = value => {
    this.props.dispatch({ type: 'SET_PICTURE_INFO', data: value })
    confirm({
      title: '确认要删除此标签吗？',
      content: '此操作不可逆转',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
        this.fetchDeletePicture({
          picture_id: this.props.statePicture.current_info.picture_id
        })
        /*删除标签*/
      },
      onCancel() {
        console.log('Cancel')
      }
    })
  }

  handleChange = info => {
    let fileList = info.fileList

    // 1. Limit the number of uploaded files
    //    Only to show two recent uploaded files, and old ones will be replaced by the new
    fileList = fileList.slice(-1)

    // 2. read from response and show file link
    fileList = fileList.map(file => {
      if (file.response) {
        // Component will show file.url as link
        file.url = file.response.data.filename
      }
      return file
    })

    // 3. filter successfully uploaded files according to response from server
    fileList = fileList.filter(file => {
      if (file.response) {
        return file.response.state === 'success'
      }
      return true
    })

    this.setState({ fileList })
  }

  TablePageChange = async pages => {
    let pagination = {}
    pagination.current = pages.current
    await this.setState({
      pagination: {
        current: pages.current
      }
    })
    this.fetchPictureList(pages)
  }

  showModal = () => {
    this.props.form.resetFields()
    this.setState({
      modal_visible_edit: true,
      is_create: true,
      fileList: []
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
        if (is_create) {
          this.fetchCreatePicture(values)
        } else {
          this.fetchUpdatePicture(values)
        }
      }
    })
  }

  handleConfirmBlur = e => {
    const value = e.target.value
    this.setState({ confirmDirty: this.state.confirmDirty || !!value })
  }

  normFile = e => {
    if (Array.isArray(e)) {
      return e
    }
    return e && e.fileList
  }

  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true })
    }
    callback()
  }

  fetchCreatePicture = values => {
    /*创建图片*/
    this.props.dispatch(
      createPicture(values, res => {
        alert.message_success('创建图片成功')
        this.fetchPictureList()
        this.setState({
          modal_visible_edit: false
        })
      })
    )
  }

  fetchUpdatePicture = values => {
    /*修改图片*/
    this.props.dispatch(
      updatePicture(
        {
          picture_id: this.props.statePicture.current_info.picture_id,
          ...values
        },
        res => {
          alert.message_success('修改图片成功')
          this.fetchPictureList()
          this.setState({
            modal_visible_edit: false
          })
        }
      )
    )
  }

  fetchDeletePicture = values => {
    /*删除图片*/
    this.props.dispatch(
      deletePicture(values, res => {
        alert.message_success('删除图片成功')
        this.fetchPictureList()
      })
    )
  }

  fetchPictureList = () => {
    /*获取管理员用户带分页的列表*/
    const that = this
    this.setState({ loading: true })
    const {
      pagination: { current }
    } = this.state
    this.props.dispatch(
      getPictureList({ params: { page: current } }, res => {
        let pagination = { ...that.state.pagination }
        pagination.total = res.count
        pagination.current = current
        that.setState({
          loading: false,
          pagination
        })
      })
    )
  }

  render() {
    const { statePicture } = this.props
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
      <div className="layout-main">
        <div className="layout-main-title">
          <Breadcrumb>
            <Breadcrumb.Item href="#/manager/index">
              <Icon type="home" />
            </Breadcrumb.Item>
            <Breadcrumb.Item href="#/manager/index">
              <span>主页</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item href="#">
              <span>网站管理</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>图片管理</Breadcrumb.Item>
          </Breadcrumb>
        </div>

        <div className="layout-nav-btn">
          <button
            className="btn btn-danger"
            icon="plus"
            type="primary"
            onClick={() => this.showModal(0)}
          >
            创建图片
          </button>
        </div>

        <div className="card picture-view">
          <div className="card-body">
            <Modal
              footer={null}
              onCancel={() => {
                this.setState({
                  modal_visible_edit: false
                })
              }}
              title="填写内容"
              visible={this.state.modal_visible_edit}
            >
              <Form className="from-view" onSubmit={this.handleSubmit}>
                <FormItem {...formItemLayout} label="图片标题">
                  {getFieldDecorator('picture_title', {
                    rules: [
                      {
                        required: true,
                        message: '请输入图片标题！',
                        whitespace: true
                      }
                    ]
                  })(<Input placeholder="图片标题" />)}
                </FormItem>

                <FormItem {...formItemLayout} label="图片说明">
                  {getFieldDecorator('description', {
                    rules: [
                      {
                        required: true,
                        message: '图片说明！',
                        whitespace: true
                      }
                    ]
                  })(<Input placeholder="图片说明" />)}
                </FormItem>

                <FormItem {...formItemLayout} label="Upload">
                  {getFieldDecorator('picture_url', {
                    getValueFromEvent: this.normFile
                  })(
                    <Upload
                      {...this.state.upload_prop}
                      fileList={this.state.fileList}
                    >
                      <div>
                        <Icon type="plus" />
                        <div className="ant-upload-text">Upload</div>
                      </div>
                    </Upload>
                  )}
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
                    {is_create ? '创建标签' : '更新'}
                  </Button>
                </FormItem>
              </Form>
            </Modal>

            <Table
              columns={this.state.columns}
              dataSource={statePicture.list}
              loading={loading}
              onChange={this.TablePageChange.bind(this)}
              pagination={this.state.pagination}
              rowKey="picture_id"
            />
          </div>
        </div>
      </div>
    )
  }
}

const PictureForm = Form.create()(Picture)

export default connect(({ statePicture }) => {
  return {
    statePicture
  }
})(PictureForm)
