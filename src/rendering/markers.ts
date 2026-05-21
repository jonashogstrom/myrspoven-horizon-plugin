import { NonlinearTimeScale, TimeZoneRange } from '../scales/nonlinearTime';

export interface TemporalMarker {
  time: number;
  x: number;
  label?: string;
  major: boolean;
}

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

function alignToStep(time: number, step: number): number {
  return Math.ceil(time / step) * step;
}

function isMidnight(time: number): boolean {
  const date = new Date(time);
  return date.getHours() === 0 && date.getMinutes() === 0;
}

function markerStep(zone: TimeZoneRange): number {
  if (zone.id === 'recent') {
    return HOUR_MS;
  }

  if (zone.id === 'transition') {
    return 6 * HOUR_MS;
  }

  return DAY_MS;
}

function formatMarker(time: number, major: boolean): string {
  const date = new Date(time);

  if (major) {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export function generateTemporalMarkers(scale: NonlinearTimeScale, minLabelSpacing = 56): TemporalMarker[] {
  const markers: TemporalMarker[] = [];
  let lastLabelX = Number.NEGATIVE_INFINITY;

  for (const zone of scale.zones) {
    const step = markerStep(zone);

    for (let time = alignToStep(zone.start, step); time <= zone.end; time += step) {
      const x = scale.x(time);
      const major = isMidnight(time) || zone.id === 'historical';
      const shouldLabel = x - lastLabelX >= minLabelSpacing || major;
      const label = shouldLabel ? formatMarker(time, major) : undefined;

      if (label) {
        lastLabelX = x;
      }

      markers.push({
        time,
        x,
        label,
        major,
      });
    }
  }

  return markers;
}

