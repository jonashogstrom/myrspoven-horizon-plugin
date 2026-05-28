import { TimeSeries, TimeSeriesPoint } from '../data/extractSeries';
import { NonlinearTimeScale } from '../scales/nonlinearTime';
import { AggregationMode, HorizonOptions } from '../types';

const BUCKET_PIXEL_WIDTH = 2;

interface Bucket {
  time: number;
  timeSum: number;
  sum: number;
  count: number;
  max: number;
  nullCount: number;
}

function aggregateValue(bucket: Bucket, mode: AggregationMode): number {
  if (mode === 'avg') {
    return bucket.sum / bucket.count;
  }

  return bucket.max;
}

function getBucketIndex(time: number, scale: NonlinearTimeScale): number {
  return Math.floor(scale.x(time) / BUCKET_PIXEL_WIDTH);
}

function getBucketTime(bucketIndex: number, scale: NonlinearTimeScale): number {
  const targetX = Math.min(scale.width, bucketIndex * BUCKET_PIXEL_WIDTH + BUCKET_PIXEL_WIDTH / 2);
  let low = scale.domainStart;
  let high = scale.domainEnd;

  for (let index = 0; index < 32; index++) {
    const mid = low + (high - low) / 2;

    if (scale.x(mid) < targetX) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return low + (high - low) / 2;
}

function bucketToPoint(bucket: Bucket, options: HorizonOptions): TimeSeriesPoint {
  return {
    time: bucket.timeSum / Math.max(1, bucket.count + bucket.nullCount),
    value: bucket.count === 0 ? 0 : aggregateValue(bucket, options.aggregationMode),
  };
}

function aggregatePoints(
  points: TimeSeriesPoint[],
  scale: NonlinearTimeScale,
  options: HorizonOptions
): TimeSeriesPoint[] {
  const buckets = new Map<number, Bucket>();

  for (const point of points) {
    if (point.time < scale.domainStart || point.time > scale.domainEnd) {
      continue;
    }

    const bucketIndex = getBucketIndex(point.time, scale);
    const existing = buckets.get(bucketIndex);

    if (existing) {
      existing.timeSum += point.time;

      if (point.value === null) {
        existing.nullCount += 1;
        continue;
      }

      existing.sum += point.value;
      existing.count += 1;
      existing.max = Math.max(existing.max, point.value);
    } else {
      buckets.set(bucketIndex, {
        time: point.time,
        timeSum: point.time,
        sum: point.value ?? 0,
        count: point.value === null ? 0 : 1,
        max: point.value ?? 0,
        nullCount: point.value === null ? 1 : 0,
      });
    }
  }

  if (buckets.size === 0) {
    return [];
  }

  const bucketIndexes = Array.from(buckets.keys());
  const firstBucketIndex = Math.min(...bucketIndexes);
  const lastBucketIndex = Math.max(...bucketIndexes);
  const result: TimeSeriesPoint[] = [];

  for (let bucketIndex = firstBucketIndex; bucketIndex <= lastBucketIndex; bucketIndex++) {
    const bucket = buckets.get(bucketIndex);

    result.push(
      bucket
        ? bucketToPoint(bucket, options)
        : {
            time: getBucketTime(bucketIndex, scale),
            value: 0,
          }
    );
  }

  return result.sort((a, b) => a.time - b.time);
}

export function aggregateSeries(
  series: TimeSeries[],
  scale: NonlinearTimeScale,
  options: HorizonOptions
): TimeSeries[] {
  return series
    .map((item) => ({
      ...item,
      points: aggregatePoints(item.points, scale, options),
    }))
    .filter((item) => item.points.length > 0);
}
