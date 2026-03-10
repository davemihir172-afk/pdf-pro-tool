const statusElement = document.getElementById('status');
const healthButton = document.getElementById('health-check');

healthButton?.addEventListener('click', async () => {
  try {
    const response = await fetch('/api/upload', { method: 'GET' });
    const contentType = response.headers.get('content-type') || 'text/plain';

    statusElement.classList.remove('hidden');
    statusElement.textContent = `API endpoint check: ${response.status} (${contentType})`;
  } catch (error) {
    statusElement.classList.remove('hidden');
    statusElement.textContent = `Request failed: ${error.message}`;
  }
});
