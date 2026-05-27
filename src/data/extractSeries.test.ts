import { FieldColorModeId, FieldType, PanelData } from '@grafana/data';

import { extractTimeSeries } from './extractSeries';

function panelDataWithColor(mode: FieldColorModeId, fixedColor?: string): PanelData {
  return {
    series: [
      {
        fields: [
          {
            config: {},
            name: 'Time',
            type: FieldType.time,
            values: [1000, 2000],
          },
          {
            config: {
              color: {
                fixedColor,
                mode,
              },
            },
            name: 'Value',
            type: FieldType.number,
            values: [1, 2],
          },
        ],
        length: 2,
        name: 'Series',
        refId: 'A',
      },
    ],
    state: 'Done',
    timeRange: {} as PanelData['timeRange'],
  } as PanelData;
}

describe('extractTimeSeries', () => {
  it('uses a fixed field color as an explicit series color override', () => {
    const series = extractTimeSeries(panelDataWithColor(FieldColorModeId.Fixed, '#ff00aa'));

    expect(series[0].color).toBe('#ff00aa');
  });

  it('does not treat palette field colors as explicit series color overrides', () => {
    const series = extractTimeSeries(panelDataWithColor(FieldColorModeId.PaletteClassic, '#ff00aa'));

    expect(series[0].color).toBeUndefined();
  });
});
