import { aggregateSeries } from './adaptiveBuckets';
import { createNonlinearTimeScale } from '../scales/nonlinearTime';
import { defaultOptions } from '../types';

const now = Date.UTC(2021, 0, 8, 6);
const options = {
  ...defaultOptions,
  recentBucketMinutes: 60,
  transitionBucketMinutes: 60,
  historicalBucketMinutes: 60,
  recentDurationHours: 6,
  transitionDurationHours: 6,
  historicalDurationHours: 6,
};

describe('aggregateSeries', () => {
  it('preserves the maximum value per bucket when max aggregation is selected', () => {
    const scale = createNonlinearTimeScale({ ...options, aggregationMode: 'max' }, 600, now);
    const result = aggregateSeries(
      [
        {
          id: 'a',
          name: 'A',
          points: [
            { time: now - 30 * 60 * 1000, value: 2 },
            { time: now - 20 * 60 * 1000, value: 9 },
            { time: now - 10 * 60 * 1000, value: 3 },
          ],
        },
      ],
      scale,
      { ...options, aggregationMode: 'max' }
    );

    expect(result[0].points).toHaveLength(1);
    expect(result[0].points[0].value).toBe(9);
  });

  it('averages bucket values when average aggregation is selected', () => {
    const scale = createNonlinearTimeScale({ ...options, aggregationMode: 'avg' }, 600, now);
    const result = aggregateSeries(
      [
        {
          id: 'a',
          name: 'A',
          points: [
            { time: now - 30 * 60 * 1000, value: 2 },
            { time: now - 20 * 60 * 1000, value: 9 },
            { time: now - 10 * 60 * 1000, value: 4 },
          ],
        },
      ],
      scale,
      { ...options, aggregationMode: 'avg' }
    );

    expect(result[0].points).toHaveLength(1);
    expect(result[0].points[0].value).toBe(5);
  });
});

