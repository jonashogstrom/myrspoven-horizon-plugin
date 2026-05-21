export type AggregationMode = 'max' | 'avg';
export type YScaleMode = 'linear' | 'log1p';

export interface ContextCompressionOptions {
  recentDurationHours: number;
  transitionDurationHours: number;
  historicalDurationHours: number;
  recentWidthPercent: number;
  transitionWidthPercent: number;
  historicalWidthPercent: number;
  recentBucketMinutes: number;
  transitionBucketMinutes: number;
  historicalBucketMinutes: number;
  aggregationMode: AggregationMode;
  yScaleMode: YScaleMode;
  lineWidth: number;
  showLegend: boolean;
  showZoneBackgrounds: boolean;
}

export const defaultOptions: ContextCompressionOptions = {
  recentDurationHours: 6,
  transitionDurationHours: 18,
  historicalDurationHours: 144,
  recentWidthPercent: 65,
  transitionWidthPercent: 20,
  historicalWidthPercent: 15,
  recentBucketMinutes: 1,
  transitionBucketMinutes: 5,
  historicalBucketMinutes: 30,
  aggregationMode: 'max',
  yScaleMode: 'log1p',
  lineWidth: 1.5,
  showLegend: true,
  showZoneBackgrounds: true,
};

export function resolveOptions(options: Partial<ContextCompressionOptions>): ContextCompressionOptions {
  return {
    ...defaultOptions,
    ...options,
  };
}
