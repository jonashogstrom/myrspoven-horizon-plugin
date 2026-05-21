# Project: Grafana Context Compression Timeline Panel

## Overview

Build a custom Grafana panel plugin for passive operational dashboards (TV/wallboard usage) that simultaneously shows:

* highly granular recent operational data
* compressed historical context
* long-term trend shifts
* anomaly origins
* baseline changes

The core idea is NOT a mathematically pure logarithmic X-axis.

Instead, this is a **focus + compressed context timeline visualization** optimized for passive observability dashboards.

The plugin should allow operators to:

* see detailed recent behavior
* understand whether current behavior is anomalous relative to historical patterns
* identify when a shift/regime change began
* preserve situational awareness across large time horizons without interaction

Primary use case:

* monitoring successful runs / throughput / event counts over time
* recent operational detail is critical
* historical context must remain visible
* no user interaction is expected

---

# Design Goals

The panel must:

* prioritize readability from a distance
* work well on TV dashboards
* preserve recent detail
* compress older history progressively
* visually emphasize recent operational state
* preserve temporal orientation
* make trend shifts obvious

This is closer to:

* SCADA dashboards
* NOC/SRE wallboards
* trading terminals
* waveform editors
* focus+context visualization systems

than traditional Grafana time series panels.

---

# Key Concept

Traditional Grafana:

* linear time axis
* one global resolution
* either short-range detail OR long-range context

This plugin:

* allocates more horizontal space to recent time
* progressively compresses older time
* progressively aggregates older data
* preserves both detail and context simultaneously

Example layout:

| Time Range   | Approx Screen Width |
| ------------ | ------------------- |
| last 6h      | 65%                 |
| previous 18h | 20%                 |
| previous 6d  | 15%                 |

The transition between regions should be smooth rather than abrupt.

---

# Critical UX Principles

## 1. Recent detail must dominate visually

Recent data is operationally important.

Recent region should:

* have highest spatial resolution
* highest visual prominence
* most detailed aggregation
* strongest color intensity

---

## 2. Historical data provides context

Older regions should:

* compress progressively
* use larger aggregation windows
* use muted rendering
* remain visually understandable

Goal:

* detect shifts/regime changes
* preserve awareness of historical baseline

---

## 3. Preserve temporal landmarks

Even with nonlinear scaling, operators must remain temporally oriented.

The chart should preserve:

* midnight markers
* day separators
* hour boundaries
* date labels

These markers should remain readable even when spacing is nonlinear.

---

## 4. No interaction assumptions

This is a passive dashboard visualization.

Do NOT optimize around:

* zooming
* brushing
* drag navigation
* hover inspection

Instead optimize for:

* glanceability
* ambient awareness
* visual anomaly detection

---

# Recommended Visualization Model

## Three-zone adaptive timeline

### Zone A — Historical Context

Example:

* 2d–7d ago

Characteristics:

* heavily compressed
* high aggregation
* muted rendering
* simplified shape

Purpose:

* historical baseline awareness
* long-term drift visibility

---

### Zone B — Transitional History

Example:

* 6h–48h ago

Characteristics:

* moderate compression
* medium aggregation
* moderate detail

Purpose:

* show when changes started

---

### Zone C — Operational Present

Example:

* last 6h

Characteristics:

* near-linear scaling
* high detail
* strongest emphasis

Purpose:

* current operational debugging

---

# Data Aggregation Strategy

Older regions should not only be spatially compressed.

They must also use adaptive aggregation.

Suggested defaults:

| Age   | Aggregation |
| ----- | ----------- |
| 0–6h  | 1 min       |
| 6–24h | 5 min       |
| 1–7d  | 30 min      |

Without aggregation, compressed regions become noisy and unreadable.

Aggregation strategy should be configurable.

---

# Recommended Scaling Model

Avoid pure logarithmic scaling.

Preferred approach:

* piecewise nonlinear compression
* smooth interpolation between regions

