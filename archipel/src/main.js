import {ArchipelApp} from './app.js';
try { new ArchipelApp(); }
catch(error){const message=document.getElementById('boot-message');message.hidden=false;message.textContent='Le jeu n’a pas pu démarrer. Rechargez la page dans un navigateur récent.';console.error(error);}
