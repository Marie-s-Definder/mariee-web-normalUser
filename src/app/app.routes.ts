import { Routes } from '@angular/router';

export const routes: Routes = [{
    path: '404',
    loadComponent: async () => import('./components/404/notfound.component').then(i => i.NotFoundComponent),
}, {
    path: '',
    // 此处需要修改loadComponent: async () => import('../modules/home/home.component').then(i => i.HomeComponent),
    loadComponent: async () => import('../modules/overview/overview.component').then(i => i.OverviewComponent),
}, {
    path: 'overview/:areaId',
    loadComponent: async () => import('../modules/overview/overview.component').then(i => i.OverviewComponent),
}, {
    path: 'robotsstatues/:areaId',
    loadComponent: async () => import('../modules/robotsstatues/robotsstatues.component').then(i => i.RobotsstatuesComponent),
}];
