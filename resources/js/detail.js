/* eslint-disable no-case-declarations */
/* eslint-disable react/sort-comp */
/* eslint-disable react/no-unused-state */
import React, {
  Component, Fragment
} from 'react';
import {
  withRouter
} from 'react-router-dom';
import { 
  Row, Col
} from 'reactstrap';
import Api from '../../apis/app';
import Chart from 'react-apexcharts';
import AdminTopBar from '../../components/TopBar/AdminTopBar';
import AdminBar from '../../components/AdminBar';
import NFTable from '../../components/NFTable';
import PayDetailTable from '../../components/PayDetailTable';

class Detail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      detail: [],
      nfs: [],
      barChart: []
    }
  }

  async componentDidMount() {
    const org = await Api.get('finance');
    const { response, body } = org;
    switch (response.status) {
      case 200:
        let cat = [];
        body.nfs.map(item => {
          cat.push(item.name_o);
        });

        let barChart = {
          series: [{
            data: body.total
          }],
          options: {
            chart: {
              type: 'bar',
              height: 360
            },
            plotOptions: {
              bar: {
                barHeight: '50%',
                distributed: true,
                horizontal: true,
                dataLabels: {
                  position: 'bottom'
                },
              }
            },
            colors: [
              '#33b2df', '#f9a3a4', '#13d8aa', '#546E7A', '#69d2e7', 
              '#2b908f', '#90ee7e', '#f48024', '#d4526e', '#A5978B'
            ],
            dataLabels: {
              enabled: true,
              textAnchor: 'start',
              style: {
                colors: ['#fff']
              },
              formatter: function (val, opt) {
                return opt.w.globals.labels[opt.dataPointIndex] + ":  $" + val
              },
              offsetX: 0,
              dropShadow: {
                enabled: true
              }
            },
            stroke: {
              width: 1,
              colors: ['#fff']
            },
            legend: {
              labels: {
                colors: ['#fff']
              }
            },
            xaxis: {
              categories: cat,
              labels: {
                show: true,
                style: {
                  colors: ['#fff']
                }
              }
            },
            yaxis: {
              labels: {
                show: false
              }
            },
            title: {
              text: 'Total Amount',
              align: 'center',
              floating: true,
              style: {
                color: '#fff',
                fontSize: '18px'
              }
            },
            tooltip: {
              theme: 'light',
              x: {
                show: true
              },
              y: {
                title: {
                  formatter: function () {
                    return ''
                  }
                }
              }
            }
          }
        }

        this.setState({
          nfs: body.nfs,
          barChart
        });
        break;
      default:
        break;
    }
  }

  async handleSelectItem(id) {
    const trans = await Api.get(`transdetail/${id}`);
    const { response, body } = trans;
    switch (response.status) {
      case 200:
        for (let i = 0; i < body.detail.length; i++) {
          body.detail[i].created_at = body.detail[i].created_at.substring(0, 10);
        }
        this.setState({
          detail: body.detail
        });
        break;
      default:
        break;
    }
  }

  render() {
    const { barChart, nfs, detail } = this.state;

    return (
      <Fragment>
        <AdminTopBar />

        <div className="d-flex">
          <AdminBar />

          <div className="admin-dashboard">
            <h4><b>All Amount from National Federations</b></h4>

            <div className="content">
              <Row className="row-0">
                <Col sm="12">
                  {
                    barChart && barChart.series && (
                      <Chart
                        options={barChart.options}
                        series={barChart.series}
                        height="360"
                        type="bar"
                      />
                    )
                  }
                </Col>
              </Row>
              <Row>
                <Col sm="6">
                  <div className="table-responsive mt-5">
                  {
                    nfs.length > 0 && (
                      <NFTable
                        items={nfs}
                        onSelect={this.handleSelectItem.bind(this)}
                      />
                    )
                  }
                  </div>
                </Col>
                <Col sm="6">
                  <div className="table-responsive mt-5">
                  {
                    detail.length > 0 && (
                      <PayDetailTable
                        detail={detail}
                      />  
                    )
                  }
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default withRouter(Detail);