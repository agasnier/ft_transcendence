# Backend

Node.js est un runtime JavaScript : il permet d'executer du JavaScript en dehors du navigateur, directement sur une machine. Chaque projet Node fonctionne de maniere isolee, ses dependances sont installees localement dans un dossier `node_modules` propre au projet, et listees dans son `package.json`. C'est npm (Node Package Manager) qui gere tout ca.

Le framework Fastify tourne sur le runtime Node.js.

La premiere chose e faire est de creer un projet Node, cela genere le fichier `package.json` qui detient les informations du projet et la liste des dependances :

```bash
npm init -y
```

Ensuite il faut installer nos dependances, ici le framework Fastify :

```bash
npm install fastify
```

Ensuite pour ecrire le code en TypeScript nous devons installer un transpileur, un traducteur de TypeScript vers le JavaScript. Ces dependances ne servent que pour le build de l'application tournant sur le runtime Node. On peut donc les installer en tant que dev tools :

```bash
npm install -D typescript tsx @types/node
```

Enfin on genere le fichier de configuration TypeScript `tsconfig.json` :

```bash
npx tsc --init
```

Cela nous permet d'avoir les fichiers de configs et de dependance pour le projet, cela creer aussi un dossier node_module et un package_lock.json qui ne sert pas en local alors on le supprime. Ils seront recree dans le containeur. 

Pour que le code TypeScript fonctionne sur le runtime Node.js, le TypeScript doit etre traduit en Javascript. Deux etapes se profilent alors au lancement, un transpilage qui traduit le code, et un lancement. On peut donc se server de docker multistage qui va donc lancer un container pour le transpilage qui prend les dev-tools installes en dependance plus haut et a la suite un container qui lui fait tourner le code sans les dev-tools. 

