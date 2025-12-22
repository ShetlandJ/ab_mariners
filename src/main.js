import { createApp } from 'vue';
import App from './App.vue';
import router from './routes/routes';
import './assets/main.css';

console.log('=== MAIN.JS LOADING ===');
console.log('Vue app starting...');

try {
  const app = createApp(App);
  console.log('Vue app created');
  
  app.use(router);
  console.log('Router installed');
  
  app.mount('#app');
  console.log('App mounted successfully!');
} catch (error) {
  console.error('ERROR MOUNTING APP:', error);
  alert('Failed to start app: ' + error.message);
}

console.log('=== MAIN.JS FINISHED ===');