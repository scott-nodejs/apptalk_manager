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
  Tag
} from 'antd'
import { Link } from 'react-router-dom'

import './AdminUser.scss'
import {
  getAdminUserList,
  createAdminUser,
  editAdminUser,
  deleteAdminUser,
  getAdminRoleAll,
  createAdminUserRole
} from '../actions/AdminUserAction'
import alert from '../../../utils/alert'

const Option = Select.Option
const FormItem = Form.Item
const confirm = Modal.confirm

class AdminUser extends React.Component {
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
          title: '账户',
          dataIndex: 'account',
          key: 'account'
        },
        {
          title: '昵称',
          dataIndex: 'nickname',
          key: 'nickname'
        },
        {
          title: '角色组',
          dataIndex: 'rule_name',
          key: 'rule_name',
          render: (text, record) => {
            return (
              <div className="operation-btn">
                {/* <Tag color="orange">超级管理员</Tag>*/}
                {this.currentUserRole(record) ? (
                  <Tag color="orange">
                    {this.currentUserRole(record).role_name}
                  </Tag>
                ) : (
                  <Tag color="#666">无</Tag>
                )}
              </div>
            )
          }
        },
        {
          title: '邮箱',
          dataIndex: 'email',
          key: 'email'
        },
        {
          title: '手机',
          dataIndex: 'phone',
          key: 'phone'
        },
        /*{
          title: '注册时间',
          dataIndex: 'reg_time',
          key: 'reg_time'
        },
        {
          title: '最后登陆时间',
          dataIndex: 'last_sign_time',
          key: 'last_sign_time'
        },
        {
          title: '注册ip',
          dataIndex: 'reg_ip',
          key: 'reg_ip'
        },
        {
          title: '最后登陆ip',
          dataIndex: 'last_sign_ip',
          key: 'last_sign_ip'
        },*/
        {
          title: '是否可以登陆',
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
              <div className="operation-btn" style={{ width: '250px' }}>
                <button
                  onClick={() => {
                    this.editUser(record)
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
                    this.deleteUser(record)
                  }}
                  size="small"
                >
                  <Icon type="delete" />
                </button>
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    await this.props.dispatch({
                      type: 'SET_ADMIN_CURRENT_USER_INFO',
                      data: record
                    })
                    this.setState({
                      modal_visible_authority: true
                    })
                  }}
                  size="small"
                >
                  设置角色
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
      modal_visible_register: false,
      modal_visible_authority: false,
      is_create: true,
      role_id: ''
    }
  }

  componentDidMount() {
    this.initAdminUserPage()
  }

  async initAdminUserPage() {
    /*初始化获取所有列表*/
    await this.fetchAdminUserList()
    /*管理员用户列表*/
    await this.props.dispatch(getAdminRoleAll())
    /*所有角色列表*/
  }

  editUser = data => {
    /*修改用户*/
    this.setState({
      modal_visible_register: true,
      is_create: false
    })
    this.props.dispatch({ type: 'SET_ADMIN_CURRENT_USER_INFO', data: data })
    this.props.form.setFieldsValue({
      account: data.account,
      nickname: data.nickname,
      email: data.email,
      phone: data.phone,
      enable: data.enable,
      password: '',
      confirm: ''
    })
  }

  deleteUser = value => {
    this.props.dispatch({ type: 'SET_ADMIN_CURRENT_USER_INFO', data: value })
    confirm({
      title: '确认要删除此用户吗？',
      content: '此操作不可逆转',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
        this.fetchAdminUserDelete({
          uid: this.props.stateAdminUser.current_user_info.uid
        })
        /*删除管理员用户*/
      },
      onCancel() {
        console.log('Cancel')
      }
    })
  }

  currentUserRole = value => {
    /*获取当前管理员用户的角色*/
    const { stateAdminUser } = this.props
    const { current_user_info, admin_role_all } = stateAdminUser
    let curr_info = value || current_user_info
    let curr_role = ''
    admin_role_all.map(item => {
      if (item.role_id === curr_info.admin_role_ids) {
        curr_role = item
      }
    })
    return curr_role
  }

  TablePageChange = async pages => {
    let pagination = {}
    pagination.current = pages.current
    await this.setState({
      pagination: {
        current: pages.current
      }
    })
    this.fetchAdminUserList(pages)
  }

  showModal = () => {
    this.props.form.resetFields()
    this.setState({
      modal_visible_register: true,
      is_create: true
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
        if (is_create) {
          this.fetchAdminUserCreate(values)
        } else {
          this.fetchAdminUserEdit(values)
        }
      }
    })
  }

  handleConfirmBlur = e => {
    const value = e.target.value
    this.setState({ confirmDirty: this.state.confirmDirty || !!value })
  }
  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form
    if (value && value !== form.getFieldValue('password')) {
      callback('两次输入的密码不一致！')
    } else {
      callback()
    }
  }

  selectRole = value => {
    this.setState({
      role_id: value
    })
  }
  handleSubmitAuthority = () => {
    if (this.state.role_id) {
      this.props.dispatch(
        createAdminUserRole(
          {
            /*创建管理员用户角色*/
            role_id: this.state.role_id,
            uid: this.props.stateAdminUser.current_user_info.uid
          },
          () => {
            this.setState({
              modal_visible_authority: false
            })
            this.initAdminUserPage()
            alert.message_success('角色更新成功')
          }
        )
      )
    } else {
      alert.message_error('请选择角色类型')
    }
  }

  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true })
    }
    callback()
  }

  fetchAdminUserCreate = values => {
    /*创建管理员用户*/
    this.props.dispatch(
      createAdminUser(values, res => {
        alert.message_success('创建成功')
        this.fetchAdminUserList()
        this.setState({
          modal_visible_register: false
        })
      })
    )
  }

  fetchAdminUserEdit = values => {
    /*修改管理员用户账户*/
    this.props.dispatch(
      editAdminUser(
        { uid: this.props.stateAdminUser.current_user_info.uid, ...values },
        res => {
          alert.message_success('修改用户成功')
          this.fetchAdminUserList()
          this.setState({
            modal_visible_register: false
          })
        }
      )
    )
  }

  fetchAdminUserDelete = values => {
    /*删除管理员用户*/
    this.props.dispatch(
      deleteAdminUser(values, res => {
        alert.message_success('删除用户成功')
        this.fetchAdminUserList()
      })
    )
  }

  fetchAdminUserList = () => {
    /*获取管理员用户带分页的列表*/
    const that = this
    this.setState({ loading: true })
    const {
      pagination: { current }
    } = this.state
    this.props.dispatch(
      getAdminUserList({ params: { page: current } }, res => {
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
    const { stateAdminUser } = this.props
    const { admin_role_all = [] } = stateAdminUser
    const { loading, is_create } = this.state
    const { getFieldDecorator } = this.props.form

    const prefixSelector = getFieldDecorator('prefix', {
      initialValue: '86'
    })(
      <Select style={{ width: 70 }}>
        <Option value="86">+86</Option>
        <Option value="87">+87</Option>
      </Select>
    )

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
              <span>系统管理</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>管理员管理</Breadcrumb.Item>
          </Breadcrumb>
        </div>

        <div className="layout-nav-btn">
          <button
            className="btn btn-danger"
            icon="plus"
            type="primary"
            onClick={() => this.showModal(0)}
          >
            创建管理员
          </button>
        </div>

        <div className="card admin-user">
          <div className="card-body">
            <Modal
              footer={null}
              onCancel={() => {
                this.setState({
                  modal_visible_register: false
                })
              }}
              title="填写管理用户"
              visible={this.state.modal_visible_register}
            >
              <Form className="from-view" onSubmit={this.handleSubmit}>
                <FormItem {...formItemLayout} label="账户">
                  {getFieldDecorator('account', {
                    rules: [
                      {
                        required: true,
                        message: '请输入账户！',
                        whitespace: true
                      }
                    ]
                  })(<Input placeholder="账户" />)}
                </FormItem>

                <FormItem {...formItemLayout} label="昵称">
                  {getFieldDecorator('nickname', {
                    rules: [
                      {
                        required: true,
                        message: '请输入昵称！',
                        whitespace: true
                      }
                    ]
                  })(<Input placeholder="昵称" />)}
                </FormItem>

                <FormItem {...formItemLayout} label="密码">
                  {getFieldDecorator('password', {
                    rules: [
                      {
                        required: true,
                        message: '请输入密码！'
                      },
                      {
                        validator: this.validateToNextPassword
                      }
                    ]
                  })(<Input placeholder="密码" type="password" />)}
                </FormItem>

                <FormItem {...formItemLayout} label="重复密码">
                  {getFieldDecorator('confirm', {
                    rules: [
                      {
                        required: true,
                        message: '重复输入密码！'
                      },
                      {
                        validator: this.compareToFirstPassword
                      }
                    ]
                  })(
                    <Input
                      onBlur={this.handleConfirmBlur}
                      placeholder="重复密码"
                      type="password"
                    />
                  )}
                </FormItem>

                <FormItem {...formItemLayout} label="电子邮件">
                  {getFieldDecorator('email', {
                    rules: [
                      {
                        type: 'email',
                        message: '输入的电子邮件无效！'
                      },
                      {
                        required: true,
                        message: '请输入您的电子邮件！'
                      }
                    ]
                  })(<Input placeholder="邮箱" />)}
                </FormItem>

                <FormItem {...formItemLayout} label="手机号码">
                  {getFieldDecorator('phone', {
                    rules: [{ required: true, message: '请输入你的手机号码！' }]
                  })(
                    <Input
                      addonBefore={prefixSelector}
                      style={{ width: '100%' }}
                    />
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
                    {is_create ? '创建账户' : '更新'}
                  </Button>
                </FormItem>
              </Form>
            </Modal>

            <Modal
              footer={null}
              onCancel={() => {
                this.setState({
                  modal_visible_authority: false
                })
              }}
              title="修改用户权限"
              visible={this.state.modal_visible_authority}
            >
              <FormItem {...formItemLayout} label="管理员账户">
                <Input
                  disabled={true}
                  type="text"
                  value={stateAdminUser.current_user_info.account}
                />
              </FormItem>
              <FormItem {...formItemLayout} label="角色类型">
                <Select
                  placeholder="请设置权限"
                  style={{ width: 150 }}
                  onChange={this.selectRole}
                >
                  {admin_role_all.map(item => (
                    <Option key={item.role_id}>{item.role_name}</Option>
                  ))}
                </Select>
              </FormItem>
              <FormItem {...tailFormItemLayout}>
                <Button
                  className="register-btn"
                  type="primary"
                  onClick={this.handleSubmitAuthority}
                >
                  修改权限
                </Button>
              </FormItem>
            </Modal>

            <Table
              columns={this.state.columns}
              dataSource={stateAdminUser.admin_user_list}
              loading={loading}
              onChange={this.TablePageChange.bind(this)}
              pagination={this.state.pagination}
              rowKey="uid"
            />
          </div>
        </div>
      </div>
    )
  }
}

const AdminUserForm = Form.create()(AdminUser)

export default connect(({ stateAdminUser }) => {
  return {
    stateAdminUser
  }
})(AdminUserForm)
