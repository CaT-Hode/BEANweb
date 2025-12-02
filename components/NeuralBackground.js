const NeuralBackground = () => {
    const canvasRef = React.useRef(null);
    const mouseRef = React.useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width, height;
        let blobs = []; // Declare blobs here
        let dustParticles = []; // Declare dustParticles here
        let sizeScale = 1; // Scale factor for sizes based on resolution

        // --- Configuration ---
        // 1. Blob Colors (Dark Red/Purple/Navy)
        const BLOB_COLORS = [
            { r: 76, g: 29, b: 149 },   // Deep Purple
            { r: 131, g: 24, b: 67 },   // Dark Pink/Red
            { r: 30, g: 27, b: 75 },    // Dark Navy
            { r: 88, g: 28, b: 135 },   // Purple
            { r: 127, g: 29, b: 29 },   // Dark Red
            { r: 15, g: 23, b: 42 }     // Slate 900 (Dark Blue-Grey)
        ];
        const DUST_COLORS = [
            'rgba(255, 255, 255, 0.8)', // White
            'rgba(200, 200, 255, 0.8)', // Light Blue
            'rgba(255, 200, 200, 0.8)'  // Light Pink
        ];
        const resize = () => {
            const oldWidth = width;
            const oldHeight = height;

            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;

            // Calculate size scale based on standard 1920x1080 resolution
            sizeScale = Math.sqrt((width * height) / (1920 * 1080));

            if (blobs.length === 0) {
                initElements();
            } else if (oldWidth > 0 && oldHeight > 0) {
                const scaleX = width / oldWidth;
                const scaleY = height / oldHeight;

                blobs.forEach(blob => {
                    blob.x *= scaleX;
                    blob.y *= scaleY;
                    blob.baseX *= scaleX;
                    blob.baseY *= scaleY;
                    blob.radius = blob.baseRadius * sizeScale;
                });

                dustParticles.forEach(p => {
                    p.x *= scaleX;
                    p.y *= scaleY;
                    p.size = p.baseSize * sizeScale;
                });
            }
        };

        // --- Classes ---

        class Blob {
            constructor() {
                this.init();
            }

            init() {
                this.baseRadius = Math.random() * 300 + 300; 
                this.radius = this.baseRadius * sizeScale;
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.color = BLOB_COLORS[Math.floor(Math.random() * BLOB_COLORS.length)];
                this.alpha = Math.random() * 0.2 + 0.15; 

                this.baseX = this.x;
                this.baseY = this.y;
                this.wanderRadius = 200;
                this.wanderTheta = Math.random() * Math.PI * 2;
                this.wanderSpeed = Math.random() * 0.0002 + 0.0001;
            }

            update(mouse) {
                // Slow, heavy wandering
                this.wanderTheta += this.wanderSpeed;
                const wanderX = this.baseX + Math.cos(this.wanderTheta) * this.wanderRadius;
                const wanderY = this.baseY + Math.sin(this.wanderTheta * 1.3) * this.wanderRadius;

                // Very subtle mouse repulsion for background blobs
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                const interactDist = 600;

                let interactX = 0;
                let interactY = 0;

                if (dist < interactDist) {
                    const force = (interactDist - dist) / interactDist;
                    interactX = -dx * force * 0.5;
                    interactY = -dy * force * 0.5;
                }

                const targetX = wanderX + interactX;
                const targetY = wanderY + interactY;

                this.x += (targetX - this.x) * 0.002; // Slower easing
                this.y += (targetY - this.y) * 0.002;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
                const { r, g: gr, b } = this.color;
                g.addColorStop(0, `rgba(${r}, ${gr}, ${b}, ${this.alpha})`);
                g.addColorStop(0.6, `rgba(${r}, ${gr}, ${b}, ${this.alpha * 0.4})`);
                g.addColorStop(1, `rgba(${r}, ${gr}, ${b}, 0)`);
                ctx.fillStyle = g;
                ctx.fill();
            }
        }

        class Dust {
            constructor() {
                this.init();
            }

            init() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                
                // Significantly increased size: Radius 5px - 20px
                this.baseSize = Math.random() * 15 + 5;
                this.size = this.baseSize * sizeScale;
                
                // Speed inversely proportional to size
                const speedFactor = 5 / this.size; 
                const baseSpeed = 0.05;

                this.vx = (Math.random() - 0.5) * baseSpeed * speedFactor;
                this.vy = (Math.random() - 0.5) * baseSpeed * speedFactor;
                
                this.color = DUST_COLORS[Math.floor(Math.random() * DUST_COLORS.length)];
                this.baseAlpha = Math.random() * 0.2 + 0.1; // Reduced base brightness (0.1 - 0.3)
                this.alpha = this.baseAlpha;
                this.pulseSpeed = Math.random() * 0.01 + 0.005; // Much slower blinking
                this.pulseTheta = Math.random() * Math.PI * 2;
                this.attractTimer = 0; 
                this.canBounce = Math.random() < 0.75;
            }

            update(mouse, targets) {
                // 1. Float
                this.x += this.vx;
                this.y += this.vy;

                // Boundary handling: 50% bounce, 50% wrap
                if (this.canBounce) {
                    if (this.x < this.size || this.x > width - this.size) {
                        this.vx = -this.vx;
                        this.x = Math.max(this.size, Math.min(this.x, width - this.size));
                    }
                    if (this.y < this.size || this.y > height - this.size) {
                        this.vy = -this.vy;
                        this.y = Math.max(this.size, Math.min(this.y, height - this.size));
                    }
                } else {
                    // Wrap around screen (wait until fully off-screen)
                    if (this.x < -this.size) this.x = width + this.size;
                    if (this.x > width + this.size) this.x = -this.size;
                    if (this.y < -this.size) this.y = height + this.size;
                    if (this.y > height + this.size) this.y = -this.size;
                }

                // 2. Pulse Glow (Twinkle)
                this.pulseTheta += this.pulseSpeed;
                this.alpha = this.baseAlpha + Math.sin(this.pulseTheta) * 0.05; // Reduced pulse amplitude

                // 3. Mouse Repulsion
                let dxMouse = mouse.x - this.x;
                let dyMouse = mouse.y - this.y;
                let distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
                const repulsionDist = 150; // Reduced interaction radius

                if (distMouse < repulsionDist) {
                    const force = (repulsionDist - distMouse) / repulsionDist;
                    // Reduced repulsion strength
                    this.vx -= (dxMouse / distMouse) * force * 0.2;
                    this.vy -= (dyMouse / distMouse) * force * 0.2;
                }

                // 4. Attraction to UI Elements
                if (targets && targets.length > 0) {
                    targets.forEach(rect => {
                        const nearestX = Math.max(rect.left, Math.min(this.x, rect.right));
                        const nearestY = Math.max(rect.top, Math.min(this.y, rect.bottom));
                        
                        let dx = nearestX - this.x;
                        let dy = nearestY - this.y;
                        let dist = Math.sqrt(dx * dx + dy * dy);
                        
                        const attractRange = 180;
                        
                        if (dist < attractRange) {
                            this.attractTimer += 0.016;

                            if (this.attractTimer < 5.0) {
                                if (dist > 5) { 
                                    const force = (attractRange - dist) / attractRange;
                                    // Gentle pull towards nearest border point
                                    this.vx += (dx / dist) * force * 0.015;
                                    this.vy += (dy / dist) * force * 0.015;
                                }
                            }
                        }
                    });
                }

                // 5. Random Wandering (Brownian-like)
                this.vx += (Math.random() - 0.5) * 0.002;
                this.vy += (Math.random() - 0.5) * 0.002;

                // Dampen speed
                const maxSpeed = 0.2 * (5 / this.size); // Adjusted max speed scaling 
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (speed > maxSpeed) {
                    this.vx = (this.vx / speed) * maxSpeed;
                    this.vy = (this.vy / speed) * maxSpeed;
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;

                const currentAlpha = Math.max(0, Math.min(1, this.alpha));
                ctx.globalAlpha = currentAlpha;

                // Dynamic Glow effect based on alpha (Twinkle)
                ctx.shadowBlur = 8 + (currentAlpha * 10);
                ctx.shadowColor = this.color;

                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1;
            }
        }

        const initElements = () => {
            blobs = [];
            dustParticles = [];

            // 8 Large Background Blobs
            for (let i = 0; i < 8; i++) {
                blobs.push(new Blob());
            }

            // Increased Dust Particles Count
            const dustCount = Math.floor((width * height) / 6000); // Increased density
            for (let i = 0; i < dustCount; i++) {
                dustParticles.push(new Dust());
            }
        };

        const handleMouseMove = (e) => {
            mouseRef.current.x = e.clientX;
            mouseRef.current.y = e.clientY;
        };

        const animate = () => {
            // Dark Background
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = '#020205'; // Almost black
            ctx.fillRect(0, 0, width, height);

            // Draw Blobs (Soft, blended)
            ctx.globalCompositeOperation = 'screen';
            blobs.forEach(blob => {
                blob.update(mouseRef.current);
                blob.draw();
            });

            // Cache attraction targets once per frame
            const attractionTargets = Array.from(document.querySelectorAll('.liquid-glass-capsule, .nav-buttons-container'))
                .map(el => el.getBoundingClientRect());

            // Draw Dust (Sharp, glowing, on top)
            ctx.globalCompositeOperation = 'source-over'; // Or 'lighter' for more intense glow
            dustParticles.forEach(p => {
                p.update(mouseRef.current, attractionTargets);
                p.draw();
            });

            handleCollisions();

            requestAnimationFrame(animate);
        };

        const handleCollisions = () => {
            for (let i = 0; i < dustParticles.length; i++) {
                for (let j = i + 1; j < dustParticles.length; j++) {
                    const p1 = dustParticles[i];
                    const p2 = dustParticles[j];
                    const dx = p2.x - p1.x;
                    const dy = p2.y - p1.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const minDist = p1.size + p2.size;

                    if (dist < minDist) {
                        // 1. Resolve Overlap (prevent sticking)
                        const angle = Math.atan2(dy, dx);
                        const overlap = minDist - dist;
                        const moveX = Math.cos(angle) * overlap * 0.5;
                        const moveY = Math.sin(angle) * overlap * 0.5;
                        
                        p1.x -= moveX;
                        p1.y -= moveY;
                        p2.x += moveX;
                        p2.y += moveY;

                        // 2. Elastic Collision Response
                        const nx = dx / dist;
                        const ny = dy / dist;
                        
                        const dvx = p2.vx - p1.vx;
                        const dvy = p2.vy - p1.vy;
                        
                        const velAlongNormal = dvx * nx + dvy * ny;

                        if (velAlongNormal > 0) continue; // Already separating

                        const restitution = 0.9; // Bounciness
                        // Mass proportional to area (size squared)
                        const m1 = p1.size * p1.size;
                        const m2 = p2.size * p2.size;

                        let jVal = -(1 + restitution) * velAlongNormal;
                        jVal /= (1 / m1 + 1 / m2);

                        const impulseX = jVal * nx;
                        const impulseY = jVal * ny;

                        p1.vx -= impulseX / m1;
                        p1.vy -= impulseY / m1;
                        p2.vx += impulseX / m2;
                        p2.vy += impulseY / m2;
                    }
                }
            }
        };

        resize();
        animate();

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ opacity: 1 }}
        />
    );
};
