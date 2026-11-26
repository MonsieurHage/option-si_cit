# SI / CIT en seconde — Institution Saint Jean Douai

Ouvrir `index.html` dans un navigateur. La présentation comporte 12 diapositives, un sommaire, des activités à explorer et un quiz. Les flèches du clavier permettent de naviguer.

## Parcours interactif pour les élèves

Le module `apprendre/analyse-systeme/index.html` propose une entrée autonome depuis la présentation :

- diagnostic de six questions avec correction expliquée ;
- six notions de cours, chacune accompagnée d’un exemple, d’un piège et d’une question ;
- exploration de cinq composants de la lampe ÉCLIPSE et exercice de frontière ;
- jeu de tri de dix cartes et jeu d’identification de cinq échanges ;
- atelier sur les exigences, trois comparaisons de données simulées et carnet d’analyse ;
- trois vidéos originales de 36 secondes, sans bande sonore, avec texte et transcription ;
- bilan de dix questions incluant un transfert au ventilateur portable ;
- export du carnet en texte et impression ou enregistrement PDF depuis le navigateur.

Les deux logos fournis de l’Institution Saint Jean et la signature « Monsieur Hage » sont intégrés. Les logos ont été convertis en WebP sans perte ; leur graphisme est conservé.

### Vérification locale

Prérequis : Node.js et Python 3. L’application n’utilise aucune dépendance JavaScript externe.

```sh
npm test
npm run build
python3 -m http.server 8080 --directory dist
```

Ouvrir `http://localhost:8080/apprendre/analyse-systeme/`. Le dossier `dist` est généré et ignoré par Git. Le fichier de configuration `.openai/hosting.json`, également ignoré, ne sert qu’à l’aperçu de travail.

Pour une lecture autonome sans serveur, ouvrir `validation/SI_CIT_Analyse_Apercu.html`. Cette copie de validation inclut les médias. La régénérer après modification avec `python3 tools/make_preview.py`.

### Progression et limites

Les réponses et le carnet restent dans le stockage local du navigateur. Il n’y a ni compte élève, ni classement public, ni transmission des textes. Sur un poste partagé, l’élève doit exporter son carnet puis effacer sa progression s’il le souhaite.

Les XP récompensent les activités terminées et ne constituent pas une note. Les réponses ouvertes ne sont pas évaluées automatiquement : elles sont relues à l’aide des critères, puis discutées avec l’enseignant. Le diagnostic et le bilan sont différents ; leurs scores ne sont pas présentés comme une mesure comparable de progrès. Les valeurs numériques des exercices sont explicitement simulées.

La représentation de la lampe est une visualisation de concept. Aucune performance du produit fabriqué n’est présumée. Le périmètre de l’analyse inclut la lampe, son cordon et sa commande ; la source USB reste extérieure.

### Publication soumise à validation

Ce travail est préparé sur une branche séparée pour révision. Aucun workflow de déploiement n’est ajouté. La mise en production et la fusion vers la branche principale nécessitent la validation explicite de Monsieur Hage. Ne pas activer de publication automatique de cette branche de préparation.

### Régénérer les vidéos

Les fichiers MP4 sont déjà inclus. `python3 tools/generate_videos.py` permet de les reproduire avec Pillow et FFmpeg. Les fichiers VTT et les transcriptions restent disponibles sans service tiers.

## Sources et crédits

- [Fiche officielle de l’option à Saint Jean Douai](https://www.stjean-douai.eu/lycee/notre-offre-doptions-des-la-2nde/sciences-lringenieur-creation-innovation-technologique-html/).

