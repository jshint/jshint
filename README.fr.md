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

## Rapporter des erreurs

Pour rapporter des erreurs, il suffit de créer un [new GitHub Issue](https://github.com/jshint/jshint/issues/new) et décrire le problème ou la suggestion d'amélioration.
Nous accueillons avec bienveillance toutes sortes de remarques à propos de JSHint, notamment, et non limitativement :

 * Quand JSHint ne fonctionne pas comme il le devrait 
 * Quand JSHint critique un code Javascript valide qui fonctionne sur tous les navigateurs 
 * Quand vous souhaitez simplement une nouvelle option ou une nouvelle fonctionnalité 

Avant de rapporter une erreur, vérifiez auparavant qu'il n'existe pas déjà un ticket en cours, ou clôturé, qui traite de votre problème, et souvenez vous de cette sagesse immuable : pull request > bug report > tweet.

## Qui utilise JSHint ?

Les ingénieurs de ces sociétés et de ces projets, utilisent JSHint:

* [Mozilla](https://www.mozilla.org/)
* [Wikipedia](https://wikipedia.org/)
* [Facebook](https://facebook.com/)
* [Twitter](https://twitter.com/)
* [Bootstrap](http://getbootstrap.com/)
* [Disqus](https://disqus.com/)
* [Medium](https://medium.com/)
* [Yahoo!](https://yahoo.com/)
* [SmugMug](http://smugmug.com/)
* [jQuery](http://jquery.com/)
* [PDF.js](http://mozilla.github.io/pdf.js)
* [Coursera](http://coursera.com/)
* [Adobe Brackets](http://brackets.io/)
* [Apache Cordova](http://cordova.io/)
* [RedHat](http://redhat.com/)
* [SoundCloud](http://soundcloud.com/)
* [Nodejitsu](http://nodejitsu.com/)
* [Yelp](https://yelp.com/)
* [Voxer](http://voxer.com/)
* [EnyoJS](http://enyojs.com/)
* [QuickenLoans](http://quickenloans.com/)
* [oDesk](http://www.odesk.com/)
* [Cloud9](http://c9.io/)
* [CodeClimate](https://codeclimate.com/)
* [Pandoo TEK](http://pandootek.com/)
* [Zendesk](http://zendesk.com/)
* [Apache CouchDB](http://couchdb.apache.org/)
* [Google](https://www.google.com/)

Et bien d'autres encore !

## Licence

La plupart des fichiers sont publiés selon la licence suivante [the standard MIT Expat
license](https://www.gnu.org/licenses/license-list.html#Expat). 
En revanche, un fichier est diffusé sous une version légèrement modifiée de cette licence.
Ce fichier sous [JSON license](https://www.gnu.org/licenses/license-list.html#JSON)
est soumis à licence payante que malheureusement, nous ne pouvons modifier pour raisons historiques.
Cette licence est un dispositif du fichier au sein duquel elle est incluse.

