// DOM Elements - Generator
const generateTab = document.getElementById('generate-tab');
const scanTab = document.getElementById('scan-tab');
const generatePane = document.getElementById('generate-pane');
const scanPane = document.getElementById('scan-pane');
const contentTypeBtns = document.querySelectorAll('.content-type-btn');
const urlForm = document.getElementById('url-form');
const textForm = document.getElementById('text-form');
const contactForm = document.getElementById('contact-form');
const urlInput = document.getElementById('url-input');
const textInput = document.getElementById('text-input');
const nameInput = document.getElementById('name-input');
const emailInput = document.getElementById('email-input');
const phoneInput = document.getElementById('phone-input');
const companyInput = document.getElementById('company-input');
const qrSizeSelect = document.getElementById('qr-size');
const foregroundColorInput = document.getElementById('foreground-color');
const backgroundColorInput = document.getElementById('background-color');
const generateBtn = document.getElementById('generate-btn');
const qrResult = document.getElementById('qr-result');
const qrCodeContainer = document.getElementById('qr-code-container');
const downloadBtn = document.getElementById('download-btn');
const shareBtn = document.getElementById('share-btn');

// DOM Elements - Scanner
const scannerPlaceholder = document.getElementById('scanner-placeholder');
const scannerVideo = document.getElementById('scanner-video');
const scannerCanvas = document.getElementById('scanner-canvas');
const startCameraBtn = document.getElementById('start-camera');
const stopCameraBtn = document.getElementById('stop-camera');
const scanResult = document.getElementById('scan-result');
const scannedResult = document.getElementById('scanned-result');
const copyResultBtn = document.getElementById('copy-result');
const openResultBtn = document.getElementById('open-result');

// Tab switching
generateTab.addEventListener('click', () => {
    generateTab.classList.add('active');
    scanTab.classList.remove('active');
    generatePane.classList.add('active');
    scanPane.classList.remove('active');
    stopCamera(); // Stop camera when switching tabs
});

scanTab.addEventListener('click', () => {
    scanTab.classList.add('active');
    generateTab.classList.remove('active');
    scanPane.classList.add('active');
    generatePane.classList.remove('active');
});

// Content type switching
contentTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        contentTypeBtns.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');
        
        // Hide all forms
        urlForm.classList.add('hidden');
        textForm.classList.add('hidden');
        contactForm.classList.add('hidden');
        
        // Show selected form
        const type = btn.dataset.type;
        if (type === 'url') {
            urlForm.classList.remove('hidden');
        } else if (type === 'text') {
            textForm.classList.remove('hidden');
        } else if (type === 'contact') {
            contactForm.classList.remove('hidden');
        }
    });
});

// Generate QR Code
generateBtn.addEventListener('click', generateQRCode);

