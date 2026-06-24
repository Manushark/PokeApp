import { Component, signal } from '@angular/core';
import { TitleCasePipe, DecimalPipe } from '@angular/common';
import { PokemonService } from '../../../services/pokemon.service';
import { PokemonDetailModalComponent } from '../detail-modal/detail-modal';

@Component({
  selector: 'app-home-random',
  standalone: true,
  imports: [TitleCasePipe, DecimalPipe, PokemonDetailModalComponent],
  templateUrl: './random.html',
  styleUrl: './random.css'
})
export class RandomComponent {
  pokemonData = signal<any>(null);
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');
  
  // pokemon que se muestra en el modal
  selectedPokemonForModal = signal<any>(null);

  constructor(private pokemonService: PokemonService) {
    this.loadRandomPokemon();
  }

  loadRandomPokemon() {
    this.loading.set(true);
    this.errorMessage.set('');
    this.pokemonData.set(null);

    this.pokemonService.getRandomPokemon().subscribe({
      next: (data: any) => {
        this.pokemonData.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.errorMessage.set('Error al cargar el Pokémon aleatorio. Inténtalo de nuevo.');
        this.loading.set(false);
      }
    });
  }

  clearModal() {
    this.selectedPokemonForModal.set(null);
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
}
