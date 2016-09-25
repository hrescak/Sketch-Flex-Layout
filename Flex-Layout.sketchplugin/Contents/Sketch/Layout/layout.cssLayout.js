
// apply a given stylesheet to classes and return the layer style tree
var layerTreeWithStyles = function(stylesheet){
  var layerTree = layerTreeWithStylesheet(stylesheet, page);
  return layerTree;
}

// collect all the measures from layers
var collectMeasures = function(styleTree, computedStyleTree){
  var measuredStyleTree = collectMeasuresRecursively(page, styleTree, computedStyleTree, false);
  return measuredStyleTree;
}

// compute layout given the metadata style tree
var computeStyles = function(styleTree){
  //load css-layout
  var jsContext = [[JSContext alloc] init];
  var layoutLib = utils.js.loadLibrary("lib/css-layout/Layout.js");
  [jsContext evaluateScript:layoutLib];
  var layoutHelper = utils.js.loadLibrary("layout.JSLayoutHelper.js");
  [jsContext evaluateScript:layoutHelper];
  var computeLayout = jsContext[@"provideComputedLayout"];

  //stringify the layer tree
  var stringifiedStyles = stringifyStyleTree(styleTree);

  //compute styles
  var layoutArguments = NSArray.arrayWithObjects(stringifiedStyles);
  var computedStyles = [computeLayout callWithArguments:layoutArguments];

  //in case something goes to hell - todo - throw an alert if not empty
  if ([jsContext exception]) {
    utils.UI.showError("CSS Layout: " + [jsContext exception]);
  };
  return [computedStyles toDictionary];
}

// lay out all the layers given computed styles
var layoutElements = function(styleTree, computedTree){
  layoutLayersRecursively(styleTree, computedTree, 0,0, page, false);
}

// traverse all of the layers and lay out the elements
var layoutLayersRecursively = function(styleTree, computedTree, currentX, currentY, currentLayer, layoutChildrenFlag)
{
  var shouldLayoutChildren = layoutChildrenFlag;
  // check if the item has a style attribute and if yes, turn the flag on
  // to lay out itself and all of it's children. This is to only start laying out
  // from the topmost item in the hierarchy that has a style attribute.
  if (styleTree.hasOwnProperty("style")) {
    shouldLayoutChildren = true;
  }

  // don't lay out children of layers that start with "@"
  if (shouldIgnoreLayer(currentLayer)) {
    shouldLayoutChildren = false;
  }
  //ignore top page and stylesheet layer
  //todo - handle artboards better
  if (shouldLayoutChildren && !shouldIgnoreLayer(currentLayer)) {

    // 0 gets undefined when it's passed as a parameter *gosh*
    if (!currentY) { currentY = 0; };
    if (!currentX) { currentX = 0; };

    var relativeY = currentY + computedTree["top"];
    var relativeX = currentX + computedTree["left"];

    var positionRect = currentLayer.rect();
    positionRect.origin.x = relativeX;
    positionRect.origin.y = relativeY;
    currentLayer.setRect(positionRect);

    // don't set size on groups, it resizes based on children and would fuck things up
    if (!utils.is.group(currentLayer)) {
      var sizeRect = [currentLayer rect];
      sizeRect.size.width = computedTree["width"];
      sizeRect.size.height = computedTree["height"];
      [currentLayer setRect:sizeRect];
    }
  }

  // iterate over children recursively if we can
  if (utils.is.group(currentLayer)){
    var childLayers = [currentLayer layers];
    var childComputedTree = computedTree["children"];
    var childStyleTree = styleTree["children"];
    var parentX = currentLayer.frame.x;
    var parentY = currentLayer.frame.y;
    if (childLayers){
      for (var i=0; i < [childLayers count]; i++){
        var childLayer = childLayers[i];

        // special case for group background to stretch to parent group size
        if (childLayer.name() == backgroundLayerName) {
          var childRect = [childLayer rect];
          childRect.origin.y = 0;
          childRect.origin.x = 0;
          childRect.size.width = computedTree["width"];
          childRect.size.height = computedTree["height"];
          [childLayer setRect:childRect];
        }
        layoutLayersRecursively(childStyleTree[i], childComputedTree[i], parentX, parentY, childLayer, shouldLayoutChildren);
      }
      // make sure group's bounds are re-set
      [currentLayer resizeToFitChildrenWithOption:1];
    }
  }
}

