/* ============================================================
   INOVA ANÁPOLIS — Slides Templates Modal
   Módulo isolado · iframe fullscreen para apresentações
   ============================================================ */
(function () {
  'use strict';

  var lastFocused = null;

  function getEls() {
    return {
      modal: document.getElementById('slt-modal'),
      overlay: document.getElementById('slt-modal-overlay'),
      closeBtn: document.getElementById('slt-modal-close'),
      iframe: document.getElementById('slt-modal-iframe')
    };
  }

  function openModal(src) {
    var els = getEls();
    if (!els.modal || !els.closeBtn || !els.iframe) return;

    lastFocused = document.activeElement;
    els.iframe.src = new URL(src, document.baseURI).href;
    els.modal.classList.add('slt-modal--open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () {
      if (els.closeBtn) els.closeBtn.focus();
    }, 60);
  }

  function closeModal() {
    var els = getEls();
    if (!els.modal || !els.iframe) return;

    els.modal.classList.remove('slt-modal--open');
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
      lastFocused = null;
    }

    setTimeout(function () {
      var currentEls = getEls();
      if (currentEls.modal && !currentEls.modal.classList.contains('slt-modal--open')) {
        currentEls.iframe.src = 'about:blank';
      }
    }, 380);
  }

  window.sltClose = closeModal;

  function init() {
    document.addEventListener('click', function (e) {
      var target = e.target && typeof e.target.closest === 'function'
        ? e.target.closest('.slt-card__btn, #slt-modal-close, #slt-modal-overlay')
        : null;

      if (!target) return;

      if (target.classList.contains('slt-card__btn')) {
        var src = target.getAttribute('data-slide-src');
        if (!src) return;
        openModal(src);
        return;
      }

      if (target.id === 'slt-modal-close' || target.id === 'slt-modal-overlay') {
        closeModal();
      }
    });

    document.addEventListener('keydown', function (e) {
      var els = getEls();
      if (!els.modal || !els.modal.classList.contains('slt-modal--open')) return;
      if (e.key === 'Escape' || e.keyCode === 27) {
        closeModal();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
