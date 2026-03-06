# Cloudflare Deployment Guide — iPad Remote Control

This guide explains how to deploy your Tree of Life sermon app to Cloudflare, enabling wireless iPad control of the church laptop presentation.

---

## What You Get

**Before:** Open local HTML file, click hotspots manually  
**After:** 
- Church laptop opens URL, displays to projector
- iPad opens URL?remote, controls everything wirelessly
- Draw annotations, navigate panels, all in sync
- Zero installation on church laptop (just Chrome)

---

## Architecture

```
Your iPad (Safari) ──────────┐
                              │
                              ├──→ Cloudflare Worker (WebSocket Relay)
                              │
Church Laptop (Chrome) ──────┘
        │
        └──→ Projector (Full Screen)
```

**Files:**
- `index.html` — Single-file app with dual-mode support
- `enhanced_tree.png` — 4x upscaled tree image
- `relay/worker.js` — WebSocket relay server
- `relay/wrangler.toml` — Worker configuration

---

## Deployment Steps

### Step 1: Deploy the WebSocket Relay

```bash
cd sermon-cloudflare
./deploy-relay.sh
```

This will:
1. Install Wrangler CLI (if needed)
2. Open browser to login to Cloudflare
3. Deploy the relay worker
4. Output your worker URL (e.g., `https://sermon-relay.YOURNAME.workers.dev`)

**Important:** Copy the worker URL from the output!

### Step 2: Update the HTML File

Open `index.html` and find line 1020:

```javascript
const RELAY_URL = "wss://sermon-relay.YOURNAME.workers.dev/relay";
```

Replace `YOURNAME` with your actual Cloudflare subdomain from Step 1.

**Example:**  
If your worker URL is `https://sermon-relay.johndoe.workers.dev`  
Change to: `const RELAY_URL = "wss://sermon-relay.johndoe.workers.dev/relay";`

### Step 3: Deploy the Web App

```bash
./deploy-pages.sh
```

This deploys your app to Cloudflare Pages. The output will show your live URL:
- `https://sermon-app.pages.dev` (or similar)

---

## Testing Locally

Before deploying, test locally:

```bash
# In one terminal - start local server
cd sermon-cloudflare
python3 -m http.server 8000

# Display mode (laptop)
open http://localhost:8000

# Remote mode (iPad simulator in Chrome)
open http://localhost:8000?remote
```

**Note:** WebSocket relay requires actual deployment to test.

---

## Day-of-Sermon Checklist

### Before Leaving Home

- [ ] Deploy latest changes: `./deploy-pages.sh`
- [ ] Verify app loads: Visit your Pages URL in browser
- [ ] Verify relay works: `curl https://sermon-relay.YOURNAME.workers.dev/status`

### At the Church

**Church Laptop:**
1. Open Chrome (or any modern browser)
2. Navigate to: `https://sermon-app.pages.dev`
3. Press F11 for full screen
4. Look for green dot in bottom-right corner (will turn green when iPad connects)

**Your iPad:**
1. Open Safari
2. Navigate to: `https://sermon-app.pages.dev?remote`
3. Confirm status shows "Connected" (green)
4. Test: Tap any navigation button
5. Verify: Panel opens on laptop/projector

**Fallback Mode:**
- If WiFi drops, laptop hotspots still work when tapped directly
- Reconnect iPad to WiFi → relay reconnects automatically
- All content works offline (no external dependencies)

---

## Features

### Display Mode (Church Laptop)

- Full Tree of Life with all 9 interactive hotspots
- Receives navigation commands from iPad
- Shows annotation overlays from iPad drawings
- Small green dot = connected to iPad
- Small gray dot = offline (manual mode)

### Remote Mode (iPad)

**Navigation Panel:**
- 9 buttons for each content section
- "Return to Tree" button
- Instant response on church display

**Annotation Tools:**
- ✏️ Draw — finger/pencil drawing
- 🔤 Text — add text overlays
- 🗑️ Clear — remove all annotations
- 5 colors: Gold, White, Red, Cyan, Green

