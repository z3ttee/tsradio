import DiscordRPC from 'discord-rpc'

class Discord {
    constructor() {
        this.clientId = "787046030285733898"
        this.rpcClient = new DiscordRPC.Client({ transport: 'ipc' })
        this.startTimestamp = new Date()

        this.rpcClient.on('ready', () => {
            this.setDiscordActivity();
        
            // activity can only be set every 15 seconds
            setInterval(() => {
                this.setDiscordActivity();
            }, 15e3);
        });
        this.rpcClient.login({ clientId: this.clientId }).catch(console.error);
    }

    setChannel(channel) {
        this.channel = channel
        this.startTimestamp = new Date()
    }

    setDiscordActivity() {
        if (!this.rpcClient || !this.channel) {
            return;
        }

        this.rpcClient.setActivity({
            state: 'Channel: '+this.channel.title,
            details: 'Hört TSRadio.live zu...',
            startTimestamp: this.startTimestamp || new Date(),
            largeImageKey: 'ts_large',
            largeImageText: 'TSRadio',
            instance: false,
            joinSecret: "123",
            partyId: "123"
        });
    }
}

export default new Discord()