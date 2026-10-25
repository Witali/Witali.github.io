const entries = document.querySelector('#entries');
const button = document.querySelector('#load-more');
const status = document.querySelector('#load-status');
let nextPage = entries.dataset.nextPage;
let pending = null;
let observer;

async function loadMore() {
  if (!nextPage) return;
  if (pending) return pending;
  pending = (async () => {
    button.disabled = true;
    status.textContent = 'Загружаем записи…';
    try {
      const response = await fetch(nextPage);
      if (!response.ok) throw new Error('Could not load posts');
      const page = await response.json();
      // HTML is generated from the same trusted Markdown files as the homepage.
      entries.insertAdjacentHTML('beforeend', page.html);
      nextPage = page.nextPage;
      status.textContent = '';
      if (!nextPage) {
        button.hidden = true;
        observer?.disconnect();
        document.querySelector('.feed-end').hidden = false;
      } else if (observer) {
        // Re-observe so a short batch can fill a viewport that is still near the end.
        observer.unobserve(button);
        observer.observe(button);
      }
    } catch {
      status.textContent = 'Не удалось загрузить записи. Попробуйте ещё раз или откройте архив.';
      observer?.disconnect();
    } finally {
      button.disabled = false;
      pending = null;
    }
  })();
  return pending;
}

if (button && nextPage) {
  button.hidden = false;
  button.addEventListener('click', loadMore);
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((items) => {
      if (items.some((item) => item.isIntersecting)) loadMore();
    }, { rootMargin: '200px' });
    observer.observe(button);
  }
}
