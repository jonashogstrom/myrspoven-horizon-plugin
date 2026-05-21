import { createNonlinearTimeScale } from './nonlinearTime';
import { defaultOptions } from '../types';

describe('createNonlinearTimeScale', () => {
  it('maps zone boundaries to configured width proportions', () => {
    const now = Date.UTC(2021, 0, 8);
    const scale = createNonlinearTimeScale(defaultOptions, 1000, now);

    expect(scale.x(scale.domainStart)).toBeCloseTo(0);
    expect(scale.x(scale.zones[0].end)).toBeCloseTo(150);
    expect(scale.x(scale.zones[1].end)).toBeCloseTo(350);
    expect(scale.x(scale.domainEnd)).toBeCloseTo(1000);
  });

  it('is monotonic across the whole domain', () => {
    const now = Date.UTC(2021, 0, 8);
    const scale = createNonlinearTimeScale(defaultOptions, 1000, now);
    const points = Array.from({ length: 50 }, (_, index) => {
      return scale.domainStart + ((scale.domainEnd - scale.domainStart) / 49) * index;
    });

    const projected = points.map(scale.x);

    for (let index = 1; index < projected.length; index++) {
      expect(projected[index]).toBeGreaterThanOrEqual(projected[index - 1]);
    }
  });
});

