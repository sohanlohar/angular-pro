/* eslint-disable @typescript-eslint/member-ordering */
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { CommonService } from '@pos/ezisend/shared/data-access/services';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import * as moment from 'moment';
import { SingleDataSet, Label, Color } from 'ng2-charts';
import { Subject, catchError, finalize, takeUntil, tap } from 'rxjs';
import { TranslationService } from '../../../../../shared-services/translate.service';
import { bm } from 'libs/ezisend/assets/my';
import { en } from 'libs/ezisend/assets/en';

@Component({
  selector: 'pos-insights',
  templateUrl: './insights.component.html',
  styleUrls: ['./insights.component.scss'],
})
export class InsightsComponent implements OnInit {
  shipments_sent_labels: any = [];
  shipments_sent_count: any = [];
  sentShipments: any = [];
  advancePieChart: any = [];
  advancePieChartState: any = [];
  verticalBar2d: any = [];
  stackedBarChartData: any = [];
  isShipmentSentEmpty = false;


  protected _onDestroy = new Subject<void>();
  loading_1 = true;
  loading_2 = true;
  loading_3 = true;
  loading_4 = true;

  // NPX chart starts 

  view: [number, number] = [650, 400];
  // Custom color scheme as a simple array
  colorScheme = 'cool';
  colorSchemeD = 'vivid';
  colorSchemeVG = 'forest';
  colorSchemeAPC = 'flame';

  // Chart options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showLabels = true;
  showXAxisLabel = true;
  barPadding = 1;
  xAxisLabel = 'Total Shipments Sent by Product';
  showYAxisLabel = true;
  yAxisLabel = 'Total Shipments Sent';
  isDoughnut = true;
  explodeSlices = false;
  arcWidth = 0.25;
  animationPC = true;

  // for custom tooltip ngx-charts-bar-vertical
  tooltipVisible: boolean = false;
  tooltipData: any = {};
  tooltipX: number = 0;
  tooltipY: number = 0;
  private mouseX: number = 0;
  private mouseY: number = 0;

