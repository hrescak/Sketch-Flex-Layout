// strict javascript, to be loaded in a javascript context
// and aware of the css-layout framework in lib/css-layout/


// all of the CSS properties that are numeric as per readme
// in https://github.com/facebook/css-layout
var numericProperties = [
  "width", "height", // positive
  "minWidth", "minHeight", // positive
  "maxWidth", "maxHeight", // positive
  "left", "right", "top", "bottom",
  "margin", "marginLeft", "marginRight", "marginTop", "marginBottom",
  "padding", "paddingLeft", "paddingRight", "paddingTop", "paddingBottom",	 // positive
  "borderWidth", "borderLeftWidth", "borderRightWidth", "borderTopWidth", "borderBottomWidth", // positive
  "flex" //positive
];

var provideComputedLayout = function(styleTree){
  // someFunction("yoo");
  var parsedLayout = parseLayoutToJSON(styleTree);

  parsedLayout = insertMeasures(parsedLayout);
  // feed the style tree to the css-layout
  computeLayout.fillNodes(parsedLayout);
  computeLayout.computeLayout(parsedLayout);
  var computedStyles = computeLayout.extractNodes(parsedLayout);
  return computedStyles;
}

var insertMeasures = function(rootNode){

  if (rootNode.hasOwnProperty("computedHeight")) {
    if (!rootNode.hasOwnProperty("style")) {
      rootNode.style = {};
    };
    rootNode.style.measure = function(width){
      return {width:width, height:rootNode.computedHeight};
    };
  };

  //iterate over children
  if (rootNode.hasOwnProperty("children")) {
    var nodeChildren = rootNode["children"];
    for (var i = 0; i < nodeChildren.length; i++) {
      var nodeChild = nodeChildren[i];
      nodeChildren[i] = insertMeasures(nodeChild);
    }
  }
  return rootNode;
}

// takes a json in string with all of the values as strings
// converts all the string value that match a subset of keys
// to numeric values
var parseLayoutToJSON = function(styleString){
  return JSON.parse(styleString, numericReviver);
}

// turns a string into a number if it matches numberProperties keys
var numericReviver = function(key, value){
  var returnValue = value;
  if (numericProperties.indexOf(key) > -1) {
    returnValue = Number(value);
  }
  return returnValue ;
}
