export const THEMES = [
 {id:'analyse',title:'Analyse des systèmes',short:'Analyse',color:'#2d75e8',angle:-Math.PI/2,radius:18,ready:true,mission:'Rallumer l’atelier',description:'Comprendre le besoin, les composants et les échanges, puis vérifier des exigences.',concepts:['Besoin et fonction','Frontière et échanges','Exigence et preuve'],prop:'lamp'},
 {id:'energie',title:'Énergie et puissance',short:'Énergie',color:'#efb53e',angle:-Math.PI/4,radius:10,ready:false,mission:'Sauver le quartier',description:'Répartir une réserve d’énergie entre plusieurs usages et comparer leurs durées de fonctionnement.',concepts:['Énergie et puissance','Durée d’utilisation','Budget énergétique'],prop:'turbine'},
 {id:'electricite',title:'Électricité',short:'Électricité',color:'#f57c58',angle:0,radius:10,ready:false,mission:'Dépanner le robot',description:'Identifier une panne dans un circuit virtuel et placer les instruments de mesure.',concepts:['Tension et intensité','Circuit et mesure','Diagnostic'],prop:'circuit'},
 {id:'capteurs',title:'Mesure et capteurs',short:'Capteurs',color:'#22b9bd',angle:Math.PI/4,radius:10,ready:false,mission:'Sécuriser le passage',description:'Répéter les relevés, écarter les interprétations hâtives et régler un seuil de détection.',concepts:['Grandeur et unité','Mesures répétées','Seuil et limite'],prop:'radar'},
 {id:'modelisation',title:'Modélisation et simulation',short:'Modélisation',color:'#9774e9',angle:Math.PI/2,radius:10,ready:false,mission:'Fabriquer la pièce manquante',description:'Ajuster les dimensions d’un support et tester son assemblage avant la fabrication.',concepts:['Modèle et paramètre','Dimensions et jeu','Prévision et essai'],prop:'model'},
 {id:'programmation',title:'Algorithmique et programmation',short:'Programmation',color:'#55b775',angle:3*Math.PI/4,radius:10,ready:false,mission:'Livrer les pièces',description:'Programmer un robot livreur, observer ses déplacements et corriger ses instructions.',concepts:['Instructions et variables','Conditions et boucles','Tests'],prop:'robot'},
 {id:'innovation',title:'Innovation et design',short:'Innovation',color:'#e879b3',angle:Math.PI,radius:10,ready:false,mission:'Aménager le refuge',description:'Imaginer plusieurs solutions et les comparer selon les usages, la matière et la réparabilité.',concepts:['Créativité','Comparaison de solutions','Cycle de vie'],prop:'design'},
 {id:'communication',title:'Communication et organisation',short:'Communication',color:'#e88f42',angle:5*Math.PI/4,radius:10,ready:false,mission:'Convaincre le jury',description:'Présenter un prototype, organiser les preuves et argumenter un choix en équipe.',concepts:['Argument et preuve','Organisation des tâches','Restitution'],prop:'exhibition'}
].map(t=>({...t,x:Math.cos(t.angle)*55,z:Math.sin(t.angle)*55}));
export const ANALYSIS=THEMES[0];
export const MISSIONS=[
 {id:'besoin',title:'Le besoin de Camille',brief:'Camille doit lire ses plans au crépuscule. Rencontrez-la pour comprendre son attente.',goal:'Parler à Camille et formuler son besoin.',hint:'Le besoin décrit une attente d’usage, avant de choisir un composant.',target:'camille'},
 {id:'composants',title:'L’atelier des composants',brief:'Inspectez les cinq pièces sur les présentoirs. Associez chacune à son rôle.',goal:'Identifier les cinq composants et leurs fonctions.',hint:'Un composant est un moyen concret. Sa fonction décrit ce qu’il fait.',target:'part-led'},
 {id:'frontiere',title:'La frontière du système',brief:'Transportez les six jetons vers la bonne zone : dans la lampe ou dans son environnement.',goal:'Placer six éléments selon le périmètre annoncé.',hint:'Notre système comprend la lampe, son cordon et sa commande. La source USB reste extérieure.',target:'sort-led'},
 {id:'flux',title:'Des échanges bien nommés',brief:'Choisissez la nature d’un lien, puis transportez sa balise jusqu’à son destinataire.',goal:'Relier cinq échanges à leur destination.',hint:'L’énergie alimente, éclaire ou chauffe. L’information transmet une consigne. Un lien matériel relie des pièces.',target:'flow-usb'},
 {id:'preuves',title:'Le laboratoire des preuves',brief:'Réalisez trois mesures simulées, interprétez-les et corrigez la masse du prototype.',goal:'Mesurer, comparer, améliorer puis vérifier à nouveau.',hint:'Une valeur doit être comparée à son exigence, avec la même unité. Une modification appelle un nouveau test.',target:'instrument-hauteur'}
];
export const PARTS=[
 {id:'led',name:'Module LED',x:-10,z:-63,role:'Produire la lumière',correct:1,options:['Maintenir la structure.','Produire la lumière.','Mesurer la hauteur.','Stocker le programme.'],why:'La LED, diode électroluminescente, émet de la lumière à partir de l’énergie électrique. Elle produit aussi de la chaleur.',color:'#f8d65a'},
 {id:'portail',name:'Portail',x:-5,z:-64,role:'Positionner la tête',correct:3,options:['Fournir l’énergie électrique.','Mesurer l’éclairement.','Commander l’utilisateur.','Positionner et soutenir la tête.'],why:'Le portail est une structure porteuse. Une autre forme peut assurer la même fonction.',color:'#55c7c8'},
 {id:'socle',name:'Socle',x:0,z:-65,role:'Maintenir la structure',correct:0,options:['Maintenir la structure sur le support.','Produire une consigne.','Transformer toute l’énergie en lumière.','Mesurer une durée.'],why:'Le socle assure l’appui et participe à la stabilité. La stabilité réelle doit être testée.',color:'#4d6685'},
 {id:'commande',name:'Commande',x:5,z:-64,role:'Régler l’éclairage',correct:2,options:['Fabriquer de l’énergie.','Porter la lampe.','Transmettre une consigne de réglage.','Peser le module.'],why:'Les boutons expriment une consigne destinée à l’électronique de commande.',color:'#e5a2d4'},
 {id:'cordon',name:'Cordon USB',x:10,z:-63,role:'Acheminer l’alimentation',correct:1,options:['Choisir le besoin de l’utilisateur.','Acheminer l’alimentation électrique.','Garantir toutes les performances.','Calculer la température.'],why:'Le cordon relie le kit à la source. Dans notre périmètre, il appartient à la lampe.',color:'#799be5'}
];
export const SORT_ITEMS=[
 {id:'led',name:'Module LED',inside:true,x:-14,z:-50,color:'#f8d65a'},
 {id:'socle',name:'Socle',inside:true,x:-11,z:-51,color:'#758ca4'},
 {id:'commande',name:'Commande et cordon',inside:true,x:-8,z:-50,color:'#dba6dd'},
 {id:'utilisateur',name:'Utilisateur',inside:false,x:-14,z:-55,color:'#f7b273'},
 {id:'bureau',name:'Bureau',inside:false,x:-11,z:-55,color:'#c79468'},
 {id:'usb',name:'Source USB',inside:false,x:-8,z:-55,color:'#8ea8ee'}
];
export const SORT_ZONES=[{id:'inside',inside:true,name:'Dans la lampe',x:-10,z:-60,radius:3},{id:'outside',inside:false,name:'Environnement',x:-10,z:-44,radius:3}];
export const NODES={usb:{name:'Source USB',x:12,z:-49},led:{name:'Module LED',x:11,z:-58},user:{name:'Utilisateur',x:5,z:-44},control:{name:'Commande',x:5,z:-51},page:{name:'Page du livre',x:6,z:-59},air:{name:'Air ambiant',x:11,z:-63},arch:{name:'Portail',x:-2,z:-55},head:{name:'Tête de lampe',x:1,z:-55}};
export const LINKS=[
 {id:'usb',from:'usb',to:'led',kind:'energie',label:'Alimenter le module',why:'La source fournit de l’énergie électrique au module.'},
 {id:'reglage',from:'user',to:'control',kind:'information',label:'Régler la luminosité',why:'Le geste de l’utilisateur transmet une consigne de réglage.'},
 {id:'lumiere',from:'led',to:'page',kind:'energie',label:'Éclairer la page',why:'La lumière transporte de l’énergie vers la surface éclairée.'},
 {id:'chaleur',from:'led',to:'air',kind:'energie',label:'Transférer de la chaleur',why:'Une partie de l’énergie est cédée à l’air sous forme thermique.'},
 {id:'maintien',from:'arch',to:'head',kind:'materiel',label:'Maintenir la tête',why:'C’est une liaison physique entre deux pièces de la structure.'}
];
export const KINDS={energie:'Flux d’énergie',information:'Flux d’information',materiel:'Lien matériel'};
export const INSTRUMENTS=[
 {id:'hauteur',name:'Règle',criterion:'Hauteur totale',x:0,z:-48,unit:'mm',value:240,limit:250,strict:false},
 {id:'masse',name:'Balance',criterion:'Masse totale',x:4,z:-47,unit:'g',value:215,repairedValue:190,limit:200,strict:false},
 {id:'duree',name:'Chronomètre',criterion:'Remplacement du module',x:8,z:-47,unit:'s',value:48,limit:60,strict:true}
];
