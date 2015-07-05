// Layout
// v0.5
// =======================================
// Apply CSS Layout to Sketch elements
// Matej Hrescak (matejh@fb.com)

@import 'utils.js'
@import 'layout.cssParser.js'
@import 'layout.prototypes.js'
@import 'layout.cssLayout.js'

var styleSheetLayerName = "@stylesheet";
var backgroundLayerName = "bg";

var onRun = function(context) {
  utils.init(context);
  //debug.start();
  // parsing prototypes
  var parsedSheet = parseStyleSheetLayer();
  var prototypeSheet = parsePrototypes();
  for(var attr in prototypeSheet){ parsedSheet[attr] = prototypeSheet[attr]};
  debug.logPart("Stylesheet + prototypes parsed");
  //log(parsedSheet);

  // saving and reading from layers
  saveStylesToLayers(parsedSheet);
  var styleTree = styleTreeFromLayers();
  debug.logPart("Layer metadata I/O");
  //log(styleTree);

  // compute layout
  var computedTree = computeStyles(styleTree);
  debug.logPart("Computed styles");
  //log(computedTree);

  // measure text layers
  var measuredStyleTree = collectMeasures(styleTree, computedTree);
  debug.logPart("Measures collected");
  //log(measuredStyleTree);

  // recompute the tree again
  computedTree = computeStyles(measuredStyleTree);
  debug.logPart("Recomputed styles");
  //log(computedTree);

  // lay out the elements
  layoutElements(computedTree);
  layoutPrototypes();
  debug.logPart("Layer layout styles");
  debug.end();
}

var newObjectFromPrototype = function(context){
  utils.init(context);
  var prototypeLayers = getPrototypeLayers();
  var chosenPrototype;
  // let people choose from more prototypes or select the single one
  if (prototypeLayers.length == 0) {
    utils.UI.showMessage("There appear to be no prototypes in this document")
    return;
  } else if (prototypeLayers.length == 1) {
    chosenPrototype = prototypeLayers[0];
  } else {
    var prototypeNames = utils.common.arrayOfValuesByKey(prototypeLayers,"name");
    var dialogResult = utils.UI.showSelect("Choose a prototype",prototypeNames);
    if (dialogResult[0] == NSAlertFirstButtonReturn) {
      chosenIndex = dialogResult[1];
      chosenPrototype = prototypeLayers[chosenIndex];
    }
  }
  // duplicate and clean up the prototype instance
  var newLayer = instantiatePrototype(chosenPrototype.layer);
  // move it to selection if there is selection
  if([selection count] != 0){
    utils.misc.moveLayerToSelection(newLayer);
    onRun(context);
  } else {
    // otherwise select the newly created layer
    [newLayer select:true byExpandingSelection:false];
  }
}
