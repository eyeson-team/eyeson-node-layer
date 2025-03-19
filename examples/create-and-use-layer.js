const Eyeson = require('eyeson-node')
const EyesonLayer = require('../src/eyeson-node-layer')

const eyeson = new Eyeson({ apiKey: process.env.API_KEY })

const run = async () => {
    const layerOptions = { widescreen: true }

    const background = new EyesonLayer(layerOptions)
    background.addRect(0, 0, 1280, 720, 0, '#8c0e0d')
    background.addRectOutline(0, 0, 1280, 720, 1, 0, '#fff')
    background.addLine(0, 360, 1280, 360, 1, '#fff')
    background.addLine(640, 0, 640, 720, 1, '#fff')

    const overlay = new EyesonLayer(layerOptions)
    const font = 'bold 16px Arial, sans-serif'
    const fontColor = '#fff'

    overlay.addTextBox('Martin', font, fontColor, 640, 360, 'bottom right', 10, null, 4, '#0000007f')
    overlay.addTextBox('Elisa', font, fontColor, 1280, 360, 'bottom right', 10, null, 4, '#0000007f')
    overlay.addTextBox('Customer', font, fontColor, 640, 720, 'bottom right', 10, null, 4, '#0000007f')

    const gradient = overlay.createLinearGradient(0, 400, 0, 600)
    gradient.addColorStop(0, '#777')
    gradient.addColorStop(1, '#555')

    overlay.startShadow(7, 2, 2, '#555')
    overlay.addMultilineTextBox('Agenda:\n \n- Test Eyeson\n- Try Layer\n- One more thing…', font, fontColor, 700, 400, 240, null, 20, 22, 4, gradient, 'center')
    overlay.endShadow()

    // background.writeFile('./bg.png')
    // overlay.writeFile('./fg.png')

    const user = await eyeson.join('eyeson-node-demo', 'node-demo', {
        options: { widescreen: true },
    })
    await Promise.all([
        user.setLayout({
            layout: 'custom',
            name: 'four',
            users: ['martin', 'elisa', 'customer', 'agenda'],
            show_names: false,
            voice_activation: false,
        }),
        user.sendLayer(background, -1),
        user.sendLayer(overlay, 1),
    ])
}

run()
