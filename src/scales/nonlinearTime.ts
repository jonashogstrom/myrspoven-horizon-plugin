import { ContextCompressionOptions } from '../types';

export type TimeZoneId = 'historical' | 'transition' | 'recent';

export interface TimeZoneRange {
  id: TimeZoneId;
  label: string;
  start: number;
  end: number;
  xStart: number;
  xEnd: number;
}

export interface NonlinearTimeScale {
  domainStart: number;
  domainEnd: number;
  width: number;
  zones: TimeZoneRange[];
  x: (time: number) => number;
  zoneFor: (time: number) => TimeZoneRange;
}

const HOUR_MS = 60 * 60 * 1000;

function positive(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function normalizeWeights(values: number[]): number[] {
  const cleanValues = values.map((value) => positive(value, 1));
  const total = cleanValues.reduce((sum, value) => sum + value, 0);
  return cleanValues.map((value) => value / total);
}

function projectWithinZone(time: number, zone: TimeZoneRange): number {
  const duration = zone.end - zone.start;
  if (duration <= 0) {
    return zone.xStart;
  }

  const progress = (time - zone.start) / duration;
  return zone.xStart + progress * (zone.xEnd - zone.xStart);
}

export function createNonlinearTimeScale(
  options: ContextCompressionOptions,
  width: number,
  now: number
): NonlinearTimeScale {
  const recentMs = positive(options.recentDurationHours, 6) * HOUR_MS;
  const transitionMs = positive(options.transitionDurationHours, 18) * HOUR_MS;
  const historicalMs = positive(options.historicalDurationHours, 144) * HOUR_MS;
  const totalMs = recentMs + transitionMs + historicalMs;
  const domainStart = now - totalMs;
  const domainEnd = now;
  const historicalEnd = domainStart + historicalMs;
  const transitionEnd = historicalEnd + transitionMs;
  const weights = normalizeWeights([
    options.historicalWidthPercent,
    options.transitionWidthPercent,
    options.recentWidthPercent,
  ]);

  const historicalWidth = width * weights[0];
  const transitionWidth = width * weights[1];

  const zones: TimeZoneRange[] = [
    {
      id: 'historical',
      label: 'Historical',
      start: domainStart,
      end: historicalEnd,
      xStart: 0,
      xEnd: historicalWidth,
    },
    {
      id: 'transition',
      label: 'Transition',
      start: historicalEnd,
      end: transitionEnd,
      xStart: historicalWidth,
      xEnd: historicalWidth + transitionWidth,
    },
    {
      id: 'recent',
      label: 'Recent',
      start: transitionEnd,
      end: domainEnd,
      xStart: historicalWidth + transitionWidth,
      xEnd: width,
    },
  ];

  const scale: NonlinearTimeScale = {
    domainStart,
    domainEnd,
    width,
    zones,
    x: (time) => {
      const clampedTime = Math.max(domainStart, Math.min(domainEnd, time));
      return projectWithinZone(clampedTime, scale.zoneFor(clampedTime));
    },
    zoneFor: (time) => {
      if (time >= zones[2].start) {
        return zones[2];
      }

      if (time >= zones[1].start) {
        return zones[1];
      }

      return zones[0];
    },
  };

  return scale;
}

