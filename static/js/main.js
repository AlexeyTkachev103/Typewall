let debounceTimer;
let textBlocks = [];
let blockIdCounter = 0;

const elements = {
    bgType: document.getElementById('bg-type'),
    solidControls: document.getElementById('solid-controls'),
    gradientControls: document.getElementById('gradient-controls'),
    bgColor: document.getElementById('bg-color'),
    gradientColor1: document.getElementById('gradient-color1'),
    gradientColor2: document.getElementById('gradient-color2'),
    gradientType: document.getElementById('gradient-type'),
    gradientDirection: document.getElementById('gradient-direction'),
    gradientDirectionGroup: document.getElementById('gradient-direction-group'),
    resolutionPreset: document.getElementById('resolution-preset'),
    customResolution: document.getElementById('custom-resolution'),
    customWidth: document.getElementById('custom-width'),
    customHeight: document.getElementById('custom-height'),
    textBlocksContainer: document.getElementById('text-blocks-container'),
    addTextBlockBtn: document.getElementById('add-text-block'),
    exportFormat: document.getElementById('export-format'),
    downloadBtn: document.getElementById('download-btn'),
    previewImage: document.getElementById('preview-image'),
    loading: document.getElementById('loading')
};

elements.bgType.addEventListener('change', () => {
    if (elements.bgType.value === 'solid') {
        elements.solidControls.style.display = 'block';
        elements.gradientControls.style.display = 'none';
    } else {
        elements.solidControls.style.display = 'none';
        elements.gradientControls.style.display = 'block';
    }
    updatePreview();
});

elements.gradientType.addEventListener('change', () => {
    if (elements.gradientType.value === 'radial') {
        elements.gradientDirectionGroup.style.display = 'none';
    } else {
        elements.gradientDirectionGroup.style.display = 'block';
    }
    updatePreview();
});

elements.resolutionPreset.addEventListener('change', () => {
    if (elements.resolutionPreset.value === 'custom') {
        elements.customResolution.style.display = 'block';
    } else {
        elements.customResolution.style.display = 'none';
        const [width, height] = elements.resolutionPreset.value.split('x');
        elements.customWidth.value = width;
        elements.customHeight.value = height;
    }
    updatePreview();
});

[
    elements.bgColor,
    elements.gradientColor1,
    elements.gradientColor2,
    elements.gradientDirection,
    elements.customWidth,
    elements.customHeight
].forEach(el => {
    el.addEventListener('input', updatePreview);
    el.addEventListener('change', updatePreview);
});

