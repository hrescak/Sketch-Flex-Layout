// save stylesheet to layer metadata
var saveStylesToLayers = function(styles,context){
  var doc = context.document;
  var page = [doc currentPage];
  for (var selector in styles) {
    saveAStyleToLayersRecursively(selector,styles[selector],page,context);
  }
}

//read styles from layer metadata
var styleTreeFromLayers = function(context){
  var doc = context.document;
  var page = [doc currentPage];
  var styleTree = stylesForAllLayers(page,context);
  return styleTree;
}

// compute layout given the metadata style tree
var computeStyles = function(styleTree, context){
  //load css-layout
  var jsContext = [[JSContext alloc] init];
  var layoutLib = getLibraryContents("lib/css-layout/Layout.js", context);
  [jsContext evaluateScript:layoutLib];
  var fillNodes = jsContext[@"computeLayout"][@"fillNodes"];
  var computeLayout = jsContext[@"computeLayout"][@"computeLayout"];
  var extractNodes = jsContext[@"computeLayout"][@"extractNodes"];

  log("style tree:");
  log(styleTree);
  //jsonized the layer tree
  var JSONizedString = JSONizeStyleTree(styleTree, context, jsContext);

  log("jsonizedstring:");
  log([JSONizedString toDictionary]);

  //compute styles
  var layoutArguments = NSArray.arrayWithObjects(JSONizedString);
  [fillNodes callWithArguments:layoutArguments];
  [computeLayout callWithArguments:layoutArguments];
  var computedStyles = [extractNodes callWithArguments:layoutArguments];

  //in case something goes to hell - todo - throw an alert if not empty
  log("exception:");
  log([jsContext exception]);
  log("computed string:");
  log([computedStyles toDictionary]);
  return [computedStyles toDictionary];
}

// lay out all the layers given computed styles
var layoutElements = function(computedTree,context){
  var doc = context.document;
  var page = [doc currentPage];
  var layerStore = context.command;
  layoutLayersRecursively(computedTree, 0,0, page, false, layerStore);
}

// traverse all of the layers and lay out the elements
var layoutLayersRecursively = function(layerTree, currentX, currentY, currentLayer, layoutChildrenFlag, layerStore)
{
  var shouldLayoutChildren = layoutChildrenFlag;
  // check if the item has a style attribute and if yes, turn the flag on
  // to lay out itself and all of it's children. This is to only start laying out
  // from the topmost item in the hierarchy that has a style attribute.
  if ([layerStore valueForKey:"style" onLayer:currentLayer]) {
    shouldLayoutChildren = true;
  }
  //ignore top page and stylesheet layer
  //todo - handle artboards and background layer
  if (shouldLayoutChildren && [currentLayer class] != "MSPage" && currentLayer.name() != styleSheetLayerName) {

    // 0 gets undefined when it's passed as a parameter *gosh*
    if (!currentY) { currentY = 0; };
    if (!currentX) { currentX = 0; };

    var relativeY = currentY + layerTree["top"];
    var relativeX = currentX + layerTree["left"];

    [[currentLayer frame] setY:relativeY];
    [[currentLayer frame] setX:relativeX];
    [[currentLayer frame] setWidth: layerTree["width"]];
    [[currentLayer frame] setHeight: layerTree["height"]];
  }

  // special case for group background to stretch to parent group size
  if (currentLayer.name() == backgroundLayerName) {
    var parentLayer = [currentLayer parentGroup];
    [[currentLayer frame] setY:0];
    [[currentLayer frame] setX:0];
    [[currentLayer frame] setWidth:parentLayer.frame().width()];
    [[currentLayer frame] setHeight:parentLayer.frame().height()];
  }

  // iterate over children recursively if we can
  if (isGroupClassMember(currentLayer)){
    var childLayers = [currentLayer layers].array();
    var childStyleTree = layerTree["children"];
    var parentX = currentLayer.frame.x;
    var parentY = currentLayer.frame.y;
    if (childLayers){
      for (var i=0; i < [childLayers count]; i++){
        var item = childLayers[i];
        layoutLayersRecursively(childStyleTree[i], parentX, parentY, item, shouldLayoutChildren, layerStore);
      }
    }
  }

}

// ----------------- helpers ---------------- //

// takes a selector, traverses the layer to see if there's one with that name
// and saves a corresponding style to the layer metadata
// todo - substring matches layers if classes are substrings of other classes
var saveAStyleToLayersRecursively = function(selector, style, layer, context){
  var sketchCommand = context.command;

  //save styles to layers with classes, ignore stylesheet layer and the parent page
  //for the future - ignore prototype layers maybe?
  if (layer.name() != styleSheetLayerName && layer.class() != "MSPage"){
    if (endsWithString(layer.name(), selector)) {
      [sketchCommand setValue:style.attributes forKey:"style" onLayer:layer];
    }
  }

  // iterate over children recursively if we can
  if (isGroupClassMember(layer)){
    var childLayers = [layer layers].array();
    if (childLayers){
      var loop = [childLayers objectEnumerator];
       while (item = [loop nextObject]) {
         saveAStyleToLayersRecursively(selector, style, item, context);
      }
    }
  }
}

// get the whole tree of layers with styles saved in the layer metadata
var stylesForAllLayers = function(layer, context){
  var layerInfo = {};
  if (layer.name() != styleSheetLayerName){
    layerInfo["name"] = layer.name(); //todo - find a way to represent layer better (uuid that gets stored maybe?)
    var sketchCommand = context.command;
    var layerStyle = [sketchCommand valueForKey:"style" onLayer:layer];
    if (layerStyle) {
      layerInfo["style"] = layerStyle;
    }
  }

  // iterate over children recursively if we can
  if (isGroupClassMember(layer)){
    var childLayers = [layer layers].array();
    if (childLayers){
      var childrenArray = [];
      var loop = [childLayers objectEnumerator];
      while (item = [loop nextObject]) {
         var childLayerInfo = stylesForAllLayers(item, context);
         //todo - in case stylesheet is somewhere deep we should remove this
         childrenArray.push(childLayerInfo);
      }
      layerInfo["children"] = childrenArray;
    }
  }
  return layerInfo;
}

// takes an obj-c dictionary of all layers, together with styles
// returns JSValue with correct JSON where all numerical values are numbers
var JSONizeStyleTree = function(styleTree, context, jsContext){
  // first converst the tree to stringified JSON
  var JSONData = [NSJSONSerialization dataWithJSONObject:styleTree options:0 error:nil];
  var JSONString = [[NSString alloc] initWithData:JSONData encoding:NSUTF8StringEncoding];
  var JSONArguments = NSArray.arrayWithObject(JSONString);

  // then parse the JSON in a new JScontext
  var JSONParser = getLibraryContents("layout.JSONLayoutParser.js", context);
  [jsContext evaluateScript:JSONParser];
  var JSONParseFunction = jsContext[@"parseLayoutToJSON"];
  var JSONizedString = [JSONParseFunction callWithArguments:JSONArguments];

  return JSONizedString; // JSValue to pass along to the css-layout library;
}


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
