import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatPoint {
  label: string;
  value: number;
  max: number;
}

@Component({
  selector: 'app-radar-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './radar-chart.html',
  styleUrl: './radar-chart.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadarChartComponent implements OnChanges {
  @Input() stats: { stat: { name: string }, base_stat: number }[] = [];
  @Input() color: string = '#3182CE';
  @Input() bgColor: string = '#BEE3F8';

  readonly SIZE = 200;
  readonly CENTER = 100;
  readonly RADIUS = 78;
  readonly LEVELS = 4;
  readonly MAX_STAT = 150;

  readonly STAT_LABELS: { [key: string]: string } = {
    hp: 'PS',
    attack: 'ATK',
    defense: 'DEF',
    'special-attack': 'SpA',
    'special-defense': 'SpD',
    speed: 'VEL',
  };

  statPoints: StatPoint[] = [];
  polygonPoints: string = '';
  gridRings: string[] = [];
  axisLines: { x1: number, y1: number, x2: number, y2: number }[] = [];
  labelPositions: { x: number, y: number, label: string, value: number, anchor: string }[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stats'] && this.stats?.length) {
      this.buildChart();
    }
  }

  buildChart(): void {
    // Use only the 6 main stats
    const orderedKeys = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
    const ordered = orderedKeys
      .map(key => this.stats.find(s => s.stat.name === key))
      .filter(Boolean) as { stat: { name: string }, base_stat: number }[];

    const n = ordered.length;
    const angleStep = (2 * Math.PI) / n;
    // Start from top (- π/2)
    const startAngle = -Math.PI / 2;

    this.statPoints = ordered.map(s => ({
      label: this.STAT_LABELS[s.stat.name] || s.stat.name,
      value: s.base_stat,
      max: this.MAX_STAT
    }));

    // Build grid rings
    this.gridRings = [];
    for (let lvl = 1; lvl <= this.LEVELS; lvl++) {
      const r = (this.RADIUS * lvl) / this.LEVELS;
      const pts = Array.from({ length: n }, (_, i) => {
        const angle = startAngle + i * angleStep;
        const x = this.CENTER + r * Math.cos(angle);
        const y = this.CENTER + r * Math.sin(angle);
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      }).join(' ');
      this.gridRings.push(pts);
    }

    // Build axis lines (center → vertex)
    this.axisLines = Array.from({ length: n }, (_, i) => {
      const angle = startAngle + i * angleStep;
      return {
        x1: this.CENTER,
        y1: this.CENTER,
        x2: +(this.CENTER + this.RADIUS * Math.cos(angle)).toFixed(2),
        y2: +(this.CENTER + this.RADIUS * Math.sin(angle)).toFixed(2),
      };
    });

    // Build data polygon
    const dataPoints = this.statPoints.map((sp, i) => {
      const angle = startAngle + i * angleStep;
      const ratio = Math.min(sp.value / this.MAX_STAT, 1);
      const r = this.RADIUS * ratio;
      const x = this.CENTER + r * Math.cos(angle);
      const y = this.CENTER + r * Math.sin(angle);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    });
    this.polygonPoints = dataPoints.join(' ');

    // Label positions (slightly beyond the radius)
    const labelOffset = this.RADIUS + 18;
    this.labelPositions = this.statPoints.map((sp, i) => {
      const angle = startAngle + i * angleStep;
      const x = this.CENTER + labelOffset * Math.cos(angle);
      const y = this.CENTER + labelOffset * Math.sin(angle);
      // Decide text-anchor based on horizontal position
      let anchor = 'middle';
      if (x < this.CENTER - 5) anchor = 'end';
      else if (x > this.CENTER + 5) anchor = 'start';
      return { x: +x.toFixed(2), y: +y.toFixed(2), label: sp.label, value: sp.value, anchor };
    });
  }
}
