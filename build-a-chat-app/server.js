import http from 'http';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';

const PORT = 3001;

const server = http.createServer((req, res) => {
  const files = {
    "/": { path: "./public/index.html", contentType: "text/html" },
    "/index.html": { path: "./public/index.html", contentType: "text/html" },
    "/script.js": {
      path: "./public/script.js",
      contentType: "text/javascript",
    },
  };
  const file = files[req.url];

  if (!file) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
    return;
  }

  fs.readFile(file.path, (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Server error");
      return;
    }
    res.writeHead(200, {
      'Content-Type': file.contentType
    })
    res.end(data)
  })
});

const wss = new WebSocketServer({server});

wss.on('connection', (socket, req) => {
  console.log('Connected');

  const username = new URL(req.url, 'http://localhost').searchParams.get('username');
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(
        { "type": "system", "text": `${username} joined` }

      )
      );
    }
  })

  socket.on('message', (message) => {
    let data;
    try {
      data = JSON.parse(message.toString());
    } catch {
      return; // ignore malformed frames instead of crashing the process
    }
    const username = typeof data?.username === 'string' ? data.username : 'Anonymous';
    const text = typeof data?.text === 'string' ? data.text : '';
    if (!text) return;
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(

          { "type": "chat", username, text}
        )
        );
      }
    })
  });

  socket.on('close', () => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(

          { "type": "system", "text": `${username} left`}
        )
        );
      }
    })
  })
})

server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
})