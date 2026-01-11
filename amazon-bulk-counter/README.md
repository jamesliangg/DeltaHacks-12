# Amazon Bulk Counter Extension

A Wxt browser extension that automatically calculates and displays $/count pricing for bulk items on Amazon search results.

## Features

- **Automatic Detection**: Scans Amazon search results for items with quantities (100 pcs, pack of 50, etc.)
- **Smart Pricing**: Calculates per-unit/per-count pricing automatically
- **Non-Intrusive**: Only adds pricing info if not already present
- **Async Processing**: Updates results asynchronously as items are processed
- **Multi-Region Support**: Works on Amazon.ca, Amazon.com, Amazon.co.uk, and many other regional Amazon sites

## Installation

### From Source

1. Clone this repository
2. Navigate to the extension directory:
   ```bash
   cd amazon-bulk-counter
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Build the extension:
   ```bash
   npm run build
   ```
5. Load in your browser:
   - **Chrome/Brave**: Go to `chrome://extensions/`, enable "Developer mode", and click "Load unpacked"
   - **Firefox**: Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on"

## Development

### Dev Mode

Run the extension in development mode with hot reload:

```bash
npm run dev
```

### Build

Build the extension for production:

```bash
npm run build
```

### Create Distribution Zip

Package the extension:

```bash
npm run zip
```

## How It Works

1. The extension runs on Amazon search pages (URLs like `https://www.amazon.ca/s?k=searchquery`)
2. It extracts the product title and price from each search result
3. It looks for quantity indicators (e.g., "100 pcs", "pack of 50", "5x20", etc.)
4. If a quantity is found and the product doesn't already have per-unit pricing, it calculates the $/count
5. The calculated price is injected into the page below the original price with styling

## Supported Quantity Patterns

The extension recognizes:
- `100 pcs`, `100 pieces`
- `pack of 100`
- `100-pack`, `100pack`
- `set of 50`
- Size measurements: `100oz`, `500ml`, `1kg`, etc.
- Alternative formats: `5x20`, `100 items`, `50 units`

## Limitations

- Works on Amazon search result pages
- Requires product titles to contain quantity information
- Prices must be extractable from the price display
- Won't modify products that already have per-unit pricing displayed

## Supported Regions

- amazon.ca (Canada)
- amazon.com (USA)
- amazon.co.uk (UK)
- amazon.de (Germany)
- amazon.fr (France)
- amazon.es (Spain)
- amazon.it (Italy)
- amazon.nl (Netherlands)
- amazon.se (Sweden)
- amazon.pl (Poland)
- amazon.com.br (Brazil)
- amazon.in (India)
- amazon.com.au (Australia)
- amazon.com.mx (Mexico)
- amazon.com.tr (Turkey)
- amazon.ae (UAE)
- amazon.sg (Singapore)
- amazon.jp (Japan)

## License

MIT
