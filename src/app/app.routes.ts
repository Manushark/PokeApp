import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./components/login/login').then(m => m.LoginComponent)
    },
    {
        path: 'home',
        loadComponent: () => import('./components/home/home').then(m => m.HomeComponent),
        canActivate: [authGuard],
        children: [
            {
                path: 'random',
                loadComponent: () => import('./components/home/random/random').then(m => m.RandomComponent)
            },
            {
                path: 'types',
                loadComponent: () => import('./components/home/types/types').then(m => m.TypesComponent)
            },
            {
                path: 'search',
                loadComponent: () => import('./components/home/search/search').then(m => m.SearchComponent)
            },
            {
                path: '',
                redirectTo: 'random',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: 'config',
        loadComponent: () => import('./components/config/config').then(m => m.ConfigComponent),
        canActivate: [authGuard]
    },
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'home'
    }
];
