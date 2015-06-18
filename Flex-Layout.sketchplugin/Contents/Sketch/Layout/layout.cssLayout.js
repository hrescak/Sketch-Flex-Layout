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
  var layoutHelper = getLibraryContents("layout.JSLayoutHelper.js", context);
  [jsContext evaluateScript:layoutHelper];
  var computeLayout = jsContext[@"provideComputedLayout"];
  // jsContext[@"someFunction"] = function(input){
  //   log("BOOOM" + input);
  // }

  log("style tree:");
  log(styleTree);
  //stringify the layer tree
  var stringifiedStyles = stringifyStyleTree(styleTree);

  //compute styles
  var layoutArguments = NSArray.arrayWithObjects(stringifiedStyles);
  var computedStyles = [computeLayout callWithArguments:layoutArguments];

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
  if (shouldLayoutChildren && !shouldIgnoreLayer(currentLayer)) {

    // 0 gets undefined when it's passed as a parameter *gosh*
    if (!currentY) { currentY = 0; };
    if (!currentX) { currentX = 0; };

    var relativeY = currentY + layerTree["top"];
    var relativeX = currentX + layerTree["left"];

    [[currentLayer frame] setY:relativeY];
    [[currentLayer frame] setX:relativeX];

    // don't set size on groups, it resizes based on children and would fuck things up
    if (!isGroupClassMember(currentLayer)) {
      [[currentLayer frame] setWidth: layerTree["width"]];
      [[currentLayer frame] setHeight: layerTree["height"]];
    }
  }

  // iterate over children recursively if we can
  if (isGroupClassMember(currentLayer)){
    var childLayers = [currentLayer layers].array();
    var childStyleTree = layerTree["children"];
    var parentX = currentLayer.frame.x;
    var parentY = currentLayer.frame.y;
    if (childLayers){
      for (var i=0; i < [childLayers count]; i++){
        var childLayer = childLayers[i];

        // special case for group background to stretch to parent group size
        if (childLayer.name() == backgroundLayerName) {
          [[childLayer frame] setY:0];
          [[childLayer frame] setX:0];
          [[childLayer frame] setWidth:layerTree["width"]];
          [[childLayer frame] setHeight:layerTree["height"]];
        }

        layoutLayersRecursively(childStyleTree[i], parentX, parentY, childLayer, shouldLayoutChildren, layerStore);
      }
    }
  }

}

// ----------------- helpers ---------------- //

// takes a selector, traverses the layer to see if there's one with that name
// and saves a corresponding style to the layer metadata
var saveAStyleToLayersRecursively = function(selector, style, layer, context){
  var sketchCommand = context.command;
  //[sketchCommand setValue:nil forKey:"style" onLayer:layer];

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
    if (isTextLayer(layer)) {
      layerInfo["textContent"] = layer.stringValue();
      layerInfo["textSize"] = layer.fontSize();
      layerInfo["textFont"] = layer.fontPostscriptName();
    }
    var sketchCommand = context.command;
    var layerStyle = [sketchCommand valueForKey:"style" onLayer:layer];
    if (layerStyle) {
      layerInfo["style"] = layerStyle;
    }

    //add position absolute to style layers and backgrounds so their sizes are not computed
    if ([[layer name] hasPrefix:"@"] || [layer name] == backgroundLayerName){
      layerStyle = {};
      layerStyle["position"] = "absolute";
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
// returns string to pass along to layout helper
var stringifyStyleTree = function(styleTree, context){
  // first converst the tree to stringified JSON
  var JSONData = [NSJSONSerialization dataWithJSONObject:styleTree options:0 error:nil];
  var JSONString = [[NSString alloc] initWithData:JSONData encoding:NSUTF8StringEncoding];
  return JSONString; // JSValue to pass along to the css-layout library;
}

// check whether a layer should be ignored when laid out
var shouldIgnoreLayer = function(currentLayer){
  if ([currentLayer class] == "MSPage") {
    return true;
  }
  if (currentLayer.name() == styleSheetLayerName) {
    return true;
  }
  if (currentLayer.name() == backgroundLayerName) {
    return true;
  }
  if ([[currentLayer name] hasPrefix:"@"]) {
    return true;
  }
  return false;
}
