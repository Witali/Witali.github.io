export function analyticsId(value = '') {
  const id = value.trim();
  if (id && !/^G-[A-Z0-9]{6,20}$/.test(id)) {
    throw new Error('GA4_MEASUREMENT_ID must be a public GA4 measurement ID (G-...), not an API key or secret');
  }
  return id;
}

export function analyticsScript(id, basePath, siteUrl) {
  if (!id) return '';
  return `<script src="${basePath}/assets/analytics.js" data-measurement-id="${analyticsId(id)}" data-site-origin="${new URL(siteUrl).origin}" defer></script>`;
}

export function analyticsConsent(id, basePath) {
  if (!id) return '';
  return `<section class="analytics-consent" id="analytics-consent" aria-labelledby="analytics-consent-title" hidden>
    <h2 id="analytics-consent-title">Статистика посещений</h2>
    <p>Разрешить Google Analytics собирать статистику посещений и действий на сайте с использованием cookies? <a href="${basePath}/privacy.html">Подробнее</a></p>
    <div class="analytics-actions"><button type="button" data-analytics-choice="granted">Разрешить</button><button type="button" data-analytics-choice="denied">Отклонить</button></div>
  </section>`;
}
