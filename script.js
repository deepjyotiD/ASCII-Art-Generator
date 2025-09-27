const fileInput = document.getElementById("fileInput");
const asciiBlock = document.getElementById("asciiBlock");
const sizeRange = document.getElementById("sizeRange");
const sizeVal = document.getElementById("sizeVal");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const toggleColorBtn = document.getElementById("toggleColorBtn");
const canvas = document.getElementById("hiddenCanvas");
const ctx = canvas.getContext("2d");
const charsetInput = document.getElementById("charsetInput");
const resRange = document.getElementById("resRange");
const fontSelect = document.getElementById("fontSelect");
const saveImageBtn = document.getElementById("saveImageBtn");
const loader = document.getElementById("loader");

let colorMode = false;

// Convert image to ASCII
function imageToAscii(img) {
    loader.style.display = "block";
    const maxWidth = 120;
    const aspect = img.height / img.width;
    const maxHeight = Math.round(maxWidth * aspect * 0.55);
    const resolution = parseInt(resRange.value);
    const chars = charsetInput.value || "@%#*+=-:. ";

    canvas.width = maxWidth;
    canvas.height = maxHeight;
    ctx.drawImage(img, 0, 0, maxWidth, maxHeight);
    const data = ctx.getImageData(0, 0, maxWidth, maxHeight).data;

    let ascii = "";
    for (let y = 0; y < maxHeight; y += resolution) {
        for (let x = 0; x < maxWidth; x += resolution) {
            const i = (y * maxWidth + x) * 4;
            const r = data[i], g = data[i+1], b = data[i+2];
            const avg = (r + g + b) / 3;
            const char = chars[Math.floor((avg / 255) * (chars.length - 1))];
            if(colorMode) ascii += `<span style="color: rgb(${r},${g},${b})">${char}</span>`;
            else ascii += char;
        }
        ascii += "\n";
    }
    loader.style.display = "none";
    return ascii;
}

// Render ASCII
function renderAscii(img) {
    asciiBlock.innerHTML = imageToAscii(img);
    asciiBlock.style.fontSize = sizeRange.value + "px";
    asciiBlock.style.fontFamily = fontSelect.value;
}

// File upload
fileInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
        const img = new Image();
        img.onload = () => renderAscii(img);
        img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
});

// Font size
sizeRange.addEventListener("input", () => {
    sizeVal.textContent = sizeRange.value;
    asciiBlock.style.fontSize = sizeRange.value + "px";
});

// Charset / resolution / font selection
[charsetInput, resRange, fontSelect].forEach(el => {
    el.addEventListener("input", () => {
        const img = new Image();
        img.src = canvas.toDataURL();
        img.onload = () => renderAscii(img);
    });
});

// Color toggle
toggleColorBtn.addEventListener("click", () => {
    colorMode = !colorMode;
    toggleColorBtn.textContent = colorMode ? "🎨 Color Mode: ON" : "🎨 Color Mode: OFF";
    const img = new Image();
    img.src = canvas.toDataURL();
    img.onload = () => renderAscii(img);
});

// Copy ASCII
copyBtn.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(asciiBlock.textContent);
        copyBtn.textContent = "✅ Copied!";
        setTimeout(()=>copyBtn.textContent="📋 Copy",1500);
    } catch {
        copyBtn.textContent = "⚠️ Failed";
        setTimeout(()=>copyBtn.textContent="📋 Copy",1500);
    }
});

// Download TXT
downloadBtn.addEventListener("click", () => {
    const blob = new Blob([asciiBlock.textContent], {type:"text/plain;charset=utf-8"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ascii_art.txt";
    a.click();
    URL.revokeObjectURL(a.href);
});

// Save PNG from ASCII
saveImageBtn.addEventListener("click", () => {
    const ascii = asciiBlock.innerText;
    const lines = ascii.split("\n");
    const fontSizePx = parseInt(sizeRange.value);
    canvas.width = Math.max(...lines.map(l=>l.length)) * fontSizePx * 0.6;
    canvas.height = lines.length * fontSizePx;
    ctx.fillStyle = "#000";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.font = `${fontSizePx}px ${fontSelect.value}`;
    ctx.fillStyle = "#fff";
    lines.forEach((line, i) => ctx.fillText(line, 0, (i+1) * fontSizePx));
    const link = document.createElement("a");
    link.href = canvas.toDataURL();
    link.download = "ascii_art.png";
    link.click();
});
