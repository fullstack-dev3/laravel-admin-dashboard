/* eslint-disable no-case-declarations */
/* eslint-disable react/sort-comp */
/* eslint-disable react/no-unused-state */
import React, { Component, Fragment } from 'react';
import {
  withRouter
} from 'react-router-dom';
import { 
  Row, Col, Progress
} from 'reactstrap';
import Api from '../../apis/app';
import { Table, Card } from 'semantic-ui-react';
import Chart from 'react-apexcharts';

import AdminTopBar from '../../components/TopBar/AdminTopBar';
import AdminBar from '../../components/AdminBar';

class Admin extends Component {
  constructor(props) {
    super(props);

    const user = JSON.parse(localStorage.getItem('auth'));

    if (user.user.is_super == 0) this.props.history.push('/');

    this.state = {
      nfs: [],
      chartOrder: [0, 1],
      pieChart: {},
      lineChart: [],
      confirmed: [],
      notpayed: [],
      pending: [],
      sum: [],
      paid: 0,
      amount: 0
    }
  }

  async componentDidMount() {
    const colorList = ['#4661EE', '#66DA26', '#E91E63', '#FF9800', '#546E7A',  
                       '#EC5657', '#1BCDD1', '#8FAABB', '#B08BEB', '#FAA586'];

    const pieSeries = [];
    const pieLabels = [];
    const pieColors = [];

    const lineSeries = [];
    const lineLabels = [];
    const lineCharts = [];

    const confirmed = [];
    const notpayed = [];
    const pending = [];

    let paid = 0;
    let amount = 0;

    const trans = await Api.get('finance');
    const { response, body } = trans;
    switch (response.status) {
      case 200:
        const sum = [];

        for (let i = 0; i < body.nfs.length; i++) {
          pieSeries.push(body.total[i] + 1);
          pieLabels.push(body.nfs[i].name_s);
          pieColors.push(colorList[i]);

          let lineData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
          for (let j = 0; j < body.subtotal[i].length; j++) {
            lineData[parseInt(body.subtotal[i][j].month) - 1] = body.subtotal[i][j].amount;
            amount += parseFloat(body.subtotal[i][j].amount);
          }

          lineSeries.push(lineData);
          lineLabels.push(body.nfs[i].name_o);

          let chart = {
            series: [{
              name: "Amount",
              data: lineSeries[i]
            }],
            options: {
              chart: {
                zoom: {
                  enabled: false
                }
              },
              colors: [colorList[i]],
              dataLabels: {
                enabled: false
              },
              stroke: {
                curve: 'straight'
              },
              title: {
                text: lineLabels[i],
                align: 'center',
                style: {
                  color: '#97A3B4',
                  fontSize: '16px'
                }
              },
              xaxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                labels: {
                  style: {
                    colors: '#97A3B4'
                  }
                }
              },
              yaxis: {
                labels: {
                  style: {
                    colors: '#97A3B4'
                  }
                }
              }
            }
          }

          lineCharts.push(chart);

          let confirm = 0;
          let notpay = 0;
          let pend = 0;

          if (body.players[i].length > 0) {
            confirm = body.players[i][1] !== undefined ? parseInt(body.players[i][1].player) : 0;
            notpay = body.players[i][0] !== undefined ? parseInt(body.players[i][0].player) : 0;
            pend = body.players[i][2] !== undefined ? parseInt(body.players[i][2].player) : 0;
          }

          confirmed.push(confirm);
          notpayed.push(notpay);
          pending.push(pend);

          sum.push((confirm + notpay + pend) == 0 ? 1 : confirm + notpay + pend);

          paid += confirm;
        }

        this.setState({
          nfs: body.nfs,
          confirmed,
          notpayed,
          pending,
          sum,
          paid,
          amount
        });
        break;
      default:
        break;
    }

    let order = this.state.chartOrder;
    const that = this;

