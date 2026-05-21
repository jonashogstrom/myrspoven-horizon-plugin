import React, { useMemo } from 'react';
import { PanelProps } from '@grafana/data';
import { css, cx } from '@emotion/css';
import { useStyles2, useTheme2 } from '@grafana/ui';

import { aggregateSeries } from '../aggregation/adaptiveBuckets';
import { extractTimeSeries, TimeSeries, TimeSeriesPoint } from '../data/extractSeries';
import { createNonlinearTimeScale, TimeZoneId } from '../scales/nonlinearTime';
import { createValueScale } from '../scales/valueScale';
import { generateTemporalMarkers } from '../rendering/markers';
import { ContextCompressionOptions, resolveOptions } from '../types';

interface Props extends PanelProps<ContextCompressionOptions> {}

interface SeriesStats {
  last: number | null;
  max: number | null;
}

const palette = ['#b877d9', '#8f7bd1', '#73bf69', '#f2495c', '#ff9830', '#5794f2', '#fade2a', '#7eb6ff'];

const zoneOpacity: Record<TimeZoneId, number> = {
  historical: 0.36,
  transition: 0.58,
  recent: 0.95,
};

const getStyles = () => ({
  wrapper: css`
    font-family: Open Sans, Inter, Helvetica, Arial, sans-serif;
    position: relative;
    overflow: hidden;
  `,
  empty: css`
    align-items: center;
    display: flex;
    height: 100%;
    justify-content: center;
    opacity: 0.75;
  `,
  svg: css`
    display: block;
  `,
  legend: css`
    display: grid;
    gap: 4px;
    grid-template-columns: 1fr 48px 48px;
    overflow: hidden;
    position: absolute;
    right: 8px;
    top: 8px;
  `,
  legendHeader: css`
    font-size: 11px;
    font-weight: 600;
    line-height: 16px;
    text-align: right;
  `,
  legendName: css`
    align-items: center;
    display: flex;
    font-size: 11px;
    gap: 8px;
    line-height: 16px;
    min-width: 0;
  `,
  legendSwatch: css`
    flex: 0 0 auto;
    height: 3px;
    width: 14px;
  `,
  legendText: css`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  legendValue: css`
    font-size: 11px;
    line-height: 16px;
    text-align: right;
  `,
});

function formatValue(value: number | null): string {
  if (value === null) {
    return '-';
  }

  if (Math.abs(value) >= 1000) {
    return `${Math.round(value / 100) / 10}k`;
  }

  return `${Math.round(value * 10) / 10}`;
}

function getMaxValue(series: TimeSeries[]): number {
  return series.reduce((max, item) => {
    return item.points.reduce((seriesMax, point) => Math.max(seriesMax, point.value ?? 0), max);
  }, 0);
}

function getSeriesStats(points: TimeSeriesPoint[]): SeriesStats {
  const values = points.map((point) => point.value).filter((value): value is number => value !== null);

  if (values.length === 0) {
    return { last: null, max: null };
  }

  return {
    last: values[values.length - 1],
    max: Math.max(...values),
  };
}

function buildStepPath(points: TimeSeriesPoint[], x: (time: number) => number, y: (value: number | null) => number): string {
  if (points.length === 0) {
    return '';
  }

  const [first, ...rest] = points;
  const commands = [`M ${x(first.time).toFixed(2)} ${y(first.value).toFixed(2)}`];

  for (const point of rest) {
    commands.push(`H ${x(point.time).toFixed(2)}`);
    commands.push(`V ${y(point.value).toFixed(2)}`);
  }

  return commands.join(' ');
}

function pointsInZone(points: TimeSeriesPoint[], zoneId: TimeZoneId, scale: ReturnType<typeof createNonlinearTimeScale>) {
  const zone = scale.zones.find((item) => item.id === zoneId);
  if (!zone) {
    return [];
  }

  return points.filter((point) => point.time >= zone.start && point.time <= zone.end);
}

export const ContextCompressionPanel: React.FC<Props> = ({ options, data, width, height, timeRange }) => {
  const theme = useTheme2();
  const styles = useStyles2(getStyles);
  const resolvedOptions = resolveOptions(options);
  const rawSeries = useMemo(() => extractTimeSeries(data), [data]);

  if (rawSeries.length === 0) {
    return (
      <div
        className={cx(
          styles.wrapper,
          styles.empty,
          css`
            color: ${theme.colors.text.secondary};
            width: ${width}px;
            height: ${height}px;
          `
        )}
      >
        No numeric time series
      </div>
    );
  }

  const legendWidth = resolvedOptions.showLegend && width >= 560 ? Math.min(250, Math.max(190, width * 0.28)) : 0;
  const margin = { top: 14, right: legendWidth + 14, bottom: 24, left: 36 };
  const plotWidth = Math.max(1, width - margin.left - margin.right);
  const plotHeight = Math.max(1, height - margin.top - margin.bottom);
  const now = timeRange.to.valueOf();
  const timeScale = createNonlinearTimeScale(resolvedOptions, plotWidth, now);
  const series = aggregateSeries(rawSeries, timeScale, resolvedOptions);

  if (series.length === 0) {
    return (
      <div
        className={cx(
          styles.wrapper,
          styles.empty,
          css`
            color: ${theme.colors.text.secondary};
            width: ${width}px;
            height: ${height}px;
          `
        )}
      >
        No data in selected horizon
      </div>
    );
  }

  const valueScale = createValueScale(getMaxValue(series), plotHeight, resolvedOptions.yScaleMode);
  const temporalMarkers = generateTemporalMarkers(timeScale);
  const x = (time: number) => margin.left + timeScale.x(time);
  const y = (value: number | null) => margin.top + valueScale.y(value);
  const gridColor = theme.colors.border.weak;
  const textColor = theme.colors.text.secondary;
  const zoneFill = theme.colors.background.secondary;

  return (
    <div
      data-testid="context-compression-panel"
      className={cx(
        styles.wrapper,
        css`
          color: ${theme.colors.text.primary};
          width: ${width}px;
          height: ${height}px;
        `
      )}
    >
      <svg
        data-testid="context-compression-panel-svg"
        className={styles.svg}
        width={width}
        height={height}
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          {resolvedOptions.showZoneBackgrounds &&
            timeScale.zones.map((zone, index) => (
              <rect
                key={zone.id}
                x={margin.left + zone.xStart}
                y={margin.top}
                width={zone.xEnd - zone.xStart}
                height={plotHeight}
                fill={zoneFill}
                opacity={index % 2 === 0 ? 0.22 : 0.1}
              />
            ))}

          {valueScale.ticks.map((tick) => (
            <g key={tick.label}>
              <line
                x1={margin.left}
                x2={margin.left + plotWidth}
                y1={margin.top + tick.y}
                y2={margin.top + tick.y}
                stroke={gridColor}
                strokeOpacity={0.5}
              />
              <text x={margin.left - 8} y={margin.top + tick.y + 4} fill={textColor} fontSize={11} textAnchor="end">
                {tick.label}
              </text>
            </g>
          ))}

          {temporalMarkers.map((marker) => (
            <g key={`${marker.time}:${marker.x}`}>
              <line
                x1={x(marker.time)}
                x2={x(marker.time)}
                y1={margin.top}
                y2={margin.top + plotHeight}
                stroke={gridColor}
                strokeOpacity={marker.major ? 0.56 : 0.22}
              />
              {marker.label && (
                <text
                  x={x(marker.time)}
                  y={height - 7}
                  fill={textColor}
                  fontSize={11}
                  textAnchor="middle"
                >
                  {marker.label}
                </text>
              )}
            </g>
          ))}

          {timeScale.zones.slice(1).map((zone) => (
            <line
              key={zone.id}
              x1={margin.left + zone.xStart}
              x2={margin.left + zone.xStart}
              y1={margin.top}
              y2={margin.top + plotHeight}
              stroke={theme.colors.border.medium}
              strokeDasharray="3 4"
              strokeOpacity={0.7}
            />
          ))}

          {series.map((item, index) => {
            const color = item.color ?? palette[index % palette.length];

            return timeScale.zones.map((zone) => {
              const zonePoints = pointsInZone(item.points, zone.id, timeScale);
              const path = buildStepPath(zonePoints, x, y);

              return path ? (
                <path
                  key={`${item.id}:${zone.id}`}
                  d={path}
                  fill="none"
                  stroke={color}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity={zoneOpacity[zone.id]}
                  strokeWidth={resolvedOptions.lineWidth}
                />
              ) : null;
            });
          })}

          <line
            x1={margin.left}
            x2={margin.left + plotWidth}
            y1={margin.top + plotHeight}
            y2={margin.top + plotHeight}
            stroke={theme.colors.border.medium}
          />
        </g>
      </svg>

      {legendWidth > 0 && (
        <div
          data-testid="context-compression-legend"
          className={styles.legend}
          style={{ width: legendWidth, color: theme.colors.text.secondary }}
        >
          <div />
          <div className={styles.legendHeader}>Last</div>
          <div className={styles.legendHeader}>Max</div>

          {series.map((item, index) => {
            const color = item.color ?? palette[index % palette.length];
            const stats = getSeriesStats(item.points);

            return (
              <React.Fragment key={item.id}>
                <div className={styles.legendName} title={item.name}>
                  <span className={styles.legendSwatch} style={{ background: color }} />
                  <span className={styles.legendText}>{item.name}</span>
                </div>
                <div className={styles.legendValue}>{formatValue(stats.last)}</div>
                <div className={styles.legendValue}>{formatValue(stats.max)}</div>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