function generateQRCode() {
    // Get active content type
    const activeContentType = document.querySelector('.content-type-btn.active').dataset.type;
    
    // Get QR code content based on content type
    let qrContent = '';
    
    if (activeContentType === 'url') {
        if (!urlInput.value.trim()) {
            alert('Please enter a URL');
            return;
        }
        qrContent = urlInput.value.trim();
        
        // Add http:// if not present
        if (!qrContent.match(/^https?:\/\//i)) {
            qrContent = 'http://' + qrContent;
        }
    } else if (activeContentType === 'text') {
        if (!textInput.value.trim()) {
            alert('Please enter some text');
            return;
        }
        qrContent = textInput.value.trim();
    } else if (activeContentType === 'contact') {
        if (!nameInput.value.trim() || !emailInput.value.trim() || !phoneInput.value.trim()) {
            alert('Please fill in the required fields (Name, Email, Phone)');
            return;
        }
        
        // Generate vCard format
        qrContent = `BEGIN:VCARD
VERSION:3.0
N:${nameInput.value.trim()}
FN:${nameInput.value.trim()}
TEL:${phoneInput.value.trim()}
EMAIL:${emailInput.value.trim()}${companyInput.value.trim() ? '\nORG:' + companyInput.value.trim() : ''}
END:VCARD`;
    }
    
    // Get QR code options
    const size = parseInt(qrSizeSelect.value);
    const foregroundColor = foregroundColorInput.value;
    const backgroundColor = backgroundColorInput.value;
    
    // Clear previous QR code
    qrCodeContainer.innerHTML = '';
    
    // Generate QR code
    QRCode.toCanvas(qrCodeContainer, qrContent, {
        width: size,
        height: size,
        color: {
            dark: foregroundColor,
            light: backgroundColor
        },
        margin: 1
    }, function (error) {
        if (error) {
            console.error(error);
            alert('Error generating QR code. Please try again.');
            return;
        }
        
        // Show QR code result
        qrResult.classList.remove('hidden');
        
        // Setup download button
        setupDownloadButton(qrContent);
        
        // Setup share button
        setupShareButton(qrContent);
    });
}

function setupDownloadButton(qrContent) {
    downloadBtn.addEventListener('click', () => {
        const canvas = qrCodeContainer.querySelector('canvas');
        if (!canvas) return;
        
        // Convert canvas to data URL
        const imageUrl = canvas.toDataURL('image/png');
        
        // Create temporary link
        const tempLink = document.createElement('a');
        tempLink.href = imageUrl;
        tempLink.download = 'qrcode.png';
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
    });
}

function setupShareButton(qrContent) {
    shareBtn.addEventListener('click', async () => {
        const canvas = qrCodeContainer.querySelector('canvas');
        if (!canvas) return;
        
        // Convert canvas to blob
        canvas.toBlob(async (blob) => {
            try {
                if (navigator.share) {
                    const file = new File([blob], 'qrcode.png', { type: 'image/png' });
                    await navigator.share({
                        title: 'QR Code',
                        text: 'Check out this QR code I created!',
                        files: [file]
                    });
                } else {
                    alert('Sharing is not supported on your device/browser');
                }
            } catch (err) {
                console.error('Error sharing: ', err);
                alert('Failed to share. Try downloading instead.');
            }
        }, 'image/png');
    });
}

// QR Code Scanner
let videoStream = null;

startCameraBtn.addEventListener('click', startCamera);
stopCameraBtn.addEventListener('click', stopCamera);

async function startCamera() {
    try {
        // Request camera access
        videoStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        });
        
        // Set video source
        scannerVideo.srcObject = videoStream;
        
        // Hide placeholder and show video
        scannerPlaceholder.style.display = 'none';
        
        // Show stop camera button and hide start camera button
        startCameraBtn.classList.add('hidden');
        stopCameraBtn.classList.remove('hidden');
        
        // Start scanning for QR codes
        scanQRCode();
    } catch (error) {
        console.error('Error accessing camera: ', error);
        alert('Failed to access camera. Please check permissions and try again.');
    }
}

function stopCamera() {
    if (videoStream) {
        // Stop all tracks
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
        
        // Reset video source
        scannerVideo.srcObject = null;
        
        // Show placeholder and hide results
        scannerPlaceholder.style.display = 'flex';
        scanResult.classList.add('hidden');
        
        // Show start camera button and hide stop camera button
        startCameraBtn.classList.remove('hidden');
        stopCameraBtn.classList.add('hidden');
    }
}

function scanQRCode() {
    if (!videoStream) return;
    
    // Set up canvas
    const canvas = scannerCanvas;
    const ctx = canvas.getContext('2d');
    
    // Function to process video frames
    function processFrame() {
        if (!videoStream) return;
        
        // Set canvas dimensions to match video
        canvas.width = scannerVideo.videoWidth;
        canvas.height = scannerVideo.videoHeight;
        
        // Draw video frame to canvas
        ctx.drawImage(scannerVideo, 0, 0, canvas.width, canvas.height);
        
        // Get image data for QR code detection
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Process image data with jsQR
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        // If QR code is detected
        if (code) {
            // Display the result
            scannedResult.textContent = code.data;
            scanResult.classList.remove('hidden');
            
            // Setup copy button
            copyResultBtn.onclick = () => {
                navigator.clipboard.writeText(code.data)
                    .then(() => alert('Copied to clipboard!'))
                    .catch(err => console.error('Failed to copy: ', err));
            };
            
            // Setup open button (only show for URLs)
            if (isValidURL(code.data)) {
                openResultBtn.classList.remove('hidden');
                openResultBtn.onclick = () => {
                    window.open(code.data, '_blank');
                };
            } else {
                openResultBtn.classList.add('hidden');
            }
            
            // Pause scanning
            return;
        }
        
        // Continue scanning
        requestAnimationFrame(processFrame);
    }
    
    // Start processing frames
    processFrame();
}

// Utility function to check if a string is a valid URL
function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Set default values
    urlInput.value = '';
    textInput.value = '';
    nameInput.value = '';
    emailInput.value = '';
    phoneInput.value = '';
    companyInput.value = '';
    
    // Make the URL type active by default
    document.querySelector('[data-type="url"]').click();
});