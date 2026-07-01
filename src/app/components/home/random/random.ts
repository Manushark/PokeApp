import { Component, signal, computed, OnInit } from '@angular/core';
import { TitleCasePipe, DecimalPipe } from '@angular/common';
import { PokemonService } from '../../../services/pokemon.service';
import { PokemonDetailModalComponent } from '../detail-modal/detail-modal';
import { StatsChartComponent } from './stats-chart/stats-chart';

export type ViewMode = 'gallery' | 'random' | 'charts';

export interface GalleryCard {
  id: number;
  name: string;
  spriteUrl: string;
}

@Component({
  selector: 'app-home-random',
  standalone: true,
  imports: [TitleCasePipe, DecimalPipe, PokemonDetailModalComponent, StatsChartComponent],
  templateUrl: './random.html',
  styleUrl: './random.css'
})
export class RandomComponent implements OnInit {

  // ── Estado de vista ──────────────────────────────
  activeView = signal<ViewMode>('gallery');

  // ── Pokémon aleatorio ────────────────────────────
  pokemonData    = signal<any>(null);
  loading        = signal(false);
  errorMessage   = signal('');

  // ── Galería paginada ─────────────────────────────
  readonly TOTAL_POKEMON = 1025;
  readonly PAGE_SIZE     = 24;
  galleryCards    = signal<GalleryCard[]>([]);
  loadingGallery  = signal(false);
  currentPage     = signal(1);
  totalPages      = computed(() => Math.ceil(this.TOTAL_POKEMON / this.PAGE_SIZE));

  // ── Modal de detalle ─────────────────────────────
  selectedPokemonForModal = signal<any>(null);
  loadingModal            = signal(false);

  // ── Charts ───────────────────────────────────────
  typeDistribution = signal<{type: string, count: number}[]>([]);
  loadingCharts    = signal(false);
  top10Data        = signal<any[]>([]);
  selectedStat     = signal('attack');
  loadingTop10     = signal(false);
  chartsInitialized = false;

  // IDs de pokemon notables para el ranking Top-10
  private readonly NOTABLE_IDS = [
    // Gen 1
    1, 3, 6, 9, 25, 94, 130, 131, 143, 149, 150, 151,
    // Gen 2
    196, 197, 248, 249, 250, 251,
    // Gen 3
    282, 373, 376, 384, 386,
    // Gen 4
    445, 448, 483, 484, 487, 493,
    // Gen 5
    494, 643, 644, 646,
    // Gen 6
    716, 717, 718,
    // Gen 7
    791, 792, 800,
    // Gen 8
    888, 889, 890, 895, 898,
    // Gen 9
    1007, 1008, 1009, 1010
  ];

  constructor(private pokemonService: PokemonService) {}

  ngOnInit(): void {
    this.loadGalleryPage(1);
  }

  // ── Navegación de vistas ─────────────────────────

  switchView(view: ViewMode): void {
    this.activeView.set(view);
    if (view === 'random' && !this.pokemonData()) {
      this.loadRandomPokemon();
    }
    if (view === 'charts' && !this.chartsInitialized) {
      this.chartsInitialized = true;
      this.loadTypeDistribution();
      this.loadTop10(this.selectedStat());
    }
  }

  // ── Pokémon aleatorio ────────────────────────────

  loadRandomPokemon(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.pokemonData.set(null);
    this.activeView.set('random');

    this.pokemonService.getRandomPokemon().subscribe({
      next: (data: any) => {
        this.pokemonData.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Error al cargar el Pokémon aleatorio. Inténtalo de nuevo.');
        this.loading.set(false);
      }
    });
  }

  // ── Galería paginada ─────────────────────────────

  loadGalleryPage(page: number): void {
    this.loadingGallery.set(true);
    const offset = (page - 1) * this.PAGE_SIZE;
    const limit  = Math.min(this.PAGE_SIZE, this.TOTAL_POKEMON - offset);

    this.pokemonService.getPokemonList(limit, offset).subscribe({
      next: (data: any) => {
        const cards: GalleryCard[] = data.results.map((p: any) => {
          const id = this.extractIdFromUrl(p.url);
          return {
            id,
            name: p.name,
            spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
          };
        });
        this.galleryCards.set(cards);
        this.currentPage.set(page);
        this.loadingGallery.set(false);
      },
      error: () => { this.loadingGallery.set(false); }
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    this.loadGalleryPage(page);
  }

  openGalleryCard(card: GalleryCard): void {
    this.loadingModal.set(true);
    this.pokemonService.getPokemonByName(card.name).subscribe({
      next: (data: any) => {
        this.selectedPokemonForModal.set(data);
        this.loadingModal.set(false);
      },
      error: () => { this.loadingModal.set(false); }
    });
  }

  // ── Charts ───────────────────────────────────────

  loadTypeDistribution(): void {
    this.loadingCharts.set(true);
    this.pokemonService.getTypeDistribution().subscribe({
      next: (data) => {
        this.typeDistribution.set(data);
        this.loadingCharts.set(false);
      },
      error: () => { this.loadingCharts.set(false); }
    });
  }

  loadTop10(stat: string): void {
    this.selectedStat.set(stat);
    this.loadingTop10.set(true);

    this.pokemonService.getPokemonBatch(this.NOTABLE_IDS).subscribe({
      next: (pokemons: any[]) => {
        const ranked = pokemons
          .map(p => ({
            name:      p.name,
            id:        p.id,
            value:     p.stats.find((s: any) => s.stat.name === stat)?.base_stat || 0,
            spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10);

        this.top10Data.set(ranked);
        this.loadingTop10.set(false);
      },
      error: () => { this.loadingTop10.set(false); }
    });
  }

  // ── Utilidades ───────────────────────────────────

  clearModal(): void { this.selectedPokemonForModal.set(null); }

  extractIdFromUrl(url: string): number {
    const parts = url.split('/').filter(Boolean);
    return Number(parts[parts.length - 1]);
  }

  // ── Color helpers (usados en vista random) ───────

  translateType(typeName: string): string {
    const translations: { [key: string]: string } = {
      normal: 'Normal', fire: 'Fuego', water: 'Agua', electric: 'Eléctrico',
      grass: 'Planta', ice: 'Hielo', fighting: 'Lucha', poison: 'Veneno',
      ground: 'Tierra', flying: 'Volador', psychic: 'Psíquico', bug: 'Bicho',
      rock: 'Roca', ghost: 'Fantasma', dragon: 'Dragón', steel: 'Acero',
      fairy: 'Hada', dark: 'Siniestro', shadow: 'Sombra', unknown: 'Desconocido'
    };
    return translations[typeName.toLowerCase()] || typeName;
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
}
