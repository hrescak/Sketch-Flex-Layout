# Sketch Flex Layout
A Plugin for Sketch allowing for CSS Flexbox layouts using stylesheets and prototypes. To install the plugin download this repository as a ZIP and double click the Flex-Layout.sketchplugin file. **Important note :** *This is a very work in progress version for early testing. A lot of things are subject to change and using it on critical projects is not yet recommended.*

![](http://i.imgur.com/Z5A8Hqo.png)

Flex Layout allows you to use both a stylesheet text layer and 'prototypes'. Prototypes are layer groups with added style layers - their sizes work as base for establishing paddings, margins, sizes etc. There's an [example file](https://github.com/hrescak/Sketch-Flex-Layout/raw/master/ExampleFile.sketch) included in the repository that shows examples of working with both.

## Working with stylesheets

![](http://i.imgur.com/2FcoADp.png)

1. Create a text layer and name it **“@stylesheet”**.
2. Write css in the layer. Some rules:
	1. the supported properties are listed [here](https://github.com/facebook/css-layout).
	2. they are in camelCase not hyphen-ated
	3. they have no units
	4. shortcut rules are not supported (yet)
	5. there are only classes *(.something)*
	6. so no nested styles *(“\>” declarations)*
3. Create some layers and append the selectors to them. So if your selector is '.someclass{width:200;}', you rename the layer from 'Rect1' to 'Rect1 .someclass'
4. Run cmd + ctrl + L for the layout to apply

## Working with prototypes

![](http://i.imgur.com/Y86vIYJ.png)

1. Create a prototype group, name it **"prototype .SOMETHING"**
2. Add rectangle style layers to the group - [these are the supported names and dimensions](http://i.imgur.com/IguIeFI.png)
	- if you need it, add a text layer named **"@styles"** with layout styles, separated by semicolon - [these are the styles and values](http://i.imgur.com/oseZ1Dr.png)
3. You can add more groups with their own styles to the prototype group, and these don't need the "prototype" in their name, just the **".somethingelse"** class name
4. Duplicate the prototype, remove **"prototype"** from the layer name, remove all the style layers, and you have a group that will change based on changes made to the prototype
5. Run cmd + ctrl + L for the layout to apply

*Tip* - you can have both prototypes and a *@stylesheet* layer on the same page.

## Notes

1. You can have different stylesheets in different pages, the layout gets applied on the current page only.
2. If a layer group has a style, all of it's children are automatically part of the layout.
3. Adding a layer named **"bg"** stretches it to the size of the group. This is because unlike in HTML, groups have no default background.
4. Class names are unique across the page and prototypes - if you have a class ".picture" in a prototype and ".picture" in a different one or the stylesheet, only one of them gets applied.

## Todos / Known problems

- See Issues to the right.
