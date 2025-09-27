const fileInput = document.getElementById("fileInput");
const asciiBlock = document.getElementById("asciiBlock");
const sizeRange = document.getElementById("sizeRange");
const sizeVal = document.getElementById("sizeVal");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const toggleColorBtn = document.getElementById("toggleColorBtn");
const canvas = document.getElementById("hiddenCanvas");
const ctx = canvas.getContext("2d");
const uploadedImage = document.getElementById("uploadedImage");

let colorMode = false;
const asciiChars = "@%#*+=-:. ";

function imageToAscii(img) {
  const maxWidth = 120;
  const aspectRatio = img.height / img.width;
  const newHeight = Math.round(maxWidth * aspectRatio * 0.55);

  canvas.width = maxWidth;
  canvas.height = newHeight;
  ctx.drawImage(img, 0, 0, maxWidth, newHeight);

  const imgData = ctx.getImageData(0, 0, maxWidth, newHeight);
  let ascii = "";

  for (let y = 0; y < newHeight; y++) {
    for (let x = 0; x < maxWidth; x++) {
      const offset = (y * maxWidth + x) * 4;
      const r = imgData.data[offset];
      const g = imgData.data[offset + 1];
      const b = imgData.data[offset + 2];
      const avg = (r + g + b) / 3;
      const charIndex = Math.floor((avg / 255) * (asciiChars.length - 1));
      const char = asciiChars[charIndex];

      if (colorMode) {
        ascii += `<span style="color: rgb(${r},${g},${b})">${char}</span>`;
      } else {
        ascii += char;
      }
    }
    ascii += "\n";
  }

  return ascii;
}

function renderAscii(img) {
  const ascii = imageToAscii(img);
  if (colorMode) {
    asciiBlock.innerHTML = ascii;
  } else {
    asciiBlock.textContent = ascii;
  }
}

fileInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    const img = new Image();
    img.onload = function() {
      uploadedImage.src = img.src;
      uploadedImage.style.display = "block";
      renderAscii(img);
    };
    img.src = evt.target.result;
  };
  reader.readAsDataURL(file);
});

sizeRange.addEventListener("input", () => {
  asciiBlock.style.fontSize = sizeRange.value + "px";
  sizeVal.textContent = sizeRange.value;
});

toggleColorBtn.addEventListener("click", () => {
  colorMode = !colorMode;
  toggleColorBtn.textContent = colorMode ? "🎨 Color Mode: ON" : "🎨 Color Mode: OFF";

  // Re-render ASCII if image is uploaded
  if (uploadedImage.src) {
    const img = new Image();
    img.src = uploadedImage.src;
    img.onload = () => renderAscii(img);
  }
});

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(asciiBlock.textContent);
    copyBtn.textContent = "✅ Copied!";
    setTimeout(() => (copyBtn.textContent = "📋 Copy"), 1500);
  } catch (err) {
    copyBtn.textContent = "⚠️ Failed";
    setTimeout(() => (copyBtn.textContent = "📋 Copy"), 1500);
  }
});

downloadBtn.addEventListener("click", () => {
  const blob = new Blob([asciiBlock.textContent], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ascii_art.txt";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});
