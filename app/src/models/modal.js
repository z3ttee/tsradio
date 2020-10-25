import store from '@/store/index.js'
import mitt from 'mitt'

class Modal {
    eventhandler = mitt()

    show(modalData){
        store.state.modals.push(modalData)
    }

    dismissCurrent() {
        store.state.modal = undefined;
        this.eventhandler.emit('dismiss')
    }

    modalClicked(event) {
        if(event.target.id === 'modal-container') {
            this.dismiss();
        }
    }

}

const modal = new Modal();
export default modal