    this.setState({
      pieChart: {
        series: pieSeries,
        chartOptions: {
          labels: pieLabels,
          dataLabels: {
            enabled: true
          },
          chart: {
            events: {
              legendClick: function(chartContext, seriesIndex, config) {
                if (order.indexOf(seriesIndex) == -1 || order.indexOf(seriesIndex) == 0) {
                  order.shift();
                  order.push(seriesIndex);
                  
                  that.setState({
                    chartOrder: order
                  });
                }
              }
            }
          },
          plotOptions: {
            pie: {
              donut: {
                size: '50%'
              }
            }
          },
          colors: pieColors,
          responsive: [{
            breakpoint: 480,
            options: {
              chart: {
                  width: 200
              },
              legend: {
                  show: false
              }
            }
          }],
          fill: {
            colors: pieColors,
            type: 'gradient',
          },
          legend: {
            position: 'right',
            labels: {
              colors: ['#FFFFFF']
            },
            markers: {
              fillColors: pieColors
            },
            offsetY: 0
          }
        }
      },
      lineChart: lineCharts
    });
  }

  handleSelectItem(id) {
    this.props.history.push('/admin/nfprofile', id);
  }

  render() {
    const { 
      pieChart, lineChart, nfs, chartOrder,
      confirmed, notpayed, pending, sum,
      paid, amount
    } = this.state;

    let d = new Date();
    let month = new Array();
        month[0] = "January";
        month[1] = "February";
        month[2] = "March";
        month[3] = "April";
        month[4] = "May";
        month[5] = "June";
        month[6] = "July";
        month[7] = "August";
        month[8] = "September";
        month[9] = "October";
        month[10] = "November";
        month[11] = "December";
    
    let date = month[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
    
    return (
      <Fragment>
        <AdminTopBar />

        <div className="d-flex">
          <AdminBar />

          <div className="admin-dashboard">
            <Row className="mb-1">
              <Col sm="12"><h4><b>Home</b></h4></Col>
            </Row>

            <div className="home-content">
              <Row className="mb-4">
                <Col sm="6" md="4">
                  <Card>
                    <Card.Content className="text-center">
                      <Card.Header><h5>All Paid Members</h5></Card.Header>
                      <Card.Description>
                        {paid} Judokas
                      </Card.Description>
                    </Card.Content>
                  </Card>
                </Col>
                <Col sm="6" md="4">
                  <Card>
                    <Card.Content className="text-center">
                      <Card.Header><h5>Total Amount</h5></Card.Header>
                      <Card.Description>
                        $ {amount}
                      </Card.Description>
                    </Card.Content>
                  </Card>
                </Col>
                <Col className="text-right" sm="12" md="4">
                  <h4>{date}</h4>
                </Col>
              </Row>
              <Row className="row-0 chart">
                <Col sm="12" md="6" lg="3">
                  {
                    pieChart && pieChart.series && (
                      <Chart className="mt-4"
                        options={pieChart.chartOptions}
                        series={pieChart.series}
                        type="donut"
                      />
                    )
                  }
                </Col>
                <Col sm="12" md="6" lg="9">
                  <Row className="line-chart">
                    <Col md="12" lg="6">
                      {
                        lineChart && lineChart[chartOrder[0]] && lineChart[chartOrder[0]].series && (
                          <Chart
                            options={lineChart[chartOrder[0]].options}
                            series={lineChart[chartOrder[0]].series}
                            type="line"
                            onClick={() => this.props.history.push('/admin/detail')}
                          />
                        )
                      }
                    </Col>
                    <Col md="12" lg="6">
                      {
                        lineChart && lineChart[chartOrder[1]] && lineChart[chartOrder[1]].series && (
                          <Chart
                            options={lineChart[chartOrder[1]].options}
                            series={lineChart[chartOrder[1]].series}
                            type="line"
                            onClick={() => this.props.history.push('/admin/detail')}
                          />
                        )
                      }
                    </Col>
                  </Row>
                </Col>
              </Row>
              {
                nfs && nfs.length > 0 && (
                  <Row className="row-0 mt-4">
                    <Table celled>
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell width="2"></Table.HeaderCell>
                          <Table.HeaderCell className="text-center" colSpan="2">
                            Payment Confirmed
                          </Table.HeaderCell>
                          <Table.HeaderCell className="text-center" colSpan="2">
                            Not Paid
                          </Table.HeaderCell>
                          <Table.HeaderCell className="text-center" colSpan="2">
                            Pending
                          </Table.HeaderCell>
                        </Table.Row>
                        <Table.Row>
                          <Table.HeaderCell width="2"></Table.HeaderCell>
                          <Table.HeaderCell colSpan="2" className="text-center">
                            Judokas ( % )
                          </Table.HeaderCell>
                          <Table.HeaderCell colSpan="2" className="text-center">
                            Judokas ( % )
                          </Table.HeaderCell>
                          <Table.HeaderCell colSpan="2" className="text-center">
                            Judokas ( % )
                          </Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {
                          nfs.map((item, index) => (
                            <Table.Row key={index}>
                              <Table.Cell>
                                <a
                                  className="detail-link" 
                                  onClick={this.handleSelectItem.bind(this, item.id)}
                                >
                                  {index + 1}. {item.name_o}
                                </a>
                              </Table.Cell>
                              <Table.Cell width="1" className="text-center">
                                {confirmed[index]} ( {Math.floor(confirmed[index] / sum[index] * 10000) / 100}% )
                              </Table.Cell>
                              <Table.Cell width="3" className="bar">
                                <div className="success-div">
                                  <Progress bar 
                                    color="success" 
                                    value={Math.floor(confirmed[index] / sum[index] * 10000) / 100}
                                  />
                                </div>
                              </Table.Cell>
                              <Table.Cell width="1" className="text-center">
                                {notpayed[index]} ( {Math.floor(notpayed[index] / sum[index] * 10000) / 100}% )
                              </Table.Cell>
                              <Table.Cell width="3" className="bar">
                                <div className="danger-div">
                                  <Progress bar 
                                    color="danger" 
                                    value={Math.floor(notpayed[index] / sum[index] * 10000) / 100}
                                  />
                                </div>
                              </Table.Cell>
                              <Table.Cell width="1" className="text-center">
                                {pending[index]} ( {Math.floor(pending[index] / sum[index] * 10000) / 100}% )
                              </Table.Cell>
                              <Table.Cell width="3" className="bar">
                                <div className="warning-div">
                                  <Progress bar 
                                    color="warning" 
                                    value={Math.floor(pending[index] / sum[index] * 10000) / 100} 
                                  />
                                </div>
                              </Table.Cell>
                            </Table.Row>
                          ))
                        }
                      </Table.Body>
                    </Table>
                  </Row>
                )
              }
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default withRouter(Admin);