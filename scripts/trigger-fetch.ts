async function trigger() {
  try {
    const response = await fetch('http://localhost:3000/api/cron/fetch-news', {
      method: 'POST'
    });
    console.log('Fetch news triggered:', await response.json());
  } catch (error) {
    console.error('Failed to trigger news fetch:', error);
  }
}
trigger();
