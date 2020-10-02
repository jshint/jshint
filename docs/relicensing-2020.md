# 2020 Relicensing

In August of 2020, the JSHint project maintainers relicensed the project. This
was the culmination of a years-long effort where great care was taken to
respect the practice of software licensing and the intent of all contributors.
By summarizing the process followed by the maintainers, this document
demonstrates the legitimacy of the change.

## Origin: JSLint

The JSLint project was first made publicly available in 2002. It was
distributed free-of-charge, but it was licensed with the so-called [JSON
License][1]. Code published under this license is not recognized as "free
software" by [the Free Software Foundation][2], nor is it recognized as "open
source" by [the Open Source Initiative][3] due to the following clause:

> The Software shall be used for Good, not Evil.

After the initial release, JSLint's creator iteratively improved it through a
series of patches to its one-and-only source code file. Throughout this time,
the owner was the sole contributor to the project.

## The fork

In 2011, another developer made improvements of their own and published the
result as a new project named [JSHint][4]. This was permissible under the
terms of JSLint's license provided that the new project used the same license
for the code it inherited.

The second developer continued to modify JSHint and also accepted contributions
from others. To promote the maintainability of the source code, new features
were occasionally introduced in distinct files that were designed to be
included at runtime. Referred to as "modules," these files were made available
under the terms of [the MIT "Expat" license][5]. As automated tests were written
and included in the project, they too were licensed under MIT "Expat."

In the years that followed, the JSHint project accepted direct code
contributions from hundreds of developers. Many of these patches modified the
original JSON-licensed file. Meanwhile, the author of JSLint permitted the
Eclipse Foundation to relicense a version of JSLint using the MIT Expat license
so that it could be included in their project named [Orion][6].

## Injecting a FOSS starting point

In 2013, a user of [JSHint requested][7] that the project be relicensed. The
JSHint maintainers obliged via the following procedure:

1. Using the git version control software, they reverted all of the changes
   that were submitted to JSHint. (The resulting code was identical to JSLint
   at the moment JSHint was created.)
2. They replaced the JSON-licensed version of the code with the MIT-licensed
   version published by the Eclipse Foundation. (The resulting code differed
   from JSLint only in the license header.)
3. They re-applied all of the changes that were submitted to JSHint.

While this operation created an "alternate history" which demonstrated how
JSHint could have been created as a free software project, it did not
necessarily reflect the intentions of the contributors. JSHint did not at that
time maintain a Contributors Licensing Agreement, so the maintainers did not
have the authority to modify the terms under which the JSHint-specific patches
were submitted.

To address this, the maintainers first introduced a Contributors Licensing
Agreement ("CLA"). They ensured all subsequent contributors agreed to the terms
of the agreement prior to accepting their patches. They contacted every
contributor who had modified the JSON-licensed `jshint.js` file and requested
they they sign the agreement. Although most responded by signing the agreement,
a few refused and still others did not respond.

## Rewriting

A full listing of the patches whose authors have not signed the CLA is
available alongside this document in the JSHint project source code repository.

The maintainers reviewed each patch which could not be relicensed. Many
involved non-substantive changes such as code comment amendments, spelling
corrections, or the introduction of references to standardized APIs. Because
these contributions did not meaningfully alter the behavior of the software,
there could be no claim to ownership, so explicit permission to relicense was
not necessary.

However, a total of six patches included non-trivial changes to `jshint.js`.
The maintainers arranged for each of these to be re-written.

Three contributions were rewritten by four volunteers who never reviewed the
implementation they were rewriting. The project maintainers prepared an
alternate version of the project for each volunteer--one that omitted each
patch that needed to be reimplemented.

Three additional contributions were rewritten by a JSHint project maintainer.
The uniqueness of his work was verified by the other maintainers.

In all cases, correctness of the new implementation was verified by the
project's existing automated tests (because as described above, their licensing
was not subject to change).

## Finalization

With this work complete, every line of code in the JSHint project has been
permitted by its contributor to be licensed using the MIT "Expat" license. The
"alternate history" is available in a Git tag named `relicensing-2020`.

As of version 2.12.0, JSHint is a free software project.

[1]: https://www.gnu.org/licenses/license-list.en.html#JSON
[2]: https://www.fsf.org/
[3]: https://opensource.org/licenses/alphabetical
[4]: https://web.archive.org/web/20110224022052/http://anton.kovalyov.net/2011/02/20/why-i-forked-jslint-to-jshint/
[5]: https://www.gnu.org/licenses/license-list.en.html#Expat
[6]: http://git.eclipse.org/c/orion/org.eclipse.orion.client.git/tree/lib/jslint/jslint-2011-01-09.js
[7]: https://github.com/jshint/jshint/issues/1234
