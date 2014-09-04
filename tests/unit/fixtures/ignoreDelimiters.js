(function foo() {
  'use strict';
  return '<%= asset_path('test.png') %>' + '<% some_method() %>';
})();
