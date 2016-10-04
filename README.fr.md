# JSHint, un outil d'analyse du code statique Javascript.


\[ [Test en ligne](http://jshint.com/) •
[Documentation](http://jshint.com/docs/) • [FAQ](http://jshint.com/docs/faq) •
[Installer](http://jshint.com/install/) •
[Contribuer](http://jshint.com/contribute/) •
[Blog](http://jshint.com/blog/) • [Twitter](https://twitter.com/jshint/) \]

[![NPM version](https://img.shields.io/npm/v/jshint.svg?style=flat)](https://www.npmjs.com/package/jshint)
[![Linux Build Status](https://img.shields.io/travis/jshint/jshint/master.svg?style=flat&label=Linux%20build)](https://travis-ci.org/jshint/jshint)
[![Windows Build status](https://img.shields.io/appveyor/ci/jshint/jshint/master.svg?style=flat&label=Windows%20build)](https://ci.appveyor.com/project/jshint/jshint/branch/master)
[![Dependency Status](https://img.shields.io/david/jshint/jshint.svg?style=flat)](https://david-dm.org/jshint/jshint)
[![devDependency Status](https://img.shields.io/david/dev/jshint/jshint.svg?style=flat)](https://david-dm.org/jshint/jshint#info=devDependencies)
[![Coverage Status](https://img.shields.io/coveralls/jshint/jshint.svg?style=flat)](https://coveralls.io/r/jshint/jshint?branch=master)

JSHint est un outil communautaire qui détecte les erreurs et les problèmes potentiel dans du code Javascript.
JSHint est si flexible qu'il peut facilement être intégré dans l'environnement au sein duquel le code sera exécuté.
JSHint est open source, et le restera.

## Notre objectif 

Le projet a pour objectif d'aider les développeurs Javascript à coder des programmes complexe, sans se préoccuper de la typographie et des erreurs de variables.

Tout code devient souvent conséquent, et la plus petite erreur - qui ne saute pas aux yeux lorsque elle est écrite - peut marquer un coup d'arrêt et ajouter de nombreuses heures supplémentaires pour le débugger.
C'est ici qu'un outil d'analyse statique du code entre en jeux, pour aider les développeurs à voir ces problèmes.
JSHint scanne un programme écrit en Javascript et fait un rapport sur les erreurs communes et les potentiels erreurs. Ces dernières peuvent être des erreurs de syntaxe, une erreur due à un type implicite de conversion, une variable inexistante, ou quoi que ce soit d'autre.

Seulement 15% de tous les programmes passés par [jshint.com](http://jshint.com) sont entièrement validés par son système de vérification.
Le reste des programmes contient des erreurs et des problèmes potentiels, trouvés par JSHint.

Notez toutefois que même si un outil d'analyse statique du code peut révéler différentes sortes d'erreurs, il ne peut détecter si le programme est correct, rapide ou a des fuites de mémoires.
Vous devez toujours combiner des outils comme JSHint avec des tests unitaires et fonctionnels ainsi que des vérifications de code.

## Rapport d'erreurs
