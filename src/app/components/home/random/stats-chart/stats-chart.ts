import {
  Component, Input, Output, EventEmitter, OnChanges, SimpleChanges,
  ChangeDetectionStrategy
} from '@angular/core';
import { TitleCasePipe } from '@angular/common';

export interface TypeDistItem {
  type: string;
  count: number;
}

export interface Top10Item {
  name: string;
  id: number;
  value: number;
  spriteUrl: string;
}

@Component({
  selector: 'app-stats-chart',
  standalone: true,
  imports: [TitleCasePipe],
  templateUrl: './stats-chart.html',
  styleUrl: './stats-chart.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatsChartComponent implements OnChanges {
  @Input() typeDistribution: TypeDistItem[] = [];
  @Input() top10Data: Top10Item[] = [];
  @Input() selectedStat: string = 'attack';
  @Input() loading: boolean = false;
  @Input() loadingTop10: boolean = false;
  @Output() statChanged = new EventEmitter<string>();

  maxTypeCount = 0;
  maxStatValue = 0;
  totalPokemon = 0;

  readonly STAT_OPTIONS = [
    { key: 'hp',               label: 'PS'       },
    { key: 'attack',           label: 'Ataque'   },
    { key: 'defense',          label: 'Defensa'  },
    { key: 'special-attack',   label: 'At. Esp.' },
    { key: 'special-defense',  label: 'Def. Esp.'},
    { key: 'speed',            label: 'Velocidad'},
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['typeDistribution'] && this.typeDistribution.length) {
      this.maxTypeCount  = Math.max(...this.typeDistribution.map(t => t.count));
      this.totalPokemon  = this.typeDistribution.reduce((s, t) => s + t.count, 0);
    }
    if (changes['top10Data'] && this.top10Data.length) {
      this.maxStatValue = Math.max(...this.top10Data.map(t => t.value));
    }
  }

  getTypeBarWidth(count: number): number {
    return this.maxTypeCount ? (count / this.maxTypeCount) * 100 : 0;
  }

  getStatBarWidth(value: number): number {
    return this.maxStatValue ? (value / this.maxStatValue) * 100 : 0;
  }

  getTypePercent(count: number): string {
    return this.totalPokemon ? ((count / this.totalPokemon) * 100).toFixed(1) : '0.0';
  }

  changeStat(key: string): void {
    this.statChanged.emit(key);
  }

  getTypeColor(typeName: string): string {
    const colors: { [key: string]: string } = {
      normal: '#E6E6D4', fire: '#FFD1B3', water: '#D0E1FD', electric: '#FFF4B8',
      grass: '#D2F0C2', ice: '#E0F7F6', fighting: '#F5C2C0', poison: '#EAD0EA',
      ground: '#F5E6C0', flying: '#E3DAFC', psychic: '#FFD3E2', bug: '#EFF3C8',
      rock: '#ECE6B8', ghost: '#DDD8F0', dragon: '#DDD0FF', steel: '#EAEAF0',
      fairy: '#FAD2E1', dark: '#DDD8D8'
    };
    return colors[typeName.toLowerCase()] || '#E2E8F0';
  }

  getTypeTextColor(typeName: string): string {
    const colors: { [key: string]: string } = {
      normal: '#707054', fire: '#C85A17', water: '#2B57B8', electric: '#967800',
      grass: '#448C17', ice: '#2D8B87', fighting: '#A31C18', poison: '#752A75',
      ground: '#9E7E1D', flying: '#5A38A0', psychic: '#BF1F53', bug: '#738A0E',
      rock: '#7B6C13', ghost: '#453875', dragon: '#4517A7', steel: '#6C6C8A',
      fairy: '#AA3D66', dark: '#493939'
    };
    return colors[typeName.toLowerCase()] || '#4A5568';
  }

  translateType(typeName: string): string {
    const translations: { [key: string]: string } = {
      normal: 'Normal', fire: 'Fuego', water: 'Agua', electric: 'Eléctrico',
      grass: 'Planta', ice: 'Hielo', fighting: 'Lucha', poison: 'Veneno',
      ground: 'Tierra', flying: 'Volador', psychic: 'Psíquico', bug: 'Bicho',
      rock: 'Roca', ghost: 'Fantasma', dragon: 'Dragón', steel: 'Acero',
      fairy: 'Hada', dark: 'Siniestro'
    };
    return translations[typeName.toLowerCase()] || typeName;
  }
}
