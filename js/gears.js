class GearsBackground {
    constructor() {
        this.container = document.getElementById('gears-background');
        this.gears = [];
        this.gearImages = [
            'assets/gears/gear1.svg',
            'assets/gears/gear2.svg',
            'assets/gears/gear3.svg',
            'assets/gears/gear4.svg',
            'assets/gears/gear5.svg',
            'assets/gears/gear6.svg'
        ];
        
        this.scrollY = window.scrollY;
        this.lastScrollY = this.scrollY;
        this.scrollVelocity = 0;
        this.targetRotations = [];
        this.currentRotations = [];
        
        this.isAnimating = false;
        this.resizeTimeout = null;
        
        this.init();
    }

    init() {
        this.generateGears();
        this.setupEventListeners();
        this.startAnimation();
    }

    generateGears() {
        this.container.innerHTML = '';
        this.gears = [];
        this.targetRotations = [];
        this.currentRotations = [];
        
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        const minSize = viewportWidth * 0.20;
        const maxSize = viewportWidth * 0.50;
        
        const numGears = this.calculateNumGears(viewportWidth, viewportHeight);
        
        const positions = this.generateNonOverlappingPositions(
            numGears,
            viewportWidth,
            viewportHeight,
            minSize,
            maxSize
        );
        
        positions.forEach((pos, index) => {
            const gearElement = this.createGearElement(pos);
            this.container.appendChild(gearElement);
            this.gears.push(gearElement);
            this.targetRotations.push(0);
            this.currentRotations.push(0);
        });
    }

    calculateNumGears(width, height) {
        const area = width * height;
        const baseArea = 1920 * 1080;
        const baseGears = 12;
        
        let numGears = Math.floor((area / baseArea) * baseGears);
        numGears = Math.max(8, Math.min(20, numGears));
        
        return numGears;
    }

    generateNonOverlappingPositions(numGears, viewportWidth, viewportHeight, minSize, maxSize) {
        const positions = [];
        const maxAttempts = 1000;
        
        for (let i = 0; i < numGears; i++) {
            let position = null;
            let attempts = 0;
            
            while (!position && attempts < maxAttempts) {
                const size = this.randomRange(minSize, maxSize);
                const x = this.randomRange(-size * 0.3, viewportWidth - size * 0.7);
                const y = this.randomRange(-size * 0.3, viewportHeight - size * 0.7);
                
                const testPosition = { x, y, size };
                
                if (positions.length === 0 || this.isPositionValid(testPosition, positions)) {
                    position = testPosition;
                    position.image = this.getRandomGearImage();
                    position.rotationSpeed = this.randomRange(0.5, 2.0);
                    position.initialRotation = this.randomRange(0, 360);
                }
                
                attempts++;
            }
            
            if (position) {
                positions.push(position);
            }
        }
        
        return positions;
    }

    isPositionValid(newPos, existingPositions) {
        const minDistance = (newPos.size * 0.3);
        
        for (let pos of existingPositions) {
            const dx = newPos.x + newPos.size / 2 - (pos.x + pos.size / 2);
            const dy = newPos.y + newPos.size / 2 - (pos.y + pos.size / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            const requiredDistance = (newPos.size + pos.size) / 2 * 0.4;
            
            if (distance < Math.max(minDistance, requiredDistance)) {
                return false;
            }
        }
        
        return true;
    }

    createGearElement(position) {
        const gear = document.createElement('div');
        gear.className = 'gear';
        gear.style.width = `${position.size}px`;
        gear.style.height = `${position.size}px`;
        gear.style.left = `${position.x}px`;
        gear.style.top = `${position.y}px`;
        gear.style.backgroundImage = `url('${position.image}')`;
        gear.style.transform = `rotate(${position.initialRotation}deg)`;
        
        gear.dataset.rotationSpeed = position.rotationSpeed;
        gear.dataset.initialRotation = position.initialRotation;
        
        return gear;
    }

    getRandomGearImage() {
        const randomIndex = Math.floor(Math.random() * this.gearImages.length);
        return this.gearImages[randomIndex];
    }

    randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    setupEventListeners() {
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.updateScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
        
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.generateGears();
            }, 250);
        });
    }

    updateScroll() {
        this.scrollY = window.scrollY;
        
        const delta = this.scrollY - this.lastScrollY;
        this.scrollVelocity = delta;
        
        this.gears.forEach((gear, index) => {
            const rotationSpeed = parseFloat(gear.dataset.rotationSpeed);
            const rotation = delta * rotationSpeed * 0.5;
            this.targetRotations[index] += rotation;
        });
        
        this.lastScrollY = this.scrollY;
    }

    startAnimation() {
        const animate = () => {
            this.gears.forEach((gear, index) => {
                const diff = this.targetRotations[index] - this.currentRotations[index];
                this.currentRotations[index] += diff * 0.15;
                
                const initialRotation = parseFloat(gear.dataset.initialRotation);
                const totalRotation = initialRotation + this.currentRotations[index];
                
                gear.style.transform = `rotate(${totalRotation}deg)`;
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GearsBackground();
});
