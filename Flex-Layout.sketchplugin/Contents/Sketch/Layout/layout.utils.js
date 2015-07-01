// global sketch variables setup and init
var app = [NSApplication sharedApplication],
  doc, page, plugin, pluginPath, pluginURL, pluginCommand, selection, artboard;

function init(context) {
  doc = context.document;
  page = doc.currentPage();
  pages = [doc pages];
  selection = context.selection;
  artboard = [[doc currentPage] currentArtboard];
  plugin = context.plugin;
  pluginPath = [plugin url] + "";
  pluginURL = context.scriptURL;
  pluginCommand = context.command;
}

// call a function on all layers
var callOnChildLayers = function(layer, callback){
  callback(layer);
  if (isGroupClassMember(layer)) {
    var childLayers = [layer layers].array();
    if (childLayers) {
      for (var i = 0; i < childLayers.count(); i++) {
        callOnChildLayers(childLayers[i], callback);
      }
    }
  }
}

// return whether a layer can have children
var isGroupClassMember = function(layer)
{
  if ([layer class] == "MSArtboardGroup" || [layer class] == "MSLayerGroup" || [layer class] == "MSPage"]) {
    return true;
  }
  return false;
}

// returns whether a layer is a text layer
var isTextLayer = function(layer){
  return ([layer class] == "MSTextLayer");
}

// returns whether a string ends with a suffix
var endsWithString = function(str, suffix){
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

// return a string context of an external file, useful for loading libraries
// and node.js modules into a JavscriptCore context
var getLibraryContents = function(path, context) {
  var scriptFolder = [pluginURL URLByDeletingLastPathComponent];
  var libraryURL = [scriptFolder URLByAppendingPathComponent:path];
  var fileString = NSString.stringWithContentsOfFile(libraryURL);
  return fileString;
}

// ------------ UI --------- //

var showMessage = function(message){
  [doc showMessage:message];
}

var showError = function(message){
  showDialog("error", message);
}

var showDialog = function(title, message){
  var app = [NSApplication sharedApplication];
  [app displayDialog:message withTitle:title];
}
