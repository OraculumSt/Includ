let voices = [];
let port = null;

function populateVoiceList() {
  voices = speechSynthesis.getVoices();
  const voiceSelect = document.getElementById('voiceSelect');
  voiceSelect.innerHTML = '';
  
  voices.forEach((voice, i) => {
    const option = document.createElement('option');
    option.textContent = `${voice.name} (${voice.lang})`;
    option.setAttribute('data-lang', voice.lang);
    option.setAttribute('data-name', voice.name);
    voiceSelect.appendChild(option);
  });
}

populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

// Aggiunta dello slider per la velocità
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');

speedSlider.addEventListener('input', () => {
  const speed = speedSlider.value;
  speedValue.textContent = `${speed}x`;
});

document.getElementById('readPage').addEventListener('click', () => {
  const voiceSelect = document.getElementById('voiceSelect');
  const selectedVoice = voices[voiceSelect.selectedIndex];
  const speed = parseFloat(speedSlider.value);
  
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    port = chrome.tabs.connect(tabs[0].id, {name: "readingChannel"});
    port.onMessage.addListener((msg) => {
      if (msg.currentText) {
        document.getElementById('currentText').textContent = msg.currentText;
      }
    });
    
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "readPage",
      voice: {
        name: selectedVoice.name,
        lang: selectedVoice.lang
      },
      speed: speed
    });
  });
});

document.getElementById('stopReading').addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {action: "stopReading"});
    document.getElementById('currentText').textContent = '';
  });
  if (port) {
    port.disconnect();
  }
});