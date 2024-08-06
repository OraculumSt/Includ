function readPage(voiceInfo) {
    const text = document.body.innerText;
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Impostazioni per migliorare la fluidità
    utterance.rate = 0.9; // Velocità leggermente più lenta per maggiore chiarezza
    utterance.pitch = 1; // Pitch normale
    
    // Seleziona la voce specificata
    const voices = speechSynthesis.getVoices();
    const selectedVoice = voices.find(voice => voice.name === voiceInfo.name && voice.lang === voiceInfo.lang);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    // Dividi il testo in frasi per una lettura più naturale
    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g);
    if (sentences) {
      sentences.forEach((sentence) => {
        const sentenceUtterance = new SpeechSynthesisUtterance(sentence);
        sentenceUtterance.voice = utterance.voice;
        sentenceUtterance.rate = utterance.rate;
        sentenceUtterance.pitch = utterance.pitch;
        speechSynthesis.speak(sentenceUtterance);
      });
    } else {
      speechSynthesis.speak(utterance);
    }
  }
  
  function stopReading() {
    speechSynthesis.cancel();
  }
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "readPage") {
      readPage(request.voice);
    } else if (request.action === "stopReading") {
      stopReading();
    }
  });


  let port = null;

function readPage(voiceInfo) {
  const text = document.body.innerText;
  const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
  
  sentences.forEach((sentence, index) => {
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    const voices = speechSynthesis.getVoices();
    const selectedVoice = voices.find(voice => voice.name === voiceInfo.name && voice.lang === voiceInfo.lang);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.onstart = () => {
      if (port) {
        port.postMessage({currentText: sentence});
      }
    };
    
    utterance.onend = () => {
      if (index === sentences.length - 1 && port) {
        port.postMessage({currentText: "Lettura completata"});
      }
    };
    
    speechSynthesis.speak(utterance);
  });
}

function stopReading() {
  speechSynthesis.cancel();
  if (port) {
    port.postMessage({currentText: ""});
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "readPage") {
    readPage(request.voice);
  } else if (request.action === "stopReading") {
    stopReading();
  }
});

chrome.runtime.onConnect.addListener((p) => {
  port = p;
  port.onDisconnect.addListener(() => {
    port = null;
  });
});