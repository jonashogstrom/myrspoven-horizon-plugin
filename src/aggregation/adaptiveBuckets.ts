import { TimeSeries, TimeSeriesPoint } from '../data/extractSeries';
import { NonlinearTimeScale, TimeZoneId } from '../scales/nonlinearTime';
import { AggregationMode, ContextCompressionOptions } from '../types';

const MINUTE_MS = 60 * 1000;

interface Bucket {
  time: number;
  sum: number;
  count: number;
  max: number;
}

function getBucketMinutes(zoneId: TimeZoneId, options: ContextCompressionOptions): number {
  switch (zoneId) {
    case 'recent':
      return options.recentBucketMinutes;
    case 'transition':
      return options.transitionBucketMinutes;
    case 'historical':
      return options.historicalBucketMinutes;
  }
}

function aggregateValue(bucket: Bucket, mode: AggregationMode): number {
  if (mode === 'avg') {
    return bucket.sum / bucket.count;
  }

  return bucket.max;
}

function aggregatePoints(
  points: TimeSeriesPoint[],
  scale: NonlinearTimeScale,
  options: ContextCompressionOptions
): TimeSeriesPoint[] {
  const buckets = new Map<string, Bucket>();

  for (const point of points) {
    if (point.value === null || point.time < scale.domainStart || point.time > scale.domainEnd) {
      continue;
    }

    const zone = scale.zoneFor(point.time);
    const bucketMs = Math.max(1, getBucketMinutes(zone.id, options)) * MINUTE_MS;
    const bucketIndex = Math.floor((point.time - zone.start) / bucketMs);
    const bucketStart = zone.start + bucketIndex * bucketMs;
    const bucketTime = Math.min(zone.end, bucketStart + bucketMs / 2);
    const key = `${zone.id}:${bucketIndex}`;
    const existing = buckets.get(key);

    if (existing) {
      existing.sum += point.value;
      existing.count += 1;
      existing.max = Math.max(existing.max, point.value);
    } else {
      buckets.set(key, {
        time: bucketTime,
        sum: point.value,
        count: 1,
        max: point.value,
      });
    }
  }

  return Array.from(buckets.values())
    .sort((a, b) => a.time - b.time)
    .map((bucket) => ({
      time: bucket.time,
      value: aggregateValue(bucket, options.aggregationMode),
    }));
}

export function aggregateSeries(
  series: TimeSeries[],
  scale: NonlinearTimeScale,
  options: ContextCompressionOptions
): TimeSeries[] {
  return series
    .map((item) => ({
      ...item,
      points: aggregatePoints(item.points, scale, options),
    }))
    .filter((item) => item.points.length > 0);
}

