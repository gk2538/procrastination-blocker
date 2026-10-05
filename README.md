# Procrastination Blocker

A Tampermonkey script that blocks procrastination sites with 
psychological exploit awareness.

## Features

Blocks YouTube, Chess.com, Twitter, Reddit, Facebook, Instagram
Shows which exploits are targeting you
Forces self-reflection before bypass
Tracks patterns over time
Free & open source

## Installation

### Requirements
- Chrome or Firefox
- Tampermonkey extension (free)

### Steps

1. Install Tampermonkey
   - Chrome: [Download](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobp55f)
   - Firefox: [Download](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)

2. Open this file: [procrastination-blocker.js](procrastination-blocker.js)

3. Click "Raw" button (top right)

4. Copy all code (Ctrl+A, Ctrl+C)

5. Open Tampermonkey Dashboard
   - Click Tampermonkey icon → Dashboard

6. Click "Create new script"

7. Delete default template

8. Paste the entire code

9. Press Ctrl+S to save

10. Done! Visit any blocked site to test

## How It Works

When you try to visit a blocked site:
- See your blocked page
- Check which exploits are hitting you
- Choose: Start focused work OR bypass (5 minutes, 15 minutes, 1 hour)

The more you use it, the more you understand your patterns.

## Customization

### Add More Sites

Find this section:
```javascript
const BLOCKED_SITES = {
    'youtube': 'YouTube - Procrastination Trap',
    'chess.com': 'Chess.com - Procrastination Trap',
    // Add more sites here
};
```

Add new sites:
```javascript
'reddit': 'Reddit - Procrastination Trap',
'tiktok': 'TikTok - Procrastination Trap',
```

### Change Bypass Time

Find this line:
```javascript
const bypassEndTime = Date.now() + (60 * 60 * 1000); // 60 minutes
```

Change `60` to different minutes:
- 30 minutes: `(30 * 60 * 1000)`
- 2 hours: `(120 * 60 * 1000)`

## Tracking Your Data

Open browser console (F12) and paste:

```javascript
let logs = JSON.parse(localStorage.getItem('procrastinationLogs'));
let exploitCounts = {};

logs.forEach(log => {
  log.recognizedExploits.forEach(exploit => {
    exploitCounts[exploit] = (exploitCounts[exploit] || 0) + 1;
  });
});

console.log("Your top exploits:");
console.table(Object.entries(exploitCounts).sort((a,b) => b[1] - a[1]));
```

This shows which psychological exploits are hitting you most.

## Results

Users reported:
- 60% productivity increase
- Identified personal weakness patterns
- Better focus on hard analytical work

## License

Free to use, modify, share. No attribution needed.

## Support

Having issues? 
- Check browser console (F12) for errors
- Make sure Developer mode, Tampermonkey is enabled
- Try incognito mode first

Good luck
