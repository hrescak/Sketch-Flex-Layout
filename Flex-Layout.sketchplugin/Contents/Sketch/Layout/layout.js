// Layout
// v0.5
// =======================================
// Apply CSS Layout to Sketch elements
// Matej Hrescak (matejh@fb.com)

@import 'layout.utils.js'
@import 'layout.cssParser.js'
@import 'layout.prototypes.js'
@import 'layout.cssLayout.js'

var styleSheetLayerName = "@stylesheet";
var backgroundLayerName = "bg";

var onRun = function(context) {
  init(context);
  var parsedSheet = parseStyleSheetLayer();
  var prototypeSheet = parsePrototypes();
  for(var attr in prototypeSheet){ parsedSheet[attr] = prototypeSheet[attr]};
  log("stylesheet with prototypes:" + parsedSheet);
  saveStylesToLayers(parsedSheet);
  var styleTree = styleTreeFromLayers();
  log("style tree from layers:");
  log(styleTree);
  var computedTree = computeStyles(styleTree);
  log("computed layout tree:" + computedTree);
  var measuredStyleTree = collectMeasures(styleTree, computedTree);
  computedTree = computeStyles(measuredStyleTree);
  log("recomputed measured layout tree:" + computedTree);
  layoutElements(computedTree);
  layoutPrototypes();
}

var newObjectFromPrototype = function(context){
  init(context);
  var prototypeLayers = getPrototypeLayers();
  var chosenPrototype;
  // let people choose from more prototypes or select the single one
  if (prototypeLayers.length == 0) {
    showMessage("There appear to be no prototypes in this document")
    return;
  } else if (prototypeLayers.length == 1) {
    chosenPrototype = prototypeLayers[0];
  } else {
    var prototypeNames = arrayOfValuesByKey(prototypeLayers,"name");
    var dialogResult = createSelect("Choose a prototype",prototypeNames);
    if (dialogResult[0] == NSAlertFirstButtonReturn) {
      chosenIndex = dialogResult[1];
      chosenPrototype = prototypeLayers[chosenIndex];
    }
  }
  // duplicate and clean up the prototype instance
  var newLayer = instantiatePrototype(chosenPrototype.layer);
  // move it to selection if there is selection
  if([selection count] != 0){
    moveLayerToSelection(newLayer);
    onRun(context);
  }
}
