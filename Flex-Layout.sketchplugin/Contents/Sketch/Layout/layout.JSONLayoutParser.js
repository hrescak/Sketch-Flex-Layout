// all of the CSS properties that are numeric as per readme
// in
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

// takes a json in string with all of the values as strings
// converts all the string value that match a subset of keys
// to numeric values
var parseLayoutToJSON = function(styleString){
 var JSONToReturn = JSON.parse(styleString, numericReviver);
 return JSONToReturn ;


}

// turns a string into a number if it matches numberProperties keys
var numericReviver = function(key, value){
  var returnValue = value;
  if (numericProperties.indexOf(key) > -1) {
    returnValue = Number(value);
  }
  return returnValue ;
}
