import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private baseUrl = 'https://pokeapi.co/api/v2';
  
  // Caché de peticiones para máxima velocidad de respuesta (Instantánea)
  private pokemonCache = new Map<string, any>();
  private typesCache: any[] = [];
  private typePokemonCache = new Map<string, any>();
  private speciesCache = new Map<number, string>();

  constructor(private http: HttpClient) { }

  // Opción 1: Obtener un Pokémon aleatorio (con caché rápida)
  getRandomPokemon(): Observable<any> {
    const randomId = Math.floor(Math.random() * 151) + 1;
    const cacheKey = String(randomId);

    if (this.pokemonCache.has(cacheKey)) {
      return of(this.pokemonCache.get(cacheKey));
    }

    return this.http.get<any>(`${this.baseUrl}/pokemon/${randomId}`).pipe(
      tap(data => {
        this.pokemonCache.set(cacheKey, data);
        this.pokemonCache.set(data.name.toLowerCase(), data);
      })
    );
  }

  // Opción 2: Listar tipos de Pokémon (con caché estática)
  getPokemonTypes(): Observable<any> {
    if (this.typesCache.length > 0) {
      return of({ results: this.typesCache });
    }

    return this.http.get<any>(`${this.baseUrl}/type/`).pipe(
      tap(data => {
        this.typesCache = data.results;
      })
    );
  }

  // Opción 3: Buscar Pokémon por nombre o ID (con caché instantánea)
  getPokemonByName(name: string): Observable<any> {
    const formattedName = name.trim().toLowerCase();

    if (this.pokemonCache.has(formattedName)) {
      return of(this.pokemonCache.get(formattedName));
    }

    return this.http.get<any>(`${this.baseUrl}/pokemon/${formattedName}`).pipe(
      tap(data => {
        this.pokemonCache.set(formattedName, data);
        this.pokemonCache.set(String(data.id), data);
      })
    );
  }

  // Obtener la lista de Pokémon que pertenecen a un tipo elemental específico (con caché)
  getPokemonByType(typeName: string): Observable<any> {
    const formattedType = typeName.trim().toLowerCase();

    if (this.typePokemonCache.has(formattedType)) {
      return of(this.typePokemonCache.get(formattedType));
    }

    return this.http.get<any>(`${this.baseUrl}/type/${formattedType}`).pipe(
      tap(data => {
        this.typePokemonCache.set(formattedType, data);
      })
    );
  }

  // Obtener la descripción del Pokémon en español desde el endpoint species (con caché)
  getPokemonDescription(id: number): Observable<string> {
    if (this.speciesCache.has(id)) {
      return of(this.speciesCache.get(id)!);
    }

    return this.http.get<any>(`${this.baseUrl}/pokemon-species/${id}`).pipe(
      map(data => {
        const entry = data.flavor_text_entries.find((e: any) => e.language.name === 'es');
        // Limpiamos los saltos de línea extraños que a veces devuelve la PokéAPI (\f, \n, etc.)
        const desc = entry 
          ? entry.flavor_text.replace(/[\n\f\r]/g, ' ') 
          : 'No hay una descripción disponible en español para este Pokémon.';
        this.speciesCache.set(id, desc);
        return desc;
      })
    );
  }
}
