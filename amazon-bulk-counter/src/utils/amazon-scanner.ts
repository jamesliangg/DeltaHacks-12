/**
 * Regex patterns to detect quantity/bulk indicators in product titles and descriptions
 */
const QUANTITY_PATTERNS = [
  // Exact quantity patterns
  /(\d+)\s*(?:pcs?|pieces?|pack|count|qty|quantity|units?)/gi,
  /(?:pack|box|case|bundle)\s+(?:of\s+)?(\d+)/gi,
  /(\d+)-?(?:pack|piece|count)/gi,
  /(?:set|lot)\s+of\s+(\d+)/gi,
  
  // Bulk size patterns (bottles, cans, etc.)
  /(\d+)\s*(?:oz|ml|g|kg|lb|lbs|mg)/gi,
  
  // Alternative patterns
  /x(\d+)/gi, // like "5x10"
  /(\d+)\s+(?:items?|products?|units?)/gi,
];

/**
 * Extract quantity from text
 */
export function extractQuantity(text: string): number | null {
  if (!text) return null;
  
  for (const pattern of QUANTITY_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const quantity = parseInt(match[1], 10);
      // Only consider quantities that make sense (between 2 and 100000)
      if (quantity >= 2 && quantity <= 100000) {
        console.log(`   ✓ Found quantity: ${quantity} (from pattern: ${pattern})`);
        return quantity;
      }
    }
  }
  
  console.log(`   ✗ No quantity pattern matched`);
  return null;
}

/**
 * Extract price from text (returns in cents to avoid floating point issues)
 */
export function extractPrice(text: string): number | null {
  if (!text) return null;
  
  // Match currency symbols and amounts
  const priceMatch = text.match(/[$€£¥₹]?\s*(\d+[.,]\d{2})\s*(?:CAD|USD|EUR|GBP)?/);
  if (priceMatch) {
    const priceStr = priceMatch[1].replace(',', '.');
    const price = parseFloat(priceStr);
    if (!isNaN(price) && price > 0) {
      const cents = Math.round(price * 100);
      console.log(`   ✓ Found price: $${price.toFixed(2)} (${cents} cents)`);
      return cents;
    }
  }
  
  console.log(`   ✗ Could not extract price from: "${text}"`);
  return null;
}

/**
 * Format price for display
 */
export function formatPrice(centAmount: number, currencySymbol: string = '$'): string {
  const dollars = centAmount / 100;
  return `${currencySymbol}${dollars.toFixed(2)}`;
}

/**
 * Check if element already has $/count or per unit pricing
 */
export function hasExistingPerUnitPricing(productDiv: HTMLElement): boolean {
  // Check in the entire product div for /count pattern
  const text = productDiv.textContent || '';
  
  // Amazon's native per-unit format: /count)
  if (text.includes('/count)') || text.includes('/count ')) {
    return true;
  }
  
  // Check for common per-unit indicators
  const perUnitPatterns = [
    /\$[\d.]+\s*\/\s*(?:count|pc|piece|unit|item|oz|ml|g|kg|lb)/i,
    /per\s+(?:count|pc|piece|unit|item|oz|ml|g|kg|lb)/i,
  ];
  
  return perUnitPatterns.some(pattern => pattern.test(text));
}

/**
 * Main function to scan and update Amazon search results
 */
export async function scanAmazonResults() {
  console.log('🔍 Amazon Bulk Counter: Starting scan...');
  
  // Find all product containers on Amazon search results
  const productDivs = document.querySelectorAll('div[data-component-type="s-search-result"]');
  
  console.log(`📦 Found ${productDivs.length} products on this page`);
  
  if (productDivs.length === 0) {
    console.log('⚠️ No products found with selector [data-component-type="s-search-result"]');
    return;
  }
  
  productDivs.forEach((productDiv, index) => {
    processProduct(productDiv as HTMLElement, index);
  });
}

/**
 * Process individual product
 */
