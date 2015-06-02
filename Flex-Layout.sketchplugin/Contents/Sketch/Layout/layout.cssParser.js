// takes a CSS string and returns a json with all the rules
var parseCss = function(cssToParse, context) {
  var jsContext = [[JSContext alloc] init];
  var json = getLibraryContents("lib/CSSJSON/json2.js", context);
  [jsContext evaluateScript:json];
  var parser = getLibraryContents("lib/CSSJSON/cssjson.js", context);
  [jsContext evaluateScript:parser];
  var parseScript = jsContext[@"CSSJSON"][@"toJSON"];
  var parseArguments = NSArray.arrayWithObjects(cssToParse);
  var parsedCSS = [parseScript callWithArguments:parseArguments];
  return [parsedCSS toDictionary].children;
}

// return a string context of an external file, useful for loading libraries
// and node.js modules into a JavscriptCore context
var getLibraryContents = function(path, context) {
  var scriptURL = context.scriptURL;
  var scriptFolder = [scriptURL URLByDeletingLastPathComponent];
  var libraryURL = [scriptFolder URLByAppendingPathComponent:path];
  var fileString = NSString.stringWithContentsOfFile(libraryURL);
  return fileString;
}
