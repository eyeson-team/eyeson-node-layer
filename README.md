# eyeson-node-layer JavaScript Layer creation plugin

A Node.js plugin to define and create overlay or background layer to use with
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
// Register font file with name or Buffer
EyesonLayer.registerFont('./OpenSans.ttf', 'OpenSans'): boolean
const layer = new EyesonLayer({ widescreen: true }): EyesonLayer
layer.width, layer.height
const metrics = layer.measureText('text', 'bold 16px OpenSans'): TextMetrics
layer.createLinearGradient(x1, y1, x2, y2): CanvasGradient
layer.createRadialGradient(x1, y1, r1, x2, y2, r2): CanvasGradient
layer.createConicGradient(startAngle, x, y): CanvasGradient
// Set shadow that is applied to all following elements
layer.startShadow(blur, offsetX, offsetY, color): LayerObject
// End shadow, continue without shadow
layer.endShadow(): LayerObject
// Set blur filter that is applied to all following elements
layer.startBlur(radius): LayerObject
// End blur filter, continue without blur
layer.endBlur(): LayerObject
// Add text
layer.addText(text, font, color, x, y, maxWidth = null): LayerObject
// Add multiline text that breaks at the given width and prevent overflow on given height
layer.addMultilineText(text, font, color, x, y, width, maxHeight = null, lineHeight, textAlign = 'left'): LayerObject
// Load image from path, URL, or Buffer to use with addImage
const image = await layer.loadImage(source)
// Add an image. "source" can be local path, URL, Buffer, or Image. Set width and height to resize the image
await layer.addImage(source, x, y, width = null, height = null, opacity = null): Promise<LayerObject>
// Add filled rectangle with border radius
layer.addRect(x, y, width, height, radius = 0, color): LayerObject
// Add stroked rectangle with border radius
layer.addRectOutline(x, y, width, height, lineWidth = 1, radius = 0, color): LayerObject
// Add filled circle
layer.addCircle(x, y, radius, color): LayerObject
// Add stroked circle
layer.addCircleOutline(x, y, radius, lineWidth = 1, color): LayerObject
// Add line
layer.addLine(x1, y1, x2, y2, lineWidth = 1, color): LayerObject
// Add a filled polygon. points are alternating x, y coordinates
layer.addPolygon(color, ...points): LayerObject
// Add a stroked polygon. points are alternating x, y coordinates
layer.addPolygonOutline(color, lineWidth = 1, ...points): LayerObject
// Add text with a filled background box
layer.addTextBox(text, font, fontColor, x, y, origin = 'top left', padding = 0, maxWidth = null, radius = 0, color): LayerObject
// Add text with a stroked box
layer.addTextBoxOutline(text, font, fontColor, x, y, origin = 'top left', padding = 0, maxWidth = null, radius = 0, lineWidth = 1, color): LayerObject
// Add a filled box with multiline text that breaks at the given width and prevent overflow on given height
layer.addMultilineTextBox(text, font, fontColor, x, y, width, maxHeight = null, padding = 0, lineHeight, radius = 0, color, textAlign = 'left'): LayerObject
// Add a stroked box with multiline text
layer.addMultilineTextBoxOutline(text, font, fontColor, x, y, width, maxHeight = null, padding = 0, lineHeight, radius = 0, lineWidth = 1, color, textAlign = 'left'): LayerObject
// Clear layer objects to re-use a clean canvas
layer.clear()
// Draw canvas and create the image buffer
layer.createBuffer(type = 'image/png', quality = 1): Buffer
// Draw canvas and write to local file
await layer.writeFile(path: String, type = 'image/png', quality = 1): Promise<void>
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

Supported types are `image/png`, `image/jpeg`, and `image/webp`.
WebP and JPG support compression that can be set as quality between 0 and 1.

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

- 1.3.0 blur, multiline auto height, image opacity
- 1.2.2 update type declarations
- 1.2.1 createBuffer image type and quality
- 1.2.0 add clear layer
- 1.1.0 add loadImage
- 1.0.1 add width and height
- 1.0.0 Initial release
