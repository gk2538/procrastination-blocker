// ==UserScript==
// @name         Procrastination Blocker
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Block distracting sites, show how each one exploits your brain, with 5/15/60 minute bypass options
// @author       You
// @match        *://*.youtube.com/*
// @match        *://*.youtube.co.uk/*
// @match        *://*.chess.com/*
// @match        *://*.x.com/*
// @match        *://*.twitter.com/*
// @match        *://*.reddit.com/*
// @match        *://*.instagram.com/*
// @match        *://*.facebook.com/*
// @match        *://*.fb.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    const SITES = {
        'youtube.com':   'YouTube',
        'youtube.co.uk': 'YouTube',
        'chess.com':     'Chess.com',
        'x.com':         'Twitter/X',
        'twitter.com':   'Twitter/X',
        'reddit.com':    'Reddit',
        'instagram.com': 'Instagram',
        'facebook.com':  'Facebook',
        'fb.com':        'Facebook'
    };

    // [emoji, title, description]
    const EXPLOITS = {
        'YouTube': [
            ['🎲', 'Variable Reward Schedule', "You don't know if the next video is amazing → compulsive watching"],
            ['♾️', 'Infinite Scroll + Autoplay', 'No natural stopping point → hours disappear'],
            ['🎯', 'Algorithmic Personalization', 'AI learns exactly what hooks YOU'],
            ['✨', 'Novelty Bias', 'Always new content → brain rewards switching'],
            ['📚', 'Legitimacy Cloak', 'Feels educational → guilt-free time wasting'],
            ['👥', 'Parasocial Connection', 'Creators feel like friends → emotional escape']
        ],
        'Chess.com': [
            ['📊', 'Instant Competitive Feedback', 'Rating changes immediately → dopamine hit'],
            ['📉', 'Loss Aversion', 'Rating went down → "must play again to recover"'],
            ['🧠', 'Skill Illusion', 'Feels productive (chess = smart) → masks time waste'],
            ['⚡', 'Zero Friction', 'Opponent always available → zero startup time'],
            ['⏰', 'Time Perception Collapse', '3 hours feels like 30 minutes'],
            ['🎖️', 'Identity Attachment', 'Becomes part of your identity → constant engagement']
        ],
        'Twitter/X': [
            ['🎲', 'Variable Reward Schedule', 'Never know if the next post is viral'],
            ['❤️', 'Social Validation Seeking', 'Likes/retweets = addiction to metrics'],
            ['🔥', 'Outrage Loop', 'Divisive content triggers emotions'],
            ['⚠️', 'FOMO', 'Breaking news might happen → constant checking'],
            ['⚔️', 'Debate Addiction', 'Arguing feels productive → actually a massive time sink'],
            ['📱', 'Infinite Novelty', 'Thousands of posts per minute']
        ],
        'Facebook': [
            ['♾️', 'Infinite Scroll', 'The feed never ends → no cue to stop'],
            ['❤️', 'Social Validation', 'Likes and comments → compulsive metric checking'],
            ['👀', 'FOMO from Friend Updates', "Everyone else's life is happening without you"],
            ['🔔', 'Notification Hijacking', 'Red badges pull you back in again and again'],
            ['👥', 'Parasocial Relationships', 'Following people you barely know feels like connection'],
            ['🎂', 'Obligation Triggers', 'Birthdays, events → "quick check" becomes an hour'],
            ['🎯', 'Personalized Ads', 'Ads target your desires → keeps you browsing and wanting'],
            ['🕳️', 'Group Rabbit Holes', 'One group leads to ten more discussions']
        ],
        'Reddit': [
            ['♾️', 'Infinite Scroll Threads', 'Endless threads and comments → no stopping point'],
            ['👍', 'Upvote/Downvote Gamification', 'Votes feel like a scoreboard for your worth'],
            ['🏅', 'Award System', 'Awards and karma reward you for posting more'],
            ['🕳️', 'Subreddit Rabbit Holes', 'One sub → 10 new ones'],
            ['🎭', 'Anonymity Debate Addiction', 'No face, no consequences → arguments that never end'],
            ['🫂', 'Community Belonging Pressure', 'Fitting in with the hive keeps you checking in'],
            ['🎲', 'Variable Reward', 'Trending posts → never know what you will find'],
            ['🔀', 'Cross-posting Rabbit Holes', 'The same content keeps leading you somewhere new']
        ],
        'Instagram': [
            ['♾️', 'Infinite Scroll', 'No bottom, no end → time vanishes'],
            ['❤️', 'Like Counter Addiction', 'Every like is a tiny dopamine hit'],
            ['💬', 'Comments & DM Notifications', 'Constant pings pull you back in'],
            ['⏳', 'Stories with 24-hr FOMO', 'Miss it today and it is gone forever'],
            ['🧭', 'Algorithmic Explore Page', 'Endless content tuned precisely to your interests'],
            ['🔁', 'Reels Autoplay Loop', 'Like TikTok: one more reel, then another, then another'],
            ['👤', 'Follower Count = Self-Worth', 'Identity trap: your value becomes a number'],
            ['🖼️', 'Visual Comparison', 'Curated perfection makes you feel behind'],
            ['#️⃣', 'Hashtag Rabbit Holes', 'One tag leads to a thousand more posts']
        ]
    };

    // Bypass choices: edit the labels or minutes here
    const BYPASS_OPTIONS = [
        { label: '5 min',  ms: 5 * 60 * 1000 },
        { label: '15 min', ms: 15 * 60 * 1000 },
        { label: '1 hour', ms: 60 * 60 * 1000 }
    ];

    const host = location.hostname;
    const domain = Object.keys(SITES).find(d => host === d || host.endsWith('.' + d));
    if (!domain) return;

    const siteName = SITES[domain];
    const key = 'bypassEnd_' + siteName;

    // Active bypass: let the page load, re-block when it expires
    const bypassEnd = Number(GM_getValue(key, 0));
    if (bypassEnd > Date.now()) {
        setTimeout(() => location.reload(), bypassEnd - Date.now());
        return;
    }

    const css = `
        :host { all: initial; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .dlg {
            position: fixed; inset: 0; width: 100vw; height: 100vh;
            max-width: none; max-height: none; margin: 0; padding: 0;
            border: 0; background: transparent; overflow: hidden;
        }
        .dlg::backdrop { background: transparent; }
        .wrap {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            overflow: auto;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex; padding: 20px;
        }
        .container {
            background: #fff; border-radius: 16px; margin: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,.3);
            padding: 50px 40px; max-width: 720px; width: 100%; text-align: center;
        }
        .emoji { font-size: 80px; margin-bottom: 20px; }
        h1 { color: #667eea; font-size: 32px; margin-bottom: 15px; }
        h2 { color: #c0392b; font-size: 18px; margin-bottom: 12px; text-align: left; }
        .site-name { color: #764ba2; font-weight: bold; font-size: 20px; margin-bottom: 30px; }
        p { color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 15px; }
        .stats {
            background: #f5f5f5; border-left: 4px solid #667eea;
            padding: 20px; margin: 30px 0; text-align: left; border-radius: 8px;
        }
        .stats p { margin: 8px 0; color: #333; font-weight: 500; }
        .exploits {
            background: #fdf4f4; border-left: 4px solid #e55353;
            padding: 20px; margin: 30px 0; text-align: left; border-radius: 8px;
        }
        .exploits ul { list-style: none; }
        .exploits li { padding: 8px 0; font-size: 15px; line-height: 1.5; color: #444; }
        .exploits li strong { color: #222; }
        .button-group {
            display: flex; gap: 12px; margin-top: 30px;
            flex-wrap: wrap; justify-content: center;
        }
        .bypass-label { font-size: 14px; color: #999; margin: 28px 0 0; }
        .bypass-group { margin-top: 12px; }
        button {
            padding: 12px 30px; font-size: 16px; border: none; border-radius: 8px;
            cursor: pointer; font-weight: 600; transition: all .3s ease;
        }
        .btn-primary { background: #667eea; color: #fff; }
        .btn-primary:hover { background: #5568d3; transform: translateY(-2px); }
        .btn-secondary {
            background: #f5f5f5; color: #667eea; border: 2px solid #667eea;
            padding: 10px 22px; font-size: 15px;
        }
        .btn-secondary:hover { background: #667eea; color: #fff; }
    `;

    function el(tag, props = {}, ...children) {
        const node = document.createElement(tag);
        Object.assign(node, props);
        children.forEach(c => node.append(c));
        return node;
    }

    function buildOverlay() {
        const workBtn = el('button', { className: 'btn-primary', textContent: '📚 Start Focused Work' });
        workBtn.addEventListener('click', () => { location.href = 'https://www.google.com'; });

        // One button per bypass option
        const bypassBtns = BYPASS_OPTIONS.map(opt => {
            const b = el('button', { className: 'btn-secondary', textContent: '⏱️ ' + opt.label });
            b.addEventListener('click', () => {
                GM_setValue(key, Date.now() + opt.ms);
                location.reload();
            });
            return b;
        });

        const exploitItems = (EXPLOITS[siteName] || []).map(([icon, title, desc]) =>
            el('li', {}, icon + ' ', el('strong', { textContent: title }), ' — ' + desc)
        );

        const wrap = el('div', { className: 'wrap' },
            el('div', { className: 'container' },
                el('div', { className: 'emoji', textContent: '🚫' }),
                el('h1', { textContent: 'BLOCKED' }),
                el('div', { className: 'site-name', textContent: siteName + ' - Procrastination Trap' }),
                el('p', { textContent: "This site is designed to exploit your brain's weaknesses." }),
                el('div', { className: 'exploits' },
                    el('h2', { textContent: siteName + ' Exploits:' }),
                    el('ul', {}, ...exploitItems)
                ),
                el('div', { className: 'stats' },
                    el('p', { textContent: '⏰ Average time wasted per session: 2-3 hours' }),
                    el('p', { textContent: '🧠 Cognitive cost: Unable to focus on analytical work' }),
                    el('p', { textContent: '📉 Productivity impact: Severe' })
                ),
                el('p', {}, el('strong', { textContent: 'You have analytical work to do.' })),
                el('p', { textContent: "Come back to this site AFTER you've completed your focused work session." }),
                el('div', { className: 'button-group' }, workBtn),
                el('p', { className: 'bypass-label', textContent: 'Need just a quick look? Pick the shortest time you can.' }),
                el('div', { className: 'button-group bypass-group' }, ...bypassBtns)
            )
        );

        const hostEl = document.createElement('div');
        hostEl.id = 'procrastination-blocker-host';
        hostEl.setAttribute('style', 'all:initial!important;position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:100vh!important;z-index:2147483647!important;display:block!important');

        const shadow = hostEl.attachShadow({ mode: 'open' });

        // Try constructable stylesheet, fall back to a <style> tag
        let styled = false;
        try {
            const sheet = new CSSStyleSheet();
            sheet.replaceSync(css);
            shadow.adoptedStyleSheets = [sheet];
            styled = true;
        } catch (e) {
            console.warn('[Blocker] adoptedStyleSheets failed, using <style>', e);
        }
        if (!styled) shadow.append(el('style', { textContent: css }));

        // Dialog goes in the browser's top layer, above everything on the page
        const dlg = document.createElement('dialog');
        dlg.className = 'dlg';
        dlg.addEventListener('cancel', e => e.preventDefault()); // Esc can't close it
        dlg.append(wrap);
        shadow.append(dlg);

        return hostEl;
    }

    let hostEl = null;

    function mount() {
        const root = document.documentElement;
        if (!root) return false;

        if (!hostEl) hostEl = buildOverlay();
        if (!root.contains(hostEl)) root.append(hostEl);

        const dlg = hostEl.shadowRoot.querySelector('dialog');
        if (dlg && !dlg.open) {
            try { dlg.showModal(); } catch (e) { console.warn('[Blocker] showModal failed', e); }
        }

        document.title = 'BLOCKED - Focus on Your Work';
        document.querySelectorAll('video, audio').forEach(m => {
            try { m.pause(); m.muted = true; } catch (e) {}
        });
        return true;
    }

    // Mount as soon as <html> exists, then keep it mounted
    (function waitForRoot() {
        if (mount()) {
            console.log('[Blocker] overlay mounted for', siteName);
            new MutationObserver(() => {
                if (hostEl && !document.documentElement.contains(hostEl)) mount();
            }).observe(document, { childList: true, subtree: true });
            setInterval(mount, 1000);
        } else {
            requestAnimationFrame(waitForRoot);
        }
    })();
})();
