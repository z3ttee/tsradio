import axios from 'axios'
import Toast from '@/models/toast.js'
import store from '@/store'

class Api {

    constructor() {
        axios.defaults.baseURL = store.state.config.api.baseURL
        axios.defaults.headers.common['Content-Type'] = "application/json";

        axios.interceptors.request.use((config) => {
            // Set authorization token for every request in header

            const token = store.state.user.token
            config.headers.Authorization = token

            return config
        })
    }

    get(url, data) {
        console.log(data)

        return new Promise((resolve, reject) => {
            axios.get(url, { data }).then((response) => {
                console.log(response)
                resolve(response)
            }).catch((error) => {
                if(error.response) {
                    this.handleResponse(error.response, reject)
                } else {
                    this.handleError(error, true)
                }
            })
        });
    }

    post(url, data) {
        console.log(data)

        return new Promise((resolve, reject) => {
            axios.post(url, data).then((response) => {
                resolve(response)
            }).catch((error) => {
                if(error.response) {
                    this.handleResponse(error.response, reject)
                } else {
                    this.handleError(error, true)
                }
            })
        });
    }

    /*post(url, config, printError = true) {
        return new Promise((resolve, reject) => {
            axios.post(url, config.query || {}).then(response => {
                if(response.data.status.code == 200) resolve();
                else this.handleResponse(response, reject, printError);
            }).catch(error => {
                this.handleError(error, printError);
                reject(error);
            }).finally(() => {
                if(config && config.done) config.done();
            });
        });
    }
    put(url, config, printError = true) {
        return new Promise((resolve, reject) => {
            axios.put(url, config.query || {}).then(response => {
                if(response.data.status.code == 200) resolve();
                else this.handleResponse(response, reject, printError);
            }).catch(error => {
                this.handleError(error, printError);
                reject(error);
            }).finally(() => {
                if(config && config.done) config.done();
            });
        });
    }
    delete(url, config, printError = true) {
        return new Promise((resolve, reject) => {
            axios.delete(url, config || {}).then(response => {
                if(response.data.status.code == 200) resolve();
                else this.handleResponse(response, reject, printError);
            }).catch(error => {
                this.handleError(error, printError);
                reject(error);
            }).finally(() => {
                if(config && config.done) config.done();
            });
        });
    }
    upload(url, data, config, printError = true) {
        return new Promise((resolve, reject) => {
            config.headers = {
                'Content-Type': 'multipart/form-data'
            }

            var formData = new FormData()
            formData.append('file', data)

            axios.post(url, formData, config || {}).then(response => {
                if(response.data.status.code == 200) resolve(false)
                else this.handleResponse(response, reject, printError)
            }).catch(error => {
                if(axios.isCancel(error)) {
                    resolve(true)
                } else {
                    this.handleError(error, printError)
                    reject(error)
                }
            }).finally(() => {
                if(config && config.done) config.done()
            })
        })
    }*/

    handleResponse(response, reject){
        if(response.status == 400 || response.status == 403 || response.status == 404) {
            //let err = response.data.err
            let message = response.data.message
            console.log(response)

            Toast.error(message);
            reject()
        }


        /*if(response.data.status.code == 200) {
            return;
        }

        var message = response.data.status.message;

        if(!printError) {
            reject(message)
            return
        }*/

        /*switch(message) {
            case 'missing required params':
                Toast.error('Bitte überprüfe deine Eingaben');
                break;
            case 'no permission':
                Toast.error('Keine Berechtigung');
                user.checkLogin()
                break;
            case 'no specific permission':
                Toast.error('Dir fehlen Berechtigungen um einige der ausgewählten Elemente zu manipulieren');
                user.checkLogin()
                break;
            case 'invalid access token' || 'authentication required' || 'authorization header required' || 'session expired':
                user.logout()
                Modal.login(router.currentRoute.value)
                break;
            case 'wrong credentials':
                Toast.error('Benutzername stimmt nicht mit Passwort überein');
                break;
            case 'not created' || 'not updated' || 'not deleted' || 'not uploaded':
                Toast.error('Die Aktion wurde durch einen Fehler nicht beendet');
                break;
            case 'name exists':
                Toast.error('Dieser Name ist bereits vergeben');
                break;
            case 'discordID exists':
                Toast.error('Diese DiscordID ist bereits zugeordnet');
                break;
            case 'not found':
                //Toast.error('Es konnte nichts gefunden werden');
                break;
            case 'unsupported encoding':
                Toast.error('Das Format der Datei wird nicht akzeptiert');
                break;
            case 'video exists':
                Toast.error('Dieses Video wurde bereits hochgeladen');
                break;
            case 'too large':
                Toast.error('Die Datei ist zu groß! (Max: 8GB)');
                break;
            case 'no resource':
                Toast.error('Die Resource ist in der Datenbank vorhanden, aber die Datei kann nicht gefunden werden');
                break;
            case 'higher tier required':
                Toast.error('Du benötigst einen höheren Rang als der zu bearbeitende Benutzer');
                break;

            default:
                Toast.error('Der Service ist derzeit nicht verfügbar');
                break;
        }*/

        //if(reject) reject(message);
    }

    handleError(error, printError = true) {
        console.log(error);
        if(!printError) return
        Toast.error('Der Service ist derzeit nicht verfügbar');
    }
}

export default new Api();