**Drawing Canvas:**
- Touch-responsive canvas
- Preview on iPad
- Appears in real-time on church display
- Normalized coordinates (works on any screen size)

---

## Security

The app uses a session token to prevent unauthorized control:

```javascript
const SESSION_TOKEN = "grace-church-2026-x7k2m";
```

**To change the token:**
1. Edit `index.html` line 1021
2. Edit `relay/worker.js` validation (optional - validation is in HTML)
3. Redeploy both relay and pages

**Why this matters:**
- Anyone on the same WiFi could theoretically connect
- The token ensures only your devices control the display
- Change it for each event if sharing the URL publicly

---

## Updating the App

After making changes to `index.html`:

```bash
cd sermon-cloudflare
./deploy-pages.sh
```

Changes are live in ~10 seconds. No need to redeploy the relay unless you modified `relay/worker.js`.

---

## Costs

**Free Tier (sufficient for weekly sermons):**
- Cloudflare Pages: Unlimited requests
- Cloudflare Workers: 100,000 requests/day
- Durable Objects: 1,000,000 requests/month

**Your usage:** ~2 connections per sermon = virtually free forever.

---

## Troubleshooting

### "Disconnected" status on iPad

**Check:**
1. Did you replace `YOURNAME` in index.html?
2. Is the relay deployed? Test: `curl https://sermon-relay.YOURNAME.workers.dev/status`
3. Check browser console (Safari → Develop → Show Web Inspector)

### Annotations not appearing on display

**Check:**
1. Both devices connected (green status)?
2. Try clearing and drawing again
3. Check browser console for errors

### Church laptop shows gray dot

This is normal! Gray = offline mode (manual hotspots still work)
- Church laptop can work 100% offline
- Green dot only appears when iPad connects

### Worker deployment fails

**Common issues:**
1. Not logged in: Run `wrangler login` in relay folder
2. Durable Objects not enabled: They're free, check Cloudflare dashboard
3. Name conflict: Change `name` in wrangler.toml

---

## File Structure

```
sermon-cloudflare/
├── index.html              ← Main app (display + remote modes)
├── enhanced_tree.png       ← 4x upscaled tree image  
├── deploy-relay.sh         ← Deploy WebSocket relay
├── deploy-pages.sh         ← Deploy web app
├── CLOUDFLARE-README.md    ← This file
└── relay/
    ├── worker.js           ← WebSocket relay code
    └── wrangler.toml       ← Cloudflare Worker config
```

---

## Advanced: Custom Domain

Want `sermon.yourchurch.com` instead of `.pages.dev`?

1. Cloudflare Dashboard → Pages → sermon-app → Custom Domains
2. Add your domain
3. Update DNS (automatic if domain is on Cloudflare)

Same process for Worker relay if desired.

---

## Support

**Test URLs:**
- Relay status: `https://sermon-relay.YOURNAME.workers.dev/status`
- Display mode: `https://sermon-app.pages.dev`
- Remote mode: `https://sermon-app.pages.dev?remote`

**Logs:**
- Browser console (F12) shows WebSocket connection status
- Cloudflare dashboard shows Worker logs (real-time)

---

## Privacy

- No data is stored or logged (beyond Cloudflare's standard access logs)
- WebSocket messages are relayed in real-time, not persisted
- Annotations exist only in browser memory
- Page refresh clears all annotations

---

## Presentation Tips

1. **Practice beforehand:** Test the iPad → laptop flow at home
2. **Charge devices:** iPad lasts 10+ hours, but charge anyway
3. **WiFi check:** Confirm church WiFi works before service starts
4. **Backup plan:** Laptop hotspots work manually if relay fails
5. **Screen wake:** Disable laptop screen sleep (presentation mode)

---

## Next Steps

1. Run `./deploy-relay.sh`
2. Copy worker URL
3. Edit `index.html` with your URL
4. Run `./deploy-pages.sh`
5. Test both URLs
6. Bookmark both URLs on iPad

**Questions?** Check Cloudflare Workers documentation or sermon app console logs.

🌳 **Your Tree of Life sermon is now cloud-powered and iPad-controllable!**
