import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/auto-icons'],
  manifest: {
    name: 'Amazon Bulk Counter',
    description: 'Automatically calculates and displays $/count for bulk items on Amazon search results',
    permissions: ['scripting', 'activeTab'],
    host_permissions: [
      'https://www.amazon.ca/*',
      'https://www.amazon.com/*',
      'https://www.amazon.co.uk/*',
      'https://www.amazon.de/*',
      'https://www.amazon.fr/*',
      'https://www.amazon.es/*',
      'https://www.amazon.it/*',
      'https://www.amazon.nl/*',
      'https://www.amazon.se/*',
      'https://www.amazon.pl/*',
      'https://www.amazon.com.br/*',
      'https://www.amazon.in/*',
      'https://www.amazon.com.au/*',
      'https://www.amazon.com.mx/*',
      'https://www.amazon.com.tr/*',
      'https://www.amazon.ae/*',
      'https://www.amazon.sg/*',
      'https://www.amazon.jp/*'
    ]
  }
});