Possible approaches:

* custom piecewise transform
* exponential compression
* sigmoid compression
* fisheye-style scaling

Goal:

* visually intuitive
* operationally readable
* preserve recent resolution

---

# Suggested Visual Treatment

## Recent region

* vivid colors
* high contrast
* sharper rendering

## Historical region

* muted colors
* lighter opacity
* smoother rendering

The eye should naturally focus on recent behavior while still perceiving historical context.

---

# High-Value Optional Features

## 1. Change-point detection

Automatically detect:

* baseline shifts
* throughput cliffs
* persistent anomalies

Render vertical annotations:

* “shift detected”
* “baseline change”

This is likely very valuable.

Possible algorithms:

* rolling mean change
* CUSUM
* Bayesian change-point detection
* z-score thresholding

Should be optional/configurable.

---

## 2. Historical comparison ghosting

Render:

* yesterday
* previous week
* historical average

as faint background overlays.

This helps identify anomalies visually without interaction.

---

## 3. Semantic labeling

Adaptive labels depending on region:

* recent → minutes/hours
* older → days

Avoid clutter.

---

# Technical Recommendations

## Tech stack

Recommended:

* Grafana panel plugin
* React
* TypeScript
* D3.js for rendering

Avoid canvas initially.

SVG + D3 is preferred for:

* iteration speed
* debugging
* axis rendering
* label handling

Canvas/WebGL can be considered later for very large datasets.

---

# Project Structure

Suggested structure:

```text
src/
  module.ts
  panel/
    ContextCompressionPanel.tsx
  scales/
    nonlinearTime.ts
  rendering/
    axis.ts
    series.ts
    annotations.ts
  aggregation/
    adaptiveBuckets.ts
  detection/
    changepoints.ts
  types/
```

---

# Core Rendering Pipeline

```text
Grafana DataFrame
    ↓
normalize timestamps
    ↓
adaptive aggregation
    ↓
nonlinear time projection
    ↓
screen coordinates
    ↓
SVG rendering
```

Keep time projection isolated in:

```text
src/scales/nonlinearTime.ts
```

This should become the core abstraction.

---

# Suggested Initial MVP

Build the smallest useful version first.

MVP features:

* custom nonlinear X-axis
* three-region compression model
* adaptive aggregation
* SVG rendering
* configurable time ranges
* configurable region proportions
* temporal markers
* one time-series line

No interaction required initially.

---

# Suggested Panel Options

## Compression settings

* recent region duration
* historical region duration
* compression strength
* transition smoothness

## Aggregation settings

* bucket sizes per region
* smoothing level

## Rendering settings

* line thickness
* opacity scaling
* region colors
* temporal marker density

---

# Important Non-Goals (Initially)

Avoid initially:

* shared Grafana crosshair integration
* synchronized zoom
* advanced brushing
* complex interaction
* bidirectional time transforms
* WebGL optimization

Focus first on:

* operational readability
* visual quality
* usefulness on wall dashboards

---

# Success Criteria

The panel is successful if an operator can:

* immediately see current operational state
* recognize whether current behavior is unusual
* identify when a regime shift began
* retain historical awareness
* understand trends at a glance from a TV display

without interacting with the dashboard.

---

# Suggested Development Plan

## Phase 1

* scaffold Grafana plugin
* static rendering
* nonlinear projection
* SVG line chart

## Phase 2

* adaptive aggregation
* temporal landmarks
* region styling

## Phase 3

* anomaly/change-point annotations
* historical overlays
* visual polish

## Phase 4

* performance tuning
* configuration UX
* packaging/signing
* OSS readiness

---

# Suggested First Tasks

1. Scaffold Grafana panel plugin using official tooling
2. Implement nonlinear time projection utility
3. Render a static SVG line using transformed coordinates
4. Add adaptive aggregation
5. Add temporal markers
6. Tune visual proportions for TV readability

Start simple and optimize for visual clarity over mathematical purity.
