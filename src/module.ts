import { PanelPlugin } from '@grafana/data';
import { ContextCompressionPanel } from './components/ContextCompressionPanel';
import { ContextCompressionOptions, defaultOptions } from './types';

export const plugin = new PanelPlugin<ContextCompressionOptions>(ContextCompressionPanel).setPanelOptions((builder) => {
  return builder
    .addNumberInput({
      path: 'recentDurationHours',
      name: 'Recent duration (hours)',
      defaultValue: defaultOptions.recentDurationHours,
    })
    .addNumberInput({
      path: 'transitionDurationHours',
      name: 'Transition duration (hours)',
      defaultValue: defaultOptions.transitionDurationHours,
    })
    .addNumberInput({
      path: 'historicalDurationHours',
      name: 'Historical duration (hours)',
      defaultValue: defaultOptions.historicalDurationHours,
    })
    .addNumberInput({
      path: 'recentWidthPercent',
      name: 'Recent width (%)',
      defaultValue: defaultOptions.recentWidthPercent,
    })
    .addNumberInput({
      path: 'transitionWidthPercent',
      name: 'Transition width (%)',
      defaultValue: defaultOptions.transitionWidthPercent,
    })
    .addNumberInput({
      path: 'historicalWidthPercent',
      name: 'Historical width (%)',
      defaultValue: defaultOptions.historicalWidthPercent,
    })
    .addNumberInput({
      path: 'recentBucketMinutes',
      name: 'Recent bucket (minutes)',
      defaultValue: defaultOptions.recentBucketMinutes,
    })
    .addNumberInput({
      path: 'transitionBucketMinutes',
      name: 'Transition bucket (minutes)',
      defaultValue: defaultOptions.transitionBucketMinutes,
    })
    .addNumberInput({
      path: 'historicalBucketMinutes',
      name: 'Historical bucket (minutes)',
      defaultValue: defaultOptions.historicalBucketMinutes,
    })
    .addRadio({
      path: 'aggregationMode',
      defaultValue: defaultOptions.aggregationMode,
      name: 'Bucket aggregation',
      settings: {
        options: [
          {
            value: 'max',
            label: 'Max',
          },
          {
            value: 'avg',
            label: 'Average',
          },
        ],
      },
    })
    .addRadio({
      path: 'yScaleMode',
      defaultValue: defaultOptions.yScaleMode,
      name: 'Y-axis scale',
      settings: {
        options: [
          {
            value: 'log1p',
            label: 'Compressed log1p',
          },
          {
            value: 'linear',
            label: 'Linear',
          },
        ],
      },
    })
    .addNumberInput({
      path: 'lineWidth',
      name: 'Line width',
      defaultValue: defaultOptions.lineWidth,
    })
    .addBooleanSwitch({
      path: 'showLegend',
      name: 'Show legend',
      defaultValue: defaultOptions.showLegend,
    })
    .addBooleanSwitch({
      path: 'showZoneBackgrounds',
      name: 'Show zone backgrounds',
      defaultValue: defaultOptions.showZoneBackgrounds,
    });
});
