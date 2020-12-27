import { ipcMain } from "electron";
import DiscordRPC from 'discord-rpc'

class Discord {
    constructor() {
        this.clientId = "787046030285733898"
        this.startTimestamp = new Date()

        this.rpcClient = new DiscordRPC.Client({ transport: 'ipc' })
        this.rpcClient.on('ready', () => {
            this.setDiscordActivity();
      
            // activity can only be set every 15 seconds
            setInterval(() => {
                this.setDiscordActivity();
            }, 15e3);
        });
        this.rpcClient.login({ clientId: this.clientId }).catch(console.error);

        ipcMain.on('discord-activity-update', (event, data) => {
            this.startTimestamp = new Date()
            this.channel = data
        })
    }

    setDiscordActivity() {
        if (!this.rpcClient || !this.channel){
            return;
        }

        this.rpcClient.setActivity({
            state: this.channel.title || 'unknown',
            details: 'Hört gerade',
            startTimestamp: this.startTimestamp || new Date(),
            largeImageKey: 'ts_large',
            largeImageText: 'TSRadio',
            instance: false,
        });
    }
}

export default Discord