<div align="center">

# 🔴 PokéApp

**Una Pokédex interactiva construida con Angular 21**

Explora el mundo Pokémon con una interfaz moderna, modo oscuro y datos en tiempo real de la PokéAPI.

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PokéAPI](https://img.shields.io/badge/PokéAPI-v2-EF5350?style=for-the-badge)](https://pokeapi.co)
[![Netlify](https://img.shields.io/badge/Deploy-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://www.netlify.com)

</div>

---

## ✨ Características

| Función | Descripción |
|---|---|
| 🎲 **Pokémon Aleatorio** | Descubre un Pokémon al azar de la 1ª generación con stats, tipo y descripción |
| 🏷️ **Explorar por Tipos** | Filtra todos los Pokémon de la 1ª gen agrupados por sus 18 tipos |
| 🔍 **Búsqueda** | Busca cualquier Pokémon por nombre o número de Pokédex |
| 📋 **Modal de Detalles** | Vista detallada con stats, cadena evolutiva y descripción en español |
| 🌙 **Modo Oscuro / Claro** | Tema alternante persistente con diseño glassmorphism |
| ⚡ **Caché inteligente** | Las peticiones a la API se almacenan en memoria para evitar llamadas duplicadas |

---

## 🛠️ Tecnologías

- **[Angular 21](https://angular.dev)** — Framework principal con componentes standalone y Signals
- **[RxJS 7.8](https://rxjs.dev)** — Manejo reactivo de peticiones HTTP
- **[PokéAPI v2](https://pokeapi.co)** — API pública de datos Pokémon
- **[TypeScript 5.9](https://www.typescriptlang.org)** — Tipado estático
- **[Prettier](https://prettier.io)** — Formateo de código
- **[Vitest](https://vitest.dev)** — Testing unitario
- **[Netlify](https://www.netlify.com)** — Plataforma de despliegue

---

## 🗂️ Estructura del Proyecto

```
src/
├── app/
│   ├── components/
│   │   ├── login/              # Pantalla de inicio de sesión
│   │   ├── home/               # Layout principal (sidebar + navbar)
│   │   │   ├── random/         # Vista: Pokémon Aleatorio
│   │   │   ├── types/          # Vista: Explorar por Tipos
│   │   │   ├── search/         # Vista: Búsqueda de Pokémon
│   │   │   └── detail-modal/   # Modal de detalles y cadena evolutiva
│   │   └── config/             # Configuración de cuenta y cierre de sesión
│   ├── services/
│   │   ├── pokemon.service.ts  # Lógica de la PokéAPI + caché
│   │   └── theme.service.ts    # Gestión del tema claro/oscuro
│   ├── guards/
│   │   └── auth-guard.ts       # Protección de rutas por sesión
│   └── app.routes.ts           # Definición de rutas con lazy loading
└── styles.css                  # Estilos globales y variables CSS
```

---

## 🚀 Instalación y Uso Local

### Requisitos previos

- [Node.js](https://nodejs.org) v18 o superior
- npm v10 o superior

### Pasos

```bash
# 1. Clona el repositorio
git clone https://github.com/tu-usuario/pokeapp.git
cd pokeapp

# 2. Instala las dependencias
npm install

# 3. Inicia el servidor de desarrollo
npm start
```

La aplicación estará disponible en `http://localhost:4200`.

---

## 🔐 Credenciales de Prueba

La app utiliza autenticación simulada con `localStorage`. Para iniciar sesión:

| Campo | Valor |
|---|---|
| **Usuario** | `Entrenador` |
| **Contraseña** | `1234` |

> La sesión persiste entre recargas de página gracias a `localStorage`.

---

## 📦 Scripts Disponibles

```bash
npm start          # Servidor de desarrollo (ng serve)
npm run build      # Build de producción
npm run watch      # Build en modo watch (desarrollo)
npm test           # Ejecutar tests unitarios con Vitest
```

---

## 🏗️ Arquitectura y Decisiones Técnicas

### Componentes Standalone
Todos los componentes usan la API standalone de Angular, eliminando la necesidad de `NgModules`.

### Angular Signals
El estado interno de los componentes se gestiona con `signal()` de Angular, permitiendo reactividad granular y sin necesidad de `BehaviorSubject`.

### Lazy Loading
Las rutas cargan sus componentes bajo demanda (`loadComponent`), reduciendo el bundle inicial.

### Caché en Memoria
El `PokemonService` implementa un sistema de caché con `Map<string, any>` para evitar peticiones repetidas a la PokéAPI durante la sesión del usuario.

### Scope de Datos
La app trabaja exclusivamente con los **151 Pokémon de la 1ª generación** para mantener una experiencia enfocada y cohesiva.

---

## 🌐 Despliegue

El proyecto está configurado para desplegarse automáticamente en **Netlify**:

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist/PokeApp/browser"
```

El archivo `netlify.toml` en la raíz gestiona la configuración del build. El SPA routing funciona correctamente gracias a los redirects de Netlify.

---

## 📡 API Utilizada

Este proyecto consume la **[PokéAPI v2](https://pokeapi.co/api/v2)**, una API pública y gratuita. Los endpoints utilizados son:

- `GET /pokemon/{id|name}` — Datos del Pokémon
- `GET /type/` — Lista de todos los tipos
- `GET /type/{name}` — Pokémon de un tipo concreto
- `GET /pokemon-species/{id}` — Descripción en español y datos de especie
- `GET /evolution-chain/{url}` — Cadena evolutiva

---

<div align="center">

Hecho con ❤️ y mucha Pokéball | Datos por [PokéAPI](https://pokeapi.co)

</div>
