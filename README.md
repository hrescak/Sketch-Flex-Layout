# Sketch Flex Layout
Lay out your Sketch files with CSS Flexbox right inside of Sketch.

![](http://i.imgur.com/aF6N2n7.png)

*important note* : This is a very work in progress version for early testing. A lot of things are subject to change and using it on production files is probably not the best idea.

## To get it to work

1. Install the plugin
2. Create a text layer and name it “@stylesheet”. There's an [example file](https://github.com/hrescak/Sketch-Flex-Layout/raw/master/ExampleFile.sketch) too if you want to play with it.
3. Write css in the layer. Some rules:
	1. the supported properties are listed [here](https://github.com/facebook/css-layout).
	2. they are in camelCase not hyphen-ated.
	3. they have no units
	4. shortcut rules are not supported
	5. selector understanding is limited - basically whatever is in the selector is matched at the end of layer name
	6. so no nested styles, no advanced “\>” declarations.
4. Create some layers and append the selectors to them. So if your selector is '.someclass{width:200;}', you rename the layer from 'Rect1' to 'Rect1 .someclass'. 

## Notes

1. the scope of the stylesheet is a page, you can have different stylesheets in different pages. 
2. if a layer group has a style, all of it's children are automatically laid out.
3. because unlike DIVs, layer groups have no background, there is a workaround  - put a layer inside your group and name it “bg”, it will be ignored in the hierarchy and positioned to cover the whole area of the group.


## Todos / Known problems

- See Issues to the right.