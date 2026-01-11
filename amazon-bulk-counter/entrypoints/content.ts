export default defineContentScript({
  matches: [
    'https://www.amazon.ca/s*',
    'https://www.amazon.com/s*',
    'https://www.amazon.co.uk/s*',
    'https://www.amazon.de/s*',
    'https://www.amazon.fr/s*',
    'https://www.amazon.es/s*',
    'https://www.amazon.it/s*',
    'https://www.amazon.nl/s*',
    'https://www.amazon.se/s*',
    'https://www.amazon.pl/s*',
    'https://www.amazon.com.br/s*',
    'https://www.amazon.in/s*',
    'https://www.amazon.com.au/s*',
    'https://www.amazon.com.mx/s*',
    'https://www.amazon.com.tr/s*',
    'https://www.amazon.ae/s*',
    'https://www.amazon.sg/s*',
    'https://www.amazon.jp/s*',
  ],
  async main() {
    // Import the scanner function
    const { scanAmazonResults } = await import('../src/utils/amazon-scanner');
    
    // Initial scan
    scanAmazonResults();
    
    // Set up observer to handle dynamically loaded products (debounced)
    let debounceTimer: number | undefined;
    const observer = new MutationObserver(() => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = setTimeout(() => {
        scanAmazonResults();
      }, 200) as unknown as number;
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });
  },
});
