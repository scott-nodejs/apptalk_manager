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
  Radio,
  Switch,
  Breadcrumb,
  Tag,
  Alert
} from 'antd'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router-dom'

import './Dynamic.scss'
import {
  getDynamicList,
  editDynamic,
  deleteDynamic,
  getDynamicTopicAll
} from '../actions'
import {
  otherStatusList,
  otherStatusListText,
  dynamicType,
  dynamicTypeText
} from '../../../utils/constant'

import alert from '../../../utils/alert'

const Option = Select.Option
const FormItem = Form.Item
const confirm = Modal.confirm

@withRouter
@connect(({ stateDynamic }) => ({ stateDynamic }))
class Dynamic extends React.Component {
  constructor(props) {
    super(props)
  }

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
          >
            {Number((this.state.pagination.current - 1) * 10) + index + 1}
          </span>
        )
      },
      {
        title: '内容',
        dataIndex: 'content',
        key: 'content',
        render: (text, record) => (
          <a href={`/dynamic/${record.id}`} className="dynamic-content">
            {record.content}
          </a>
        )
      },
      {
        title: '创建时间',
        dataIndex: 'create_dt',
        key: 'create_dt'
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (text, record) => (
          <Tag className="table-article-tag-list" color="red">
            {this.state.otherStatusListText[record.status]}
          </Tag>
        )
      },
      {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
        render: (text, record) => (
          <Tag className="table-article-tag-list" color="red">
            {this.state.dynamicTypeText[record.type]}
          </Tag>
        )
      },
      {
        title: '所属话题',
        dataIndex: 'tag_ids',
        key: 'tag_ids',
        render: (value, record) => {
          return (
            <div className="table-article-tag-view">
              {this.state.dynamicTopicAll.map((item, key) => {
                if (item.topic_id === record.topic_ids) {
                  return (
                    <Tag
                      className="table-article-tag-list"
                      key={key}
                      color="orange"
                    >
                      {item.name}
                    </Tag>
                  )
                }
              })}
            </div>
          )
        }
      },
      {
        title: '预览',
        dataIndex: 'attach',
        key: 'attach',
        render: (text, record) => (
          <div
            className="img-preview"
            dangerouslySetInnerHTML={{ __html: this.renderAttach(record) }}
          />
        )
      },
      {
        title: '评论数',
        dataIndex: 'comment_count',
        key: 'comment_count',
        render: (text, record) => (
          <Tag className="table-article-tag-list" color="green">
            {record.comment_count}
          </Tag>
        )
      },
      {
        title: '拒绝的原因',
        dataIndex: 'rejection_reason',
        key: 'rejection_reason',
        render: (text, record) => (
          <div>
            {Number(record.status) === this.state.otherStatusList.reviewFail
              ? record.rejection_reason
              : ''}
          </div>
        )
      },
      {
        title: '操作',
        key: 'action',
        render: (text, record) => {
          return (
            <div className="operation-btn">
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
                  this.deleteDynamic(record)
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
    modal_visible_edit: false,
    loading: false,
    otherStatusList,
    otherStatusListText,
    dynamicType,
    dynamicTypeText,
    content_val: '',
    status_val: '',
    type_val: '',
    edit_status_val: '',
    dynamicTopicAll: []
  }

  componentDidMount() {
    this.fetchDynamicList()
    this.props.dispatch(
      getDynamicTopicAll('', res => {
        console.log('res', res)
        this.setState({
          dynamicTopicAll: res.all
        })
      })
    )
  }

  editUser(val) {
    console.log('val', val)
    this.setState({
      modal_visible_edit: true,
      edit_status_val: String(val.status)
    })
    this.props.form.setFieldsValue({
      status: String(val.status),
      type: String(val.type),
      rejection_reason: val.rejection_reason,
      topic_ids: val.topic_ids
    })
    this.props.dispatch({ type: 'DYNAMIC_SET_CURRENT_INFO', data: val })
  }

  renderAttach(item) {
    // 渲染其他
    if (item.type === this.state.dynamicType.link) {
      return `<a href="${item.attach}" target="_block">
       ${item.attach}
        </a>`
    } else if (item.type === this.state.dynamicType.img) {
      let img = ''
      this.imgAnalyze(item.attach).map(item => {
        img += `<img src="${item}" alt=""></img>`
      })
      return img
    }
  }

  imgAnalyze(attach) {
    let urlArr = attach.split(',') || []
    let length = attach.split(',').length
    return length > 0 ? urlArr : []
  }

  deleteDynamic(val) {
    this.props.dispatch({ type: 'DYNAMIC_SET_CURRENT_INFO', data: val })
    confirm({
      title: '确认要删除此动态吗？',
      content: '此操作不可逆转',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
        this.fetchDynamicDelete({
          id: this.props.stateDynamic.current_info.id
        })
        /*删除动态*/
      },
      onCancel() {
        console.log('Cancel')
      }
    })
  }

  TablePageChange = async pages => {
    let pagination = {}
    pagination.current = pages.current
    await this.setState({
      pagination: {
        current: pages.current
      }
    })
    this.fetchDynamicList(pages)
  }

  handleSubmit = e => {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.fetchUserEdit(values)
      }
    })
  }

  fetchDynamicDelete = values => {
    /*删除动态*/
    this.props.dispatch(
      deleteDynamic(values, res => {
        alert.message_success('删除动态成功')
        this.fetchDynamicList()
      })
    )
  }

  getParams = () => {
    const { content_val, status_val, type_val } = this.state
    return {
      content: content_val,
      status: status_val,
      type: type_val
    }
  }

  fetchDynamicList = () => {
    /*获取动态带分页的列表*/
    let params = this.getParams()
    const that = this
    this.setState({ loading: true })
    const {
      pagination: { current }
    } = this.state

    this.props.dispatch(
      getDynamicList({ page: current, ...params }, res => {
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

  fetchUserEdit = values => {
    /*修改动态*/
    this.props.dispatch(
      editDynamic(
        { id: this.props.stateDynamic.current_info.id, ...values },
        res => {
          alert.message_success('修改动态成功')
          this.fetchDynamicList()
          this.setState({
            modal_visible_edit: false
          })
        }
      )
    )
  }

  resetBarFrom = () => {
    this.setState(
      {
        content_val: '',
        status_val: '',
        type_val: ''
      },
      () => {
        this.fetchDynamicList()
      }
    )
  }

  changeVal = (val, type) => {
    let data = {}
    data[type] = val
    this.setState(data)
  }

  render() {
    const {
      loading,
      content_val,
      status_val,
      type_val,
      edit_status_val
    } = this.state
    const { stateDynamic = {} } = this.props
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
              <span>动态管理</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>动态汇总</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="xsb-operation-menu">
              <Form layout="inline">
                <FormItem label="动态内容">
                  <Input
                    value={content_val}
                    onChange={e => {
                      this.changeVal(e.target.value, 'content_val')
                    }}
                  />
                </FormItem>
                <FormItem label="状态">
                  <Select
                    className="select-view"
                    value={status_val}
                    onChange={value => {
                      this.changeVal(value, 'status_val')
                    }}
                  >
                    <Option value="">全部</Option>
                    {Object.keys(this.state.otherStatusListText).map(key => (
                      <Option key={key}>
                        {this.state.otherStatusListText[key]}
                      </Option>
                    ))}
                  </Select>
                </FormItem>
                <FormItem label="类型">
                  <Select
                    className="select-view"
                    value={type_val}
                    onChange={value => {
                      this.changeVal(value, 'type_val')
                    }}
                  >
                    <Option value="">全部</Option>
                    {Object.keys(this.state.dynamicTypeText).map(key => (
                      <Option key={key} value={key}>
                        {this.state.dynamicTypeText[key]}
                      </Option>
                    ))}
                  </Select>
                </FormItem>
                <Form.Item>
                  <button
                    className="btn btn-danger"
                    onClick={this.fetchDynamicList}
                  >
                    搜索
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={this.resetBarFrom}
                  >
                    重置
                  </button>
                </Form.Item>
              </Form>
            </div>

            <Modal
              footer={null}
              onCancel={() => {
                this.setState({
                  modal_visible_edit: false
                })
              }}
              title="修改动态"
              visible={this.state.modal_visible_edit}
            >
              <Form className="from-view" onSubmit={this.handleSubmit}>
                <FormItem {...formItemLayout} hasFeedback label="状态">
                  {getFieldDecorator('status', {
                    rules: [{ required: true, message: '请选择状态！' }]
                  })(
                    <Select
                      placeholder="状态"
                      onChange={value => {
                        this.setState({
                          edit_status_val: value
                        })
                      }}
                    >
                      {Object.keys(this.state.otherStatusListText).map(key => (
                        <Option key={key}>
                          {this.state.otherStatusListText[key]}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>

                {Number(edit_status_val) ===
                this.state.otherStatusList.reviewFail ? (
                  <FormItem {...formItemLayout} label="拒绝的原因">
                    {getFieldDecorator('rejection_reason', {
                      rules: [
                        {
                          required: true,
                          message: '请输入拒绝的原因！',
                          whitespace: true
                        }
                      ]
                    })(<Input placeholder="动态被拒绝的原因" />)}
                  </FormItem>
                ) : (
                  ''
                )}

                <FormItem {...formItemLayout} hasFeedback label="类型">
                  {getFieldDecorator('type', {
                    rules: [{ required: true, message: '请选择类型！' }]
                  })(
                    <Select placeholder="类型">
                      {Object.keys(this.state.dynamicTypeText).map(key => (
                        <Option key={key} value={key}>
                          {this.state.dynamicTypeText[key]}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>

                <FormItem {...formItemLayout} label="所属专题">
                  {getFieldDecorator('topic_ids', {
                    rules: [
                      {
                        message: '请选择所属专题!',
                        whitespace: true
                      }
                    ]
                  })(
                    <Select placeholder="请选择所属专题">
                      <Option value="">空</Option>
                      {this.state.dynamicTopicAll.map(item => (
                        <Option key={item.topic_id}>{item.name}</Option>
                      ))}
                    </Select>
                  )}
                </FormItem>

                <FormItem {...tailFormItemLayout}>
                  <Button
                    className="register-btn"
                    htmlType="submit"
                    type="primary"
                  >
                    更新
                  </Button>
                </FormItem>
              </Form>
            </Modal>

            <Table
              columns={this.state.columns}
              dataSource={stateDynamic.list}
              loading={loading}
              onChange={this.TablePageChange.bind(this)}
              pagination={this.state.pagination}
              rowKey="id"
            />
          </div>

          <Alert
            style={{ marginTop: '20px' }}
            message="备注信息"
            description="动态发表完成后状态是审核中，是仅对自己可见的，审核不通过也是仅自己可见，并且会标注审核不通过，更改为审核通过的动态对所有人开放，
          这种方式是人工审核的，暂时采用这种方案，后续会更改"
            type="info"
            showIcon
          />
        </div>
      </div>
    )
  }
}

const DynamicForm = Form.create()(Dynamic)

export default DynamicForm
