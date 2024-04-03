# eyeson-node-layer JavaScript Layer creation plugin

A NodeJS plugin to define and create overlay or background layer to use with
[eyeson-node](https://github.com/eyeson-team/eyeson-node).

## Installation

Add eyeson-node-layer to your node project using `npm` or `yarn`.

```sh
$ npm install --save eyeson-node eyeson-node-layer
# or
$ yarn add eyeson-node eyeson-node-layer
```

> [!NOTE]
> Minimum required version of eyeson-node is 1.2.0!

## Usage

Get an API-KEY from
[developers.eyeson.team](https://developers.eyeson.team).

```js
import Eyeson from 'eyeson-node'
import EyesonLayer from 'eyeson-node-layer'

const eyeson = new Eyeson({ apiKey: '< api-key >' }) // configure to use your api key
const layer = new EyesonLayer()
// layer.addText etc.
const user = await eyeson.join('< username >')
await user.sendLayer(layer)
```

### Layer creation

You can create and apply foreground or background layers by simply programming
them! It is based on the node canvas plugin from https://github.com/Brooooooklyn/canvas.

```js
import Eyeson from 'eyeson-node'
import EyesonLayer from 'eyeson-node-layer'

const eyeson = new Eyeson({ apiKey: '< api-key >' }) // configure to use your api key

const overlay = new EyesonLayer()
const font = 'bold 16px Arial, sans-serif'
const fontColor = '#fff'

overlay.addTextBox('Martin', font, fontColor, 640, 360, 'bottom right', 10, null, 4, '#0000007f')
overlay.addTextBox('Elisa', font, fontColor, 1280, 360, 'bottom right', 10, null, 4, '#0000007f')
overlay.addTextBox('Customer', font, fontColor, 640, 720, 'bottom right', 10, null, 4, '#0000007f')

const gradient = overlay.createLinearGradient(0, 400, 0, 600)
gradient.addColorStop(0, '#777')
gradient.addColorStop(200, '#555')

overlay.startShadow(7, 2, 2, '#555')
overlay.addMultilineTextBox('Agenda:\n \n- Test Eyeson\n- Try Layer', font, fontColor, 700, 400, 240, 200, 20, 22, 4, gradient, 'center')
overlay.endShadow()

const user = await eyeson.join(username)
await user.sendLayer(overlay)
```

Save the resulting image as preview:

```js
import EyesonLayer from 'eyeson-node-layer'

const layer = new EyesonLayer()
layer.addText(...)
...
await layer.writeFile('./preview.png')
```

Here's a list of all EyesonLayer methods:

```ts
// Register font file with name
EyesonLayer.registerFont('./OpenSans.ttf', 'OpenSans'): boolean
const layer = new EyesonLayer({ widescreen: true }): EyesonLayer
const metrics = layer.measureText('text', 'bold 16px OpenSans'): TextMetrics
layer.createLinearGradient(x1, y1, x2, y2): CanvasGradient
layer.createRadialGradient(x1, y1, r1, x2, y2, r2): CanvasGradient
layer.createConicGradient(startAngle, x, y): CanvasGradient
// Set shadow that is applied to all following elements
layer.startShadow(blur, offsetX, offsetY, color): LayerObject
// End shadow, continue without shadow
layer.endShadow(): LayerObject
// add text
layer.addText(text, font, color, x, y, maxWidth = null): LayerObject
// add multiline text that breaks at the given width and prevent overflow on given height
layer.addMultilineText(text, font, color, x, y, width, height, lineHeight, textAlign = 'left'): LayerObject
// add image. path can be local or URL. set width and height to resize the image
await layer.addImage(path, x, y, width = null, height = null): Promise<LayerObject>
// add filled rectangle with border radius
layer.addRect(x, y, width, height, radius = 0, color): LayerObject
// add stroked rectangle with border radius
layer.addRectOutline(x, y, width, height, lineWidth = 1, radius = 0, color): LayerObject
// add filled circle
layer.addCircle(x, y, radius, color): LayerObject
// add stroked circle
layer.addCircleOutline(x, y, radius, lineWidth = 1, color): LayerObject
// add line
layer.addLine(x1, y1, x2, y2, lineWidth = 1, color): LayerObject
// add a filled polygon. points are alternating x, y coordinates
layer.addPolygon(color, ...points): LayerObject
// add a stroked polygon. points are alternating x, y coordinates
layer.addPolygonOutline(color, lineWidth = 1, ...points): LayerObject
// add text with a filled background box
layer.addTextBox(text, font, fontColor, x, y, origin = 'top left', padding = 0, maxWidth = null, radius = 0, color): LayerObject
// add text with a stroked box
layer.addTextBoxOutline(text, font, fontColor, x, y, origin = 'top left', padding = 0, maxWidth = null, radius = 0, lineWidth = 1, color): LayerObject
// add a filled box with multiline text that breaks at the given width and prevent overflow on given height
layer.addMultilineTextBox(text, font, fontColor, x, y, width, height, padding = 0, lineHeight, radius = 0, color, textAlign = 'left'): LayerObject
// add a stroked box with multiline text
layer.addMultilineTextBoxOutline(text, font, fontColor, x, y, width, height, padding = 0, lineHeight, radius = 0, lineWidth = 1, color, textAlign = 'left'): LayerObject
// draw canvas and create the image buffer
layer.createBuffer(): Buffer
// draw canvas and write to local file
await layer.writeFile(path: String): Promise<void>
```

For all methods, `color`, or `fontColor` can be CSS color value, e.g. '#000' or
'black' or with alpha 'rgb(0 0 0 / 10%)', or a previous generated gradient.

`textAlign` can be 'left', 'center', 'right', 'start', or 'end'.

`origin` can be 'top left', 'top center', 'top right', 'center left', 'center',
'center right', 'bottom left', 'bottom center', or 'bottom right'.

`padding` can be one number for all sides or an array of numbers. It supports
1, 2, 3, or 4 value notation.

All number values are in pixels.

The `LayerObject` is just an object containing `type` and all its settings. It's great for further delta updates.

```js
const user = eyeson.join(...)
const overlay = new EyesonLayer({ widescreen: true })
const timeEntry = overlay.addTextBox(new Date().toLocaleTimeString(), font, fontColor, x, y, origin, padding, maxWidth, radius, backgroundColor)
await user.sendLayer(overlay)
setTimeout(async () => {
    timeEntry.text = new Date().toLocaleTimeString()
    await user.sendLayer(overlay)
}, 60 * 1000) // update time every minute
```

## Development

```sh
$ npm install
$ npm run test -- --watch
$ npm run build
```

## Releases

- 1.0.0 Initial release