function createTextBlock() {
    const blockId = blockIdCounter++;
    const block = {
        id: blockId,
        text: '',
        font_family: 'Arial',
        font_size: 48,
        text_color: '#ffffff',
        bold: false,
        italic: false,
        underline: false,
        position: 'middle-center'
    };
    textBlocks.push(block);

    const blockHtml = `
        <div class="text-block" data-block-id="${blockId}">
            <div class="text-block-header">
                <span class="text-block-title">Text Block ${blockId + 1}</span>
                <button class="remove-block-btn" data-block-id="${blockId}">×</button>
            </div>
            <div class="form-group">
                <label>Content:</label>
                <textarea class="text-content" rows="3" placeholder="Enter text..."></textarea>
            </div>
            <div class="form-group">
                <label>Font:</label>
                <select class="font-family">
                    <option value="Arial">Arial</option>
                    <option value="Times">Times New Roman</option>
                    <option value="Courier">Courier</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                    <option value="FiraCode">Fira Code (Nerd Font)</option>
                    <option value="JetBrainsMono">JetBrains Mono (Nerd Font)</option>
                    <option value="Hack">Hack (Nerd Font)</option>
                    <option value="RobotoMono">Roboto Mono (Nerd Font)</option>
                    <option value="SourceCodePro">Source Code Pro (Nerd Font)</option>
                </select>
            </div>
            <div class="form-group">
                <label>Size:</label>
                <input type="range" class="font-size" min="12" max="200" value="48">
                <span class="font-size-value">48px</span>
            </div>
            <div class="form-group">
                <label>Color:</label>
                <input type="color" class="text-color" value="#ffffff">
            </div>
            <div class="form-group">
                <label>Style:</label>
                <div class="checkbox-group">
                    <label><input type="checkbox" class="text-bold"> Bold</label>
                    <label><input type="checkbox" class="text-italic"> Italic</label>
                    <label><input type="checkbox" class="text-underline"> Underline</label>
                </div>
            </div>
            <div class="form-group">
                <label>Position:</label>
                <div class="position-grid">
                    <button class="position-btn" data-position="top-left">↖</button>
                    <button class="position-btn" data-position="top-center">↑</button>
                    <button class="position-btn" data-position="top-right">↗</button>
                    <button class="position-btn" data-position="middle-left">←</button>
                    <button class="position-btn active" data-position="middle-center">⊙</button>
                    <button class="position-btn" data-position="middle-right">→</button>
                    <button class="position-btn" data-position="bottom-left">↙</button>
                    <button class="position-btn" data-position="bottom-center">↓</button>
                    <button class="position-btn" data-position="bottom-right">↘</button>
                </div>
            </div>
        </div>
    `;

    elements.textBlocksContainer.insertAdjacentHTML('beforeend', blockHtml);

    const blockElement = elements.textBlocksContainer.querySelector(`[data-block-id="${blockId}"]`);

    blockElement.querySelector('.text-content').addEventListener('input', (e) => {
        updateBlockData(blockId, 'text', e.target.value);
    });

    blockElement.querySelector('.font-family').addEventListener('change', (e) => {
        updateBlockData(blockId, 'font_family', e.target.value);
    });

    const fontSizeInput = blockElement.querySelector('.font-size');
    const fontSizeValue = blockElement.querySelector('.font-size-value');
    fontSizeInput.addEventListener('input', (e) => {
        fontSizeValue.textContent = e.target.value + 'px';
        updateBlockData(blockId, 'font_size', parseInt(e.target.value));
    });

    blockElement.querySelector('.text-color').addEventListener('input', (e) => {
        updateBlockData(blockId, 'text_color', e.target.value);
    });

    blockElement.querySelector('.text-bold').addEventListener('change', (e) => {
        updateBlockData(blockId, 'bold', e.target.checked);
    });

    blockElement.querySelector('.text-italic').addEventListener('change', (e) => {
        updateBlockData(blockId, 'italic', e.target.checked);
    });

    blockElement.querySelector('.text-underline').addEventListener('change', (e) => {
        updateBlockData(blockId, 'underline', e.target.checked);
    });

    blockElement.querySelectorAll('.position-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            blockElement.querySelectorAll('.position-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateBlockData(blockId, 'position', btn.dataset.position);
        });
    });

    blockElement.querySelector('.remove-block-btn').addEventListener('click', () => {
        removeTextBlock(blockId);
    });

    updatePreview();
}

function updateBlockData(blockId, field, value) {
    const block = textBlocks.find(b => b.id === blockId);
    if (block) {
        block[field] = value;
        updatePreview();
    }
}

function removeTextBlock(blockId) {
    textBlocks = textBlocks.filter(b => b.id !== blockId);
    const blockElement = elements.textBlocksContainer.querySelector(`[data-block-id="${blockId}"]`);
    if (blockElement) {
        blockElement.remove();
    }
    updatePreview();
}

elements.addTextBlockBtn.addEventListener('click', createTextBlock);

function getParams() {
    const params = {
        bg_type: elements.bgType.value,
        text_blocks: textBlocks,
        format: elements.exportFormat.value
    };

    if (elements.resolutionPreset.value === 'custom') {
        params.width = elements.customWidth.value;
        params.height = elements.customHeight.value;
    } else {
        const [width, height] = elements.resolutionPreset.value.split('x');
        params.width = width;
        params.height = height;
    }

    if (elements.bgType.value === 'solid') {
        params.bg_color = elements.bgColor.value;
    } else {
        params.gradient_color1 = elements.gradientColor1.value;
        params.gradient_color2 = elements.gradientColor2.value;
        params.gradient_type = elements.gradientType.value;
        params.gradient_direction = elements.gradientDirection.value;
    }

    return params;
}

function updatePreview() {
    clearTimeout(debounceTimer);
    elements.loading.style.display = 'block';
    elements.previewImage.style.display = 'none';

    debounceTimer = setTimeout(async () => {
        try {
            const params = getParams();
            const response = await fetch('/preview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(params)
            });

            const data = await response.json();
            elements.previewImage.src = data.image;
            elements.previewImage.style.display = 'block';
            elements.loading.style.display = 'none';
        } catch (error) {
            console.error('Error updating preview:', error);
            elements.loading.textContent = 'Error generating preview';
        }
    }, 300);
}

elements.downloadBtn.addEventListener('click', async () => {
    try {
        const params = getParams();
        const response = await fetch('/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        });

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wallpaper.${params.format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading image:', error);
        alert('Error downloading image');
    }
});

createTextBlock();
updatePreview();