  // npx charts ends 
  public barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.5,
    scales: {
      xAxes: [
        {
          type:'time',
          offset: true,
          time: {
            parser: 'YYYY-MM-DD',
            tooltipFormat: 'll',
            unit: 'day',
            displayFormats: {
                day: 'MMM D'
            }
          },
          gridLines: {
            drawOnChartArea: false,
            color: '#cdcdcd',
          },
          ticks: {
            padding:6,
            // Custom function to generate ticks with a gap of 5
            callback: (value: number, index: number, values: any[]) => {
              if (index % 5 === 0) {
                return value; // Return the label value
              }
              return ''; // Return an empty string to hide labels
            },
          },
        },
      ],
      yAxes: [
        {
          gridLines: {
            drawOnChartArea: true,
            color: '#cdcdcd',
          },
        },
      ],
    },
    legend: { position: 'bottom' },
    tooltips: {
      callbacks: {
        label: function(tooltipItem:any, data:any) {
          const dataset = data?.datasets[tooltipItem?.datasetIndex];
          const total = data?.datasets.reduce((sum:any, dataset:any) => sum + dataset.data[tooltipItem.index], 0);
          const currentValue = dataset.data[tooltipItem.index];
          const percentage = ((currentValue / total) * 100).toFixed(2);

          return `${dataset.label}: ${currentValue} (${percentage}%)`;
        }
      }
    }
  };

  public barChartOptionsForSingleBar: ChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.5,
    scales: {
      xAxes: [
        {
          type:'time',
          offset: true,
          time: {
              parser: 'YYYY-MM-DD',
              tooltipFormat: 'll',
              unit: 'day',
              displayFormats: {
                  day: 'MMM D'
              }
          },
          gridLines: {
            drawOnChartArea: false,
            color: '#cdcdcd',
          },
          ticks: {
            padding:6,
            // Custom function to generate ticks with a gap of 5
            callback: (value: number, index: number, values: any[]) => {
              if (index % 5 === 0) {
                return value; // Return the label value
              }
              return ''; // Return an empty string to hide labels
            },
          },
        }
      ],
      yAxes: [
        {
          gridLines: {
            drawOnChartArea: true,
            color: '#cdcdcd',
          }
        }
      ],
    },
    legend: { position: 'bottom' },
    tooltips: {
      callbacks: {
        label: (tooltipItem: any, data: any) => {
          const dataset = data.datasets[tooltipItem.datasetIndex];
          const total = data.datasets.reduce((sum: number, dataset: any) => {
            return sum + dataset.data.reduce((acc: number, value: number) => acc + value, 0);
          }, 0);
          const currentValue = dataset.data[tooltipItem.index];
          const percentage = ((currentValue / total) * 100).toFixed(2);

          return `${dataset.label}: ${currentValue} (${percentage}%)`;
        }
      }
    }
  };

  public multiStackChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    scales: {
      xAxes: [
        {
          gridLines: {
            drawOnChartArea: false,
            color: '#000000',
          },
        },
      ],
      yAxes: [
        {
          gridLines: {
            drawOnChartArea: false,
            color: '#000000',
          },
        },
      ],
    },
    legend: { position: 'bottom' }
  };

  public pieChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1,
    legend: { position: 'left' },
    tooltips: {
      callbacks: {
        label: (tooltipItem:any, data:any) => {
          const dataset = data.datasets[tooltipItem.datasetIndex];
          const total = dataset.data.reduce((sum:any, value:any) => sum + value, 0);
          const currentValue = dataset.data[tooltipItem.index];
          const percentage = ((currentValue / total) * 100).toFixed(2);
          
          return `${data.labels[tooltipItem.index]}: ${currentValue} (${percentage}%)`;
        }
      }
    }
  };

  /*  doughnut chart */
  public doughnutChartLabels: Label[] = ["COD","NON COD"];
  public doughnutChartData: SingleDataSet = [];
  public doughnutChartType: ChartType = 'doughnut';
  public doughnutColors: Color[] = [
    {
      backgroundColor: [
        '#008BD3',
        '#00AFAF'
      ],
      borderColor: [
        '#008BD3',
        '#00AFAF'
      ]
    },
  ];
  public doughnutChartLegend = false;
  public doughnutChartPlugins = [];
  /* doughnut chart */
  public doughnutChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1,
    legend: { position: 'left' },
    tooltips: {
      callbacks: {
        label: (tooltipItem:any, data:any) => {
          const dataset = data.datasets[tooltipItem.datasetIndex];
          const total = dataset.data.reduce((sum:any, value:any) => sum + value, 0);
          const currentValue = dataset.data[tooltipItem.index];
          const percentage = isNaN((currentValue / total) * 100) ? 0 : ((currentValue / total) * 100).toFixed(2);
          
          return `${data.labels[tooltipItem.index]}: ${currentValue} (${percentage}%)`;
        }
      }
    }
  };

  displayedColumns2: string[] = ['delivery_type', 'order_count', 'percentage'];
  dataSource2: any = [];

  displayedColumns: string[] = ['state', 'order_count', 'percentage'];
  dataSource: any = [];

  /* Bar Chart */
  public barChartLabels: Label[] = [];
  public barChartType: ChartType = 'bar';
  public barChartLegend = false;
  public barChartPlugins = [];
  public barChartData: ChartDataSets[] = [
    {
      data: [],
      label: 'Order Sent',
      stack: '',
      maxBarThickness: 15,
    },
  ];
  public barChartColor: Color[] = [
    {
      backgroundColor: '#008BD3'
    }
  ];
  /* Bar Chart */

  /* 2 stack Chart */

  public stackBarChartLabels: Label[] = [];
  public stackBarChartType: ChartType = 'doughnut';
  public stackBarChartLegend = true;
  public stackBarChartPlugins = [];

  public stackBarChartData: ChartDataSets[] = [
    { data: [], label: 'COD', stack: 'a', backgroundColor: '#12528C', hoverBackgroundColor: '#12528C', maxBarThickness: 15, },
    { data: [], label: 'NON COD', stack: 'a', backgroundColor: '#3993E5', hoverBackgroundColor: '#3993E5', maxBarThickness: 15, },
  ];
  public sstackBarChartColor: Color[] = [
    {
      backgroundColor: '#FF4545'
    }
  ];
  /* 2 stack Chart */

  /* multi stack Chart */
  public multiStackChartLabels: Label[] = [];
  public multiStackChartType: ChartType = 'bar';
  public multiStackChartLegend = true;
  public multiStackChartPlugins = [];

  public multiStackChartData: ChartDataSets[] = [
    { data: [], label: 'MELPLUS', stack: 'a', backgroundColor: '#0061A8', hoverBackgroundColor:'#0061A8', maxBarThickness: 15, },
    { data: [], label: 'MPS', stack: 'a', backgroundColor: '#95FFDF', hoverBackgroundColor:'#95FFDF', maxBarThickness: 15, },
    { data: [], label: 'POS LAJU', stack: 'a', backgroundColor: '#FFB016', hoverBackgroundColor:'#FFB016', maxBarThickness: 15, },
    // { data: [], label: 'PARCEL', stack: 'a', backgroundColor:'#FB5F07' },
    // { data: [], label: 'DOCUMENT', stack: 'a', backgroundColor:'#12528C' },
    // { data: [], label: 'MERCHANDISE', stack: 'a', backgroundColor:'#E81AAE' },
    { data: [], label: 'EMS', stack: 'a', backgroundColor: '#FFD600', hoverBackgroundColor:'#FFD600', maxBarThickness: 15, },
    { data: [], label: 'AIR PARCEL', stack: 'a', backgroundColor: '#3DAE15', hoverBackgroundColor:'#3DAE15', maxBarThickness: 15, },
    { data: [], label: 'SURFACE PARCEL', stack: 'a', backgroundColor: '#A9FF3C', hoverBackgroundColor:'#A9FF3C', maxBarThickness: 15, },
    { data: [], label: 'COD UBAT', stack: 'a', backgroundColor:'#00AFAF', hoverBackgroundColor:'#00AFAF', maxBarThickness:15, }
  ];

  /* multi stack Chart */

  /*  pie chart */
  public pieChartLabels: Label[] = [];
  public pieChartData: SingleDataSet = [];
  public pieChartType: ChartType = 'doughnut';
  public colors: Color[] = [
    {
      backgroundColor: [
        '#32964D',
        '#9DE866',
        '#0A4F4E',
        '#6AD5EB',
        '#1A4FA3',
        '#658BFB',
        '#8C46D0',
        '#BE8FB9',
        '#C14A92',
        '#F90DA0',
        '#68374F',
        '#C64C70',
        '#FF9486',
        '#FCF189',
        '#FFC700',
        '#F17039'
      ],
      borderColor: [
        '#32964D',
        '#9DE866',
        '#0A4F4E',
        '#6AD5EB',
        '#1A4FA3',
        '#658BFB',
        '#8C46D0',
        '#BE8FB9',
        '#C14A92',
        '#F90DA0',
        '#68374F',
        '#C64C70',
        '#FF9486',
        '#FCF189',
        '#FFC700',
        '#F17039'
      ]
    },
  ];
  public pieChartLegend = false;
  public pieChartPlugins = [];
  stateColors:any = {
    "selangor": "#FFC700",
    "johor":"#32964D",
    "pahang":"#BE8FB9",
    "sembilan":"#8C46D0",
    "pinang":"#C14A92",
    "kedah":"#9DE866",
    "kelantan":"#0A4F4E",
    "kuala lumpur":"#6AD5EB",
    "labuan":"#1A4FA3",
    "melaka":"#658BFB",
    "perak":"#F90DA0",
    "perlis":"#68374F",
    "putrajaya":"#C64C70",
    "sabah":"#FF9486",
    "sarawak":"#FCF189",
    "terengganu":"#F17039"
  };
  /* pie chart */

  languageData: any = (localStorage.getItem("language") && localStorage.getItem("language") === 'en') ? en.data.dashboard.insights :
    (localStorage.getItem("language") && localStorage.getItem("language") === 'my') ? bm.data.dashboard.insights :
      en.data.dashboard.insights

  statistics = {
    byShipment:0,
    byState:0,
    byProduct:0,
    byPayment:0
  }    

  constructor(private http: HttpClient, public commonService: CommonService, private cdr: ChangeDetectorRef, private translate: TranslationService) {


    this.translate.buttonClick$.subscribe(() => {
      if (localStorage.getItem("language") == "en") {
        this.languageData = en.data.dashboard.insights;
      }
      else if (localStorage.getItem("language") == "my") {
        this.languageData = bm.data.dashboard.insights;
      }

      this.cdr.detectChanges();
    })
  }

  ngOnInit() {
    this.fetchShipmentSent();
    this.fetchShipmentByPaymentType();
    this.fetchShipmentByProductType();
    this.fetchShipmentByState();
  }

  fetchShipmentSent() {
    this.commonService
      .fetchList('dashboard', `shipment/insights?category=shipments_sent`)


      .pipe(
        takeUntil(this._onDestroy),
        tap((data: any) => {
          this.loading_1 = false;
          // bar chart starts 
          this.shipments_sent_labels = data.data;
          this.barChartData[0].data = [];
          let datasetValues:any = [];
          for (let i = 0; i < this.shipments_sent_labels.length; i++) {
            this.barChartLabels.push(
              this.shipments_sent_labels[i].Date
            );
            this.barChartData[0].data.push(
              this.shipments_sent_labels[i].Count
            );
            datasetValues.push(this.shipments_sent_labels[i].Count)
          }
          if(datasetValues.length > 0){
            const maxValue = Math.max(...datasetValues);
            const yAxisMax = maxValue >= 12 ? (maxValue%2==0 ? maxValue+2 : maxValue+1 ) : 12;
            this.barChartOptionsForSingleBar = {
              ...this.barChartOptionsForSingleBar,
              scales: {
                xAxes: this.barChartOptionsForSingleBar.scales?.xAxes,
                yAxes: [
                  {
                    gridLines: {
                      drawOnChartArea: true,
                      color: '#cdcdcd',
                    },
                    ticks: {
                      beginAtZero: true,
                      stepSize: 2,
                      max: yAxisMax,
                    }
                  }
                ],
              },
            };
          }
          if (data.data.length > 0) {
            this.xAxisLabel = "Total " + data.data[0].Key + " by Date";
            this.statistics.byShipment = data.data.reduce((acc:any,curr:any)=> acc += curr.Count ? curr.Count : 0, 0)
          }

          if (this.shipments_sent_labels.length === 0) {
            this.isShipmentSentEmpty = true;

            this.barChartOptionsForSingleBar = {
              ...this.barChartOptionsForSingleBar,
              scales: {
                xAxes: this.barChartOptionsForSingleBar.scales?.xAxes,
                yAxes: [{
                  ticks: {
                    beginAtZero: true,
                    min: 0,  
                    max: 12,  
                    stepSize: 2  
                  }
                }]
              }
            };
          }
        }),
        // ngx bar charts ends 
        tap((response: any) => {
          this.loading_1 = false;
          this.sentShipments = response.data.map((item: any) => ({
            name: moment(item.Date).format('DD MMM YYYY'),
            value: item.Count,
            extra: {
              percentage: item.Percentage
            }
          }));

        }),
        catchError((err) => {
          this.loading_1 = false;
          return err;
        }),
        finalize(() => {
          this.loading_1 = false;
        })
      )
      .subscribe(() => {
        this.cdr.detectChanges();
      });
  }

  fetchShipmentByPaymentType() {
    this.commonService
      .fetchList(
        'dashboard',
        `shipment/insights?category=shipments_by_payment_type`
      )
      .pipe(
        takeUntil(this._onDestroy),
        tap((data: any) => {
          this.loading_2 = false;
          // advancePieChart chart starts 
          let codTotal = 0;
          let nonCodTotal = 0;

          data.data.forEach((item: { Key: string; Count: number; }) => {
            if (item.Key === 'COD') {
              codTotal += item.Count;
            } else if (item.Key === 'Non-COD') {
              nonCodTotal += item.Count;
            }
          });

          // Prepare the chart data
          this.dataSource2 = [
            { name: 'COD', color: this.doughnutColors[0].backgroundColor?.[0], value: codTotal, percentage: (codTotal + nonCodTotal) !== 0 ? ((codTotal * 100) / (codTotal + nonCodTotal)).toFixed(2) : 0 },
            { name: 'NON COD', color: this.doughnutColors[0].backgroundColor?.[1], value: nonCodTotal, percentage: (codTotal + nonCodTotal) !== 0 ? ((nonCodTotal * 100) / (codTotal + nonCodTotal)).toFixed(2) : 0 }
          ];
          if(codTotal+nonCodTotal !== 0){
            this.doughnutChartData = [codTotal,nonCodTotal];
          }

          // advancePieChart chart ends 
          const codCountByDate: any = {};
          const nonCodCountByDate: any = {};

          data.data.forEach((item: any) => {
            const date = moment(item.Date).format('DD MMM');
            if (!this.stackBarChartLabels.includes(date)) {
              this.stackBarChartLabels.push(date);
            }
            if (item.Key === 'COD') {
              codCountByDate[date] = (codCountByDate[date] || 0) + item.Count;
            } else {
              nonCodCountByDate[date] =
                (nonCodCountByDate[date] || 0) + item.Count;
            }
          });
          this.stackBarChartLabels.forEach((date: any) => {
            this.stackBarChartData[0].data?.push(codCountByDate[date] || 0);
            this.stackBarChartData[1].data?.push(nonCodCountByDate[date] || 0);
          });

          if (data.data.length > 0) {
            this.statistics.byPayment = data.data.reduce((acc:any,curr:any)=> acc += curr.Count ? curr.Count : 0, 0)
          }
        }),
        catchError((err: any) => {
          this.loading_2 = false;
          return err;
        }),
        finalize(() => {
          this.loading_2 = false;
        })
      )
      .subscribe(() => {
        this.cdr.detectChanges();
      });
  }

  fetchShipmentByProductType() {
    this.commonService
      .fetchList(
        'dashboard',
        `shipment/insights?category=shipments_by_product_type`
      )
      .pipe(
        takeUntil(this._onDestroy),
        tap((data: any) => {
          this.loading_3 = false;
          // stacked vertical bar starts
          this.verticalBar2d = data.data.map((item: any) => {
            return {
              name: item.Key,
              value: item.Count
            };
          });
          // stacked vertical bar ends
          const mpsCountByDate: any = {};
          const parcelCountByDate: any = {};
          const melplusCountByDate: any = {};
          const airParcelCountByDate: any = {};
          const surfaceParcelCountByDate: any = {};
          const emsCountByDate: any = {}
          const CountByDate: any = {};
          const codUbatByDate:any = {};

          data.data.forEach((item: any) => {
            const date = item.Date;
            if (!this.multiStackChartLabels.includes(date)) {
              this.multiStackChartLabels.push(date);
              if(this.isShipmentSentEmpty){
                this.barChartLabels.push(date);
              }
            }

            this.multiStackChartLabels.sort((a: any, b: any) =>
              this.toDate(a).diff(this.toDate(b))
            );

            if (item.Key.toLowerCase() === 'melplus') {
              melplusCountByDate[date] =
                (melplusCountByDate[date] || 0) + item.Count;
            } else if (item.Key.toLowerCase() === 'mps') {
              mpsCountByDate[date] = (mpsCountByDate[date] || 0) + item.Count;
            } else if (item.Key.toLowerCase() === 'pos laju') {
              parcelCountByDate[date] =
                (parcelCountByDate[date] || 0) + item.Count;
            } else if (item.Key.toLowerCase() === 'air parcel') {
              airParcelCountByDate[date] =
                (airParcelCountByDate[date] || 0) + item.Count;
            } else if (item.Key.toLowerCase() === 'surface parcel') {
              surfaceParcelCountByDate[date] =
                (surfaceParcelCountByDate[date] || 0) + item.Count;
            } else if (item.Key.toLowerCase() === 'ems') {
              emsCountByDate[date] =
                (emsCountByDate[date] || 0) + item.Count;
            } else if (item.Key.toLowerCase() === 'ubat') {
              codUbatByDate[date] =
                (codUbatByDate[date] || 0) + item.Count;
            } else {
              CountByDate[date] = (CountByDate[date] || 0) + item.Count;
            }
            // else if (item.Key.toLowerCase() === 'merchandise') {
            //   merchandiseCountByDate[date] =
            //     (merchandiseCountByDate[date] || 0) + item.Count;
            // } 
          });
          this.multiStackChartLabels.forEach((date: any) => {
            this.multiStackChartData[0].data?.push(
              melplusCountByDate[date] || 0
            );
            this.multiStackChartData[1].data?.push(mpsCountByDate[date] || 0);
            this.multiStackChartData[2].data?.push(
              parcelCountByDate[date] || 0
            );
            this.multiStackChartData[3].data?.push(emsCountByDate[date] || 0);
            this.multiStackChartData[4].data?.push(airParcelCountByDate[date] || 0);
            this.multiStackChartData[5].data?.push(surfaceParcelCountByDate[date] || 0);
            this.multiStackChartData[6].data?.push(
              codUbatByDate[date] || 0
            );
          });

          const dateSums:any|number = {};
          this.multiStackChartData.forEach((dataset:any) => {
            dataset.data.forEach((value:any, index:any) => {
              const date:any = this.multiStackChartLabels[index];
              if (!dateSums[date]) {
                dateSums[date] = 0;  
              }
              dateSums[date] += value;  
            });
          });
          let maxInAllArrays = -Infinity;
          Object.values(dateSums).forEach((value:any) => {
            if (value > maxInAllArrays) {
              maxInAllArrays = value;
            }
          });
          const yAxisMax = maxInAllArrays >= 12 ? (maxInAllArrays%2==0 ? maxInAllArrays+2 : maxInAllArrays+1) : 12;
          this.barChartOptions = {
            ...this.barChartOptions,
            scales: {
              xAxes: this.barChartOptions.scales?.xAxes,
              yAxes: [
                {
                  gridLines: {
                    drawOnChartArea: true,
                    color: '#cdcdcd',
                  },
                  ticks: {
                    beginAtZero: true,
                    stepSize: 2,
                    max: yAxisMax
                  }
                },
              ],
            },
          }

          if (data.data.length > 0) {
            this.statistics.byProduct = data.data.reduce((acc:any,curr:any)=> acc += curr.Count ? curr.Count : 0, 0)
          }

          if(this.statistics.byProduct == 0){
            this.barChartOptions = {
              ...this.barChartOptions,
              scales: {
                xAxes: this.barChartOptions.scales?.xAxes,
                yAxes: [{
                  ticks: {
                    beginAtZero: true,
                    min: 0,  
                    max: 12,  
                    stepSize: 2  
                  }
                }]
              }
            };
          }
        }),
        catchError((err) => {
          this.loading_3 = false;
          return err;
        }),
        finalize(() => {
          this.loading_3 = false;
        })
      )
      .subscribe(
        () => {
          this.cdr.detectChanges();
        }
      );
  }

  fetchShipmentByState() {
    this.commonService
      .fetchList('dashboard', `shipment/insights?category=shipments_by_state`)
      .pipe(
        takeUntil(this._onDestroy),
        tap((data: any) => {
          this.loading_4 = false;
          // for advance pie chart starts
          this.advancePieChartState = data.data.map((item: { Key: any; Count: any; Percentage: any; }) => ({
            name: item.Key,
            value: item.Count,
            extra: { percentage: item.Percentage }
          }));
          // for advance pie chart ends

          const countByState: any = {};
          const backgroundColors:any = [];
          const borderColors:any = [];

          data.data.forEach((item: any) => {
            const date = moment(item.Date).format('DD MMM');
            const state = item.Key;
            if (!this.pieChartLabels.includes(state)) {
              this.pieChartLabels.push(state);
            }
            countByState[state] = (countByState[state] || 0) + item.Count;

            for (const keyword in this.stateColors) {
              if (state.toLowerCase().includes(keyword)) {
                backgroundColors.push(this.stateColors[keyword]);  
                borderColors.push(this.stateColors[keyword]);  
                break;
              }
            }

          });
          this.colors = [{ backgroundColor: backgroundColors, borderColor:borderColors }];
          this.pieChartLabels.forEach((state: any) => {
            this.pieChartData.push(countByState[state] || 0);
          });

          let topStates: any[] = [];
          const keyData: any = {};

          data.data.forEach((item: any) => {
            if (!keyData[item.Key]) {
              keyData[item.Key] = {
                Count: 0,
                Percentage: 0,
                Key: item.Key,
              };
            }
            keyData[item.Key].Count += item.Count;
            keyData[item.Key].Percentage += item.Percentage;
          });

          const states = Object.values(keyData);
          states.sort((a: any, b: any) => b.Count - a.Count);

          topStates = states.slice(0, 5).map((item: any, index) => {
            const stateName = item.Key;
            let assignedColor;
            Object.keys(this.stateColors).forEach(keyword => {
              if (stateName.toLowerCase().includes(keyword)) {
                assignedColor = this.stateColors[keyword];
              }
            });
          
            return {
              ...item,
              color: assignedColor,
              Percentage: item.Percentage.toFixed(2)
            };
          });
          this.dataSource = topStates;
          if (data.data.length > 0) {
            this.statistics.byState = data.data.reduce((acc:any,curr:any)=> acc += curr.Count ? curr.Count : 0, 0)
          }
        }),
        catchError((err) => {
          this.loading_4 = false;
          return err;
        }),
        finalize(() => {
          this.loading_4 = false;
        })
      )
      .subscribe(() => {
        this.cdr.detectChanges();
      });
  }

  toDate(dateString: any) {
    return moment(dateString, 'DD MMM');
  }

  // Generic total calculation method
  getTotal(data: any[]): number {
    return data.reduce((sum, item) => sum + item.value, 0);
  }

  // Generic tooltip formatter
  tooltipText(data: any, dataSet: any[]): string {
    const total = this.getTotal(dataSet);
    const percentage = ((data.value / total) * 100).toFixed(2);
    return `${data.name}: ${data.value} (${percentage}%)`;
  }

  // Tooltip formatter for bar chart
  tooltipTextPie({ data }: any): string {
    return this.tooltipText(data, this.advancePieChart);
  }

  // Tooltip formatter for pie chart
  tooltipTextPieState({ data }: any): string {
    return this.tooltipText(data, this.advancePieChartState);
  }

  // Calculate total for sentShipments
  get total() {
    return this.sentShipments.reduce((sum:any, item:any) => sum + item.value, 0);
  }

  // Get the percentage value
  getPercentage(data: any): string {
    const total = this.total;
    return ((data.value / total) * 100).toFixed(2);
  }

  onActivate(event: any): void {
    this.tooltipVisible = true;
    this.tooltipData = {
      label:event.value.label,
      value:event.value.value,
      percentage:this.getPercentage(event.value.value)
    };
    this.tooltipX = this.mouseX - 155;
    this.tooltipY = this.mouseY - 40;
  }

  onDeactivate(): void {
    this.tooltipVisible = false;
    this.tooltipData = {};
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }

}