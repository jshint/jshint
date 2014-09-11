(function foo() {
  'use strict';
  someMethod('<?php foo('test') ?>');
  return '<%= asset_path('test.png') %>' + '<% some_method() %>';
})();
