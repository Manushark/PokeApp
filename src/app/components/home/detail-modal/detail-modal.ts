import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, signal } from '@angular/core';
import { TitleCasePipe, DecimalPipe } from '@angular/common';
import { PokemonService } from '../../../services/pokemon.service';
import { RadarChartComponent } from './radar-chart/radar-chart';

@Component({
  selector: 'app-pokemon-detail-modal',
  standalone: true,
  imports: [TitleCasePipe, DecimalPipe, RadarChartComponent],
  templateUrl: './detail-modal.html',
  styleUrl: './detail-modal.css'
})
export class PokemonDetailModalComponent implements OnChanges {
  @Input() pokemon: any = null;
  @Output() close = new EventEmitter<void>();

  currentPokemon = signal<any>(null);
  description = signal<string>('');
  loadingDescription = signal<boolean>(false);
  evolutionChain = signal<any[]>([]);
  loadingEvolution = signal<boolean>(false);

  constructor(private pokemonService: PokemonService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['pokemon'] && this.pokemon) {
      this.selectPokemon(this.pokemon);
    }
  }

  selectPokemon(pokeData: any) {
    this.currentPokemon.set(pokeData);
    this.loadDescription();
    this.loadEvolutionChain();
  }

  loadDescription() {
    this.loadingDescription.set(true);
    this.description.set('');
    
    this.pokemonService.getPokemonDescription(this.currentPokemon().id).subscribe({
      next: (desc: string) => {
        this.description.set(desc);
        this.loadingDescription.set(false);
      },
      error: () => {
        this.description.set('No se pudo cargar la descripción de la Pokédex.');
        this.loadingDescription.set(false);
      }
    });
  }

  loadEvolutionChain() {
    this.loadingEvolution.set(true);
    this.evolutionChain.set([]);

    this.pokemonService.getPokemonSpecies(this.currentPokemon().id).subscribe({
      next: (speciesData: any) => {
        const chainUrl = speciesData.evolution_chain?.url;
        if (!chainUrl) {
          this.loadingEvolution.set(false);
          return;
        }

        this.pokemonService.getEvolutionChain(chainUrl).subscribe({
          next: (chainData: any) => {
            const parsed = this.parseEvolutionChain(chainData.chain);
            this.evolutionChain.set(parsed);
            this.loadingEvolution.set(false);
          },
          error: () => {
            this.loadingEvolution.set(false);
          }
        });
      },
      error: () => {
        this.loadingEvolution.set(false);
      }
    });
  }

  parseEvolutionChain(chain: any): any[] {
    const list: any[] = [];
    let current = chain;

    while (current) {
      const speciesUrl = current.species.url;
      const id = this.extractIdFromUrl(speciesUrl);
      
      list.push({
        name: current.species.name,
        id: id,
        imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
      });

      if (current.evolves_to && current.evolves_to.length > 0) {
        current = current.evolves_to[0];
      } else {
        current = null;
      }
    }
    return list;
  }

  extractIdFromUrl(url: string): number {
    const parts = url.split('/').filter(Boolean);
    return Number(parts[parts.length - 1]);
  }

  onEvolutionClick(pokemonName: string) {
    if (pokemonName === this.currentPokemon().name) return;
    this.loadingDescription.set(true);
    this.loadingEvolution.set(true);

    this.pokemonService.getPokemonByName(pokemonName).subscribe({
      next: (pokeData: any) => {
        this.selectPokemon(pokeData);
      },
      error: () => {
        this.loadingDescription.set(false);
        this.loadingEvolution.set(false);
      }
    });
  }

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

  translateAbility(abilityName: string): string {
    const abilities: { [key: string]: string } = {
      overgrow: 'Espesura', blaze: 'Mar Llamas', torrent: 'Torrente', shield_dust: 'Polvo Escudo',
      shed_skin: 'Mudar', compound_eyes: 'Ojo Compuesto', tinted_lens: 'Lente Tintada', swarm: 'Enjambre',
      insomnia: 'Insomnio', keen_eye: 'Vista Lince', vital_spirit: 'Espíritu Vital', static: 'Estática',
      sand_veil: 'Velo Arena', damp: 'Humedad', water_absorb: 'Absorbe Agua', flash_fire: 'Absorbe Fuego',
      effect_spore: 'Espora Efecto', poison_point: 'Punto Tóxico', shell_armor: 'Caparazón',
      inner_focus: 'Foco Interno', soundproof: 'Insonorizar', levitate: 'Levitación', synchronize: 'Sincronía',
      chlorophyll: 'Clorofila', natural_cure: 'Cura Natural', intimidate: 'Intimidación',
      guts: 'Agallas', clear_body: 'Cuerpo Puro', liquid_ooze: 'Viscosidad', pressure: 'Presión'
    };
    const formatted = abilityName.replace('-', '_').toLowerCase();
    return abilities[formatted] || abilityName.replace('-', ' ').toUpperCase();
  }

  translateStatName(statName: string): string {
    const stats: { [key: string]: string } = {
      hp: 'PS', attack: 'Ataque', defense: 'Defensa', 
      'special-attack': 'At. Especial', 'special-defense': 'Def. Especial',
      speed: 'Velocidad'
    };
    return stats[statName.toLowerCase()] || statName;
  }
}
