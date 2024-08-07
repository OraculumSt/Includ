document.addEventListener('DOMContentLoaded', function() {
  const sectionSelect = document.getElementById('sectionSelect');
  const highContrastBtn = document.getElementById('highContrastBtn');
  const normalContrastBtn = document.getElementById('normalContrastBtn');

  sectionSelect.addEventListener('change', function() {
    showSection(this.value);
  });

  highContrastBtn.addEventListener('click', function() {
    setContrast('high');
  });

  normalContrastBtn.addEventListener('click', function() {
    setContrast('normal');
  });

  window.showSection = function(sectionId) {
    document.getElementById('readerSection').classList.add('hidden');
    document.getElementById('contrastSection').classList.add('hidden');
    document.getElementById(sectionId).classList.remove('hidden');
  };

  window.setContrast = function(level) {
    if (level === 'high') {
      document.body.style.backgroundColor = 'black';
      document.body.style.color = 'white';
    } else {
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    }
  };

  // Initialize with the reader section shown
  showSection('readerSection');
});