// global sketch variables setup and init
var app = [NSApplication sharedApplication],
  doc, page, plugin, pluginPath, pluginURL, pluginCommand, selection, artboard;

// debug for profiling and logging
var debug = debug || {};
debug = {
  on : false,
  startTime: 0,
  partialTime: 0,
  // start the profiling
  start : function(){
    debug.on = true;
    startTime = Date.now();
    partialTime = Date.now();
    log("======= DEBUG START =========");
  },
  // log with current time elapsed from start
  log : function(message){
    if (!debug.on) {
      return;
    } else {
      log("==" + (Date.now() - startTime) + "ms== " + message);
    }
  },
  // log with partial time elapsed and resets partial time
  logPart : function(message){
    if (!debug.on) {
      return;
    } else {
      log("--" +(Date.now() - partialTime) + "ms-- " + message);
      partialTime = Date.now();
    }
  },
  // end debug, log total time
  end : function(){
    if (!debug.on) {
      return;
    } else {
      log("======= DEBUG END: " + (Date.now() - startTime) + "ms =========");
    }
  }
}

// namespace utils and initialize with global vars init
var utils = utils || {};

utils.init = function(context){
  doc = context.document;
  page = doc.currentPage();
  pages = [doc pages];
  selection = context.selection;
  artboard = [[doc currentPage] currentArtboard];
  plugin = context.plugin;
  pluginPath = [plugin url] + "";
  pluginURL = context.scriptURL;
  pluginCommand = context.command;
};

// call a function on multiple layers at once
utils.call = {
  // call a function recursively on child layers of layer, including the layer.
  childLayers : function(layer, callback){
    callback(layer);
    if (utils.is.group(layer)) {
      var childLayers = [layer layers].array();
      if (childLayers) {
        for (var i = 0; i < childLayers.count(); i++) {
          utils.call.childLayers(childLayers[i], callback);
        };
      };
    };
  },
  // call a function on all layers on a page recursively, including the page layer.
  pageLayers : function(callback){
    utils.call.childLayers(page, callback);
  },
  // call a function on selected layers
  selectedLayers : function(callback){
    var selectionCount = selection.count();
    if (selectionCount > 0) {
      for (var i = 0; i < selectionCount; i++) {
        callback(selection[i]);
      }
    } else {
      log("selection is empty");
    }
  },
}

// layer boolean checks
utils.is = {
  // returns whether a layer is a group
  group : function(layer){
    if ([layer class] == "MSArtboardGroup" || [layer class] == "MSLayerGroup" || [layer class] == "MSPage"]) {
      return true;
    }
    return false;
  },
  // returns whether a layer is a text layer
  textLayer : function(layer){
    return ([layer class] == "MSTextLayer");
  },
  // returns whether nothing is selected
  selectionEmpty : function(){
    return (selection.count() == 0);
  }
}

// common low-level utils
utils.common = {
  // returns whether a string ends with a suffix
  endsWithString : function(str, suffix){
    return [str hasSuffix:suffix];
  },
  // returns javascript object size
  objectSize : function(obj){
    return Object.keys(obj).length;
  },
  // flatten a multidimensional js array
  flattenArray : function(arr) {
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
  },
  //given an array of objects and a key, returns an object with the key value as properties
  keyedObjectFromArray : function(array, key){
    var keyedObject = {};
    for (var i = 0; i < array.length; i++) {
      var arrayMember = array[i];
      var arrayKey = arrayMember[key];
      delete arrayMember[key];
      keyedObject[arrayKey] = arrayMember;
    }
    return keyedObject;
  },
  // given an object where children ha
  arrayOfValuesByKey : function(arr, key){
    var returnArray = [];
    for (var i = 0; i < arr.length; i++) {
      returnArray.push(arr[i][key]);
    }
    return returnArray;
  }
}

// miscellaneous layer manipulation and such
utils.misc = {
  // moves provided layer into the current selection
  moveLayerToSelection : function(layer){
    var selectedLayer = selection[0];
    if (utils.is.group(selectedLayer)) {
      [layer removeFromParent];
      [selectedLayer addLayers:[layer]];
    }
  }
}

// interaction with a separate javascript context
utils.js = {
  loadLibrary : function(path){
    var scriptFolder = [pluginURL URLByDeletingLastPathComponent];
    var libraryURL = [scriptFolder URLByAppendingPathComponent:path];
    var fileString = NSString.stringWithContentsOfFile(libraryURL);
    return fileString;
  }
}

// ------------ UI --------- //

// UI
utils.UI = {
  showInput : function (message, initialValue){
    if (!initialValue) {
      initialValue = "";
    }
    return [doc askForUserInput:message initialValue:initialValue];
  },
  showMessage : function(message){
    [doc showMessage:message];
  },
  showError : function(message){
    utils.UI.showDialog("Error", message);
  },
  showDialog : function(title, message){
    var app = [NSApplication sharedApplication];
    [app displayDialog:message withTitle:title];
  },
  showSelect : function(msg, items, selectedItemIndex){
    var selectedItemIndex = selectedItemIndex || 0;

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
};
