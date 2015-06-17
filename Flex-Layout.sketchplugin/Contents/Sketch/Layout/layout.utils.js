// return whether a layer can have children
var isGroupClassMember = function(layer)
{
  if ([layer class] == "MSArtboardGroup" || [layer class] == "MSLayerGroup" || [layer class] == "MSPage"]) {
    return true;
  }
  return false;
}

// returns whether a string ends with a suffix
var endsWithString = function(str, suffix){

  // var lastIndex = str.lastIndexOf(suffix);
  // return (lastIndex !== -1) && (lastIndex + suffix.length === str.length);
  //return str.indexOf(suffix, str.length - suffix.length) !== -1;
  return [str hasSuffix:suffix];
}

// returns javascript object size
var objectSize = function(obj){
  return Object.keys(obj).length;
}

// get class from layer name
var layerClass = function(layer){
  return "." + [[[layer name] componentsSeparatedByString:"."] lastObject];
}

// flatten a multidimensional js array
var flattenArray = function(arr) {
	var r = [];
  function arrayEqual(a, b) {
  	var i = Math.max(a.length, b.length, 1);
  	while(i-- >= 0 && a[i] === b[i]);
  	return (i === -2);
  }

	while (!arrayEqual(r, arr)) {
		r = arr;
		arr = [].concat.apply([], arr);
	}
	return arr;
}

//given an array of objects and a key, returns an object with the key value as properties
var keyedObjectFromArray = function(array, key){
  var keyedObject = {};
  for (var i = 0; i < array.length; i++) {
    var arrayMember = array[i];
    var arrayKey = arrayMember[key];
    delete arrayMember[key];
    keyedObject[arrayKey] = arrayMember;
  }
  return keyedObject;
}
