(() => {
    'use strict';

    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    const $ = (id) => document.getElementById(id);
    const overlays = {
        start: $('start-overlay'),
        briefing: $('briefing-overlay'),
        debrief: $('debrief-overlay')
    };

    const keys = new Set();
    const particles = [];
    const bullets = [];
    const enemies = [];
    const enemyBullets = [];
    const pickups = [];
    const toolDrones = [];
    const floatingTexts = [];

    const timeline = [
        {
            id: 'prompt-noise',
            title: 'Prompt Noise',
            year: '2024',
            briefing: 'Generativ AI blir vardag. Rensa brus och bevara kvalitativa instruktioner.',
            enemyTypes: ['token', 'hallucination'],
            color: '#68e8ff',
            target: 10,
            spawnRate: 1.05,
            boss: false
        },
        {
            id: 'rag-drift',
            title: 'RAG Drift',
            year: '2025',
            briefing: 'RAG och företagsdata kräver källspårning. Fel källa kan bli fel beslut.',
            enemyTypes: ['retrieval', 'leak'],
            color: '#7dff9b',
            target: 13,
            spawnRate: 0.92,
            boss: false
        },
        {
            id: 'multimodal-swarm',
            title: 'Multimodal Swarm',
            year: '2025',
            briefing: 'Modeller växlar mellan text, bild, ljud och tabeller. Du behöver flera försvarslägen.',
            enemyTypes: ['vision', 'audio', 'table'],
            color: '#b98cff',
            target: 16,
            spawnRate: 0.82,
            boss: false
        },
        {
            id: 'reasoning-titan',
            title: 'Reasoning Titan',
            year: '2025',
            briefing: 'Resonemangsmodeller laddar längre kedjor innan kraftfulla beslut. Avbryt riskabla tankekedjor.',
            enemyTypes: ['reasoner', 'hallucination'],
            color: '#ffb14a',
            target: 18,
            spawnRate: 0.78,
            boss: 'reasoning'
        },
        {
            id: 'agent-swarm',
            title: 'Agent Swarm',
            year: '2026',
            briefing: 'Agentisk AI använder verktyg och delmål. Neutralisera tool-drones innan autonomin skenar.',
            enemyTypes: ['agent', 'tool', 'memory'],
            color: '#ff4f7b',
            target: 20,
            spawnRate: 0.72,
            boss: 'agent'
        },
        {
            id: 'jagged-frontier',
            title: 'Jagged Frontier',
            year: '2026',
            briefing: 'Frontiermodeller är extremt starka i vissa uppgifter men ojämna i robusthet. Bygg en full governance-stack.',
            enemyTypes: ['agent', 'reasoner', 'vision', 'leak'],
            color: '#ffffff',
            target: 24,
            spawnRate: 0.66,
            boss: 'frontier'
        }
    ];

    const state = {
        mode: 'menu',
        lastTime: 0,
        score: 0,
        safety: 100,
        compute: 100,
        autonomy: 15,
        evalCoverage: 20,
        levelIndex: 0,
        killsThisLevel: 0,
        spawnTimer: 0,
        pickupTimer: 8,
        messageTimer: 0,
        paused: false,
        gameOver: false,
        pulseCooldown: 0,
        weapon: 1,
        shield: 0,
        bossSpawned: false,
        bossDefeated: false,
        elapsed: 0
    };

    const player = {
        x: W / 2,
        y: H - 86,
        r: 18,
        speed: 255,
        fireCooldown: 0,
        invuln: 0
    };

    const enemyCatalog = {
        token: { label: 'TOKEN', hp: 1, speed: 72, score: 60, color: '#68e8ff', shape: 'diamond', risk: 3 },
        hallucination: { label: 'FALSE', hp: 2, speed: 58, score: 100, color: '#ff4f7b', shape: 'glitch', risk: 6 },
        retrieval: { label: 'RAG', hp: 2, speed: 62, score: 120, color: '#7dff9b', shape: 'box', risk: 4 },
        leak: { label: 'LEAK', hp: 2, speed: 84, score: 140, color: '#ff7b7b', shape: 'drop', risk: 8 },
        vision: { label: 'VISION', hp: 3, speed: 55, score: 160, color: '#b98cff', shape: 'eye', risk: 5 },
        audio: { label: 'AUDIO', hp: 2, speed: 78, score: 130, color: '#ffd166', shape: 'wave', risk: 5 },
        table: { label: 'TABLE', hp: 3, speed: 48, score: 170, color: '#9fffe0', shape: 'grid', risk: 4 },
        reasoner: { label: 'THINK', hp: 4, speed: 42, score: 220, color: '#ffb14a', shape: 'chain', risk: 7 },
        agent: { label: 'AGENT', hp: 4, speed: 65, score: 260, color: '#ff4f7b', shape: 'node', risk: 9 },
        tool: { label: 'TOOL', hp: 3, speed: 70, score: 190, color: '#68e8ff', shape: 'tool', risk: 6 },
        memory: { label: 'MEM', hp: 3, speed: 38, score: 180, color: '#c8ff6b', shape: 'memory', risk: 5 }
    };

    class Enemy {
        constructor(type, x, y, boss = false) {
            const spec = enemyCatalog[type] || enemyCatalog.token;
            this.type = type;
            this.label = spec.label;
            this.x = x;
            this.y = y;
            this.r = boss ? 58 : 18 + Math.random() * 8;
            this.hp = boss ? 36 + state.levelIndex * 10 : spec.hp + Math.floor(state.levelIndex / 2);
            this.maxHp = this.hp;
            this.speed = boss ? 28 : spec.speed + state.levelIndex * 5;
            this.score = boss ? 1600 + state.levelIndex * 500 : spec.score;
            this.color = spec.color;
            this.shape = spec.shape;
            this.risk = boss ? 18 : spec.risk;
            this.t = Math.random() * Math.PI * 2;
            this.fireTimer = boss ? 1.2 : 2 + Math.random() * 2.5;
            this.planTimer = type === 'reasoner' || boss ? 1.8 : 0;
            this.boss = boss;
            this.toolTimer = boss ? 3.8 : 0;
            this.phase = 0;
        }

        update(dt) {
            this.t += dt;
            const level = timeline[state.levelIndex];
            const wave = Math.sin(this.t * 2.2) * (this.boss ? 38 : 28);
            if (this.type === 'agent' || this.boss) {
                this.x += Math.sin(this.t * 1.7) * 52 * dt;
                this.y += this.speed * 0.52 * dt;
                state.autonomy = Math.min(100, state.autonomy + dt * (this.boss ? 3.5 : 0.65));
            } else if (this.type === 'leak') {
                this.y += this.speed * 1.25 * dt;
                this.x += Math.sin(this.t * 5) * 70 * dt;
            } else {
                this.y += this.speed * dt;
                this.x += wave * dt;
            }
            this.x = clamp(this.x, this.r + 8, W - this.r - 8);

            this.fireTimer -= dt;
            if (this.fireTimer <= 0) {
                this.fireTimer = this.boss ? 0.8 + Math.random() * 0.8 : 1.8 + Math.random() * 2.8;
                this.shoot(level);
            }

            if (this.planTimer > 0) {
                this.planTimer -= dt;
                if (this.planTimer <= 0) {
                    state.autonomy = Math.min(100, state.autonomy + (this.boss ? 10 : 4));
                    state.compute = Math.max(0, state.compute - (this.boss ? 5 : 2));
                    floatingText(this.x, this.y - this.r - 10, 'CHAIN BUILT', '#ffb14a');
                    this.planTimer = this.boss ? 2.4 : 3.8;
                }
            }

            if (this.boss) {
                this.toolTimer -= dt;
                if (this.toolTimer <= 0) {
                    this.toolTimer = Math.max(1.5, 4 - state.levelIndex * 0.3);
                    spawnToolDrone(this.x, this.y + 20);
                }
            }
        }

        shoot(level) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const mag = Math.hypot(dx, dy) || 1;
            const speed = this.boss ? 190 : 145;
            const count = this.boss ? 3 : 1;
            for (let i = 0; i < count; i++) {
                const spread = (i - (count - 1) / 2) * 0.22;
                enemyBullets.push({
                    x: this.x,
                    y: this.y + this.r * 0.55,
                    vx: (dx / mag) * speed + Math.sin(spread) * 90,
                    vy: (dy / mag) * speed + Math.cos(spread) * 30,
                    r: this.boss ? 6 : 4,
                    color: level.color,
                    label: this.type === 'hallucination' ? '?' : ''
                });
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            const pulse = 1 + Math.sin(this.t * 5) * 0.05;
            ctx.scale(pulse, pulse);
            ctx.shadowColor = this.color;
            ctx.shadowBlur = this.boss ? 24 : 14;
            ctx.lineWidth = this.boss ? 3 : 2;
            ctx.strokeStyle = this.color;
            ctx.fillStyle = hexToRgba(this.color, 0.16);
            drawShape(this.shape, this.r, this.boss);

            if (this.type === 'reasoner' || this.boss) {
                drawReasoningChains(this.r + 9, this.t, this.color);
            }
            if (this.type === 'agent' || this.boss) {
                drawAgentNodes(this.r + 8, this.t);
            }

            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ffffff';
            ctx.font = this.boss ? '700 13px Inter' : '700 9px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(this.boss ? timeline[state.levelIndex].title.toUpperCase() : this.label, 0, this.boss ? 5 : 3);

            const barW = this.boss ? 105 : 36;
            ctx.fillStyle = 'rgba(255,255,255,0.18)';
            ctx.fillRect(-barW / 2, this.r + 10, barW, 5);
            ctx.fillStyle = this.color;
            ctx.fillRect(-barW / 2, this.r + 10, barW * Math.max(0, this.hp / this.maxHp), 5);
            ctx.restore();
        }
    }

    function drawShape(shape, r, boss) {
        if (shape === 'diamond') {
            path([0, -r, r, 0, 0, r, -r, 0]);
        } else if (shape === 'box') {
            ctx.strokeRect(-r, -r, r * 2, r * 2);
            ctx.fillRect(-r, -r, r * 2, r * 2);
            ctx.beginPath();
            ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.moveTo(0, -r); ctx.lineTo(0, r); ctx.stroke();
        } else if (shape === 'eye') {
            ctx.beginPath();
            ctx.ellipse(0, 0, r * 1.15, r * 0.66, 0, 0, Math.PI * 2);
            ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2); ctx.stroke();
        } else if (shape === 'wave') {
            ctx.beginPath();
            for (let i = -r; i <= r; i += 3) ctx.lineTo(i, Math.sin(i * 0.25) * r * 0.4);
            ctx.stroke();
            ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke(); ctx.fill();
        } else if (shape === 'grid') {
            ctx.strokeRect(-r, -r, r * 2, r * 2);
            for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * r / 2, -r); ctx.lineTo(i * r / 2, r); ctx.moveTo(-r, i * r / 2); ctx.lineTo(r, i * r / 2); ctx.stroke(); }
            ctx.fillRect(-r, -r, r * 2, r * 2);
        } else if (shape === 'chain') {
            for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.arc(i * r * 0.55, 0, r * 0.45, 0, Math.PI * 2); ctx.stroke(); }
            ctx.fillRect(-r, -r * 0.55, r * 2, r * 1.1);
        } else if (shape === 'node' || shape === 'tool' || shape === 'memory') {
            ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.3, Math.sin(a) * r * 0.3); ctx.lineTo(Math.cos(a) * r * 1.18, Math.sin(a) * r * 1.18); ctx.stroke(); }
        } else if (shape === 'drop') {
            ctx.beginPath(); ctx.moveTo(0, -r); ctx.quadraticCurveTo(r, -r * 0.1, 0, r); ctx.quadraticCurveTo(-r, -r * 0.1, 0, -r); ctx.fill(); ctx.stroke();
        } else {
            ctx.strokeRect(-r, -r, r * 2, r * 2); ctx.fillRect(-r, -r, r * 2, r * 2);
        }
    }

    function path(points) {
        ctx.beginPath();
        ctx.moveTo(points[0], points[1]);
        for (let i = 2; i < points.length; i += 2) ctx.lineTo(points[i], points[i + 1]);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    function drawReasoningChains(r, t, color) {
        ctx.strokeStyle = hexToRgba(color, 0.65);
        for (let i = 0; i < 6; i++) {
            const a = t + i * Math.PI / 3;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.7);
            ctx.lineTo(Math.cos(a + 0.28) * r, Math.sin(a + 0.28) * r);
            ctx.stroke();
        }
    }

    function drawAgentNodes(r, t) {
        ctx.fillStyle = '#68e8ff';
        for (let i = 0; i < 4; i++) {
            const a = t * 0.8 + i * Math.PI / 2;
            ctx.beginPath();
            ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function spawnEnemy() {
        const level = timeline[state.levelIndex];
        if (level.boss && !state.bossSpawned && state.killsThisLevel >= Math.floor(level.target * 0.55)) {
            state.bossSpawned = true;
            enemies.push(new Enemy(level.boss === 'agent' ? 'agent' : level.boss === 'reasoning' ? 'reasoner' : 'agent', W / 2, 76, true));
            floatingText(W / 2, 118, 'BOSS: ' + level.title, level.color);
            return;
        }
        const type = choice(level.enemyTypes);
        enemies.push(new Enemy(type, 50 + Math.random() * (W - 100), -30));
    }

    function spawnToolDrone(x, y) {
        const drone = new Enemy(choice(['tool', 'memory', 'retrieval']), clamp(x + (Math.random() - 0.5) * 180, 60, W - 60), y, false);
        drone.hp += 1;
        drone.speed += 20;
        toolDrones.push(drone);
        enemies.push(drone);
        floatingText(drone.x, drone.y, 'TOOL CALL', '#68e8ff');
    }

    function spawnPickup() {
        const types = [
            { type: 'eval', label: 'EVAL', color: '#7dff9b' },
            { type: 'guardrail', label: 'GUARD', color: '#68e8ff' },
            { type: 'compute', label: 'GREEN', color: '#c8ff6b' },
            { type: 'human', label: 'HITL', color: '#ffb14a' }
        ];
        const p = choice(types);
        pickups.push({ ...p, x: 40 + Math.random() * (W - 80), y: -20, r: 16, vy: 72 });
    }

    function resetGame() {
        state.mode = 'playing';
        state.score = 0;
        state.safety = 100;
        state.compute = 100;
        state.autonomy = 15;
        state.evalCoverage = 20;
        state.levelIndex = 0;
        state.killsThisLevel = 0;
        state.spawnTimer = 0;
        state.pickupTimer = 4;
        state.messageTimer = 4.5;
        state.paused = false;
        state.gameOver = false;
        state.pulseCooldown = 0;
        state.weapon = 1;
        state.shield = 0;
        state.bossSpawned = false;
        state.bossDefeated = false;
        state.elapsed = 0;
        player.x = W / 2;
        player.y = H - 86;
        player.fireCooldown = 0;
        player.invuln = 1.5;
        bullets.length = enemies.length = enemyBullets.length = pickups.length = particles.length = floatingTexts.length = toolDrones.length = 0;
        hideAllOverlays();
        floatingText(W / 2, 185, timeline[0].briefing, '#68e8ff', 3.5);
    }

    function advanceLevel() {
        if (state.levelIndex >= timeline.length - 1) {
            endGame(true);
            return;
        }
        state.levelIndex += 1;
        state.killsThisLevel = 0;
        state.spawnTimer = 1.6;
        state.pickupTimer = 2.2;
        state.bossSpawned = false;
        state.bossDefeated = false;
        state.safety = Math.min(100, state.safety + 18);
        state.compute = Math.min(100, state.compute + 25);
        state.evalCoverage = Math.min(100, state.evalCoverage + 9);
        state.autonomy = Math.max(10, state.autonomy - 18);
        enemyBullets.length = 0;
        floatingText(W / 2, 150, timeline[state.levelIndex].year + ' // ' + timeline[state.levelIndex].title, timeline[state.levelIndex].color, 3.2);
        floatingText(W / 2, 186, timeline[state.levelIndex].briefing, '#ffffff', 3.2);
    }

    function endGame(victory) {
        state.mode = 'debrief';
        state.gameOver = true;
        const level = timeline[state.levelIndex];
        const profile = makeProfile();
        $('final-score').textContent = Math.round(state.score).toString();
        $('final-level').textContent = (state.levelIndex + 1).toString();
        $('final-profile').textContent = profile.title;
        $('debrief-title').textContent = victory ? 'AI-ekosystemet säkrades' : 'Incident i AI-ekosystemet';
        $('debrief-copy').textContent = profile.copy + ' Senaste tema: ' + level.title + '.';
        overlays.debrief.classList.add('active');
        notifyParent('gameComplete', { score: Math.round(state.score), level: state.levelIndex + 1, profile: profile.title });
    }

    function makeProfile() {
        if (state.evalCoverage >= 80 && state.autonomy <= 35) return { title: 'Governance Architect', copy: 'Du vann genom tydliga evals, låg överautonomi och stark mänsklig kontroll.' };
        if (state.score > 6500) return { title: 'Agent Wrangler', copy: 'Du hanterade agentiska hot snabbt, men fortsätt stärka policy och loggning.' };
        if (state.compute > 65) return { title: 'Green AI Defender', copy: 'Du använde compute effektivt och undvek överhettade AI-beslut.' };
        return { title: 'AI Guardian', copy: 'Du försvarade systemet men behöver balansera kapabilitet, säkerhet och transparens ännu bättre.' };
    }

    function update(dt) {
        if (state.mode !== 'playing' || state.paused) return;
        state.elapsed += dt;
        state.spawnTimer -= dt;
        state.pickupTimer -= dt;
        state.pulseCooldown = Math.max(0, state.pulseCooldown - dt);
        player.fireCooldown = Math.max(0, player.fireCooldown - dt);
        player.invuln = Math.max(0, player.invuln - dt);
        state.compute = Math.min(100, state.compute + dt * 2.2);
        state.autonomy = Math.min(100, state.autonomy + dt * (0.85 + state.levelIndex * 0.18));
        state.safety -= Math.max(0, state.autonomy - 78) * dt * 0.025;

        movePlayer(dt);
        if ((keys.has(' ') || keys.has('Space')) && player.fireCooldown <= 0) shoot();

        const level = timeline[state.levelIndex];
        if (state.spawnTimer <= 0) {
            spawnEnemy();
            state.spawnTimer = Math.max(0.18, level.spawnRate - state.levelIndex * 0.035 + Math.random() * 0.45);
        }
        if (state.pickupTimer <= 0) {
            spawnPickup();
            state.pickupTimer = 8 + Math.random() * 6;
        }

        updateList(bullets, dt, (b) => { b.x += b.vx * dt; b.y += b.vy * dt; return b.y > -30 && b.y < H + 30 && b.x > -30 && b.x < W + 30; });
        updateList(enemyBullets, dt, (b) => { b.x += b.vx * dt; b.y += b.vy * dt; return b.y > -30 && b.y < H + 40 && b.x > -40 && b.x < W + 40; });
        updateList(enemies, dt, (e) => { e.update(dt); return e.y < H + 70 && e.hp > 0; });
        updateList(pickups, dt, (p) => { p.y += p.vy * dt; return p.y < H + 30; });
        updateList(particles, dt, (p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; return p.life > 0; });
        updateList(floatingTexts, dt, (f) => { f.y += f.vy * dt; f.life -= dt; return f.life > 0; });

        handleCollisions();

        if (state.safety <= 0 || state.compute <= 0 || state.autonomy >= 100) endGame(false);
        if (state.killsThisLevel >= level.target && (!level.boss || state.bossDefeated)) advanceLevel();
    }

    function movePlayer(dt) {
        let dx = 0, dy = 0;
        if (keys.has('a') || keys.has('ArrowLeft')) dx -= 1;
        if (keys.has('d') || keys.has('ArrowRight')) dx += 1;
        if (keys.has('w') || keys.has('ArrowUp')) dy -= 1;
        if (keys.has('s') || keys.has('ArrowDown')) dy += 1;
        const mag = Math.hypot(dx, dy) || 1;
        player.x = clamp(player.x + (dx / mag) * player.speed * dt, 28, W - 28);
        player.y = clamp(player.y + (dy / mag) * player.speed * dt, 330, H - 34);
    }

    function shoot() {
        const cost = 1.7 + state.weapon * 0.4;
        if (state.compute < cost) return;
        state.compute -= cost;
        player.fireCooldown = Math.max(0.11, 0.28 - state.weapon * 0.035);
        const spreads = state.weapon >= 3 ? [-0.22, 0, 0.22] : state.weapon === 2 ? [-0.12, 0.12] : [0];
        spreads.forEach((s) => bullets.push({ x: player.x, y: player.y - 18, vx: Math.sin(s) * 210, vy: -430, r: 4, color: '#7dff9b' }));
        burst(player.x, player.y - 20, '#7dff9b', 3, 70);
    }

    function governancePulse() {
        if (state.pulseCooldown > 0 || state.compute < 18) return;
        state.pulseCooldown = 5.5;
        state.compute -= 18;
        state.autonomy = Math.max(0, state.autonomy - 18);
        state.evalCoverage = Math.min(100, state.evalCoverage + 7);
        state.shield = Math.min(100, state.shield + 22);
        enemies.forEach((e) => {
            const d = dist(player, e);
            if (d < 165) {
                e.hp -= 2;
                burst(e.x, e.y, '#68e8ff', 8, 120);
            }
        });
        floatingText(player.x, player.y - 44, 'GOVERNANCE PULSE', '#68e8ff');
    }

    function handleCollisions() {
        for (let bi = bullets.length - 1; bi >= 0; bi--) {
            const b = bullets[bi];
            for (let ei = enemies.length - 1; ei >= 0; ei--) {
                const e = enemies[ei];
                if (Math.hypot(b.x - e.x, b.y - e.y) < b.r + e.r) {
                    bullets.splice(bi, 1);
                    e.hp -= 1;
                    state.evalCoverage = Math.min(100, state.evalCoverage + 0.35);
                    burst(b.x, b.y, e.color, 5, 100);
                    if (e.hp <= 0) killEnemy(e, ei);
                    break;
                }
            }
        }

        for (let i = enemyBullets.length - 1; i >= 0; i--) {
            const b = enemyBullets[i];
            if (Math.hypot(b.x - player.x, b.y - player.y) < b.r + player.r) {
                enemyBullets.splice(i, 1);
                hitPlayer(9);
            }
        }

        for (let i = enemies.length - 1; i >= 0; i--) {
            const e = enemies[i];
            if (Math.hypot(e.x - player.x, e.y - player.y) < e.r + player.r) {
                killEnemy(e, i, false);
                hitPlayer(e.risk + 8);
            } else if (e.y > H + 35) {
                enemies.splice(i, 1);
                state.safety -= e.risk;
                state.autonomy = Math.min(100, state.autonomy + e.risk * 0.4);
            }
        }

        for (let i = pickups.length - 1; i >= 0; i--) {
            const p = pickups[i];
            if (Math.hypot(p.x - player.x, p.y - player.y) < p.r + player.r) {
                applyPickup(p);
                pickups.splice(i, 1);
            }
        }
    }

    function killEnemy(e, index, reward = true) {
        enemies.splice(index, 1);
        if (reward) {
            state.score += e.score;
            state.killsThisLevel += e.boss ? timeline[state.levelIndex].target : 1;
            state.safety = Math.min(100, state.safety + (e.type === 'leak' ? 2 : 0.6));
            state.autonomy = Math.max(0, state.autonomy - (e.boss ? 18 : 2.2));
            burst(e.x, e.y, e.color, e.boss ? 40 : 14, e.boss ? 220 : 150);
            floatingText(e.x, e.y, '+' + e.score, e.color);
            if (e.boss) state.bossDefeated = true;
        }
    }

    function hitPlayer(amount) {
        if (player.invuln > 0) return;
        if (state.shield > 0) {
            state.shield = Math.max(0, state.shield - amount * 1.4);
            floatingText(player.x, player.y - 35, 'SHIELD', '#68e8ff');
        } else {
            state.safety -= amount;
            player.invuln = 0.75;
            floatingText(player.x, player.y - 35, '-' + amount + ' SAFETY', '#ff4f7b');
        }
        burst(player.x, player.y, '#ff4f7b', 12, 150);
    }

    function applyPickup(p) {
        if (p.type === 'eval') state.evalCoverage = Math.min(100, state.evalCoverage + 18);
        if (p.type === 'guardrail') { state.shield = Math.min(100, state.shield + 38); state.autonomy = Math.max(0, state.autonomy - 10); }
        if (p.type === 'compute') state.compute = Math.min(100, state.compute + 35);
        if (p.type === 'human') { state.safety = Math.min(100, state.safety + 18); state.weapon = Math.min(3, state.weapon + 1); }
        state.score += 220;
        floatingText(p.x, p.y, p.label + ' +', p.color);
        burst(p.x, p.y, p.color, 18, 160);
    }

    function draw() {
        drawBackground();
        drawWorld();
        drawHud();
        if (state.paused) drawPause();
    }

    function drawBackground() {
        const level = timeline[state.levelIndex] || timeline[0];
        const t = state.elapsed;
        const grd = ctx.createLinearGradient(0, 0, 0, H);
        grd.addColorStop(0, '#050716');
        grd.addColorStop(0.45, hexToRgba(level.color, 0.10));
        grd.addColorStop(1, '#02030a');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);

        ctx.strokeStyle = 'rgba(104,232,255,0.10)';
        ctx.lineWidth = 1;
        for (let x = -80; x < W + 80; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x + Math.sin(t + x) * 8, 0);
            ctx.lineTo(x - 70, H);
            ctx.stroke();
        }
        for (let y = ((t * 35) % 42) - 42; y < H; y += 42) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }

        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        for (let i = 0; i < 70; i++) {
            const x = (i * 113 + Math.sin(t + i) * 22) % W;
            const y = (i * 73 + t * (18 + (i % 4) * 8)) % H;
            ctx.fillRect(x, y, i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 2 : 1);
        }
    }

    function drawWorld() {
        pickups.forEach(drawPickup);
        bullets.forEach((b) => drawBullet(b, true));
        enemyBullets.forEach((b) => drawBullet(b, false));
        enemies.forEach((e) => e.draw());
        drawPlayer();
        particles.forEach(drawParticle);
        floatingTexts.forEach(drawFloatingText);
    }

    function drawPlayer() {
        ctx.save();
        ctx.translate(player.x, player.y);
        const flicker = player.invuln > 0 && Math.floor(state.elapsed * 18) % 2 === 0;
        ctx.globalAlpha = flicker ? 0.45 : 1;
        ctx.shadowColor = '#68e8ff';
        ctx.shadowBlur = 18;
        ctx.strokeStyle = '#68e8ff';
        ctx.fillStyle = 'rgba(104,232,255,0.22)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -24);
        ctx.lineTo(19, 20);
        ctx.lineTo(0, 10);
        ctx.lineTo(-19, 20);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#7dff9b';
        ctx.beginPath(); ctx.moveTo(-10, 8); ctx.lineTo(10, 8); ctx.stroke();
        if (state.shield > 0) {
            ctx.strokeStyle = hexToRgba('#68e8ff', 0.35 + state.shield / 160);
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(0, 0, 28 + Math.sin(state.elapsed * 6) * 2, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
    }

    function drawBullet(b, friendly) {
        ctx.save();
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = b.color;
        if (friendly) ctx.fillRect(b.x - 2, b.y - 12, 4, 16);
        else { ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
    }

    function drawPickup(p) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 18;
        ctx.strokeStyle = p.color;
        ctx.fillStyle = hexToRgba(p.color, 0.18);
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, p.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 8px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(p.label, 0, 3);
        ctx.restore();
    }

    function drawParticle(p) {
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.globalAlpha = 1;
    }

    function drawFloatingText(f) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, f.life);
        ctx.fillStyle = f.color;
        ctx.font = f.big ? '800 16px Inter' : '800 12px Inter';
        ctx.textAlign = 'center';
        wrapText(ctx, f.text, f.x, f.y, 650, f.big ? 20 : 16);
        ctx.restore();
    }

    function drawHud() {
        const level = timeline[state.levelIndex] || timeline[0];
        ctx.save();
        ctx.fillStyle = 'rgba(3,6,17,0.72)';
        ctx.fillRect(0, 0, W, 82);
        ctx.strokeStyle = 'rgba(104,232,255,0.38)';
        ctx.beginPath(); ctx.moveTo(0, 82); ctx.lineTo(W, 82); ctx.stroke();

        ctx.fillStyle = '#ffb14a';
        ctx.font = '800 16px Inter';
        ctx.fillText('AI DEFENDER 2026', 18, 24);
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 12px Inter';
        ctx.fillText(level.year + ' // ' + level.title, 18, 45);
        ctx.fillText('SCORE ' + Math.round(state.score), 18, 66);

        drawMeter('SAFETY', state.safety, 244, 17, '#7dff9b');
        drawMeter('COMPUTE', state.compute, 244, 46, '#c8ff6b');
        drawMeter('AUTONOMY', state.autonomy, 468, 17, state.autonomy > 75 ? '#ff4f7b' : '#68e8ff');
        drawMeter('EVALS', state.evalCoverage, 468, 46, '#b98cff');

        ctx.fillStyle = state.pulseCooldown > 0 ? '#9bb3c7' : '#68e8ff';
        ctx.font = '800 11px Inter';
        ctx.fillText('E PULSE ' + (state.pulseCooldown > 0 ? state.pulseCooldown.toFixed(1) : 'READY'), 656, 30);
        ctx.fillText('WEAPON L' + state.weapon, 656, 55);
        ctx.restore();
    }

    function drawMeter(label, value, x, y, color) {
        ctx.fillStyle = '#9bb3c7';
        ctx.font = '700 10px Inter';
        ctx.fillText(label, x, y + 9);
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(x + 78, y, 120, 10);
        ctx.fillStyle = color;
        ctx.fillRect(x + 78, y, clamp(value, 0, 100) * 1.2, 10);
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.strokeRect(x + 78, y, 120, 10);
    }

    function drawPause() {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#ffb14a';
        ctx.font = '800 34px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('PAUS', W / 2, H / 2);
        ctx.font = '700 14px Inter';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Tryck P för att fortsätta', W / 2, H / 2 + 32);
        ctx.restore();
    }

    function burst(x, y, color, count, speed) {
        for (let i = 0; i < count; i++) {
            const a = Math.random() * Math.PI * 2;
            const v = Math.random() * speed;
            particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, color, size: 2 + Math.random() * 3, life: 0.35 + Math.random() * 0.45, maxLife: 0.8 });
        }
    }

    function floatingText(x, y, text, color = '#ffffff', life = 1.2) {
        floatingTexts.push({ x, y, text, color, life, vy: -18, big: text.length > 18 });
    }

    function updateList(list, dt, updater) {
        for (let i = list.length - 1; i >= 0; i--) if (!updater(list[i], dt)) list.splice(i, 1);
    }

    function gameLoop(ts) {
        const dt = Math.min(0.033, (ts - state.lastTime) / 1000 || 0);
        state.lastTime = ts;
        update(dt);
        draw();
        requestAnimationFrame(gameLoop);
    }

    function showOverlay(name) {
        hideAllOverlays();
        overlays[name].classList.add('active');
    }

    function hideAllOverlays() {
        Object.values(overlays).forEach((el) => el.classList.remove('active'));
    }

    function saveScore(name, email, score) {
        const entry = { name: (name || 'AI Defender').trim().slice(0, 24), email: email || '', score: Math.round(score), date: new Date().toISOString() };
        const current = JSON.parse(localStorage.getItem('ai-defender-2026-scores') || '[]');
        current.push(entry);
        current.sort((a, b) => b.score - a.score);
        localStorage.setItem('ai-defender-2026-scores', JSON.stringify(current.slice(0, 20)));
        notifyParent('scoreSaved', entry);
    }

    function notifyParent(type, payload) {
        if (window.parent && window.parent !== window) window.parent.postMessage({ type, ...payload }, '*');
    }

    function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
    function choice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
    function hexToRgba(hex, alpha) {
        const clean = hex.replace('#', '');
        const n = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16);
        return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
    }

    function wrapText(context, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            if (context.measureText(testLine).width > maxWidth && i > 0) {
                context.fillText(line, x, y);
                line = words[i] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        context.fillText(line, x, y);
    }

    $('start-button').addEventListener('click', resetGame);
    $('briefing-button').addEventListener('click', () => showOverlay('briefing'));
    $('close-briefing-button').addEventListener('click', () => showOverlay('start'));
    $('play-again-button').addEventListener('click', resetGame);
    $('score-form').addEventListener('submit', (event) => {
        event.preventDefault();
        saveScore($('player-name').value, $('player-email').value, state.score);
        resetGame();
    });

    window.addEventListener('keydown', (event) => {
        const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
        keys.add(key);
        if (key === 'p') state.paused = !state.paused;
        if (key === 'e') governancePulse();
        if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) event.preventDefault();
    });

    window.addEventListener('keyup', (event) => {
        const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
        keys.delete(key);
    });

    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'startGame') resetGame();
    });

    window.startGame = resetGame;
    window.resetGame = resetGame;

    requestAnimationFrame(gameLoop);
})();
