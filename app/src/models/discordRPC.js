import DiscordRPC from 'discord-rpc'

const clientId = "787046030285733898"
const startTimestamp = new Date()
const rpcClient = new DiscordRPC.Client({ transport: 'ipc' })

async function setDiscordActivity() {
    if (!rpcClient) {
        return;
    }

    //const boops = await mainWindow.webContents.executeJavaScript('window.boops');

    // You'll need to have snek_large and snek_small assets uploaded to
    // https://discord.com/developers/applications/<application_id>/rich-presence/assets
    rpcClient.setActivity({
        //state: '',
        details: 'Hört tsradio.live zu',
        startTimestamp,
        largeImageKey: 'ts_large',
        largeImageText: 'TSRadio',
        instance: false,
    });
}

rpcClient.on('ready', () => {
    setDiscordActivity();

    // activity can only be set every 15 seconds
    setInterval(() => {
        setDiscordActivity();
    }, 15e3);
});
rpcClient.login({ clientId }).catch(console.error);

export { setDiscordActivity }