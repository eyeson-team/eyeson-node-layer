const Eyeson = require('@eyeson/node')
const EyesonLayer = require('@eyeson/node-layer')

const eyeson = new Eyeson({ apiKey: process.env.API_KEY })

const participants = new Map()
const overlay = new EyesonLayer()
const font = '16px "Comic Sans MS", sans-serif'
const fontColor = '#000000'
const backgroundColor = '#d9d9d980'

let user = null
let currentPodium = []
let userUpdate = false
let layerBusy = false
let queueLayerUpdate = false

const onParticipant = async participant => {
    if (participant.online === false) {
        participants.delete(participant.id)
        return
    }
    participants.set(participant.id, participant)
    if (userUpdate) {
        userUpdate = false
        await createLayer()
    }
}

const onPodium = async podium => {
    currentPodium = podium
    await createLayer()
}

const createLayer = async () => {
    if (layerBusy) {
        queueLayerUpdate = true
        return
    }
    layerBusy = true
    // re-use EyesonLayer
    overlay.clear()
    currentPodium.forEach(spot => {
        // wait for participant_update
        if (spot.user_id && !participants.has(spot.user_id)) {
            userUpdate = true
        }
        // https://docs.eyeson.com/docs/rest/features/observer/events#podium_update
        if (spot.user_id && participants.has(spot.user_id)) {
            const { name } = participants.get(spot.user_id)
            const x = spot.left
            const y = spot.top + spot.height
            overlay.addTextBox(name, font, fontColor, x, y, 'bottom left', 10, spot.width, 3, backgroundColor)
        }
    })
    try {
        await user.sendLayer(overlay)
    } catch (error) {
        console.warn('Send Layer', error)
    }
    layerBusy = false
    if (queueLayerUpdate) {
        queueLayerUpdate = false
        await createLayer()
    }
}

const run = async () => {
    user = await eyeson.join('User', 'testroom', { options: { widescreen: true, sfu_mode: 'disabled' } })
    await user.waitReady()
    // turn off name-banner to use our own
    await user.setLayout({ layout: 'auto', show_names: false })
    // log meeting links to join
    console.log('User', user.data.links.gui, 'Guest', user.data.links.guest_join)
    const connection = eyeson.observer.connect(user.roomId)
    connection.on('event', event => {
        if (event.type === 'participant_update') {
            onParticipant(event.participant)
        }
        else if (event.type === 'podium_update') {
            onPodium(event.podium)
        }
    })
}

run()
