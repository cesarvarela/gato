import electron from 'electron'

const secureListener = (listener: (e: electron.IpcMainInvokeEvent, ...args) => void) => {

    return (e: electron.IpcMainInvokeEvent, ...args) => {

        //TODO: check if the sender is trusted
        if (e.sender.getURL().includes('snacks')) {

            console.log('secure listener', e.sender.getURL())

            return listener(e, ...args)
        }
        else {

            console.log('Blocked request from:', e.sender.getURL())
        }
    }
}

export default secureListener