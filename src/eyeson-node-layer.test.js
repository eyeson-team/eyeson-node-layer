const fsPromise = require('node:fs/promises')
jest.mock('node:fs/promises');

const EyesonLayer = require('./eyeson-node-layer')

describe('canvas', () => {
  it('creates a canvas', () => {
    const layer = new EyesonLayer({ widescreen: true })
    expect(layer._canvas.width).toEqual(1280)
    expect(layer._canvas.height).toEqual(720)
  })

  it('adds text', () => {
    const layer = new EyesonLayer({ widescreen: true })
    const entry = layer.addText('test', '16px Arial', '#000', 0, 0, null)
    expect(entry.type).toBe('text')
  })

  it('creates a buffer', () => {
    const layer = new EyesonLayer({ widescreen: true })
    layer.addText('test', '16px Arial', '#000', 0, 0, null)
    const buffer = layer.createBuffer()
    expect(buffer).toBeInstanceOf(Buffer)
  })

  it('writes local image', async () => {
    const layer = new EyesonLayer({ widescreen: true })
    layer.addText('test', '16px Arial', '#000', 0, 0, null)
    await layer.writeFile('./test.png')
    expect(fsPromise.writeFile).toHaveBeenCalledTimes(1)
  })

  it('can register a font', () => {
    const result = EyesonLayer.registerFont('./OpenSans.ttf', 'OpenSans')
    // result is false since there's no real ttf file
    expect(result).toBe(false)
  })
})
