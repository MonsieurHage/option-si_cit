# L’Archipel des ingénieurs

Prototype 3D de découverte SI/CIT en seconde, pour l’Institution Saint Jean Douai et Monsieur Hage.

Ce projet constitue une nouvelle proposition. Le premier parcours documentaire reste conservé dans sa branche et sa proposition GitHub en brouillon. Aucun de ses fichiers n’est remplacé par cette version.

## Ce qui est jouable

Le lieu central dessert huit îles : analyse des systèmes, énergie et puissance, électricité, mesure et capteurs, modélisation et simulation, algorithmique et programmation, innovation et design, communication et organisation.

Seule la zone d’analyse dispose actuellement d’un parcours complet. Les sept autres sont explorables, avec un décor thématique et un descriptif de leur future mission. Elles sont signalées comme telles dans la carte.

Les cinq missions d’analyse :

1. Écouter Camille et formuler son besoin avant de choisir une solution.
2. Inspecter cinq composants et identifier leur rôle.
3. Transporter six jetons et les placer dans le système ou dans son environnement.
4. Identifier cinq liens, puis accompagner leurs balises jusqu’aux destinataires.
5. Réaliser trois mesures simulées, interpréter les résultats, alléger le socle, refaire la pesée et expliciter les limites de la conclusion.

Le site comprend aussi six notions expliquées, 22 questions corrigées réparties entre diagnostic, cours et bilan, trois capsules animées de 36 secondes et un carnet exportable. Les vidéos n’ont pas de bande sonore et disposent de transcriptions.

## Tester sans installation

Télécharger `validation/Archipel_SI_Apercu.html`, puis l’ouvrir dans Chrome, Edge, Firefox ou Safari récent. Depuis un dossier de téléchargements, utiliser au besoin « Ouvrir avec » puis sélectionner le navigateur. Le lecteur de pièces jointes ne remplace pas un navigateur pour ce jeu.

Le fichier inclut le moteur et les médias, sans appel à un CDN. La 3D nécessite WebGL 2 ; si ce rendu est indisponible, les cours et les vidéos restent accessibles. Aucune installation ni publication n’est nécessaire.

Les deux logos de Saint Jean et la signature « Monsieur Hage » figurent dans l’interface. Les personnages et les décors sont des créations géométriques originales.

### Commandes

- ZQSD, WASD ou flèches : déplacement.
- E : parler, inspecter, prendre ou déposer.
- Espace : saut. Majuscule : course.
- Clic droit et déplacement : rotation de la caméra. Molette : distance de vue.
- M : carte. C : cours. Échap : options ou fermeture d’une fenêtre.
- Sur écran tactile : pavé de déplacement, saut et bouton d’interaction. Glisser sur le décor pour tourner la caméra.
- « Repère » permet de se rapprocher d’un objectif. Pour le tri, l’élève choisit lui-même la zone à rejoindre ; le repère ne résout pas sa décision.

Le mode économique réduit la résolution de rendu et désactive les ombres. Les animations décoratives peuvent être réduites.

## Développement

Dans ce dossier, avec Node.js récent :

```sh
npm ci
npm run build
npm test
```

Le moteur compilé est produit dans `assets/game.js`. Le dossier `dist`, généré et ignoré par Git, constitue la copie statique pour aperçu. Le fichier autonome de validation est régénéré dans `validation`.

Pour un serveur local hors de l’environnement de travail :

```sh
python3 -m http.server 8080 --directory dist
```

Dans le dépôt principal, l’application est rangée sous `archipel/`, indépendamment de la présentation existante.

## Organisation pour les huit thèmes

- `src/themes.js` : registre des huit zones, positions, statuts, objectifs et données du premier parcours.
- `src/profile.js` : profil local et espaces de progression distincts pour les huit modules.
- `src/state.js` : règles et validation des missions d’analyse, indépendantes du rendu.
- `src/navigation.js` : déplacement, sol, ponts et collisions.
- `src/world.js` : monde 3D, avatar, objets manipulables et interactions de proximité.
- `src/app.js` : interface commune, cours, carte, QCM, carnet et options.
- `src/content.js` : contenus pédagogiques et corrections.

L’ajout d’un thème nécessite ses données pédagogiques, ses règles de mission et ses objets d’interaction. Les progrès des autres thèmes doivent être conservés lors de cette extension. Un thème n’est marqué jouable qu’après intégration et vérification de son parcours.

## Cadre pédagogique

Les huit thèmes structurent la demande pédagogique ; ils ne constituent pas huit chapitres imposés par le programme officiel. Les missions articulent observation, manipulation, modèle, hypothèse, test et communication.

Les mesures et l’allègement sont simulés. Les valeurs ne décrivent pas un prototype réellement testé. Le jeu demande de distinguer conformité à une exigence et validation globale du produit. Après allègement, la stabilité reste à vérifier.

Les XP récompensent les missions terminées et ne constituent pas une note. Les réponses ouvertes nécessitent une appréciation humaine. La progression et le carnet restent dans ce navigateur, sans compte élève ni transmission automatique à l’enseignant. Sur un poste partagé, exporter le carnet avant de quitter.

## Validation avant publication

Les tests couvrent les règles de progression, les erreurs, le parcours complet, les QCM, la reprise, les manipulations et la structure géométrique du monde. Ils vérifient aussi le fichier HTML réellement livré : intégrité du moteur inclus, syntaxe du programme, médias autonomes et démarrage des ressources en mode sans WebGL. Les tests du moteur utilisent un rendu substitué : ils ne certifient pas le rendu WebGL réel.

Le service d’aperçu distant est indisponible dans l’environnement de travail. Le contrôle visuel final et la fluidité sur ordinateur et téléphone restent à vérifier dans un navigateur réel, à l’aide du fichier autonome.

Aucun workflow de déploiement n’est ajouté et aucune mise en production n’est effectuée. Fusion et publication attendent la validation explicite de Monsieur Hage.

## Sources et licences

- [Programme officiel de seconde SI/CIT](https://www.education.gouv.fr/bo/19/Special1/MENE1901570A.htm).
- [Accompagnement Éduscol](https://eduscol.education.fr/document/22498/download).
- Three.js : licence MIT, reproduite dans `assets/THREE_LICENSE.txt` et conservée dans le moteur compilé.
- Logos : Institution Saint Jean Douai, fournis par l’enseignant, convertis en WebP sans perte graphique.
- Monde et personnages : créations originales. Aucun moteur distant ni compte de plateforme de jeu n’est nécessaire.
