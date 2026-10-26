(() => {
  const loader = document.currentScript;
  const id = loader?.dataset.measurementId;
  if (!/^G-[A-Z0-9]{6,20}$/.test(id ?? '')) return;
  const panel = document.querySelector('#analytics-consent');
  const settings = document.querySelector('#analytics-settings');
  if (!panel || !settings) return;

  const key = 'pogromist.analytics-consent.v1';
  const lifetime = 180 * 24 * 60 * 60 * 1000;
  const production = location.protocol === 'https:' && location.origin === loader.dataset.siteOrigin;
  let started = false;
  let choice;
  try {
    const stored = JSON.parse(localStorage.getItem(key));
    if (stored?.expires > Date.now() && ['granted', 'denied'].includes(stored.value)) choice = stored.value;
  } catch { /* The banner also works when storage is unavailable. */ }

  function showPanel(show) {
    panel.hidden = !show;
    settings.setAttribute('aria-expanded', String(show));
  }

  function startAnalytics() {
    // Local previews show the controls but never load Google's tag.
    if (!production || started) return;
    started = true;
    window[`ga-disable-${id}`] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'denied', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied',
    });
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    window.gtag('js', new Date());
    let referrer = '';
    try { referrer = new URL(document.referrer).origin; } catch { /* Direct visit. */ }
    window.gtag('config', id, {
      page_location: location.origin + location.pathname,
      page_referrer: referrer,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_prefix: 'pogromist',
      cookie_domain: location.hostname,
      cookie_expires: lifetime / 1000,
      cookie_flags: 'SameSite=Lax;Secure',
    });
    const tag = document.createElement('script');
    tag.async = true;
    tag.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.append(tag);
  }

  function clearAnalyticsCookies() {
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.trim().split('=')[0];
      if (!name.startsWith('pogromist')) continue;
      for (const domain of ['', `;domain=${location.hostname}`, `;domain=.${location.hostname}`]) {
        document.cookie = `${name}=;max-age=0;path=/${domain};SameSite=Lax;Secure`;
      }
    }
  }

  function choose(value) {
    choice = value;
    try { localStorage.setItem(key, JSON.stringify({ value, expires: Date.now() + lifetime })); } catch {}
    showPanel(false);
    if (value === 'granted') {
      // Reload only when re-enabling an already disabled, previously loaded tag.
      if (started && window[`ga-disable-${id}`]) location.reload();
      else startAnalytics();
    } else {
      window[`ga-disable-${id}`] = true;
      clearAnalyticsCookies();
      // Unload the already running tag after consent is withdrawn.
      if (started) location.reload();
    }
  }

  for (const button of panel.querySelectorAll('[data-analytics-choice]')) {
    button.addEventListener('click', () => choose(button.dataset.analyticsChoice));
  }
  settings.addEventListener('click', () => {
    showPanel(true);
    panel.querySelector('button')?.focus();
  });
  if (choice === 'granted') startAnalytics();
  else showPanel(choice !== 'denied');
})();
