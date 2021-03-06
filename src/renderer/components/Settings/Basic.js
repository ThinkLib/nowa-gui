/*
  工具基本设置
*/
import React, { PropTypes, Component } from 'react';
import { remote } from 'electron';
import Button from 'antd/lib/button';
import Select from 'antd/lib/select';
import Radio from 'antd/lib/radio';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import Popconfirm from 'antd/lib/popconfirm';
import { connect } from 'dva';

import i18n from 'i18n-renderer-nowa';
import { VSCODE, SUBLIME, WEBSTORM } from 'const-renderer-nowa';
import { hidePathString } from 'util-renderer-nowa';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;

class BasicSetting extends Component {
  constructor(props) {
    super(props);
    this.editor = props.editor;
    this.state = {
      shouldAppUpdate: props.version !== props.newVersion,
    };
  }

  componentWillReceiveProps(next) {
    const { newVersion } = this.props;
    if (next.newVersion !== newVersion) {
      this.setState({
        shouldAppUpdate: true,
      });
    }
  }

  handleSubmit = () => {
    const that = this;
    const { dispatch, form } = that.props;
    form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        dispatch({
          type: 'setting/setValues',
          payload: {
            ...values,
            editor: that.editor,
          },
        });
      }
    });
  };

  selectPath() {
    const { form } = this.props;
    try {
      const importPath = remote.dialog.showOpenDialog({
        properties: ['openFile'],
      });
      const defaultEditor = form.getFieldValue('defaultEditor');
      this.editor[defaultEditor] = importPath[0];

      form.setFieldsValue({
        editorPath: importPath[0],
      });
    } catch (e) {
      console.log(e);
    }
  }

  goBack() {
    this.props.dispatch({ type: 'layout/goBack' });
  }

  reset() {
    this.props.dispatch({ type: 'layout/resetAPP' });
  }

  handleEditorChange = (e) => {
    const { form, editor } = this.props;
    const defaultEditor = e.target.value;
    form.setFieldsValue({
      defaultEditor,
    });
    form.setFieldsValue({
      editorPath: editor[defaultEditor],
    });
  };

  updateAPP() {
    this.props.dispatch({ type: 'layout/updateAPP' });
  }

  render() {
    const { shouldAppUpdate } = this.state;
    const {
      version,
      newVersion,
      registryList,
      registry,
      editor,
      defaultEditor,
      lang,
    } = this.props;
    const { getFieldDecorator } = this.props.form;
    const pathAddon = (
      <i className="iconfont icon-folder" onClick={() => this.selectPath()} />
    );

    return (
      <Form className="ui-form" layout="horizontal">
        <FormItem
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 8 }}
          label={i18n('setting.version')}
        >
          <span className="setting-basic-version">
            {version}
            {!shouldAppUpdate && ` (${i18n('setting.version.newest.tip')})`}
          </span>
          {shouldAppUpdate &&
            <Button
              type="primary"
              size="small"
              icon="download"
              onClick={() => this.updateAPP()}
            >
              {newVersion}
            </Button>}
        </FormItem>

        <FormItem
          label={i18n('setting.language')}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 8 }}
        >
          {getFieldDecorator('language', {
            initialValue: lang,
          })(
            <Select>
              <Select.Option value={'en'}>
                {i18n('setting.language.en')}
              </Select.Option>
              <Select.Option value={'zh'}>
                {i18n('setting.language.zh')}
              </Select.Option>
            </Select>
          )}
        </FormItem>

        <FormItem
          label={i18n('setting.registry')}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
        >
          {getFieldDecorator('registry', {
            initialValue: registry,
            rules: [{ type: 'url' }],
          })(
            <Select mode="combobox" filterOption={false}>
              {registryList.map(item =>
                <Select.Option value={item} key={item}>{item}</Select.Option>
              )}
            </Select>
          )}
        </FormItem>

        <FormItem
          label={i18n('setting.editor')}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
        >
          <FormItem>
            {getFieldDecorator('defaultEditor', {
              initialValue: defaultEditor,
              onChange: this.handleEditorChange,
            })(
              <RadioGroup>
                <Radio value={SUBLIME}>{SUBLIME}</Radio>
                <Radio value={VSCODE}>{VSCODE}</Radio>
                <Radio value={WEBSTORM}>{WEBSTORM}</Radio>
              </RadioGroup>
            )}
          </FormItem>
          <br />
          <FormItem>
            {getFieldDecorator('editorPath', {
              initialValue: hidePathString(editor[defaultEditor], 42),
              rules: [{ required: true, message: i18n('msg.editorPath') }],
            })(<Input addonAfter={pathAddon} disabled />)}
          </FormItem>
        </FormItem>
        <br /><br />
        <FormItem wrapperCol={{ offset: 6, span: 16 }} className="ui-form-btns">
          <Button
            type="primary"
            size="default"
            onClick={() => this.handleSubmit()}
          >
            {i18n('form.submit')}
          </Button>
          <Button type="default" size="default" onClick={() => this.goBack()}>
            {i18n('form.back')}
          </Button>
          <Popconfirm
              placement="top"
              title={i18n('重置工具将会用户数据，自定义模板...')}
              onConfirm={() => this.reset()}
              okText={i18n('form.ok')}
              cancelText={i18n('form.cancel')}
            >
          <Button
            type="danger" size="default"
            style={{ float: 'right' }}
          >
            {i18n('form.reset')}
          </Button>
          </Popconfirm>
        </FormItem>
      </Form>
    );
  }
}

BasicSetting.propTypes = {
  newVersion: PropTypes.string.isRequired,
  version: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  defaultEditor: PropTypes.string.isRequired,
  registry: PropTypes.string.isRequired,
  registryList: PropTypes.array.isRequired,
  lang: PropTypes.string.isRequired,
  form: PropTypes.shape({
    getFieldDecorator: PropTypes.func,
    setFieldsValue: PropTypes.func,
    validateFields: PropTypes.func,
  }).isRequired,
  editor: PropTypes.shape({
    Sublime: PropTypes.string,
    VScode: PropTypes.string,
  }).isRequired,
};

export default Form.create()(
  connect(({ layout, setting }) => ({
    version: layout.version,
    newVersion: layout.newVersion,
    defaultEditor: setting.defaultEditor,
    editor: setting.editor,
    registry: setting.registry,
    registryList: setting.registryList,
    lang: setting.lang,
  }))(BasicSetting)
);
