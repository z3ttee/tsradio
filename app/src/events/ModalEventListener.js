import mitt from 'mitt'
import store from '@/store/index.js'

const eventbus = mitt()

eventbus.on('dismiss', () => {
    const dismiss = () => store.state.modal = undefined

    if(store.state.modal.onDismiss) {
        store.state.modal.onDismiss(dismiss)
    } else {
        dismiss()
    }
})
eventbus.on('outsideClicked', () => {
    const dismiss = () => store.state.modal = undefined

    if(store.state.modal.onOutsideClicked) {
        store.state.modal.onOutsideClicked(dismiss)
    } else {
        dismiss()
    }
})

export default eventbus