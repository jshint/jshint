<a name="2.8.0"></a>
# [2.8.0](https://github.com/jshint/jshint/compare/2.7.0...2.8.0) (2015-05-31)


### Bug Fixes

* add the "fetch" global for "browser" environment ([b3b41c8](https://github.com/jshint/jshint/commit/b3b41c8)), closes [#2355](https://github.com/jshint/jshint/issues/2355)
* Allow lexer to communicate completion ([a093f78](https://github.com/jshint/jshint/commit/a093f78))
* Distinguish between directive and mode ([51059bd](https://github.com/jshint/jshint/commit/51059bd))
* Don't throw "Duplicate class method" with computed method names ([ab12dfb](https://github.com/jshint/jshint/commit/ab12dfb)), closes [#2350](https://github.com/jshint/jshint/issues/2350)
* Ignore unused arrow-function parameters if unused: vars ([2ea9cb0](https://github.com/jshint/jshint/commit/2ea9cb0)), closes [#2345](https://github.com/jshint/jshint/issues/2345)
* Move helper methods to `state` object ([678da76](https://github.com/jshint/jshint/commit/678da76))
* parse `const` declarations in ForIn/Of loops ([2b673d9](https://github.com/jshint/jshint/commit/2b673d9)), closes [#2334](https://github.com/jshint/jshint/issues/2334) [#2335](https://github.com/jshint/jshint/issues/2335)
* Parse semicolons in class bodies ([58c8e64](https://github.com/jshint/jshint/commit/58c8e64))
* Prevent regression in `enforceall` ([6afcde4](https://github.com/jshint/jshint/commit/6afcde4))
* Relax singleGroups restrictions: arrow fns ([4a4f522](https://github.com/jshint/jshint/commit/4a4f522))
* Relax singleGroups restrictions: IIFEs ([9f55160](https://github.com/jshint/jshint/commit/9f55160))
* Reset generator flag for each method definition ([2444a04](https://github.com/jshint/jshint/commit/2444a04)), closes [#2388](https://github.com/jshint/jshint/issues/2388) [#2389](https://github.com/jshint/jshint/issues/2389)

### Features

* Implement `module` option ([290280c](https://github.com/jshint/jshint/commit/290280c))
* support destructuring in ForIn/Of loops, lint bad ForIn/Of LHS ([c0edd9f](https://github.com/jshint/jshint/commit/c0edd9f)), closes [#2341](https://github.com/jshint/jshint/issues/2341)



<a name="2.7.0"></a>
# [2.7.0](https://github.com/jshint/jshint/compare/2.6.3...2.7.0) (2015-04-10)


### Bug Fixes

* Accept `get` and `set` as ID properties ([2ad235c](https://github.com/jshint/jshint/commit/2ad235c))
* allow trailing comma in ArrayBindingPattern ([3477933](https://github.com/jshint/jshint/commit/3477933)), closes [#2222](https://github.com/jshint/jshint/issues/2222)
* allow typeof symbol === "symbol" ([7f7aac2](https://github.com/jshint/jshint/commit/7f7aac2)), closes [#2241](https://github.com/jshint/jshint/issues/2241) [#2242](https://github.com/jshint/jshint/issues/2242)
* Correctly enforce maxparams:0 ([011364e](https://github.com/jshint/jshint/commit/011364e))
* default to empty string in src/cli.js loadIgnores ([0eeba14](https://github.com/jshint/jshint/commit/0eeba14))
* disallow 'lone' rest operator in identifier() ([dd08f85](https://github.com/jshint/jshint/commit/dd08f85)), closes [#2222](https://github.com/jshint/jshint/issues/2222)
* emit I003 more carefully and less annoyingly ([757fb73](https://github.com/jshint/jshint/commit/757fb73)), closes [#2251](https://github.com/jshint/jshint/issues/2251)
* export all names for var/let/const declarations ([3ce1267](https://github.com/jshint/jshint/commit/3ce1267)), closes [#2248](https://github.com/jshint/jshint/issues/2248) [#2253](https://github.com/jshint/jshint/issues/2253) [#2252](https://github.com/jshint/jshint/issues/2252)
* Incorrect 'Unclosed string' when the closing quote is the first character after a newline ([b804e65](https://github.com/jshint/jshint/commit/b804e65)), closes [#1532](https://github.com/jshint/jshint/issues/1532) [#1532](https://github.com/jshint/jshint/issues/1532) [#1319](https://github.com/jshint/jshint/issues/1319)
* predefine HTMLTemplateElement in browser ([231557a](https://github.com/jshint/jshint/commit/231557a)), closes [#2246](https://github.com/jshint/jshint/issues/2246)
* Prevent incorrect warnings for relations ([64f85f3](https://github.com/jshint/jshint/commit/64f85f3))
* Relax restrictions on `singleGroups` ([896bf82](https://github.com/jshint/jshint/commit/896bf82))
* templates are operands, not operators ([162dee6](https://github.com/jshint/jshint/commit/162dee6)), closes [#2223](https://github.com/jshint/jshint/issues/2223) [#2224](https://github.com/jshint/jshint/issues/2224)

### Features

* add `varstmt` enforcement option to disallow use of VariableStatements ([59396f7](https://github.com/jshint/jshint/commit/59396f7)), closes [#1549](https://github.com/jshint/jshint/issues/1549)



<a name="2.6.3"></a>
## [2.6.3](https://github.com/jshint/jshint/compare/2.6.2...2.6.3) (2015-02-28)


### Bug Fixes

* parse trailing comma in ObjectBindingPattern ([7a2b713](https://github.com/jshint/jshint/commit/7a2b713)), closes [#2220](https://github.com/jshint/jshint/issues/2220)



<a name="2.6.2"></a>
## [2.6.2](https://github.com/jshint/jshint/compare/2.6.1...2.6.2) (2015-02-28)


### Bug Fixes

* Disable `futurehostile` option by default ([3cbd41f](https://github.com/jshint/jshint/commit/3cbd41f))
* Make let variables in the closure shadow predefs ([cfd2e0b](https://github.com/jshint/jshint/commit/cfd2e0b))



<a name="2.6.1"></a>
## [2.6.1](https://github.com/jshint/jshint/compare/2.6.0...2.6.1) (2015-02-27)


### Bug Fixes

* Allow object-literals within template strings ([4f08b74](https://github.com/jshint/jshint/commit/4f08b74)), closes [#2082](https://github.com/jshint/jshint/issues/2082)
* Correct behavior of `singleGroups` ([6003c83](https://github.com/jshint/jshint/commit/6003c83))
* Correct token reported by `singleGroups` ([bc857f3](https://github.com/jshint/jshint/commit/bc857f3))
* Disambiguate argument ([d75ef69](https://github.com/jshint/jshint/commit/d75ef69))
* Do not crash on improper use of `delete` ([35df49f](https://github.com/jshint/jshint/commit/35df49f))
* ES6 modules respect undef and unused ([438d928](https://github.com/jshint/jshint/commit/438d928))
* Fix false positives in 'nocomma' option ([33612f8](https://github.com/jshint/jshint/commit/33612f8))
* Handle multi-line tokens after return or yield ([5c9c7fd](https://github.com/jshint/jshint/commit/5c9c7fd)), closes [#1814](https://github.com/jshint/jshint/issues/1814) [#2142](https://github.com/jshint/jshint/issues/2142)
* Miss xdescribe/xit/context/xcontext in mocha ([8fe6610](https://github.com/jshint/jshint/commit/8fe6610))
* Parse nested templates ([3da1eaf](https://github.com/jshint/jshint/commit/3da1eaf)), closes [#2151](https://github.com/jshint/jshint/issues/2151) [#2152](https://github.com/jshint/jshint/issues/2152)
* Permit "eval" as object key ([b5f5d5d](https://github.com/jshint/jshint/commit/b5f5d5d))
* Prevent beginning array from being confused for JSON ([813d97a](https://github.com/jshint/jshint/commit/813d97a))
* Refactor `doFunction` ([06b5d40](https://github.com/jshint/jshint/commit/06b5d40))
* Remove quotmark linting for NoSubstTemplates ([7e80490](https://github.com/jshint/jshint/commit/7e80490))
* Remove tautological condition ([f0bff58](https://github.com/jshint/jshint/commit/f0bff58))
* remove unused var ([e69acfe](https://github.com/jshint/jshint/commit/e69acfe)), closes [#2156](https://github.com/jshint/jshint/issues/2156)
* Simulate class scope for class expr names ([ac98a24](https://github.com/jshint/jshint/commit/ac98a24))
* Support more cases of ES6 module usage ([776ed69](https://github.com/jshint/jshint/commit/776ed69)), closes [#2118](https://github.com/jshint/jshint/issues/2118) [#2143](https://github.com/jshint/jshint/issues/2143)
* Templates can not be directives ([20ff670](https://github.com/jshint/jshint/commit/20ff670))
* Unfollowable path in lexer. ([065961a](https://github.com/jshint/jshint/commit/065961a))

### Features

* Implement new option `futurehostile` ([da52aa0](https://github.com/jshint/jshint/commit/da52aa0))
* parse and lint tagged template literals ([4816dbd](https://github.com/jshint/jshint/commit/4816dbd)), closes [#2000](https://github.com/jshint/jshint/issues/2000)



<a name="2.6.0"></a>
# [2.6.0](https://github.com/jshint/jshint/compare/2.5.11...2.6.0) (2015-01-21)


### Bug Fixes

* Add missing globals to browser environment ([32f02e0](https://github.com/jshint/jshint/commit/32f02e0))
* Allow array, grouping and string form to follow spread operator in function call args. ([437655a](https://github.com/jshint/jshint/commit/437655a)), closes [#2060](https://github.com/jshint/jshint/issues/2060) [#2060](https://github.com/jshint/jshint/issues/2060)
* Correct bug in enforcement of `singleGroups` ([5fedda6](https://github.com/jshint/jshint/commit/5fedda6)), closes [#2064](https://github.com/jshint/jshint/issues/2064)
* Remove dead code ([3b5d94a](https://github.com/jshint/jshint/commit/3b5d94a)), closes [#883](https://github.com/jshint/jshint/issues/883)
* Remove dead code for parameter parsing ([a1d5817](https://github.com/jshint/jshint/commit/a1d5817))
* Revert unnecessary commit ([a70bbda](https://github.com/jshint/jshint/commit/a70bbda))

### Features

* `elision` option to relax "Extra comma" warnings ([cbfc827](https://github.com/jshint/jshint/commit/cbfc827)), closes [#2062](https://github.com/jshint/jshint/issues/2062)
* Add new Jasmine 2.1 globals to "jasmine" option ([343c45e](https://github.com/jshint/jshint/commit/343c45e)), closes [#2023](https://github.com/jshint/jshint/issues/2023)
* Support generators in class body ([ee348c3](https://github.com/jshint/jshint/commit/ee348c3))



<a name="2.5.11"></a>
## [2.5.11](https://github.com/jshint/jshint/compare/2.5.10...2.5.11) (2014-12-18)




<a name="2.5.10"></a>
## [2.5.10](https://github.com/jshint/jshint/compare/2.5.9...2.5.10) (2014-11-06)




<a name="2.5.9"></a>
## [2.5.9](https://github.com/jshint/jshint/compare/2.5.8...2.5.9) (2014-11-06)




<a name="2.5.8"></a>
## [2.5.8](https://github.com/jshint/jshint/compare/2.5.7...2.5.8) (2014-10-29)




<a name="2.5.7"></a>
## [2.5.7](https://github.com/jshint/jshint/compare/2.5.6...2.5.7) (2014-10-28)




<a name="2.5.6"></a>
## [2.5.6](https://github.com/jshint/jshint/compare/2.5.5...2.5.6) (2014-09-21)




<a name="2.5.5"></a>
## [2.5.5](https://github.com/jshint/jshint/compare/2.5.4...2.5.5) (2014-08-24)




<a name="2.5.4"></a>
## [2.5.4](https://github.com/jshint/jshint/compare/2.5.3...2.5.4) (2014-08-18)




<a name="2.5.3"></a>
## [2.5.3](https://github.com/jshint/jshint/compare/2.5.2...2.5.3) (2014-08-08)




<a name="2.5.2"></a>
## [2.5.2](https://github.com/jshint/jshint/compare/2.5.1...2.5.2) (2014-07-05)




<a name="2.5.1"></a>
## [2.5.1](https://github.com/jshint/jshint/compare/2.5.0...2.5.1) (2014-05-16)




<a name="2.5.0"></a>
# [2.5.0](https://github.com/jshint/jshint/compare/2.4.4...2.5.0) (2014-04-02)




<a name="2.4.4"></a>
## [2.4.4](https://github.com/jshint/jshint/compare/2.4.3...2.4.4) (2014-02-21)




<a name="2.4.3"></a>
## [2.4.3](https://github.com/jshint/jshint/compare/2.4.2...2.4.3) (2014-01-26)




<a name="2.4.2"></a>
## [2.4.2](https://github.com/jshint/jshint/compare/2.4.1...2.4.2) (2014-01-21)




<a name="2.4.1"></a>
## [2.4.1](https://github.com/jshint/jshint/compare/2.4.0...2.4.1) (2014-01-03)




<a name="2.4.0"></a>
# [2.4.0](https://github.com/jshint/jshint/compare/2.3.0...2.4.0) (2013-12-25)




<a name="2.3.0"></a>
# [2.3.0](https://github.com/jshint/jshint/compare/2.2.0...2.3.0) (2013-10-21)




<a name="2.2.0"></a>
# [2.2.0](https://github.com/jshint/jshint/compare/2.1.11...2.2.0) (2013-10-18)




<a name="2.1.11"></a>
## [2.1.11](https://github.com/jshint/jshint/compare/2.1.10...2.1.11) (2013-09-20)




<a name="2.1.10"></a>
## [2.1.10](https://github.com/jshint/jshint/compare/2.1.9...2.1.10) (2013-08-15)




<a name="2.1.9"></a>
## [2.1.9](https://github.com/jshint/jshint/compare/2.1.8...2.1.9) (2013-08-02)




<a name="2.1.8"></a>
## [2.1.8](https://github.com/jshint/jshint/compare/2.1.7...2.1.8) (2013-08-01)




<a name="2.1.7"></a>
## [2.1.7](https://github.com/jshint/jshint/compare/2.1.6...2.1.7) (2013-07-29)




<a name="2.1.6"></a>
## [2.1.6](https://github.com/jshint/jshint/compare/2.1.5...2.1.6) (2013-07-29)




<a name="2.1.5"></a>
## [2.1.5](https://github.com/jshint/jshint/compare/2.1.4...2.1.5) (2013-07-27)




<a name="2.1.4"></a>
## [2.1.4](https://github.com/jshint/jshint/compare/2.1.3...2.1.4) (2013-06-24)




<a name="2.1.3"></a>
## [2.1.3](https://github.com/jshint/jshint/compare/2.1.2...2.1.3) (2013-06-03)




<a name="2.1.2"></a>
## [2.1.2](https://github.com/jshint/jshint/compare/2.1.1...2.1.2) (2013-05-22)




<a name="2.1.1"></a>
## [2.1.1](https://github.com/jshint/jshint/compare/2.1.0...2.1.1) (2013-05-21)




<a name="2.1.0"></a>
# [2.1.0](https://github.com/jshint/jshint/compare/2.0.1...2.1.0) (2013-05-21)




<a name="2.0.1"></a>
## [2.0.1](https://github.com/jshint/jshint/compare/2.0.0...2.0.1) (2013-05-08)




<a name="2.0.0"></a>
# [2.0.0](https://github.com/jshint/jshint/compare/1.1.0...2.0.0) (2013-05-08)




<a name="1.1.0"></a>
# [1.1.0](https://github.com/jshint/jshint/compare/1.0.0...1.1.0) (2013-03-06)




<a name="1.0.0"></a>
# [1.0.0](https://github.com/jshint/jshint/compare/1.0.0-rc4...1.0.0) (2013-01-30)




<a name="1.0.0-rc4"></a>
# [1.0.0-rc4](https://github.com/jshint/jshint/compare/1.0.0-rc3...1.0.0-rc4) (2013-01-18)




<a name="1.0.0-rc3"></a>
# [1.0.0-rc3](https://github.com/jshint/jshint/compare/1.0.0-rc2...1.0.0-rc3) (2013-01-02)




<a name="1.0.0-rc2"></a>
# [1.0.0-rc2](https://github.com/jshint/jshint/compare/1.0.0-rc1...1.0.0-rc2) (2012-12-31)




<a name="1.0.0-rc1"></a>
# 1.0.0-rc1 (2012-12-31)




