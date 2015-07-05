// returns parsed CSS retrieved from style sheet layer
var parseStyleSheetLayer = function() {
  var parsedCSS = {}
  var styleSheetLayer = getStyleSheetLayer(styleSheetLayerName);
  if (styleSheetLayer) {
    var cssString = "" + [styleSheetLayer stringValue]; //hack to circumvent cocoa string;
    var parsedCSS = parseCss(cssString);
  } else {
    log("No stylesheet found, proceeding to prototypes");
  }
  return (parsedCSS);
}

// get the styleSheet layer
var getStyleSheetLayer = function(layerName){
  var layer = nil;
  var pageLayers = [page layers].array();
  if (pageLayers) {
    var loop = [pageLayers objectEnumerator];
       while (item = [loop nextObject]) {
         if ([item class] == "MSTextLayer" && [item name] == styleSheetLayerName)
         layer = item;
      }
  }
  return layer;
}

// takes a CSS string and returns a json with all the rules
var parseCss = function(cssToParse) {
  var jsContext = [[JSContext alloc] init];
  var jsonLib = utils.js.loadLibrary("lib/CSSJSON/json2.js");
  [jsContext evaluateScript:jsonLib];
  var parser = utils.js.loadLibrary("lib/CSSJSON/cssjson.js");
  [jsContext evaluateScript:parser];
  var parseScript = jsContext[@"CSSJSON"][@"toJSON"];
  var parseArguments = NSArray.arrayWithObjects(cssToParse);
  var parsedCSS = [parseScript callWithArguments:parseArguments];
  return [parsedCSS toDictionary].children;
}
