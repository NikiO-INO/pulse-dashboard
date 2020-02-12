// Recidiviz - a data platform for criminal justice reform
// Copyright (C) 2019 Recidiviz, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
// =============================================================================

import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import * as $ from 'jquery';

import ExportMenu from '../ExportMenu';

import { COLORS } from '../../../assets/scripts/constants/colors';
import {
  getTrailingLabelFromMetricPeriodMonthsToggle, getPeriodLabelFromMetricPeriodMonthsToggle,
  toggleLabel, updateTooltipForMetricType,
} from '../../../utils/charts/toggles';
import { toInt } from '../../../utils/transforms/labels';

const chartId = 'revocationsByDistrict';

const RevocationsByDistrict = (props) => {
  const [nonDisplayedLabels, setNonDisplayedLabels] = useState([]);
  const [chartLabels, setChartLabels] = useState([]);
  const [chartDataPoints, setChartDataPoints] = useState([]);
  const [countModeEnabled, setCountModeEnabled] = useState(true);

  const processResponse = () => {
    const districtToCount = props.data.reduce(
      (result, { district, population_count: populationCount }) => {
        return { ...result, [district]: (result[district] || 0) + (toInt(populationCount) || 0) };
      }, {},
    );
    // Explicitly remove the All district, if provided, for this by-district chart
    delete districtToCount.ALL;

    const supervisionDistributions = props.supervisionPopulation.reduce(
      (result, { district, total_population: totalPopulation }) => {
        return { ...result, [district]: (result[district] || 0) + (toInt(totalPopulation) || 0) };
      }, {},
    );
    // Explicitly remove the All district, if provided, for this by-district chart
    delete supervisionDistributions.ALL;

    const getRate = (district) => (100 * (districtToCount[district] / supervisionDistributions[district])).toFixed(2);

    // Sort bars by decreasing count or rate
    let sorted = [];
    if (countModeEnabled) {
      sorted = Object.entries(districtToCount).sort((a, b) => b[1] - a[1]);
    } else {
      sorted = Object.entries(districtToCount)
        .map((entry) => [entry[0], getRate(entry[0])])
        .sort((a, b) => b[1] - a[1]);
    }

    const sortedDataPoints = sorted.map((entry) => entry[1]);
    setChartDataPoints(sortedDataPoints);

    const sortedLabels = sorted.map((entry) => entry[0]);
    setNonDisplayedLabels(sortedLabels);
    setChartLabels(sortedLabels);
  };

  // TODO: Replace this jQuery usage with a more React-friendly approach
  $('#modeButtons :input').change(function () {
    const clickedCount = this.value.toLowerCase() === 'counts';
    setCountModeEnabled(clickedCount);
  });

  useEffect(() => {
    processResponse();
  }, [
    props.data,
    props.metricPeriodMonths,
    props.currentDistrict,
    countModeEnabled,
  ]);

  // This sets bar color to light-blue-500 when it's the current district, or orange-500 otherwise
  const highlightCurrentDistrict = () => {
    const colors = [];
    for (let i = 0; i < nonDisplayedLabels.length; i += 1) {
      if (props.currentDistrict
        && props.currentDistrict.toLowerCase() === nonDisplayedLabels[i].toLowerCase()) {
        colors.push(COLORS['light-blue-500']);
      } else {
        colors.push(COLORS['orange-500']);
      }
    }
    return colors;
  };

  const chart = (
    <Bar
      id={chartId}
      data={{
        labels: chartLabels,
        datasets: [{
          label: toggleLabel({
            counts: 'Revocations', rates: 'Revocation rate',
          }, countModeEnabled ? 'counts' : 'rates'),
          backgroundColor: highlightCurrentDistrict(),
          hoverBackgroundColor: highlightCurrentDistrict(),
          hoverBorderColor: highlightCurrentDistrict(),
          data: chartDataPoints,
        }],
      }}
      options={{
        legend: {
          display: false,
        },
        responsive: true,
        scales: {
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'District',
            },
            stacked: true,
          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: toggleLabel({
                counts: 'Number of people revoked', rates: 'Revocation rate',
              }, countModeEnabled ? 'counts' : 'rates'),
            },
            stacked: true,
          }],
        },
        tooltips: {
          backgroundColor: COLORS['grey-800-light'],
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (tooltipItem, data) => updateTooltipForMetricType(
              countModeEnabled ? 'counts' : 'rates', tooltipItem, data,
            ),
          },
        },
      }}
    />
  );

  return (
    <div>
      <h4>
        Revocations by district
        <ExportMenu
          chartId={chartId}
          chart={chart}
          metricTitle="Revocations by district"
        />
      </h4>
      <h6 className="pB-20">
        {`${getTrailingLabelFromMetricPeriodMonthsToggle(props.metricPeriodMonths)} (${getPeriodLabelFromMetricPeriodMonthsToggle(props.metricPeriodMonths)})`}
      </h6>

      <div id="modeButtons" className="pB-20 btn-group btn-group-toggle" data-toggle="buttons">
        <label id="countModeButton" className="btn btn-sm btn-outline-primary active">
          <input type="radio" name="modes" id="countMode" value="counts" autoComplete="off" />
          Revocation count
        </label>
        <label id="rateModeButton" className="btn btn-sm btn-outline-primary">
          <input type="radio" name="modes" id="rateMode" value="rates" autoComplete="off" />
          Revocation rate
        </label>
      </div>

      {chart}
    </div>
  );
};

export default RevocationsByDistrict;