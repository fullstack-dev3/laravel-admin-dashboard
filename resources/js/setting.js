/* eslint-disable react/no-unused-state */
/* eslint-disable jsx-a11y/alt-text */
import React, { Component, Fragment } from 'react';
import Api from '../../apis/app';

import AdminTopBar from '../../components/TopBar/AdminTopBar';
import AdminBar from '../../components/AdminBar';
import SettingTable from '../../components/SettingTable';

class Setting extends Component {
  constructor(props) {
    super(props);

    this.state = {
      items: []
    };
  }

  async componentDidMount() {
    const data = await Api.get('allsetting');
    const { response, body } = data;
    switch (response.status) {
      case 200:
        this.setState({
          items: body
        });
        break;
      default:
        break;
    }
  }

  render() {
    const {items} = this.state;

    return (
      <Fragment>
        <AdminTopBar />

        <div className="d-flex">
          <AdminBar />

          <div className="admin-dashboard">
            <h4><b>Financial Setting</b></h4>
            
            <div className="content setting table-responsive">
              {
                items.length > 0 && (
                  <SettingTable
                    items={items}
                  />
                )
              }
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default Setting;