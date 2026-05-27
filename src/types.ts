export type AggregationMode = 'max' | 'avg';
export type ColorPalette = 'grafana' | 'classic' | 'cool' | 'warm';
export type GradientMode = 'none' | 'opacity' | 'hue' | 'scheme';
export type LegendPlacement = 'right' | 'bottom';
export type LineInterpolation = 'linear' | 'smooth' | 'stepAfter' | 'stepBefore';
export type LineStyle = 'solid' | 'dash' | 'dot';
export type ThresholdDisplay = 'off' | 'lines';
export type YAxisLowerBound = 'zero' | 'seriesMin';
export type YScaleMode = 'linear' | 'log1p';

export interface ContextCompressionOptions {
  compressionFocusHours: number;
  aggregationMode: AggregationMode;
  colorPalette: ColorPalette;
  fillOpacity: number;
  gradientMode: GradientMode;
  legendPlacement: LegendPlacement;
  lineInterpolation: LineInterpolation;
  lineOpacity: number;
  lineStyle: LineStyle;
  thresholdDisplay: ThresholdDisplay;
  yAxisLowerBound: YAxisLowerBound;
  yScaleMode: YScaleMode;
  lineWidth: number;
  showLegend: boolean;
}

export const defaultOptions: ContextCompressionOptions = {
  compressionFocusHours: 6,
  aggregationMode: 'max',
  colorPalette: 'grafana',
  fillOpacity: 0,
  gradientMode: 'none',
  legendPlacement: 'right',
  lineInterpolation: 'stepAfter',
  lineOpacity: 0.95,
  lineStyle: 'solid',
  thresholdDisplay: 'off',
  yAxisLowerBound: 'zero',
  yScaleMode: 'log1p',
  lineWidth: 1.5,
  showLegend: true,
};

export function resolveOptions(options: Partial<ContextCompressionOptions>): ContextCompressionOptions {
  return {
    ...defaultOptions,
    ...options,
  };
}
