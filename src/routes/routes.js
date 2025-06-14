import { createRouter, createWebHistory } from 'vue-router';
import MarinersView from '../components/MarinersView.vue';
import ShipsView from '../components/ShipsView.vue';
import SearchView from '../components/SearchView.vue';
import MarinerPersonView from '../components/MarinerPersonView.vue';
import ReportsView from '../components/ReportsView.vue';
import BackupView from '../components/BackupView.vue';

const routes = [
  {
    path: '/',
    redirect: '/mariners'
  },
  {
    path: '/mariners',
    name: 'Mariners',
    component: MarinersView
  },
  {
    path: '/mariners/:id',
    name: 'mariner-person-view',
    component: MarinerPersonView,
    props: true
  },
  {
    path: '/ships',
    name: 'Ships',
    component: ShipsView
  },
  {
    path: '/search',
    name: 'Search',
    component: SearchView
  },
  {
    path: '/reports',
    name: 'Reports',
    component: ReportsView
  },
  {
    path: '/backup',
    name: 'Backup',
    component: BackupView
  }
];

const router = createRouter({
  history: createWebHistory('/'),
  routes
});

export default router;
