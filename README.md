# Sketch Flex Layout
A Plugin for Sketch allowing for CSS Flexbox layouts using stylesheets and prototypes. Here's a [Medium article](https://medium.com/@hrescak/exploring-dynamic-layout-in-sketch-fdf0e825d1cf) with some background. To install the plugin download this repository as a ZIP and double click the Flex-Layout.sketchplugin file. **Important note :** *This is a very work in progress version for early testing. A lot of things are subject to change and using it on critical projects is not yet recommended.*

![](http://i.imgur.com/Z5A8Hqo.png)

Flex Layout allows you to use both a stylesheet text layer and 'prototypes'. Prototypes are layer groups with added style layers - their sizes work as base for establishing paddings, margins, sizes etc. There's an [example file](https://github.com/hrescak/Sketch-Flex-Layout/raw/master/ExampleFile.sketch) included in the repository that shows examples of working with both.

## Install with Sketch Runner
With Sketch Runner, just go to the `install` command and search for `Sketch Flex Layout`. Runner allows you to manage plugins and do much more to speed up your workflow in Sketch. [Download Runner here](http://www.sketchrunner.com).


## Working with stylesheets

![](http://i.imgur.com/2FcoADp.png)

1. Create a text layer and name it **“@stylesheet”**.
2. Write css in the layer. Some rules:
	- the supported properties are listed [here](https://github.com/facebook/css-layout).
	- they are in camelCase not hyphen-ated
	- they have no units
	- shortcut rules are not supported (yet)
	- there are only classes *(.something)*
	- so no nested styles *(“\>” declarations)*
3. Create some layers and append the selectors to them. So if your selector is '.someclass{width:200;}', you rename the layer from 'Rect1' to 'Rect1 .someclass'
4. Run cmd + ctrl + L for the layout to apply _(make sure your stylesheet layer is de-selected, or the changes will not apply)_

## Working with prototypes

![](http://i.imgur.com/Y86vIYJ.png)

1. Create a layer group, name it **"prototype .SOMETHING"**
2. Add rectangles to the group that will define its style - [these are the supported names and dimensions](http://i.imgur.com/IguIeFI.png)
	- if you need it, add a text layer named **"@styles"** with layout styles, separated by semicolon - [these are the styles and values](http://i.imgur.com/oseZ1Dr.png)
3. You can add more groups with their own styles to the prototype group, and these don't need the "prototype" in their name, just the **".somethingelse"** class name
4. Run _Add Object From Prototype_ action - this will duplicate the prototype, remove all the style layers and if you have a group selected, it will move it under the group. This will also apply the layout.
5. After you make changes, Run cmd + ctrl + L for the layout to apply.

**Tip** - you can have both prototypes and a *@stylesheet* layer on the same page.

**Pro Tip** - when you duplicate your groups, you can prevent Sketch from adding "copy" to their names - Go to Preferences > Layers > Uncheck "Rename Duplicated Layers"

## Notes

1. You can have different stylesheets in different pages, the layout gets applied on the current page only.
2. If a layer group has a style, all of it's children are automatically part of the layout.
3. Adding a layer named **"bg"** stretches it to the size of the group. This is because unlike in HTML, groups have no default background.
4. Class names are unique across the page and prototypes - if you have a class ".picture" in a prototype and ".picture" in a different one or the stylesheet, only one of them gets applied.

## Todos / Known problems

- See [Issues](https://github.com/hrescak/Sketch-Flex-Layout/issues) to the right.
