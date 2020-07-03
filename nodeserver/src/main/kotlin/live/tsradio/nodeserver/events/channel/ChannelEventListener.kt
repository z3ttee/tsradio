package live.tsradio.nodeserver.events.channel

import live.tsradio.nodeserver.api.node.channel.NodeChannel
import live.tsradio.nodeserver.handler.ChannelHandler
import live.tsradio.nodeserver.files.Filesystem
import org.slf4j.Logger
import org.slf4j.LoggerFactory

object ChannelEventListener {
    private val logger: Logger = LoggerFactory.getLogger(ChannelHandler::class.java)

    const val REASON_SHUTDOWN_TRIGGERED = 0
    const val REASON_CHANNEL_EXCEPTION: Int = 1

    fun onChannelReady(channel: NodeChannel) {
        channel.isRunning = true
        logger.info("Channel '${channel.name}' is ready")
    }

    fun onChannelDone(channel: NodeChannel) {
        if(ChannelHandler.restartTries.containsKey(channel.id)) {
            ChannelHandler.restartTries.remove(channel.id)
        }
    }

    fun onChannelStop(channel: NodeChannel, reason: Int = REASON_SHUTDOWN_TRIGGERED){
        channel.isRunning = false
        //ChannelHandler.activeChannels.remove(channel.id)
        Thread.sleep(10)

        if(reason == REASON_CHANNEL_EXCEPTION && Filesystem.preferences.channels.autorestart) {
            // Restart channel
            var triesUsed = ChannelHandler.restartTries.getOrDefault(channel.id, 0)
            val delay: Long = (Filesystem.preferences.channels.restartDelay*1000).toLong()
            triesUsed += 1

            when {
                triesUsed == 1 -> {
                    logger.warn("Channel '${channel.name}' was shut down. Restarting it in ${delay/1000}sec [$triesUsed/${Filesystem.preferences.channels.restartTries}]")

                    Thread.sleep(delay)
                    ChannelHandler.restartTries[channel.id] = triesUsed
                    ChannelHandler.startChannel(channel.id)
                }
                triesUsed > Filesystem.preferences.channels.restartTries -> {
                    logger.error("Could not restart channel '${channel.name}' after ${triesUsed-1} tries.")
                    ChannelHandler.restartTries.remove(channel.id)
                }
                else -> {
                    // Execute with delay
                    logger.warn("Trying to restart channel '${channel.id}' in ${delay/1000}sec [$triesUsed/${Filesystem.preferences.channels.restartTries}]")

                    Thread.sleep(delay)
                    ChannelHandler.restartTries[channel.id] = triesUsed
                    ChannelHandler.startChannel(channel.id)
                }
            }
        } else {
            logger.info("Channel '${channel.name}' shut down.")
        }

        logger.info("Shut down: ${ChannelHandler.getChannel(channel.id)!!.isRunning}")
    }

}