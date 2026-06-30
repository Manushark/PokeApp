import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private baseUrl = 'https://pokeapi.co/api/v2';
  
  // cache para no repetir peticiones
  private pokemonCache = new Map<string, any>();
  private typesCache: any[] = [];
  private typePokemonCache = new Map<string, any>();
  private speciesCache = new Map<number, string>();
  private speciesDataCache = new Map<number, any>();
  private evolutionChainCache = new Map<string, any>();
  private pokemonListCache = new Map<string, any>();
  private typeDistributionCache: {type: string, count: number}[] | null = null;

  constructor(private http: HttpClient) { }

  // pokemon aleatorio — ahora del rango completo 1-1025
  getRandomPokemon(): Observable<any> {
    const randomId = Math.floor(Math.random() * 1025) + 1;
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

  // lista paginada ligera (nombre + url) — un solo request por página
  getPokemonList(limit: number, offset: number): Observable<{count: number, results: {name: string, url: string}[]}> {
    const cacheKey = `list_${limit}_${offset}`;
    if (this.pokemonListCache.has(cacheKey)) {
      return of(this.pokemonListCache.get(cacheKey));
    }
    return this.http.get<any>(`${this.baseUrl}/pokemon?limit=${limit}&offset=${offset}`).pipe(
      tap(data => this.pokemonListCache.set(cacheKey, data))
    );
  }

  // carga en paralelo de múltiples pokemon (con forkJoin + caché)
  getPokemonBatch(ids: number[]): Observable<any[]> {
    const requests = ids.map(id => {
      const cacheKey = String(id);
      if (this.pokemonCache.has(cacheKey)) {
        return of(this.pokemonCache.get(cacheKey));
      }
      return this.http.get<any>(`${this.baseUrl}/pokemon/${id}`).pipe(
        tap(data => {
          this.pokemonCache.set(cacheKey, data);
          this.pokemonCache.set(data.name.toLowerCase(), data);
        })
      );
    });
    return forkJoin(requests);
  }

  // distribución de pokemon por tipo (18 tipos en paralelo)
  getTypeDistribution(): Observable<{type: string, count: number}[]> {
    if (this.typeDistributionCache) {
      return of(this.typeDistributionCache);
    }
    const types = [
      'normal', 'fire', 'water', 'electric', 'grass', 'ice',
      'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
      'rock', 'ghost', 'dragon', 'steel', 'fairy', 'dark'
    ];
    const requests = types.map(t => this.getPokemonByType(t));
    return forkJoin(requests).pipe(
      map(results =>
        results
          .map((r: any, i: number) => ({
            type: types[i],
            count: (r.pokemon?.length || 0)
          }))
          .sort((a, b) => b.count - a.count)
      ),
      tap(data => { this.typeDistributionCache = data; })
    );
  }

  // lista de tipos
  getPokemonTypes(): Observable<any> {
    if (this.typesCache.length > 0) {
      return of({ results: this.typesCache });
    }

    return this.http.get<any>(`${this.baseUrl}/type/`).pipe(
      map(data => {
        // ignoramos estos tipos raros
        const ignoredTypes = ['unknown', 'shadow', 'stellar'];
        const filtered = data.results.filter((t: any) => !ignoredTypes.includes(t.name.toLowerCase()));
        return { results: filtered };
      }),
      tap(data => {
        this.typesCache = data.results;
      })
    );
  }

  // buscar por nombre o id
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

  // pokemon de un tipo concreto
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

  // descripcion en español
  getPokemonDescription(id: number): Observable<string> {
    if (this.speciesCache.has(id)) {
      return of(this.speciesCache.get(id)!);
    }

    return this.http.get<any>(`${this.baseUrl}/pokemon-species/${id}`).pipe(
      map(data => {
        const entry = data.flavor_text_entries.find((e: any) => e.language.name === 'es');
        // limpiamos saltos de linea raros que devuelve la api
        const desc = entry 
          ? entry.flavor_text.replace(/[\n\f\r]/g, ' ') 
          : 'No hay una descripción disponible en español para este Pokémon.';
        this.speciesCache.set(id, desc);
        return desc;
      })
    );
  }

  // datos de la especie
  getPokemonSpecies(id: number): Observable<any> {
    if (this.speciesDataCache.has(id)) {
      return of(this.speciesDataCache.get(id));
    }
    return this.http.get<any>(`${this.baseUrl}/pokemon-species/${id}`).pipe(
      tap(data => this.speciesDataCache.set(id, data))
    );
  }

  // cadena de evoluciones
  getEvolutionChain(url: string): Observable<any> {
    if (this.evolutionChainCache.has(url)) {
      return of(this.evolutionChainCache.get(url));
    }
    return this.http.get<any>(url).pipe(
      tap(data => this.evolutionChainCache.set(url, data))
    );
  }
}
