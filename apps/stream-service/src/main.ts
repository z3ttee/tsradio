import { spawn } from "child_process";
import fs from "fs";
import express from "express";
import ffmpegStatic from "ffmpeg-static";

const app = express();
const port = 3000;

console.log(ffmpegStatic);

function createFFmpegStream(mp3FilePath) {
  // Replace 'your_output_format' with the desired streaming format (e.g., WebM, AAC, etc.).
  const ffmpeg = spawn(`${ffmpegStatic}`, [
    // '-re',                  // Read input at native framerate
    '-i', mp3FilePath,      // Input MP3 file
    '-b:a', "128k",         // Output bitrate
    // '-ac', '2',
    '-ar', '44100',
    '-f', 'mp3',            // Output format
    'pipe:1',               // Pipe output to stdout
  ]);

  return ffmpeg;
}

function readPlaylist(playlist: string): string[] {
    return fs.readdirSync(playlist);
}

const playlist = readPlaylist("./playlist");
let currentStream = null;

console.log(playlist);

app.get('/skip', (req, res) => {
  if (currentStream) {
    // Stop the current FFmpeg stream
    currentStream.kill('SIGINT');
  }

  if (playlist.length > 0) {
    const nextMP3FilePath = playlist.shift();
    currentStream = createFFmpegStream(nextMP3FilePath);

    // Send the new stream to the client
    currentStream.pipe(res);
  } else {
    // Handle the case when there are no more MP3s in the playlist
    res.status(404).send('No more songs in the playlist');
  }
});

app.get('/stream', (req, res) => {
    // Replace 'mp3FilePath' with the actual path to the MP3 file you want to stream.
    const mp3FilePath = './playlist/2_Minuten.mp3';
  
    // Create an FFmpeg stream for the specified MP3 file
    const ffmpegStream = createFFmpegStream(mp3FilePath);
  
    // Set appropriate response headers for audio streaming
    res.setHeader('Content-Type', 'audio/mp3');
    res.setHeader('Transfer-Encoding', 'chunked');
  
    // Pipe the FFmpeg stream to the response object to send the audio to the client
    ffmpegStream.stdout.pipe(res);
  
    // Handle any errors or close events
    ffmpegStream.on('error', (err) => {
      console.error('FFmpeg stream error:', err);
    });
  
    ffmpegStream.on('end', () => {
      console.log('Stream ended.');
    });
  
    res.on('close', () => {
      // Clean up resources when the client closes the connection (optional)
      ffmpegStream.kill('SIGINT'); // Stop the FFmpeg process
    });
  });

app.listen(port, () => {
  console.log(`Web radio server is running on port ${port}`);
});