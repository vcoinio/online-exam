import React from "react";
import { Form, Input, Icon, Button } from 'antd';
import './login.css';
import { connect } from 'react-redux';
import { login, logout } from '../../../actions/loginAction';
import auth from '../../../services/AuthServices';
import Alert from '../../common/alert';
import { Redirect } from 'react-router-dom';

import { withTranslation } from 'react-i18next';

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: false
        }
    }

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                auth.LoginAuth(values.email, values.password).then((response) => {
                    console.log(response);
                    if (response.data.success) {
                        this.props.login(response.data.user)
                        auth.storeToken(response.data.token);
                        this.setState({
                            isLoggedIn: true
                        })
                    }
                    else {
                        return Alert('error', this.props.t('Error!'), response.data.message);
                    }
                }).catch((error) => {
                    console.log(error);
                    return Alert('error', this.props.t('Error!'), 'Server Error');
                })
            }
        });
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        if (this.state.isLoggedIn) {
            return <Redirect to={this.props.user.userOptions[0].link} />
        }
        else {
            return (
                <div className="login-container">
                    <div className="login-inner">
                        <Form onSubmit={this.handleSubmit}>
                            <Form.Item label={this.props.t('Email')} hasFeedback>
                                {getFieldDecorator('email', {
                                    rules: [
                                        {
                                            type: 'email',
                                            message: this.props.t('The input is not valid E-mail!'),
                                        },
                                        {
                                            required: true,
                                            message: this.props.t('Please input your E-mail!'),
                                        },
                                    ],
                                })(<Input
                                    prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                    placeholder={this.props.t('Username')} />)}
                            </Form.Item>
                            <Form.Item label={this.props.t('Password')} hasFeedback>
                                {getFieldDecorator('password', {
                                    rules: [
                                        {
                                            required: true, message: this.props.t('Please input your Password!')
                                        }
                                    ],
                                })(
                                    <Input
                                        prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                        type="password"
                                        placeholder={this.props.t('Password')}
                                    />,
                                )}
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" block>
                                    {this.props.t('Login')}
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                </div>
            )
        }
    }

}

const LoginForm = Form.create({ name: 'login' })(withTranslation()(Login));


const mapStateToProps = state => ({
    user: state.user
});

export default connect(mapStateToProps, {
    login,
    logout
})(LoginForm);