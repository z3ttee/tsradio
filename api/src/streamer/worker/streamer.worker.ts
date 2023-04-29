
import { Logger } from "@nestjs/common";
import { Channel } from "src/channel/entities/channel.entity";
import workerpool from "workerpool";
import { io, Socket } from "socket.io-client";
import { StreamQueue } from "../entities/stream-queue";
import { createReadStream } from "node:fs";

import fs from "node:fs";
import http from "node:http";

const logger = new Logger("Streamer");

/**
 * Connect to the coordinator
 * @param channel Channel data
 * @param secret Secret to use for authentication
 * @returns Socket instance
 */
function connectToCoordinator(channel: Channel, secret: string): Socket {
    const socket = io(`http://localhost:3001`, {
        transports: [ "websocket" ],
        path: "/coordinator",
        auth: {
            secret: secret
        }
    });

    socket.on("connect", () => {
        logger.log(`Streamer '${channel.name}' successfully connected to coordinator. Waiting for instructions`);
    });

    socket.on("disconnect", (reason, description) => {
        logger.error(`Streamer '${channel.name}' got disconnected by coordinator (${reason}). Shutting down...`);
        throw new Error("Disconnected from coordinator");
    });

    // Listen on failed reconnect attempts.
    socket.on("reconnect_attempt", () => {
        logger.warn(`Streamer '${channel.name}' lost connection to coordinator. Reconnecting...`);
    });

    // Listen on failed reconnect events. This only happens if the maximum
    // amount of retries has been reached
    socket.on("reconnect_failed", () => {
        logger.error(`Streamer '${channel.name}' could not reconnect to coordinator. Shutting down...`);
        throw new Error("Cannot reconnect to coordinator");
    });

    socket.on("error", (error) => {
        logger.error(`Streamer '${channel.name}' catched a unrecoverable socket error: ${error.message}`, error);
        throw new Error("Error on communication to coordinator");
    });

    socket.on("connect_error", (error) => {
        logger.error(`Streamer '${channel.name}' cannot connect to coordinator: ${error.message}`, error);
        throw new Error("Cannot connect to coordinator");
    });

    return socket;
}

function streamFile(file: string) {
    const mountpoint = '/test';
    const username = 'source';
    const password = 'hackme';

    const req = http.request({
        method: 'PUT',
        hostname: "localhost",
        port: 8000,
        path: mountpoint,
        headers: {
            'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
            'Content-Type': 'audio/mpeg',
            'User-Agent': 'Mozilla/5.0',
            'Transfer-Encoding': 'chunked',
        },
    });

    const audioStream = fs.createReadStream(file);

    // let interval;
    // audioStream.on('data', (chunk) => {
    //     interval = setInterval(() => {
    //         req.write(chunk);
    //     }, 1000);
    // });
    
    // audioStream.on('end', () => {
    //     clearInterval(interval);
    //     req.end();
    // });

    // audioStream.pipe(req);

    req.on('response', (res) => {
        console.log(`Icecast server responded with status code ${res.statusCode}`);
    });
    
    req.on('error', (e) => {
        console.error(`Error connecting to Icecast server: ${e}`);
    });
}

async function streamer_bootstrap(env, channel: Channel, secret: string) {
    return new Promise((resolve, reject) => {
        logger.log(`Starting streamer on channel '${channel.name}'`);

        const socket = connectToCoordinator(channel, secret);
        const queue = new StreamQueue(channel);
    

        // Initialize nodeshout
        const icecast = "http://localhost:8000/test";
        const mp3File = queue.getNext();
        console.log(mp3File);

        const stream = createReadStream(mp3File);

        streamFile(mp3File);        
    });
}

workerpool.worker({
    default: streamer_bootstrap
})