// recursively iterate through all layers, find text layers within elements that
// should be laid out, measure their height based on the computed tree
// and add it back to the style tree
var collectMeasuresRecursively = function(currentLayer, styleTree, computedStyleTree, shouldCollectMeasures){
  // only collect measures if it's a descendant of a styled element
  if (styleTree.hasOwnProperty("style")) {
    shouldCollectMeasures = true;
  }
  //collect measures if it's a text layer
  if (shouldCollectMeasures && utils.is.textLayer(currentLayer)) {
    // parent elements have width and text should behave appropriately
    if (computedStyleTree["width"] > 0) {
      [currentLayer setTextBehaviour:1] // BCTextBehaviourFixedWidth
      var currentRect = [currentLayer rect];
      currentRect.size.width = computedStyleTree["width"];
      [currentLayer setRect:currentRect];
      [currentLayer adjustFrameToFit];
    // parent elements have no width, they should behave according to the text layer
    } else {
      styleTree["computedWidth"] = currentLayer.rect().size.width;
    }

    styleTree["computedHeight"] = currentLayer.rect().size.height;
  }

  // iterate over children recursively if we can
  if (utils.is.group(currentLayer)){
    var childLayers = [currentLayer layers];
    var childStyleTree = styleTree["children"];
    var childComputedTree = computedStyleTree["children"];
    if (childLayers){
      for (var i=0; i < [childLayers count]; i++){
        var childLayer = childLayers[i];
        styleTree["children"][i] = collectMeasuresRecursively(childLayer, childStyleTree[i], childComputedTree[i], shouldCollectMeasures);
      }
    }
  }
  return styleTree;
}

// ----------------- helpers ---------------- //

// takes a stylesheet, returns a tree of layers with the individual selector
// styles applied to layers that match the selector, also applies
// absolute styles for backgrounds and style layers so they're not moved
var layerTreeWithStylesheet = function(stylesheet, layer){
  var layerInfo = {};
  // ignore stylesheets
  var layerName = layer.name();
  layerInfo["name"] = layerName;
  if (layerName == styleSheetLayerName || utils.is.page(layer)) {

    // ignore stylesheets and pages

  } else if ([layerName hasPrefix:"@"] || layerName == backgroundLayerName){

    // add position absolute to style layers and backgrounds so their sizes are not computed
    layerStyle = {};
    layerStyle["position"] = "absolute";
    layerInfo["style"] = layerStyle;

  } else {

    // check if we should style this layer and add it to the style
    for (var selector in stylesheet) {
      if (utils.common.endsWithString(layerName, selector)) {
        var style = stylesheet[selector];
        layerInfo["style"] = style.attributes;
      }
    }
  }

  // iterate over children recursively if we can
  if (utils.is.group(layer)){
    var childLayers = [layer layers];
    if (childLayers){
      var childrenArray = [];
      var loop = [childLayers objectEnumerator];
      while (item = [loop nextObject]) {
         var childLayerInfo = layerTreeWithStylesheet(stylesheet, item);
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
var stringifyStyleTree = function(styleTree){
  // first converst the tree to stringified JSON
  var JSONData = [NSJSONSerialization dataWithJSONObject:styleTree options:0 error:nil];
  var JSONString = [[NSString alloc] initWithData:JSONData encoding:NSUTF8StringEncoding];
  return JSONString; // JSValue to pass along to the css-layout library;
}

// check whether a layer should be ignored when being laid out
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
