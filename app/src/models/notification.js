const DEFAULT_OPTIONS = {
    vibrate: true,
    icon: "/favicon.ico",
}

export class Notifications {

    static notifications = {}

    static create(id, title, message, options = {}, onclick = () => { window.focus() }) {
        // Fallback
        if(!("Notification" in window)){
            alert(title + "\n" + message);
            return
        }

        // Check permissions
        if(Notification.permission !== 'granted') {
            Notification.requestPermission().then((value) => {
                if(value == "granted") {
                    this.create(id, title, message, options, onclick)
                }
            })
            return
        }

        // Create notification and show it
        var notification = new Notification(title, {
            tag: id,
            body: message,
            ...DEFAULT_OPTIONS,
            ...options
        })

        notification.onclick = onclick
        notification.onclose = () => {
            delete this.notifications[id]
        }

        if(id) {
            this.notifications[id] = notification
        }
        
    }

    static close(id) {
        if(this.notifications[id]) {
            this.notifications[id].close()
            delete this.notifications[id]
        }
    }

    static error(id, message) {
        this.create(id, "Ein Fehler ist aufgetreten", message, { renotify: true })
    }

}