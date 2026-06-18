/* ============================================================
   INOVA ANÁPOLIS — Social Templates Lightbox
   Módulo isolado · zero interferência nas animações existentes
   Animações gerenciadas: apenas modal/lightbox da galeria.
   ============================================================ */
(function () {
  'use strict';

  function init() {
    var modal     = document.getElementById('sct-modal');
    var overlay   = document.getElementById('sct-modal-overlay');
    var closeBtn  = document.getElementById('sct-modal-close');
    var modalImg  = document.getElementById('sct-modal-img');

    if (!modal || !overlay || !closeBtn || !modalImg) return;

    var lastFocused = null;

    /* ---------- ABRIR ---------- */
    function openModal(src, alt) {
      lastFocused = document.activeElement;
      modalImg.src = src;
      modalImg.alt = alt || '';
      modal.classList.add('sct-modal--open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    /* ---------- FECHAR ---------- */
    function closeModal() {
      modal.classList.remove('sct-modal--open');
      document.body.style.overflow = '';
      if (lastFocused) {
        lastFocused.focus();
        lastFocused = null;
      }
      /* Limpa src após animação de saída */
      setTimeout(function () {
        if (!modal.classList.contains('sct-modal--open')) {
          modalImg.src = '';
          modalImg.alt = '';
        }
      }, 380);
    }

    /* ---------- CLICK NOS CARDS (delegação) ---------- */
    document.addEventListener('click', function (e) {
      var card = e.target && typeof e.target.closest === 'function'
        ? e.target.closest('.sct-card')
        : null;
      if (!card) return;
      var img = card.querySelector('.sct-card__img');
      if (!img) return;
      openModal(img.src, img.alt);
    });

    /* ---------- TECLADO NOS CARDS (Enter / Espaço) ---------- */
    document.addEventListener('keydown', function (e) {
      var key = e.key;
      var code = e.keyCode;
      if (key !== 'Enter' && key !== ' ' && code !== 13 && code !== 32) return;
      var focused = document.activeElement;
      if (!focused || !focused.classList.contains('sct-card')) return;
      e.preventDefault();
      var img = focused.querySelector('.sct-card__img');
      if (!img) return;
      openModal(img.src, img.alt);
    });

    /* ---------- FECHAR: overlay ---------- */
    overlay.addEventListener('click', closeModal);

    /* ---------- FECHAR: botão × ---------- */
    closeBtn.addEventListener('click', closeModal);

    /* ---------- FECHAR: ESC ---------- */
    document.addEventListener('keydown', function (e) {
      if (!modal.classList.contains('sct-modal--open')) return;
      if (e.key === 'Escape' || e.keyCode === 27) {
        closeModal();
      }
    });
  }

  /* Boot seguro */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