function processProduct(productDiv: HTMLElement, index: number = 0) {
  try {
    // Skip if already processed
    if (productDiv.querySelector('[data-bulk-counter-processed]')) {
      console.log(`⏭️  Product ${index}: Already processed, skipping`);
      return;
    }
    
    // Check if already has per-unit pricing (skip early)
    if (hasExistingPerUnitPricing(productDiv)) {
      console.log(`⏭️  Product ${index}: Already has per-unit pricing, skipping`);
      return;
    }
    
    // Get product title - look for h2 span
    const titleElement = productDiv.querySelector('h2 span');
    if (!titleElement) {
      console.log(`⏭️  Product ${index}: No title element found`);
      return;
    }
    
    const title = titleElement.textContent || '';
    console.log(`📝 Product ${index}: "${title.substring(0, 50)}..."`);
    
    // Get price element - look for .a-price
    const priceElement = productDiv.querySelector('[data-a-color="base"] .a-price');
    if (!priceElement) {
      console.log(`⏭️  Product ${index}: No price element found`);
      return;
    }
    
    // Get the full price text including symbol
    const priceText = priceElement.textContent || '';
    console.log(`💰 Product ${index}: Price text = "${priceText}"`);
    
    // Extract quantity and price
    const quantity = extractQuantity(title);
    const price = extractPrice(priceText);
    
    console.log(`📊 Product ${index}: Quantity=${quantity}, Price=${price}`);
    
    // Only proceed if we found a quantity and price
    if (quantity && price) {
      const pricePerUnit = price / quantity;
      const currencySymbol = priceText.match(/[\$€£¥₹]/)?.[0] || '$';
      
      console.log(`✅ Product ${index}: Calculated ${currencySymbol}${(pricePerUnit / 100).toFixed(2)}/count`);
      
      // Create and inject the per-unit price element
      injectPerUnitPrice(productDiv, pricePerUnit, quantity, currencySymbol);
      
      // Mark as processed
      productDiv.setAttribute('data-bulk-counter-processed', 'true');
    } else {
      console.log(`⏭️  Product ${index}: Could not extract quantity or price`);
    }
  } catch (error) {
    console.error(`❌ Product ${index}: Error processing product:`, error);
  }
}

/**
 * Inject the calculated per-unit price into the DOM
 */
function injectPerUnitPrice(
  productDiv: HTMLElement,
  pricePerUnit: number,
  quantity: number,
  currencySymbol: string
) {
  // Find the price container with the main price
  const priceContainer = productDiv.querySelector('[data-a-color="base"] .a-price');
  if (!priceContainer) return;
  
  // Find or create a section for secondary pricing info
  let secondarySection = productDiv.querySelector('.bulk-counter-secondary');
  
  if (!secondarySection) {
    secondarySection = document.createElement('span');
    secondarySection.className = 'a-size-base a-color-secondary bulk-counter-secondary';
    secondarySection.style.cssText = `
      display: block;
      margin-top: 4px;
    `;
    
    // Insert after the price container's parent
    const priceParent = priceContainer.closest('.a-row');
    if (priceParent && priceParent.parentNode) {
      priceParent.parentNode.insertBefore(secondarySection, priceParent.nextSibling);
    }
  }
  
  // Create the per-unit price display
  const priceDisplay = document.createElement('span');
  priceDisplay.className = 'bulk-counter-info';
  
  const openParen = document.createTextNode('(');
  const priceSpan = document.createElement('span');
  priceSpan.className = 'a-price a-text-price';
  priceSpan.style.cssText = `
    font-weight: 500;
  `;
  const offscreenPrice = document.createElement('span');
  offscreenPrice.className = 'a-offscreen';
  offscreenPrice.textContent = formatPrice(Math.round(pricePerUnit), currencySymbol);
  const visiblePrice = document.createElement('span');
  visiblePrice.setAttribute('aria-hidden', 'true');
  visiblePrice.textContent = formatPrice(Math.round(pricePerUnit), currencySymbol);
  
  priceSpan.appendChild(offscreenPrice);
  priceSpan.appendChild(visiblePrice);
  
  const perCountLabel = document.createTextNode('/count');
  const quantityInfo = document.createTextNode(` - ${quantity} qty)`);
  
  priceDisplay.appendChild(openParen);
  priceDisplay.appendChild(priceSpan);
  priceDisplay.appendChild(perCountLabel);
  priceDisplay.appendChild(quantityInfo);
  
  // Clear previous content and add new
  secondarySection.innerHTML = '';
  secondarySection.appendChild(priceDisplay);
}
