(() => {
  const slots = {
    header: '/ads/header-ad.html',
    sidebar: '/ads/sidebar-ad.html',
    inline: '/ads/inline-ad.html',
    footer: '/ads/footer-ad.html'
  };

  const hydrateSlot = async (node) => {
    const type = node.getAttribute('data-ad-slot');
    const url = slots[type];
    if (!url) return;

    try {
      const response = await fetch(url, { credentials: 'same-origin' });
      if (!response.ok) return;
      node.innerHTML = await response.text();

      if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
        const adNodes = node.querySelectorAll('.adsbygoogle');
        adNodes.forEach(() => window.adsbygoogle.push({}));
      }
    } catch (_) {
      // Fail silently so ads never block UX
    }
  };

  window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-ad-slot]').forEach((node) => {
      hydrateSlot(node);
    });
  });
})();
