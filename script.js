document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const browseBtn = document.getElementById('browse-btn');
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('file-name');
    const fileSize = document.getElementById('file-size');
    const removeFileBtn = document.getElementById('remove-file');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const fromFormat = document.getElementById('from-format');
    const toFormat = document.getElementById('to-format');
    const convertBtn = document.getElementById('convert-btn');
    const conversionOptions = document.getElementById('conversion-options');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const formatTabBtns = document.querySelectorAll('.format-tab-btn');
    const formatTables = document.querySelectorAll('.format-table');
    const downloadModal = document.getElementById('download-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const qrModal = document.getElementById('qr-modal');
    const emailModal = document.getElementById('email-modal');
    const qrBtn = document.querySelector('.qr-btn');
    const emailBtn = document.querySelector('.email-btn');
    const startConvertingBtn = document.getElementById('start-converting');
    
    // Current file data
    let currentFile = null;
    
    // Format conversion mapping
    const formatConversionMap = {
        // Documents
        pdf: ['docx', 'ppt', 'jpg', 'png', 'html'],
        docx: ['pdf', 'txt', 'html'],
        ppt: ['pdf', 'jpg'],
        xlsx: ['pdf', 'csv'],
        // Images
        jpg: ['png', 'pdf', 'webp'],
        png: ['jpg', 'pdf', 'svg', 'webp'],
        svg: ['png', 'pdf'],
        webp: ['jpg', 'png'],
        // Audio
        mp3: ['wav', 'aac', 'm4a'],
        wav: ['mp3', 'aac'],
        aac: ['mp3', 'wav'],
        // Video
        mp4: ['webm', 'avi', 'mov', 'mp3'],
        webm: ['mp4', 'avi'],
        avi: ['mp4', 'webm'],
        // Other
        html: ['pdf'],
        zip: ['rar']
    };
    
    // Conversion options for each format
    const conversionOptionsMap = {
        pdf: [
            { id: 'pdf-quality', label: 'Quality', type: 'range', min: 1, max: 100, value: 90 },
            { id: 'pdf-password', label: 'Password Protection', type: 'checkbox' },
            { id: 'pdf-pages', label: 'Pages to Convert', type: 'text', placeholder: 'e.g. 1-5, 8' }
        ],
        docx: [
            { id: 'docx-formatting', label: 'Preserve Formatting', type: 'checkbox', checked: true },
            { id: 'docx-images', label: 'Include Images', type: 'checkbox', checked: true }
        ],
        jpg: [
            { id: 'jpg-quality', label: 'Quality', type: 'range', min: 1, max: 100, value: 85 },
            { id: 'jpg-resize', label: 'Resize', type: 'checkbox' },
            { id: 'jpg-width', label: 'Width (px)', type: 'number', placeholder: 'auto', disabled: true },
            { id: 'jpg-height', label: 'Height (px)', type: 'number', placeholder: 'auto', disabled: true }
        ],
        png: [
            { id: 'png-compression', label: 'Compression Level', type: 'range', min: 0, max: 9, value: 6 },
            { id: 'png-transparency', label: 'Preserve Transparency', type: 'checkbox', checked: true }
        ],
        mp3: [
            { id: 'mp3-quality', label: 'Bitrate', type: 'select', options: ['128 kbps', '192 kbps', '256 kbps', '320 kbps'], value: '192 kbps' },
            { id: 'mp3-trim', label: 'Trim Audio', type: 'checkbox' },
            { id: 'mp3-start', label: 'Start Time (s)', type: 'number', placeholder: '0', disabled: true },
            { id: 'mp3-end', label: 'End Time (s)', type: 'number', placeholder: 'end', disabled: true }
        ],
        mp4: [
            { id: 'mp4-resolution', label: 'Resolution', type: 'select', options: ['Original', '1080p', '720p', '480p'], value: 'Original' },
            { id: 'mp4-audio', label: 'Audio Quality', type: 'select', options: ['Original', 'High', 'Medium', 'Low'], value: 'Original' }
        ]
    };
    
    // Initialize the app
    function init() {
        setupEventListeners();
        updateConvertButtonState();
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Drag and drop events
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false);
        });
        
        dropArea.addEventListener('drop', handleDrop, false);
        
        // File input events
        browseBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFiles);
        removeFileBtn.addEventListener('click', resetFileInput);
        
        // Format selection events
        fromFormat.addEventListener('change', updateToFormatOptions);
        toFormat.addEventListener('change', updateConversionOptions);
        
        // Tab switching
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => switchTab(btn.dataset.tab));
        });
        
        // Format table switching
        formatTabBtns.forEach(btn => {
            btn.addEventListener('click', () => switchFormatTab(btn.dataset.format));
        });
        
        // Modal events
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', closeAllModals);
        });
        
        qrBtn.addEventListener('click', () => {
            downloadModal.classList.remove('active');
            qrModal.classList.add('active');
        });
        
        emailBtn.addEventListener('click', () => {
            downloadModal.classList.remove('active');
            emailModal.classList.add('active');
        });
        
        // Start converting button scroll
        startConvertingBtn.addEventListener('click', () => {
            document.getElementById('converter').scrollIntoView({ behavior: 'smooth' });
        });
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                closeAllModals();
            }
        });
    }
    
    // Prevent default drag and drop behavior
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Highlight drop area
    function highlight() {
        dropArea.classList.add('highlight');
    }
    
    // Unhighlight drop area
    function unhighlight() {
        dropArea.classList.remove('highlight');
    }
    
    // Handle dropped files
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles({ target: { files } });
    }
    
    // Handle selected files
    function handleFiles(e) {
        const files = e.target.files;
        if (files.length === 0) return;
        
        currentFile = files[0];
        displayFileInfo(currentFile);
        
        // Try to detect file format from extension
        const fileExt = currentFile.name.split('.').pop().toLowerCase();
        if (formatConversionMap[fileExt]) {
            fromFormat.value = fileExt;
            updateToFormatOptions();
        }
    }
    
    // Display file information
    function displayFileInfo(file) {
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        fileInfo.style.display = 'flex';
        progressContainer.style.display = 'none';
    }
    
    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Reset file input
    function resetFileInput() {
        currentFile = null;
        fileInput.value = '';
        fileInfo.style.display = 'none';
        fromFormat.value = '';
        toFormat.innerHTML = '<option value="">Select format</option>';
        convertBtn.disabled = true;
    }
    
    // Update the "Convert to" format options based on "Convert from" selection
    function updateToFormatOptions() {
        const fromFormatValue = fromFormat.value;
        toFormat.innerHTML = '<option value="">Select format</option>';
        
        if (fromFormatValue && formatConversionMap[fromFormatValue]) {
            formatConversionMap[fromFormatValue].forEach(format => {
                const option = document.createElement('option');
                option.value = format;
                option.textContent = format.toUpperCase();
                toFormat.appendChild(option);
            });
        }
        
        updateConvertButtonState();
        updateConversionOptions();
    }
    
    // Update conversion options based on selected formats
    function updateConversionOptions() {
        conversionOptions.innerHTML = '';
        
        const toFormatValue = toFormat.value;
        if (!toFormatValue) return;
        
        if (conversionOptionsMap[toFormatValue]) {
            conversionOptionsMap[toFormatValue].forEach(option => {
                const optionElement = createOptionElement(option);
                conversionOptions.appendChild(optionElement);
                
                // Add event listeners for dependent fields
                if (option.id === 'jpg-resize') {
                    const resizeCheckbox = document.getElementById('jpg-resize');
                    const widthInput = document.getElementById('jpg-width');
                    const heightInput = document.getElementById('jpg-height');
                    
                    resizeCheckbox.addEventListener('change', (e) => {
                        widthInput.disabled = !e.target.checked;
                        heightInput.disabled = !e.target.checked;
                    });
                }
                
                if (option.id === 'mp3-trim') {
                    const trimCheckbox = document.getElementById('mp3-trim');
                    const startInput = document.getElementById('mp3-start');
                    const endInput = document.getElementById('mp3-end');
                    
                    trimCheckbox.addEventListener('change', (e) => {
                        startInput.disabled = !e.target.checked;
                        endInput.disabled = !e.target.checked;
                    });
                }
            });
        }
        
        updateConvertButtonState();
    }
    
    // Create option element based on type
    function createOptionElement(option) {
        const div = document.createElement('div');
        div.className = 'option-item';
        
        if (option.type === 'checkbox') {
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = option.id;
            if (option.checked) input.checked = true;
            
            label.appendChild(input);
            label.appendChild(document.createTextNode(' ' + option.label));
            div.appendChild(label);
        } 
        else if (option.type === 'range') {
            const label = document.createElement('label');
            label.htmlFor = option.id;
            label.textContent = option.label + ': ';
            
            const valueSpan = document.createElement('span');
            valueSpan.id = option.id + '-value';
            valueSpan.textContent = option.value;
            
            const input = document.createElement('input');
            input.type = 'range';
            input.id = option.id;
            input.min = option.min;
            input.max = option.max;
            input.value = option.value;
            
            input.addEventListener('input', () => {
                valueSpan.textContent = input.value;
            });
            
            div.appendChild(label);
            div.appendChild(valueSpan);
            div.appendChild(input);
        }
        else if (option.type === 'select') {
            const label = document.createElement('label');
            label.htmlFor = option.id;
            label.textContent = option.label;
            
            const select = document.createElement('select');
            select.id = option.id;
            
            option.options.forEach(opt => {
                const optionElement = document.createElement('option');
                optionElement.value = opt;
                optionElement.textContent = opt;
                if (opt === option.value) optionElement.selected = true;
                select.appendChild(optionElement);
            });
            
            div.appendChild(label);
            div.appendChild(select);
        }
        else if (option.type === 'number' || option.type === 'text') {
            const label = document.createElement('label');
            label.htmlFor = option.id;
            label.textContent = option.label;
            
            const input = document.createElement('input');
            input.type = option.type;
            input.id = option.id;
            if (option.placeholder) input.placeholder = option.placeholder;
            if (option.disabled) input.disabled = true;
            
            div.appendChild(label);
            div.appendChild(input);
        }
        
        return div;
    }
    
    // Update convert button state based on selections
    function updateConvertButtonState() {
        convertBtn.disabled = !(currentFile && fromFormat.value && toFormat.value);
    }
    
    // Switch between single and batch tabs
    function switchTab(tabId) {
        tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        
        tabContents.forEach(content => {
            content.classList.toggle('active', content.id === tabId + '-tab');
        });
    }
    
    // Switch between format tables
    function switchFormatTab(formatId) {
        formatTabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.format === formatId);
        });
        
        formatTables.forEach(table => {
            table.classList.toggle('active', table.id === formatId + '-format');
        });
    }
    
    // Close all modals
    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }
    
    // Convert button click handler
    convertBtn.addEventListener('click', function() {
        if (!currentFile || !fromFormat.value || !toFormat.value) return;
        
        // Show progress
        fileInfo.style.display = 'none';
        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';
        progressText.textContent = '0%';
        
        // Simulate conversion progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                // Show download modal after a short delay
                setTimeout(() => {
                    downloadModal.classList.add('active');
                }, 500);
            }
            
            progressBar.style.width = progress + '%';
            progressText.textContent = Math.round(progress) + '%';
        }, 300);
    });
    
    // Initialize the app
    init();
});
