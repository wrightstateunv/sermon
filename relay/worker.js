// Cloudflare Worker — WebSocket relay for sermon presentation control
// Connects iPad (remote) and Laptop (display) via WebSocket
// Uses Durable Objects for stateful connection management

export { SermonRelay };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin":  "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    // Route all WebSocket connections to the Durable Object
    if (url.pathname === "/relay") {
      const id     = env.RELAY.idFromName("sermon-2026");
      const relay  = env.RELAY.get(id);
      return relay.fetch(request);
    }

    // Health check endpoint
    if (url.pathname === "/status") {
      return new Response(JSON.stringify({ 
        status: "running",
        service: "sermon-relay",
        timestamp: new Date().toISOString()
      }), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" 
        }
      });
    }

    return new Response("Sermon Relay — WebSocket Server", { status: 200 });
  }
};

// Durable Object — holds all connected WebSocket clients
class SermonRelay {
  constructor(state) {
    this.state   = state;
    this.clients = new Set();
  }

  async fetch(request) {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket", { status: 400 });
    }

    const [client, server] = Object.values(new WebSocketPair());
    server.accept();

    // Register this connection
    this.clients.add(server);
    console.log(`Client connected. Total clients: ${this.clients.size}`);

    server.addEventListener("message", (event) => {
      // Relay message to ALL other connected clients
      // iPad sends → Laptop receives (and vice versa)
      let relayed = 0;
      for (const client of this.clients) {
        if (client !== server && client.readyState === WebSocket.READY_STATE_OPEN) {
          client.send(event.data);
          relayed++;
        }
      }
      console.log(`Relayed message to ${relayed} clients`);
    });

    server.addEventListener("close", () => {
      this.clients.delete(server);
      console.log(`Client disconnected. Total clients: ${this.clients.size}`);
    });

    server.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);
      this.clients.delete(server);
    });

    return new Response(null, { status: 101, webSocket: client });
  }
}
