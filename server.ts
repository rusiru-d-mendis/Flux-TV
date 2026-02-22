import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // Proxy endpoint to fetch M3U files and avoid CORS
  app.get("/api/proxy-m3u", async (req, res) => {
    const url = req.query.url as string;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      const content = await response.text();
      res.send(content);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Proxy endpoint for stream manifests to bypass CORS and Mixed Content
  app.get("/api/proxy-manifest", async (req, res) => {
    const url = req.query.url as string;
    if (!url) return res.status(400).send("URL required");
    
    try {
      const fetchOptions: RequestInit = {
        headers: {
          'User-Agent': 'VLC/3.0.20',
          'Accept': '*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Connection': 'keep-alive',
        },
        redirect: 'follow'
      };

      // Pass through Range header if present
      if (req.headers.range) {
        (fetchOptions.headers as any)['Range'] = req.headers.range;
      }

      // Some providers require Referer to be the origin of the stream
      try {
        const urlObj = new URL(url);
        (fetchOptions.headers as any)['Referer'] = urlObj.origin + '/';
        (fetchOptions.headers as any)['Origin'] = urlObj.origin;
      } catch (e) {}

      const response = await fetch(url, fetchOptions);
      
      // If the response was redirected, we might need the final URL for relative path resolution
      const finalUrl = response.url || url;
      
      if (!response.ok && response.status !== 206) {
        return res.status(response.status).send(`Target returned ${response.status}`);
      }

      const contentType = response.headers.get("Content-Type") || "";
      
      // Pass through important headers
      if (response.headers.get("Content-Range")) res.set("Content-Range", response.headers.get("Content-Range")!);
      if (response.headers.get("Accept-Ranges")) res.set("Accept-Ranges", response.headers.get("Accept-Ranges")!);
      if (response.headers.get("Content-Length")) res.set("Content-Length", response.headers.get("Content-Length")!);
      
      // If it's an M3U8 manifest, we need to rewrite URLs
      const isManifest = contentType.includes("mpegurl") || 
                         contentType.includes("apple.mpegurl") || 
                         contentType.includes("application/x-mpegURL") ||
                         contentType.includes("text/plain") || // Some providers use text/plain for manifests
                         finalUrl.toLowerCase().includes(".m3u8") || 
                         finalUrl.toLowerCase().includes(".m3u");

      if (isManifest) {
        let text = await response.text();
        
        // Basic validation that it looks like a manifest
        if (!text.trim().startsWith('#EXTM3U')) {
           // Not a manifest, just pipe it
           res.set("Content-Type", contentType);
           res.set("Access-Control-Allow-Origin", "*");
           return res.send(text);
        }

        const parsedUrl = new URL(finalUrl);
        const baseUrl = parsedUrl.origin + parsedUrl.pathname.substring(0, parsedUrl.pathname.lastIndexOf('/') + 1);
        
        const lines = text.split('\n');
        const rewrittenLines = lines.map(line => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) {
            if (trimmed.includes('URI="')) {
              return trimmed.replace(/URI="([^"]+)"/g, (match, p1) => {
                let absoluteAttrUrl = p1;
                if (!p1.startsWith('http')) {
                  absoluteAttrUrl = p1.startsWith('/') ? parsedUrl.origin + p1 : baseUrl + p1;
                }
                return `URI="/api/proxy-manifest?url=${encodeURIComponent(absoluteAttrUrl)}"`;
              });
            }
            return line;
          }
          
          let absoluteUrl = trimmed;
          if (!trimmed.startsWith('http')) {
            absoluteUrl = trimmed.startsWith('/') ? parsedUrl.origin + trimmed : baseUrl + trimmed;
          }
          
          return `/api/proxy-manifest?url=${encodeURIComponent(absoluteUrl)}`;
        });
        
        res.set("Content-Type", "application/vnd.apple.mpegurl");
        res.set("Access-Control-Allow-Origin", "*");
        return res.send(rewrittenLines.join('\n'));
      }

      // For segments or other binary data
      res.set("Content-Type", contentType);
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Cache-Control", "public, max-age=3600");
      
      if (response.body) {
        // Use the native response body for streaming if possible
        const reader = response.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
        res.end();
      } else {
        const buffer = await response.arrayBuffer();
        res.send(Buffer.from(buffer));
      }
    } catch (error: any) {
      console.error("Proxy Error:", error.message);
      if (!res.headersSent) {
        res.status(500).send(error.message);
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve("dist", "index.html"));
    });
  }

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
