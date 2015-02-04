/* global React */
var Custom;
var dotted;
var more = { key: "value" };

function render() {
  var value = "value";
  return (
    <div>
      foo &amp; bar
      {value}
      <span foo="bar" key={value}>text</span>
      <Namespaced:Name key='foo' namespaced:argument="value">
        <Custom {...more} />
      </Namespaced:Name>
      <dotted.expression />
    </div>
  );
}

function renderWithErrors() {
  return (
    <div>
      foo
      {unknownValue}
      <span foo="bar" key={unknownValue}>unknownValue</span>
      <Namespaced:Name key='foo' namespaced:argument="value">
        <UnknownCustom {...unknownValue} />
      </Namespaced:Name>
      <unknown.expression />
    </div>
  );
}
