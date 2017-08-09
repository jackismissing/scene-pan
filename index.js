class ScenePan {
    constructor(options) {
        this.resize = this.resize.bind(this);
        this.onMousemove = this.onMousemove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.getMaxSize = this.getMaxSize.bind(this);
        this.tick = this.tick.bind(this);
        this.$wrapper = options.el;
        this.ease = options.ease || .08;
        this.init();
    }

    init() {
        this.touch = 'ontouchstart' in document.documentElement || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;

        this.treshold = .1;

        this.position = {
            x: 0,
            y: 0
        };

        this.destination = {
            x: 0,
            y: 0
        };

        this.offset = {
            x: 0,
            y: 0
        };

        this.delta = {
            x: 0,
            y: 0
        };

        this.size = {
            x: 0,
            y: 0,
            offsetX: 0,
            offsetY: 0,

        };

        this.resize();
        this.bindEvents();
        this.tick();
    }

    resize() {
        this.setWrapperSize();
        this.setWrapperPosition();
    }

    bindEvents() {
        window.addEventListener('resize', this.resize);
        if (this.touch) {
            document.addEventListener('touchstart', this.onMouseDown);
            document.addEventListener('touchend', this.onMouseUp);
        } else {
            document.addEventListener('mousedown', this.onMouseDown);
            document.addEventListener('mouseup', this.onMouseUp);
        }
    }

    /**
     * Sets the wrapper size based on its taller and wider childrens
     */
    setWrapperSize() {
        this.size = [].slice.call(this.$wrapper.childNodes).reduce(this.getMaxSize);
        this.size.offsetX = this.size.w - window.innerWidth;
        this.size.offsetY = this.size.h - window.innerHeight;
        this.$wrapper.style.width = `${this.size.w}px`;
        this.$wrapper.style.height = `${this.size.h}px`;
    }

    /**
     * Returns the max width and height between two objects
     * @param  {[type]} acc [description]
     * @param  {[type]} cur [description]
     * @return {[type]}     [description]
     */
    getMaxSize(a, b) {
        a = this.getElSize(a);
        b = this.getElSize(b);

        return {
            w: Math.max(a.w, b.w),
            h: Math.max(a.h, b.h),
        };
    }

    getElSize(el) {
        // Is el a proper ELEMENT_NODE ?
        if (el.nodeType === 1) {
            el.w = el.offsetWidth;
            el.h = el.offsetHeight;
        } else {
            el.w = el.w || 0;
            el.h = el.h || 0;
        }

        return el;
    }

    /**
     * Centers wrapper
     * @return {[type]} [description]
     */
    setWrapperPosition() {
        this.destination.x = .5 * this.size.offsetX;
        this.destination.y = .5 * this.size.offsetY;
    }

    onMousemove(e) {
        e.preventDefault();
        this.mouseMove = true;
        const x = e.clientX || e.touches[0].clientX;
        const y = e.clientY || e.touches[0].clientY;

        this.offset.x = x - this.delta.x;
        this.offset.y = y - this.delta.y;

        this.destination.x -= this.offset.x;
        this.destination.y -= this.offset.y;
        
        // We don't want to go out of bounds
        this.destination.x = Math.min(Math.max(0, this.destination.x), this.size.offsetX);
        this.destination.y = Math.min(Math.max(0, this.destination.y), this.size.offsetY);
        this.delta.x = x;
        this.delta.y = y;
    }

    onMouseDown(e) {
        const x = e.clientX || e.touches[0].clientX;
        const y = e.clientY || e.touches[0].clientY;
        this.delta.x = x;
        this.delta.y = y;
        this.$wrapper.classList.add('dragging');

        if (this.touch) {
            document.addEventListener('touchmove', this.onMousemove);
        } else {
            document.addEventListener('mousemove', this.onMousemove);
        }
    }

    onMouseUp(e) {
        this.mouseMove = false;
        // this.destination.x = this.offset.x;
        // this.destination.y = this.offset.y;
        this.offset.x = 0;
        this.offset.y = 0;
        this.$wrapper.classList.remove('dragging');

        if (this.touch) {
            document.removeEventListener('touchmove', this.onMousemove);
        } else {
            document.removeEventListener('mousemove', this.onMousemove);
        }
    }

    tick() {
        // Put motion in the displacement of the wrapper
        // Instead of setting position = destination
        // We add the distance between the destination and the position to the position
        this.movePosition();
        this.$wrapper.style.transform = `translate3d(-${this.position.x}px, -${this.position.y}px, 0)`;
        window.requestAnimationFrame(this.tick);
    }

    /**
     * Calculates the new position based on the distance between the destination and the current position
     * We add a percentage to add the easing effect
     * https://codepen.io/rachsmith/post/animation-tip-lerp
     * @return {[type]} [description]
     */
    movePosition() {
        const toX = (this.destination.x - this.position.x) * .08;
        const toY = (this.destination.y - this.position.y) * .08;

        this.isPanning = (toX > this.treshold || toY > this.treshold);

        this.position.x += toX;
        this.position.y += toY;
    }

    // Utils
    map(val, oldMin, oldMax, newMin, newMax) {
        return newMin + (val - oldMin) * (newMax - newMin) / (oldMax - oldMin);
    }
}