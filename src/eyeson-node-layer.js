const canvas = require('@napi-rs/canvas')
const fsPromise = require('node:fs/promises')

/**
 * @typedef {'left'|'center'|'right'|'start'|'end'} TextAlign
 * @typedef {'top left'|'top center'|'top right'|'center left'|'center'|'center right'|'bottom left'|'bottom center'|'bottom right'} BoxOrigin
 */

/**
 * Class Layer
 */
class EyesonLayer {
  /**
   * @typedef {object} LayerObject
   * @prop {string} type
   * 
   * @typedef {object} LayerOptions
   * @prop {boolean} [widescreen] - widescreen, default: true
   */

  /**
   * @param {LayerOptions} options 
   */
  constructor(options = {}) {
    options.widescreen = options.widescreen ?? true
    this.options = options
    /** @type {Array<LayerObject & Record<string,any>>} */
    this._objects = []
    this.width = 1280
    this.height = options.widescreen ? 720 : 960
    /** @type {canvas.Canvas} */
    this._canvas = canvas.createCanvas(this.width, this.height)
    /** @type {canvas.SKRSContext2D} */
    this._ctx = this._canvas.getContext('2d')
    this._ctx.textAlign = 'left'
    this._ctx.textBaseline = 'top'
  }
  /**
   * Measure text
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/measureText
   * @param {string} text
   * @param {string} font - E.g. '16px Arial, sans-serif'
   * @returns {TextMetrics}
   */
  measureText(text, font) {
    this._ctx.font = font
    return this._ctx.measureText(text)
  }
  /**
   * Load image from path, URL, or Buffer to use with addImage
   * @param {string|URL|Buffer|ArrayBufferLike|Uint8Array|canvas.Image|import('stream').Readable} source
   * @returns {Promise<canvas.Image>}
   */
  async loadImage(source) {
    return await canvas.loadImage(source)
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createLinearGradient
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @returns {CanvasGradient}
   */
  createLinearGradient(x1, y1, x2, y2) {
    return this._ctx.createLinearGradient(x1, y1, x2, y2)
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createRadialGradient
   * @param {number} x1
   * @param {number} y1
   * @param {number} r1
   * @param {number} x2
   * @param {number} y2
   * @param {number} r2
   * @returns {CanvasGradient}
   */
  createRadialGradient(x1, y1, r1, x2, y2, r2) {
    return this._ctx.createRadialGradient(x1, y1, r1, x2, y2, r2)
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createConicGradient
   * @param {number} startAngle
   * @param {number} x
   * @param {number} y
   * @returns {CanvasGradient}
   */
  createConicGradient(startAngle, x, y) {
    return this._ctx.createConicGradient(startAngle, x, y)
  }
  /**
   * Set shadow that is applied to all following elements
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowBlur
   * @param {number} blur
   * @param {number} offsetX
   * @param {number} offsetY
   * @param {string} color - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
   * @returns {{ type: 'start-shadow', blur: number, offsetX: number, offsetY: number, color: string }}
   */
  startShadow(blur, offsetX, offsetY, color) {
    const entry = { type: 'start-shadow', blur, offsetX, offsetY, color }
    this._objects.push(entry)
    return entry
  }
  /**
   * End shadow, continue without shadow
   * @returns {{ type: 'end-shadow' }}
   */
  endShadow() {
    const entry = { type: 'end-shadow' }
    this._objects.push(entry)
    return entry
  }
  /**
   * Add text to canvas
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillText
   * @param {string} text
   * @param {string} font - E.g. '16px Arial, sans-serif'
   * @param {string|CanvasGradient} color - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
   * @param {number} x
   * @param {number} y
   * @param {number|null} [maxWidth]
   * @returns {{ type: 'text', text: string, font: string, color: string|CanvasGradient, x: number, y: number, maxWidth: number|null }}
   */
  addText(text, font, color, x, y, maxWidth = null) {
    const entry = { type: 'text', text, font, color, x, y, maxWidth }
    this._objects.push(entry)
    return entry
  }
  /**
   * Add multiline text to canvas
   * @param {string} text
   * @param {string} font - E.g. '16px Arial, sans-serif'
   * @param {string|CanvasGradient} color - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {number} lineHeight
   * @param {TextAlign} [textAlign]
   * @returns {{ type: 'multiline', text: string, font: string, color: string|CanvasGradient, x: number, y: number, width: number, height: number, lineHeight: number, textAlign: TextAlign }}
   */
  addMultilineText(text, font, color, x, y, width, height, lineHeight, textAlign = 'left') {
    const entry = { type: 'multiline', text, font, color, x, y, width, height, lineHeight, textAlign }
    this._objects.push(entry)
    return entry
  }
  /**
   * Add image to canvas
   * @param {string|URL|Buffer|ArrayBufferLike|Uint8Array|canvas.Image|import('stream').Readable} source - URL or path of image file
   * @param {number} x
   * @param {number} y
   * @param {number|null} [width] - width of image if null
   * @param {number|null} [height] - height of image if null
   * @returns {Promise<{ type: 'image', image: canvas.Image, x: number, y: number, width: number|null, height: number|null }>}
   */
  async addImage(source, x, y, width = null, height = null) {
    const image = await canvas.loadImage(source)
    const entry = { type: 'image', image, x, y, width, height }
    this._objects.push(entry)
    return entry
  }
  /**
   * Add a filled rectangle to canvas
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {number} radius - default 0
   * @param {string|CanvasGradient} color - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
   * @returns {{ type: 'rect', x: number, y: number, width: number, height: number, radius: number, color: string|CanvasGradient }}
   */
  addRect(x, y, width, height, radius = 0, color) {
    const entry = { type: 'rect', x, y, width, height, radius, color }
    this._objects.push(entry)
    return entry
  }
  /**
   * Add a stroked rectangle to canvas
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {number} lineWidth - default 1
   * @param {number} radius - default 0
   * @param {string|CanvasGradient} color - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
   * @returns {{ type: 'rect-outline', x: number, y: number, width: number, height: number, lineWidth: number, radius: number, color: string|CanvasGradient }}
   */
  addRectOutline(x, y, width, height, lineWidth = 1, radius = 0, color) {
    const entry = { type: 'rect-outline', x, y, width, height, lineWidth, radius, color }
    this._objects.push(entry)
    return entry
  }
  /**
   * Add a filled circle
   * @param {number} x
   * @param {number} y
   * @param {number} radius
   * @param {string|CanvasGradient} color - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
   * @returns {{ type: 'circle', x: number, y: number, radius: number, color: string|CanvasGradient }}
   */
  addCircle(x, y, radius, color) {
    const entry = { type: 'circle', x, y, radius, color }
    this._objects.push(entry)
    return entry
  }
  /**
   * Add a stroked circle
   * @param {number} x
   * @param {number} y
   * @param {number} radius
   * @param {number} lineWidth - default 1
   * @param {string|CanvasGradient} color - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
   * @returns {{ type: 'circle-outline', x: number, y: number, radius: number, lineWidth: number, color: string|CanvasGradient }}
   */
  addCircleOutline(x, y, radius, lineWidth = 1, color) {
    const entry = { type: 'circle-outline', x, y, radius, lineWidth, color }
    this._objects.push(entry)
    return entry
  }
  /**
   * Add a line
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @param {number} lineWidth - default 1
   * @param {string|CanvasGradient} color - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
   * @returns {{ type: 'line', x1: number, y1: number, x2: number, y2: number, lineWidth: number, color: string|CanvasGradient }}
   */
  addLine(x1, y1, x2, y2, lineWidth = 1, color) {
    const entry = { type: 'line', x1, y1, x2, y2, lineWidth, color }
    this._objects.push(entry)
    return entry
  }
  /**
   * Add a filled polygon
   * @param {string|CanvasGradient} color - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
   * @param  {...number} points - a sequence of x, y point coordinates. minimum 3 points
   * @returns {{ type: 'polygon', color: string|CanvasGradient, points: Array<number> }}
   */
  addPolygon(color, ...points) {
    if (points.length % 2 !== 0) {
      throw new Error('Number of points must be even')
    }
    if (points.length < 6) {
      throw new Error('Polygon must at least have 3 choordinates')
    }
    const entry = { type: 'polygon', color, points }
    this._objects.push(entry)
    return entry
  }
  /**
   * Add a stroked polygon
   * @param {string|CanvasGradient} color - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
   * @param {number} lineWidth - default 1
   * @param  {...number} points - a sequence of x, y point coordinates. minimum 3 points
   * @returns {{ type: 'polygon-outline', color: string|CanvasGradient, lineWidth: number, points: Array<number> }}
   */
  addPolygonOutline(color, lineWidth = 1, ...points) {
    if (points.length % 2 !== 0) {
      throw new Error('Number of points must be even')
    }
    if (points.length < 6) {
      throw new Error('Polygon must at least have 3 choordinates')
    }
    const entry = { type: 'polygon-outline', color, lineWidth, points }
    this._objects.push(entry)
    return entry
  }
  /**
   * Add a text on a filled box
   * @param {string} text
   * @param {string} font - E.g. '16px Arial, sans-serif'
   * @param {string|CanvasGradient} fontColor - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
   * @param {number} x
   * @param {number} y
   * @param {BoxOrigin} origin - Origin of x, y, default "top left"
   * @param {number|Array<number>} padding - One number for all sides or array of numbers, supports 1, 2, 3, or 4 value notation. default 0
   * @param {number|null} maxWidth - default null
   * @param {number} radius - default 0
   * @param {string|CanvasGradient} color - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
   * @returns {{ type: 'text-box', text: string, font: string, fontColor: string|CanvasGradient, x: number, y: number, origin: BoxOrigin, padding: number|Array<number>, maxWidth: number|null, radius: number, color: string|CanvasGradient }}
   */
  addTextBox(text, font, fontColor, x, y, origin = 'top left', padding = 0, maxWidth = null, radius = 0, color) {
    const entry = { type: 'text-box', text, font, fontColor, x, y, origin, padding, maxWidth, radius, color }
    this._objects.push(entry)
    return entry
  }
  /**
   * Add a text on a stroked box
   * @param {string} text
   * @param {string} font - E.g. '16px Arial, sans-serif'
   * @param {string|CanvasGradient} fontColor - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
   * @param {number} x
   * @param {number} y
   * @param {BoxOrigin} origin - Origin of x, y, default "top left"
   * @param {number|Array<number>} padding - One number for all sides or array of numbers, supports 1, 2, 3, or 4 value notation. default 0
   * @param {number|null} maxWidth - default null
   * @param {number} radius - default 0
   * @param {number} lineWidth - default 1
   * @param {string|CanvasGradient} color - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
   * @returns {{ type: 'text-box-outline', text: string, font: string, fontColor: string|CanvasGradient, x: number, y: number, origin: BoxOrigin, padding: number|Array<number>, maxWidth: number|null, radius: number, lineWidth: number, color: string|CanvasGradient }}
   */
  addTextBoxOutline(text, font, fontColor, x, y, origin = 'top left', padding = 0, maxWidth = null, radius = 0, lineWidth = 1, color) {
    const entry = { type: 'text-box-outline', text, font, fontColor, x, y, origin, padding, maxWidth, radius, lineWidth, color }
    this._objects.push(entry)
    return entry
  }
  /**
   * Add a filled rectangle with non-exeeding multiline text
   * @param {string} text
   * @param {string} font - E.g. '16px Arial, sans-serif'
   * @param {string|CanvasGradient} fontColor - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {number|Array<number>} padding - One number for all sides or array of numbers, supports 1, 2, 3, or 4 value notation. default 0
   * @param {number} lineHeight
   * @param {number} radius - default 0
   * @param {string|CanvasGradient} color - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
   * @param {TextAlign} [textAlign] - default "left"
   * @returns {{ type: 'multiline-box', text: string, font: string, fontColor: string|CanvasGradient, x: number, y: number, width: number, height: number, padding: number|Array<number>, lineHeight: number, radius: number, color: string|CanvasGradient, textAlign: TextAlign }}
   */
  addMultilineTextBox(text, font, fontColor, x, y, width, height, padding = 0, lineHeight, radius = 0, color, textAlign = 'left') {
    const entry = { type: 'multiline-box', text, font, fontColor, x, y, width, height, padding, lineHeight, radius, color, textAlign }
    this._objects.push(entry)
    return entry
  }
  /**
   * Add a stroked rectangle with non-exeeding multiline text
   * @param {string} text
   * @param {string} font - E.g. '16px Arial, sans-serif'
   * @param {string|CanvasGradient} fontColor - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {number|Array<number>} padding - One number for all sides or array of numbers, supports 1, 2, 3, or 4 value notation. default 0
   * @param {number} lineHeight
   * @param {number} radius - default 0
   * @param {number} lineWidth - default 1
   * @param {string|CanvasGradient} color - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
   * @param {TextAlign} [textAlign] - default "left"
   * @returns {{ type: 'multiline-box-outline', text: string, font: string, fontColor: string|CanvasGradient, x: number, y: number, width: number, height: number, padding: number|Array<number>, lineHeight: number, radius: number, lineWidth: number, color: string|CanvasGradient, textAlign: TextAlign }}
   */
  addMultilineTextBoxOutline(text, font, fontColor, x, y, width, height, padding = 0, lineHeight, radius = 0, lineWidth = 1, color, textAlign = 'left') {
    const entry = { type: 'multiline-box-outline', text, font, fontColor, x, y, width, height, padding, lineHeight, radius, lineWidth, color, textAlign }
    this._objects.push(entry)
    return entry
  }
  /**
   * Draw on canvas and return Buffer
   * @returns {Buffer}
   */
  createBuffer() {
    const { _canvas, _ctx } = this
    _ctx.clearRect(0, 0, _canvas.width, _canvas.height)
    this._objects.forEach(entry => {
      const { type } = entry
      if (type === 'text') {
        _ctx.font = entry.font
        _ctx.fillStyle = entry.color
        _ctx.fillText(entry.text, entry.x, entry.y, entry.maxWidth)
      }
      else if (type === 'multiline') {
        _ctx.font = entry.font
        _ctx.fillStyle = entry.color
        _ctx.textAlign = entry.textAlign
        const xText = parseTextAlign(entry.textAlign, entry.x, entry.width)
        canvasMultilineText(_ctx, entry.text, xText, entry.y, entry.width, entry.height, entry.lineHeight)
        _ctx.textAlign = 'left'
      }
      else if (type === 'multiline-box') {
        _ctx.font = entry.font
        _ctx.fillStyle = entry.color
        _ctx.textAlign = entry.textAlign
        const [paddingTop, paddingRight, paddingBottom, paddingLeft] = parsePadding(entry.padding)
        const xText = parseTextAlign(entry.textAlign, entry.x, entry.width - paddingLeft - paddingRight)
        if (entry.radius > 0) {
          _ctx.beginPath()
          _ctx.roundRect(entry.x, entry.y, entry.width, entry.height, entry.radius)
          _ctx.fill()
        } else {
          _ctx.fillRect(entry.x, entry.y, entry.width, entry.height)
        }
        _ctx.fillStyle = entry.fontColor
        canvasMultilineText(_ctx, entry.text, xText + paddingLeft, entry.y + paddingTop, entry.width - paddingLeft - paddingRight, entry.height - paddingTop - paddingBottom, entry.lineHeight)
        _ctx.textAlign = 'left'
      }
      else if (type === 'multiline-box-outline') {
        _ctx.font = entry.font
        _ctx.strokeStyle = entry.color
        _ctx.lineWidth = entry.lineWidth
        _ctx.textAlign = entry.textAlign
        const [paddingTop, paddingRight, paddingBottom, paddingLeft] = parsePadding(entry.padding)
        const xText = parseTextAlign(entry.textAlign, entry.x, entry.width - paddingLeft - paddingRight)
        if (entry.radius > 0) {
          _ctx.beginPath()
          _ctx.roundRect(entry.x, entry.y, entry.width, entry.height, entry.radius)
          _ctx.stroke()
        } else {
          _ctx.strokeRect(entry.x, entry.y, entry.width, entry.height)
        }
        _ctx.fillStyle = entry.fontColor
        canvasMultilineText(_ctx, entry.text, xText + paddingLeft, entry.y + paddingTop, entry.width - paddingLeft - paddingRight, entry.height - paddingTop - paddingBottom, entry.lineHeight)
        _ctx.textAlign = 'left'
      }
      else if (type === 'rect') {
        _ctx.fillStyle = entry.color
        if (entry.radius > 0) {
          _ctx.beginPath()
          _ctx.roundRect(entry.x, entry.y, entry.width, entry.height, entry.radius)
          _ctx.fill()
        } else {
          _ctx.fillRect(entry.x, entry.y, entry.width, entry.height)
        }
      }
      else if (type === 'text-box') {
        _ctx.font = entry.font
        const textSize = _ctx.measureText(entry.text)
        const [paddingTop, paddingRight, paddingBottom, paddingLeft] = parsePadding(entry.padding)
        const width = entry.maxWidth ? Math.min(textSize.width + paddingLeft + paddingRight, entry.maxWidth) : textSize.width + paddingLeft + paddingRight
        const height = Math.abs(textSize.actualBoundingBoxAscent) + Math.abs(textSize.actualBoundingBoxDescent) + paddingTop + paddingBottom
        const [xBox, yBox, xText, yText] = parseOrigin(entry.origin.trim(), entry.x, entry.y, paddingLeft, paddingTop, width, height)
        _ctx.fillStyle = entry.color
        if (entry.radius > 0) {
          _ctx.beginPath()
          _ctx.roundRect(xBox, yBox, width, height, entry.radius)
          _ctx.fill()
        } else {
          _ctx.fillRect(xBox, yBox, width, height)
        }
        _ctx.fillStyle = entry.fontColor
        _ctx.fillText(entry.text, xText, yText, width - paddingLeft - paddingRight)
      }
      else if (type === 'text-box-outline') {
        _ctx.font = entry.font
        const textSize = _ctx.measureText(entry.text)
        const [paddingTop, paddingRight, paddingBottom, paddingLeft] = parsePadding(entry.padding)
        const width = entry.maxWidth ? Math.min(textSize.width + paddingLeft + paddingRight, entry.maxWidth) : textSize.width + paddingLeft + paddingRight
        const height = Math.abs(textSize.actualBoundingBoxAscent) + Math.abs(textSize.actualBoundingBoxDescent) + paddingTop + paddingBottom
        const [xBox, yBox, xText, yText] = parseOrigin(entry.origin.trim(), entry.x, entry.y, paddingLeft, paddingTop, width, height)
        _ctx.strokeStyle = entry.color
        _ctx.lineWidth = entry.lineWidth
        if (entry.radius > 0) {
          _ctx.beginPath()
          _ctx.roundRect(xBox, yBox, width, height, entry.radius)
          _ctx.stroke()
        } else {
          _ctx.strokeRect(xBox, yBox, width, height)
        }
        _ctx.fillStyle = entry.fontColor
        _ctx.fillText(entry.text, xText, yText, width - paddingLeft - paddingRight)
      }
      else if (type === 'rect-outline') {
        _ctx.strokeStyle = entry.color
        _ctx.lineWidth = entry.lineWidth
        if (entry.radius > 0) {
          _ctx.beginPath()
          _ctx.roundRect(entry.x, entry.y, entry.width, entry.height, entry.radius)
          _ctx.stroke()
        } else {
          _ctx.strokeRect(entry.x, entry.y, entry.width, entry.height)
        }
      }
      else if (type === 'image') {
        _ctx.drawImage(entry.image, entry.x, entry.y, entry.width, entry.height)
      }
      else if (type === 'circle') {
        _ctx.fillStyle = entry.color
        _ctx.beginPath()
        _ctx.arc(entry.x, entry.y, entry.radius, 0, 2 * Math.PI)
        _ctx.fill()
      }
      else if (type === 'circle-outline') {
        _ctx.strokeStyle = entry.color
        _ctx.lineWidth = entry.lineWidth
        _ctx.beginPath()
        _ctx.arc(entry.x, entry.y, entry.radius, 0, 2 * Math.PI)
        _ctx.stroke()
      }
      else if (type === 'line') {
        _ctx.lineWidth = entry.lineWidth
        _ctx.strokeStyle = entry.color
        _ctx.beginPath()
        _ctx.moveTo(entry.x1, entry.y1)
        _ctx.lineTo(entry.x2, entry.y2)
        _ctx.closePath()
        _ctx.stroke()
      }
      else if (type === 'polygon') {
        const { points } = entry
        _ctx.fillStyle = entry.color
        _ctx.beginPath()
        _ctx.moveTo(points[0], points[1])
        for (let i = 2; i < points.length; i += 2) {
          _ctx.lineTo(points[i], points[i+1])
        }
        _ctx.closePath()
        _ctx.fill()
      }
      else if (type === 'polygon-outline') {
        const { points } = entry
        _ctx.lineWidth = entry.lineWidth
        _ctx.strokeStyle = entry.color
        _ctx.beginPath()
        _ctx.moveTo(points[0], points[1])
        for (let i = 2; i < points.length; i += 2) {
          _ctx.lineTo(points[i], points[i+1])
        }
        _ctx.closePath()
        _ctx.stroke()
      }
      else if (type === 'start-shadow') {
        _ctx.shadowBlur = entry.blur
        _ctx.shadowColor = entry.color
        _ctx.shadowOffsetX = entry.offsetX
        _ctx.shadowOffsetY = entry.offsetY
      }
      else if (type === 'end-shadow') {
        _ctx.shadowBlur = 0
        _ctx.shadowOffsetX = 0
        _ctx.shadowOffsetY = 0
      }
    })
    return _canvas.toBuffer('image/png')
  }
  /**
   * Write canvas to image file for testing
   * @param {string} path - write file destination path
   * @returns {Promise}
   */
  async writeFile(path) {
    const buffer = this.createBuffer()
    await fsPromise.writeFile(path, buffer)
  }
}

const canvasMultilineText = (ctx, text, x, y, maxWidth, maxHeight, lineHeight, bullet) => {
  const lines = text.split(/\r?\n/)
  const endHeight = y + maxHeight - lineHeight
  const bulletOffset = bullet ? ctx.measureText(bullet).width : 0
  for (let line of lines) {
    if (line === '') {
      continue
    }
    const words = line.split(' ')
    let newLine = ''
    let first = true
    for (let i = 0, n = words.length; i < n; i++) {
      let testLine = newLine + words[i] + ' '
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && i > 0) {
        if (bullet && first) {
          first = false
          ctx.fillText(bullet, x, y)
        }
        ctx.fillText(newLine, x + bulletOffset, y)
        newLine = words[i] + ' '
        y += lineHeight
        if (y > endHeight) {
          return
        }
      } else {
        newLine = testLine
      }
    }
    if (bullet && first) {
      first = false
      ctx.fillText(bullet, x, y)
    }
    ctx.fillText(newLine, x + bulletOffset, y)
    y += lineHeight
    if (y > endHeight) {
      return
    }
  }
}

const parsePadding = padding => {
  let top = 0
  let right = 0
  let bottom = 0
  let left = 0
  if (typeof padding === 'string') {
    padding = padding.trim().split(/\s+/).map(Number)
  }
  if (Array.isArray(padding)) {
    if (padding.length === 1) {
      top = right = bottom = left = padding[0]
    }
    else if (padding.length === 2) {
      top = bottom = padding[0]
      right = left = padding[1]
    }
    else if (padding.length === 3) {
      top = padding[0]
      right = left = padding[1]
      bottom = padding[2]
    }
    else if (padding.length >= 4) {
      top = padding[0]
      right = padding[1]
      bottom = padding[2]
      left = padding[3]
    }
  }
  if (typeof padding === 'number') {
    top = right = bottom = left = padding
  }
  return [top, right, bottom, left]
}

const parseOrigin = (origin, x, y, paddingLeft, paddingTop, width, height) => {
  let xBox = x
  let yBox = y
  let xText = x + paddingLeft
  let yText = y + paddingTop
  if (typeof origin === 'string') {
    if (origin.includes('right')) {
      xBox = x - width
      xText = xBox + paddingLeft
    }
    if (origin.endsWith('center')) {
      xBox = x - width / 2
      xText = xBox + paddingLeft
    }
    if (origin.includes('bottom')) {
      yBox = y - height
      yText = yBox + paddingTop
    }
    if (origin.startsWith('center')) {
      yBox = y - height / 2
      yText = yBox + paddingTop
    }
  }
  return [xBox, yBox, xText, yText]
}

const parseTextAlign = (textAlign, x, width) => {
  let left = x
  if (textAlign === 'right' || textAlign === 'end') {
    left = x + width
  }
  if (textAlign === 'center') {
    left = x + width / 2
  }
  return left
}

/**
 * Register font by file path and font name
 * @param {string|Buffer} source - path to font file
 * @param {string} nameAlias - name of font
 * @returns {boolean}
 */
EyesonLayer.registerFont = (source, nameAlias) => {
  if (canvas.GlobalFonts.has(nameAlias)) {
    return true
  }
  if (source instanceof Buffer) {
    return canvas.GlobalFonts.register(source, nameAlias)
  }
  return canvas.GlobalFonts.registerFromPath(source, nameAlias)
}

module.exports = EyesonLayer
