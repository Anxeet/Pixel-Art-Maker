class PixelArtMaker {
    constructor() {
        this.gridSize = 32;
        this.currentColor = '#ff0000';
        this.isDrawing = false;
        this.isErasing = false;
        this.grid = [];
        this.actionHistory = [];
        this.maxHistorySize = 50;
        this.isDarkMode = false;
        
        this.initializeElements();
        this.setupEventListeners();
        this.createGrid();
    }

    initializeElements() {
        this.pixelGrid = document.getElementById('pixelGrid');
        this.colorPicker = document.getElementById('colorPicker');
        this.gridSizeSelect = document.getElementById('gridSize');
        this.clearBtn = document.getElementById('clearBtn');
        this.eraserBtn = document.getElementById('eraserBtn');
        this.undoBtn = document.getElementById('undoBtn');
        this.saveBtn = document.getElementById('saveBtn');
        this.themeBtn = document.getElementById('themeBtn');
    }

    setupEventListeners() {
        // Color picker
        this.colorPicker.addEventListener('change', (e) => {
            this.currentColor = e.target.value;
            this.isErasing = false;
            this.eraserBtn.classList.remove('active');
        });

        // Grid size selector
        this.gridSizeSelect.addEventListener('change', (e) => {
            this.gridSize = parseInt(e.target.value);
            this.createGrid();
            this.clearHistory();
        });

        // Clear button
        this.clearBtn.addEventListener('click', () => {
            this.clearGrid();
        });

        // Eraser button
        this.eraserBtn.addEventListener('click', () => {
            this.isErasing = !this.isErasing;
            this.eraserBtn.classList.toggle('active');
        });

        // Undo button
        this.undoBtn.addEventListener('click', () => {
            this.undo();
        });

        // Save button
        this.saveBtn.addEventListener('click', () => {
            this.saveAsImage();
        });

        // Theme toggle
        this.themeBtn.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Mouse events for drawing
        this.pixelGrid.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('pixel')) {
                this.isDrawing = true;
                this.handlePixelClick(e.target);
            }
        });

        this.pixelGrid.addEventListener('mouseover', (e) => {
            if (this.isDrawing && e.target.classList.contains('pixel')) {
                this.handlePixelClick(e.target);
            }
        });

        document.addEventListener('mouseup', () => {
            this.isDrawing = false;
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                this.undo();
            }
        });

        // Prevent context menu on right click
        this.pixelGrid.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    createGrid() {
        this.pixelGrid.innerHTML = '';
        this.grid = [];
        
        // Set grid template columns
        this.pixelGrid.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        
        // Create pixels with faster staggered animation
        for (let row = 0; row < this.gridSize; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                const pixel = document.createElement('div');
                pixel.className = 'pixel';
                pixel.dataset.row = row;
                pixel.dataset.col = col;
                
                // Add faster staggered animation delay based on position
                const delay = (row + col) * 0.005; // 5ms delay per pixel (faster)
                pixel.style.animationDelay = `${1.2 + delay}s`;
                
                this.pixelGrid.appendChild(pixel);
                this.grid[row][col] = pixel;
            }
        }
    }

    handlePixelClick(pixel) {
        const row = parseInt(pixel.dataset.row);
        const col = parseInt(pixel.dataset.col);
        const oldColor = pixel.style.backgroundColor;
        
        // Save action to history
        this.saveAction(row, col, oldColor);
        
        if (this.isErasing) {
            pixel.style.backgroundColor = 'white';
            pixel.classList.remove('filled');
        } else {
            pixel.style.backgroundColor = this.currentColor;
            pixel.classList.add('filled');
        }
    }

    saveAction(row, col, oldColor) {
        const action = {
            row: row,
            col: col,
            oldColor: oldColor,
            newColor: this.isErasing ? 'white' : this.currentColor,
            timestamp: Date.now()
        };
        
        this.actionHistory.push(action);
        
        // Limit history size
        if (this.actionHistory.length > this.maxHistorySize) {
            this.actionHistory.shift();
        }
        
        // Enable undo button
        this.undoBtn.disabled = false;
    }

    undo() {
        if (this.actionHistory.length === 0) return;
        
        const lastAction = this.actionHistory.pop();
        const pixel = this.grid[lastAction.row][lastAction.col];
        
        pixel.style.backgroundColor = lastAction.oldColor;
        
        if (lastAction.oldColor === 'white' || !lastAction.oldColor) {
            pixel.classList.remove('filled');
        } else {
            pixel.classList.add('filled');
        }
        
        // Disable undo button if no more history
        if (this.actionHistory.length === 0) {
            this.undoBtn.disabled = true;
        }
    }

    clearHistory() {
        this.actionHistory = [];
        this.undoBtn.disabled = true;
    }

    clearGrid() {
        const pixels = document.querySelectorAll('.pixel');
        pixels.forEach(pixel => {
            pixel.style.backgroundColor = 'white';
            pixel.classList.remove('filled');
        });
        this.clearHistory();
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
        
        // Update button icon and text
        const btnIcon = this.themeBtn.querySelector('.btn-icon');
        const btnText = this.themeBtn.querySelector('.btn-text');
        
        if (btnIcon) {
            btnIcon.textContent = this.isDarkMode ? '☀️' : '🌙';
        }
        if (btnText) {
            btnText.textContent = this.isDarkMode ? 'Light' : 'Theme';
        }
    }

    saveAsImage() {
        // Create a canvas to draw the grid
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size (each pixel will be 10x10 for better quality)
        const pixelSize = 10;
        canvas.width = this.gridSize * pixelSize;
        canvas.height = this.gridSize * pixelSize;
        
        // Fill background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw each pixel
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const pixel = this.grid[row][col];
                const color = pixel.style.backgroundColor;
                
                if (color && color !== 'white') {
                    ctx.fillStyle = color;
                    ctx.fillRect(
                        col * pixelSize, 
                        row * pixelSize, 
                        pixelSize, 
                        pixelSize
                    );
                }
            }
        }
        
        // Create download link
        const link = document.createElement('a');
        link.download = `pixel-art-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PixelArtMaker();
});

// Add some CSS for the active eraser state
const style = document.createElement('style');
style.textContent = `
    .btn-eraser.active {
        background: linear-gradient(135deg, #059669, #047857);
        border-color: #059669;
        color: white;
        transform: scale(1.05);
    }
    
    .btn-eraser.active::before {
        opacity: 0;
    }
`;
document.head.appendChild(style); 