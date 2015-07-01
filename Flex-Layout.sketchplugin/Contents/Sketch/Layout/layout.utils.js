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

// moves provided layer into the current selection
var moveLayerToSelection = function(layer){
  var selectedLayer = selection[0];
  if (isGroupClassMember(selectedLayer)) {
    [layer removeFromParent];
    [selectedLayer addLayers:[layer]];
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

// given an object where children ha
var arrayOfValuesByKey = function(arr, key){
  var returnArray = [];
  for (var i = 0; i < arr.length; i++) {
    returnArray.push(arr[i][key]);
  }
  return returnArray;
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

var createSelect = function(msg, items, selectedItemIndex){
  selectedItemIndex = selectedItemIndex || 0

  var accessory = [[NSComboBox alloc] initWithFrame:NSMakeRect(0,0,200,25)]
  [accessory addItemsWithObjectValues:items]
  [accessory selectItemAtIndex:selectedItemIndex]

  var alert = [[NSAlert alloc] init]
  [alert setMessageText:msg]
  [alert addButtonWithTitle:'OK']
  [alert addButtonWithTitle:'Cancel']
  [alert setAccessoryView:accessory]

  var responseCode = [alert runModal]
  var sel = [accessory indexOfSelectedItem]

  return [responseCode, sel]
}
