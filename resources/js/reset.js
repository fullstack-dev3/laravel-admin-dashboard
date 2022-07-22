/* eslint-disable react/no-unused-state */
/* eslint-disable jsx-a11y/alt-text */
import React, { Component, Fragment } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {
  Col,
  Form, FormGroup,
  Button, Input, Label,
  Alert
} from 'reactstrap';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import Api from '../../apis/app';
import AppHelper from '../../helpers/AppHelper';
import AdminTopBar from '../../components/TopBar/AdminTopBar';
import AdminBar from '../../components/AdminBar';

import { logout } from '../../actions/common';

class Reset extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      successMessage: '',
      alertVisible: false,
      messageStatus: false,
      successMessage: '',
      failMessage: ''
    }
  }

  async handleSubmit(values, bags) {
    const user = JSON.parse(localStorage.getItem('auth'));
    const token = user.token;

    const data = await Api.post(`resetpass/${token}`, values);
    const { response, body } = data;
    switch (response.status) {
      case 200:
        this.setState({
          alertVisible: true,
          messageStatus: true,
          successMessage: body.message
        });

        setTimeout(() => {
          this.setState({ alertVisible: false });

          this.handleLogout();
        }, 2000);

        break;
      case 406:
        this.setState({
          alertVisible: true,
          messageStatus: false,
          failMessage: body.message
        });

        setTimeout(() => {
          this.setState({ alertVisible: false });
        }, 2000);

        bags.setStatus(AppHelper.getStatusAlertData(body));
        break;
      default:
        break;
    }

    bags.setSubmitting(false);
  }

  async handleLogout() {
    document.body.classList.remove('admin');
    await this.props.logout();
    this.props.history.push('/logout');
  }

  render() {
    
    return (
      <Fragment>
        <AdminTopBar />

        <div className="d-flex">
          <AdminBar />

          <div className="admin-dashboard">
            <h4><b>Password Reset</b></h4>

            <div className="content">
              <Formik
                initialValues={{
                  current: '',
                  password: '',
                  password_confirmation: ''
                }}
                validationSchema={
                  Yup.object().shape({
                    current: Yup.string().min(6, 'Password has to be longer than 6 characters!').required('Password is required!'),
                    password: Yup.string().min(6, 'Password has to be longer than 6 characters!').required('Password is required!'),
                    password_confirmation: Yup.string()
                      .min(6, 'Password has to be longer than 6 characters!')
                      .oneOf([Yup.ref('password'), null], 'Confirm Password must match!')
                      .required('Confirm Password is required!')
                  })
                }
                onSubmit={this.handleSubmit.bind(this)}
                render={({
                  values,
                  errors,
                  touched,
                  handleBlur,
                  handleChange,
                  handleSubmit,
                  isSubmitting
                }) => (
                  <Form className="intro-box-form-field" onSubmit={handleSubmit}>
                    <Col 
                      className="form-fields offset-md-3 offset-lg-4"
                      sm="12" md="6" lg="4">
                      <Alert color={this.state.messageStatus ? 'success' : 'warning'} isOpen={this.state.alertVisible}>
                        {
                          this.state.messageStatus ? this.state.successMessage : this.state.failMessage
                        }
                      </Alert>
                      {touched.password && !!errors.password && (
                        <Alert color="danger">
                          {touched.password && errors.password}
                        </Alert>
                      )}
                    </Col>
                    <Col 
                      className="form-fields offset-md-3 offset-lg-4"
                      sm="12" md="6" lg="4">
                      <FormGroup>
                        <Label for="current">Current Password</Label>
                        <Input
                          type="password"
                          name="current"
                          id="current"
                          placeholder="Password"
                          value={values.current}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          invalid={touched.current && !!errors.current}
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label for="password">New Password</Label>
                        <Input
                          type="password"
                          name="password"
                          id="password"
                          placeholder="Password"
                          value={values.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          invalid={touched.password && !!errors.password}
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label for="password_confirmation">Confirm Password</Label>
                        <Input
                          type="password"
                          name="password_confirmation"
                          id="password_confirmation"
                          placeholder="Confirm Password"
                          value={values.password_confirmation}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          invalid={touched.password_confirmation && !!errors.password_confirmation}
                        />
                      </FormGroup>
                    </Col>
                    <Col 
                      className="form-links offset-md-3 offset-lg-4"
                      sm="12" md="6" lg="4">
                      <FormGroup className="text-center">
                        <Button
                          disabled={isSubmitting}
                          type="submit"
                          color="success"
                          className="btn-lg"
                        >
                          {
                            isSubmitting && (
                              <Fragment>
                                <span className="fa fa-spinner fa-spin" />
                                &nbsp;&nbsp;
                              </Fragment>
                            )
                          }
                          Reset password
                        </Button>
                      </FormGroup>
                    </Col>
                  </Form>
                )}
              />
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

const mapStateToProps = () => ({
});

const mapDispatchToProps = dispatch => ({
  logout: bindActionCreators(logout, dispatch)
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Reset));