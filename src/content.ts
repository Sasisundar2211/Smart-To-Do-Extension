// Content script: Enhanced for contextual analysis
console.log('Smart To-Do content script loaded');

// Function to extract page content for AI analysis
function extractPageContent() {
  return {
    title: document.title,
    url: window.location.href,
    description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
    headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent?.trim()).filter(Boolean),
    mainContent: extractMainContent(),
    selectedText: window.getSelection()?.toString().trim() || '',
    timestamp: new Date().toISOString()
  };
}

// Extract main content from page
function extractMainContent() {
  // Try to find main content areas
  const selectors = ['main', 'article', '[role="main"]', '.content', '#content', '.post', '.entry'];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      return element.textContent?.trim().substring(0, 2000) || ''; // Limit to 2000 chars
    }
  }
  
  // Fallback: get first few paragraphs
  const paragraphs = Array.from(document.querySelectorAll('p'))
    .map(p => p.textContent?.trim())
    .filter(text => text && text.length > 50)
    .slice(0, 3)
    .join(' ');
    
  return paragraphs.substring(0, 2000);
}

// Listen for requests from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_PAGE_CONTENT') {
    sendResponse(extractPageContent());
  }
  return true;
});

(window as any).smartTodo = {
  extractPageContent
};
