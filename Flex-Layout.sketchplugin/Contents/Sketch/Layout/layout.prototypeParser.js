var prototypeKeyword = "prototype";
var styleHandle = "@";
var styleLayerName = "styles";
var compoundProperties = ["margin", "padding", "size"];
var widthProperties = ["width", "minWidth", "maxWidth", "left", "right", "marginLeft", "marginRight", "paddingLeft", "paddingRight"];
var heightProperties = ["height", "minHeight", "maxHeight", "top", "bottom", "marginTop", "marginBottom", "paddintTop", "paddingBottom"];

var parsePrototypes = function(context){
  var doc = context.document;
  var page = [doc currentPage];
  log("parsing prototypes");
  // look for prototypes in page recursively
  var styleArray = parseLayersForPrototypes(page,false);
  var flattenedArray = flattenArray(styleArray);
  var styleObject = keyedObjectFromArray(flattenedArray, "class");
  return styleObject;
}

var parseLayersForPrototypes = function(baseLayer,shouldCollectStyles){
  //if layer is a prototype, flip a switch to parse all of the children for styles
  var parsedStyles = [];
  if (isLayerAPrototype(baseLayer)) {
    shouldCollectStyles = true;
  }

  if (isGroupClassMember(baseLayer)){
    // you can only collect styles on groups
    if (shouldCollectStyles) {
      var styleAttributes = collectAttributes(baseLayer);
      if (objectSize(styleAttributes) > 0) {
        var styleObject = {};
        styleObject["class"] = layerClass(baseLayer);
        styleObject["attributes"] = styleAttributes;
        parsedStyles.push(styleObject);
      }
    }
    var childLayers = [baseLayer layers].array();
    if (childLayers){
      for (var i=0; i < [childLayers count]; i++){
        var item = childLayers[i];
        var childStyles = parseLayersForPrototypes(item,shouldCollectStyles);
        parsedStyles.push(childStyles);
      }
    }
  }
  return parsedStyles;
}

// returns whether a layer group is a prototype or not
var isLayerAPrototype = function(layer){
  return [[layer name] hasPrefix:prototypeKeyword];
}

// collects all attributes from style layers
var collectAttributes = function(layer){
  var attributes = {};
  log("collecting layer styles on" + [layer name]);

  // iterate over child layers to look for style layers
  var childLayers = [layer layers].array();

  for (var i = 0; i < [childLayers count]; i++) {
    var styleLayer = childLayers[i];

    //collect style layer
    if ([styleLayer name] == styleHandle + styleLayerName) {
      var styleLayerAttributes = attributesFromStyleLayer(styleLayer);
      for (var attr in styleLayerAttributes) {
        attributes[attr] = styleLayerAttributes[attr];
      }
    }

    //collect compounds;
    for (var j = 0; j < compoundProperties.length; j++) {
      if ([styleLayer name] == styleHandle + compoundProperties[j]) {
        if (compoundProperties[j] == "size") {
          attributes["width"] = styleLayer.frame().width();
          attributes["height"] = styleLayer.frame().height();
        } else {
          var propertyTop = compoundProperties[j] + "Top";
          var propertyBottom = compoundProperties[j] + "Bottom";
          var propertyLeft = compoundProperties[j] + "Left";
          var propertyRight = compoundProperties[j] + "Right";

          attributes[propertyTop] = styleLayer.frame().height();
          attributes[propertyBottom] = styleLayer.frame().height();
          attributes[propertyRight] = styleLayer.frame().width();
          attributes[propertyLeft] = styleLayer.frame().width();
        }
      }
    };

    //collect widths;
    for (var k = 0; k < widthProperties.length; k++) {
      var widthProperty = widthProperties[k];
      if ([styleLayer name] == styleHandle + widthProperty) {
        attributes[widthProperty] = styleLayer.frame().width();
      }
    }

    //collect heights;
    for (var l = 0; l < heightProperties.length; l++) {
      var heightProperty = heightProperties[l]
      if ([styleLayer name] == styleHandle + heightProperty) {
        attributes[heightProperty] = styleLayer.frame().height();
      }
    }
  }
  return attributes;
}

var attributesFromStyleLayer = function(layer){
  var attributes = {};
  if (isTextLayer(layer)) {
    var attributeString = [layer stringValue];
    //strip whitespace and newlines
    attributeString = [attributeString stringByReplacingOccurrencesOfString:"\n" withString:""];
    attributeString = [attributeString stringByReplacingOccurrencesOfString:" " withString:""];

    var attributesArray = [attributeString componentsSeparatedByString:";"];
    log([attributesArray count])
    for (var i = 0; i < [attributesArray count]; i++) {
      var currentAttribute = attributesArray[i];
      var splitAttribute = [currentAttribute componentsSeparatedByString:":"];
      if ([splitAttribute count] == 2) {
        var property = splitAttribute[0];
        var propertyValue = splitAttribute[1];
        attributes[property] = propertyValue;
      }
    }
  }
  log(attributes);
  return attributes;
}
