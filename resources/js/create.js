/* eslint-disable jsx-a11y/alt-text */
import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {
  Row, Col,
  Button,
  Form, FormGroup, FormFeedback,
  Input, Label,
  UncontrolledAlert, Alert
} from 'reactstrap';
import Select from 'react-select';
import Api from '../../apis/app';
import AdminTopBar from '../../components/TopBar/AdminTopBar';
import AdminBar from '../../components/AdminBar';
import {countries} from '../../configs/data';

class CreateNational extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imagePreviewUrl: '',
      fileKey: 1,
      alertVisible: false,
      messageStatus: false,
      successMessage: '',
      failMessage: ''
    };
    this.fileRef = React.createRef();
    this.formikRef = React.createRef();
  }

  fileUpload(e) {
    e.preventDefault();
    const reader = new FileReader();
    
    let file = e.target.files[0];

    reader.onloadend = () => {
      this.setState({
        imagePreviewUrl: reader.result
      });
    };

    reader.readAsDataURL(file);
  }

  async handleSubmit(values, bags) {

    let newData = {};
    const { imagePreviewUrl } = this.state;

    newData = {
      name_o: values.name_o,
      name_s: values.name_s,
      logo: imagePreviewUrl || '',
      email: values.email,
      mobile_phone: values.mobile_phone,
      addressline1: values.addressline1,
      addressline2: values.addressline2,
      country: values.country.countryCode,
      state: values.state,
      city: values.city,
      zip_code: values.zip_code
    };

    const data = await Api.post('create-nf', newData);
    const { response, body } = data;
    switch (response.status) {
      case 200:
        this.setState({
          alertVisible: true,
          messageStatus: true,
          successMessage: 'Added Successfully!'
        });
        setTimeout(() => {
          this.setState({ alertVisible: false });
          this.props.history.push('/admin/federations');
        }, 2000);
        break;
      case 406:
        if (body.message) {
          bags.setStatus({
            color: 'danger',
            children: body.message
          });
        }
        bags.setErrors(body.errors);
        break;
      case 422:
        this.setState({
          alertVisible: true,
          messageStatus: false,
          failMessage: body.data && (`${body.data.email !== undefined ? body.data.email : ''} 
                        ${body.data.country !== undefined ? body.data.country : ''}`)
        });
        break;
      default:
        break;
    }

    bags.setSubmitting(false);
  }

  render() {
    const {
      imagePreviewUrl
    } = this.state;

    let $imagePreview = null;
    if (imagePreviewUrl) {
      $imagePreview = (<img src={imagePreviewUrl} />);
    } else {
      $imagePreview = (<div className="previewText">Please select an Image for Preview</div>);
    }
    
    return (
      <Fragment>
        <AdminTopBar />

        <div className="d-flex">
          <AdminBar />

          <div className="admin-dashboard">
            <h4><b>Create New Federation</b></h4>
            
            <div className="content">
              {
                this.state.alertVisible && (
                  <div className="w-100 mb-5">
                    <Alert color={this.state.messageStatus ? 'success' : 'warning'} isOpen={this.state.alertVisible}>
                      {
                        this.state.messageStatus ? this.state.successMessage : this.state.failMessage
                      }
                    </Alert>
                  </div>
                )
              }
              <Formik
                ref={this.formikRef}
                initialValues={{
                  name_o: '',
                  name_s: '',
                  email: '',
                  logo: null,
                  mobile_phone: '',
                  addressline1: '',
                  addressline2: '',
                  country: null,
                  state: '',
                  city: '',
                  zip_code: '',
                }}
                validationSchema={
                  Yup.object().shape({
                    name_o: Yup.string().required('This field is required!'),
                    name_s: Yup.string().max(3, 'Country Code is less than 3 characters!').required('This field is required!'),
                    email: Yup.string().email('Email is not valid!').required('This field is required!'),
                    mobile_phone: Yup.string().matches(/^\+?[0-9]\s?[-]\s|[0-9]$/, 'Mobile phone is incorrect!').required('This field is required!'),
                    addressline1: Yup.string().required('This field is required!'),
                    country: Yup.mixed().required('This field is required!'),
                    city: Yup.string().required('This field is required!'),
                    state: Yup.string().required('This field is required!'),
                    zip_code: Yup.string().required('This field is required!')
                  })
                }
                onSubmit={this.handleSubmit.bind(this)}
                render={({
                  values,
                  errors,
                  touched,
                  status,
                  setFieldValue,
                  handleBlur,
                  handleChange,
                  handleSubmit,
                  isSubmitting
                }) => (
                  <Form onSubmit={handleSubmit}>
                    {status && <UncontrolledAlert {...status} />}
                    <Row>
                      <Col xs="6">
                        <FormGroup>
                          <Label for="logo">Logo Image</Label>
                          <Input
                            ref="file"
                            type="file"
                            key={this.state.fileKey}
                            multiple={false}
                            onChange={this.fileUpload.bind(this)}
                          />
                          <div className={imagePreviewUrl ? 'image-preview is_image' : 'image-preview'}>
                            {$imagePreview}
                          </div>
                        </FormGroup>
                      </Col>
                      <Col xs="6"></Col>
                      <Col sm="6" md="4">
                        <FormGroup>
                          <Label for="name_o">National Federation Name</Label>
                          <Input
                            type="text"
                            name="name_o"
                            value={values.name_o}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.name_o && touched.name_o}
                          />
                          <FormFeedback>{errors.name_o}</FormFeedback>
                        </FormGroup>
                      </Col>
                      <Col sm="6" md="4">
                        <FormGroup>
                          <Label for="country">Country</Label>
                          <Select 
                            name="country"
                            className="select-box"
                            classNamePrefix={!!errors.country && touched.country ? 'invalid react-select-lg' : 'react-select-lg'}
                            indicatorSeparator={null}
                            options={countries}
                            getOptionValue={option => option.countryCode}
                            getOptionLabel={option => option.name}
                            value={values.country}
                            onChange={(value) => {
                              setFieldValue('country', value);
                              values.name_s = value.code;
                            }}
                            onBlur={this.handleBlur}
                          />
                          {!!errors.country && touched.country && (
                            <FormFeedback className="d-block">{errors.country}</FormFeedback>
                          )}
                        </FormGroup>
                      </Col>
                      <Col sm="6" md="4">
                        <FormGroup>
                          <Label for="name_s">
                            Country Code
                          </Label>
                          <Input
                            type="text"
                            name="name_s"
                            value={values.name_s}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.name_s && touched.name_s}
                          />
                          <FormFeedback>{errors.name_s}</FormFeedback>
                        </FormGroup>
                      </Col>
                      <Col sm="6">
                        <FormGroup>
                          <Label for="mobile_phone">
                            Mobile Phone
                          </Label>
                          <Input
                            type="phone"
                            name="mobile_phone"
                            value={values.mobile_phone}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.mobile_phone && touched.mobile_phone}
                          />
                          <FormFeedback>{errors.mobile_phone}</FormFeedback>
                        </FormGroup>
                      </Col>
                      <Col sm="6">
                        <FormGroup>
                          <Label for="email">
                            Email
                          </Label>
                          <Input
                            type="email"
                            name="email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.email && touched.email}
                          />
                          <FormFeedback>{errors.email}</FormFeedback>
                        </FormGroup>
                      </Col>
                      <Col sm="6">
                        <FormGroup>
                          <Label for="addressline1">
                            Address Line1
                          </Label>
                          <Input
                            type="text"
                            name="addressline1"
                            value={values.addressline1}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.addressline1 && touched.addressline1}
                          />
                          <FormFeedback>{errors.addressline1}</FormFeedback>
                        </FormGroup>
                      </Col>
                      <Col sm="6">
                        <FormGroup>
                          <Label for="addressline2">
                            Address Line2
                          </Label>
                          <Input
                            type="text"
                            name="addressline2"
                            value={values.addressline2}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </FormGroup>
                      </Col>
                      <Col sm="6" md="4">
                        <FormGroup>
                          <Label for="state">State</Label>
                          <Input
                            name="state"
                            type="text"
                            value={values.state || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.state && touched.state}
                          />
                          {!!errors.state && touched.state && (<FormFeedback className="d-block">{errors.state}</FormFeedback>)}
                        </FormGroup>
                      </Col>
                      <Col sm="6" md="4">
                        <FormGroup>
                          <Label for="city">City</Label>
                          <Input
                            name="city"
                            type="text"
                            value={values.city || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.city && touched.city}
                          />
                          {!!errors.city && touched.city && (<FormFeedback className="d-block">{errors.city}</FormFeedback>)}
                        </FormGroup>
                      </Col>
                      <Col sm="6" md="4">
                        <FormGroup>
                          <Label for="zip_code">Zip Code</Label>
                          <Input
                            name="zip_code"
                            type="text"
                            value={values.zip_code || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            invalid={!!errors.zip_code && touched.zip_code}
                          />
                          {!!errors.zip_code && touched.zip_code && (<FormFeedback className="d-block">{errors.zip_code}</FormFeedback>)}
                        </FormGroup>
                      </Col>
                    </Row>
                    <div className="w-100 d-flex justify-content-end">
                      <div>
                        <Button
                          className="mr-5"
                          disabled={isSubmitting}
                          type="submit"
                          color="warning"
                        >
                          Create
                        </Button>
                        <Button
                          type="button"
                          color="secondary"
                          onClick={() => this.props.history.push('/admin/home')}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
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

export default withRouter(CreateNational);