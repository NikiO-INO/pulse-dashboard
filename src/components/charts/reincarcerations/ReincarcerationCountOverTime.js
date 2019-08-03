import React, { useState, useEffect } from "react";

import { Line } from 'react-chartjs-2';
import { configureDownloadButtons } from "../../../assets/scripts/charts/chartJS/downloads";
import { COLORS } from "../../../assets/scripts/constants/colors";

const ReincarcerationCountOverTime = props => {
  const [chartLabels, setChartLabels] = useState([]);
  const [chartDataPoints, setChartDataPoints] = useState([]);

  const processResponse = () => {
    const countsByMonth = props.reincarcerationCountsByMonth;

    var sorted = [];
    for (var month in countsByMonth) {
        sorted.push([month, countsByMonth[month]]);
    }

    setChartLabels(sorted.map(element => element[0]));
    setChartDataPoints(sorted.map(element => element[1]));
  }

  useEffect(() => {
    processResponse();
  }, [props.reincarcerationCountsByMonth]);

  const chart =
    <Line id="reincarceration-drivers-chart" data={{
      labels: chartLabels,
      datasets: [{
        label: 'Reincarceration returns',
        borderColor: COLORS['grey-500'],
        pointBackgroundColor: COLORS['grey-700'],
        fill: false,
        borderWidth: 2,
        data: chartDataPoints,
      }],
    }}
    options={{
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 20,
        },
      },
      scales: {
        xAxes: [{
          ticks: {
            autoSkip: false,
          },
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Reincarceration count',
          },
        }],
      },
      tooltips: {
        mode: 'x',
      },
      annotation: {
        events: ['click'],
        annotations: [{
          type: 'line',
          mode: 'horizontal',
          value: 17,

          // optional annotation ID (must be unique)
          id: 'recidivism-drivers-goal-line',
          scaleID: 'y-axis-0',

          drawTime: 'afterDatasetsDraw',

          borderColor: 'red',
          borderWidth: 2,
          borderDash: [2, 2],
          borderDashOffset: 5,
          label: {
            enabled: false,
            content: 'Goal',
            position: 'center',

            // Background color of label, default below
            backgroundColor: 'rgba(0,0,0,0.1)',

            fontFamily: 'sans-serif',
            fontSize: 12,
            fontStyle: 'bold',
            fontColor: '#000',

            // Adjustment along x-axis (left-right) of label relative to above
            // number (can be negative). For horizontal lines positioned left
            // or right, negative values move the label toward the edge, and
            // positive values toward the center.
            xAdjust: 0,

            // Adjustment along y-axis (top-bottom) of label relative to above
            // number (can be negative). For vertical lines positioned top or
            // bottom, negative values move the label toward the edge, and
            // positive values toward the center.
            yAdjust: 0,
          },

          onClick(e) { return e; },
        }]
      }
    }}
    />

  const exportedStructureCallback = function () {
    return {
      recidivismType: 'reincarceration',
      returnType: 'new_offenses',
      startDate: '2018-11',
      endDate: '2019-04',
      series: [],
    };
  };
  configureDownloadButtons('reincarceration', 'Drivers', chart.props,
    document.getElementById('reincarceration-drivers-chart'), exportedStructureCallback
  );

  return (chart);
}

export default ReincarcerationCountOverTime;
