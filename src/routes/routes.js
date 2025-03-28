import { createRouter, createWebHistory } from 'vue-router';
import MarinersView from '../components/MarinersView.vue';
import ShipsView from '../components/ShipsView.vue';
import SearchView from '../components/SearchView.vue';

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
    path: '/ships',
    name: 'Ships',
    component: ShipsView
  },
  {
    path: '/search',
    name: 'Search',
    component: SearchView
  }
];

const router = createRouter({
  history: createWebHistory('/'),
  routes
});

export default router;
