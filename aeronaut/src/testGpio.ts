import gpio from 'rpi-gpio'

const gpioPromise = gpio.promise
const PIR_PIN = 18

const log = console.log // tslint:disable-line
const error = console.error // tslint:disable-line

const testGpio = async () => {
    try {
        await gpioPromise.setup(PIR_PIN, gpio.DIR_IN, gpio.EDGE_BOTH)
        log('PIR listening on port ' + PIR_PIN)
    } catch (e) {
        error('Failed to setup PIR listener')
        error(e)
    }

    gpio.on('change', async function (_, pinValue) {
        // TODO: what if this was equally triggered by a photo being taken + then recorded? should we count it as a separate motion detection?
        log('PIR is now', pinValue)
    });
}

testGpio().then(() => { log('Setup done') }).catch((e) => { error(e) })