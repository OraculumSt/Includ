let port = null;

function readPage(voiceInfo, speed) {
  const text = document.body.innerText;
  const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];

  sentences.forEach((sentence, index) => {
    const utterance = new SpeechSynthesisUtterance(sentence);

    if (port) {
      const stats = calculateReadingStats(text);
      port.postMessage({
        action: "readingStats",
        stats: stats
      });
    }

    // Assicuriamoci che la velocità sia un numero valido
    const validSpeed = isFinite(speed) ? Math.max(0.1, Math.min(10, speed)) : 1;
    utterance.rate = validSpeed;
    utterance.pitch = 1;

    const voices = speechSynthesis.getVoices();
    const selectedVoice = voices.find(voice => voice.name === voiceInfo.name && voice.lang === voiceInfo.lang);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      if (port) {
        port.postMessage({ currentText: sentence });
      }
    };

    utterance.onend = () => {
      if (index === sentences.length - 1 && port) {
        port.postMessage({ currentText: "Lettura completata" });
      }
    };

    speechSynthesis.speak(utterance);
  });
}

function stopReading() {
  speechSynthesis.cancel();
  if (port) {
    port.postMessage({ currentText: "" });
  }
}

function calculateReadingStats(text) {
  const wordCount = text.trim().split(/\s+/).length;
  const averageWordsPerMinute = 200; // Velocità di lettura media
  const estimatedReadingTimeMinutes = Math.ceil(wordCount / averageWordsPerMinute);

  const sentenceCount = (text.match(/[.!?]+/g) || []).length;

  return {
    wordCount,
    estimatedReadingTimeMinutes,
  };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "readPage") {
    readPage(request.voice, request.speed);
  } else if (request.action === "stopReading") {
    stopReading();
  } else if (request.action === "getReadingStats") {
    const stats = calculateReadingStats(document.body.innerText);
    sendResponse(stats);
  }
});

chrome.runtime.onConnect.addListener((p) => {
  port = p;
  port.onDisconnect.addListener(() => {
    port = null;
  });
});
