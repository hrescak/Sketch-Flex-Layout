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
  log("measured style tree:");
  log(measuredStyleTree);
  computedTree = computeStyles(measuredStyleTree);
  log("recomputed measured layout tree:" + computedTree);
  layoutElements(computedTree);
  layoutPrototypes();
}
