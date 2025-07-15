// DOM elements
const offersGrid = document.getElementById('offers-grid');
//const cardFilter = document.getElementById('card-filter');
const sortOptions = document.getElementById('sort-options');
const searchBox = document.getElementById('offer-search');
const refreshOffersButton = document.getElementById('refresh-offers');
const signinButton = document.getElementById('signin-button');
const activeOffersElement = document.getElementById('active-offers');
const collectedOffersElement = document.getElementById('collected-offers');
const activatedOffersElement = document.getElementById('offers-activated');
const redeemedOffersElement = document.getElementById('redeemed-offers');
const expiredOffersElement = document.getElementById('offers-expired');
const buttonAdvancedFilter = document.getElementById('advanced-filters-toggle');
const onlineFilter = document.getElementById('location-online');
const footer = document.getElementById('footer');
const version = chrome.runtime.getManifest().version;
footer.textContent = `GetCashback.ai v${version} - Your Cashback Copilot`;

// Global variables
let allOffers = [];
let cards = [];
let currentFilter = 'all';
let currentSearch = '';

document.addEventListener('DOMContentLoaded', () => {
  validateClientID()
    .then(() => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('debugmode')) {
        // Show the AI Summary link if in debug mode
        document.getElementById('ai-summary').style.display = '';
        document.getElementById('deduplicate-offers').style.display = '';
      }
      // Load all offers when page loads
      // Add this with your other event listeners
      document.getElementById('clear-storage').addEventListener('click', function () {
        if (confirm('Are you sure you want to clear all stored offers? This action cannot be undone.')) {
          clearLocalStorage();
        }
      });

      document.getElementById('help').addEventListener('click', function () {
        window.open("https://www.reddit.com/r/GetCashback/", "_blank");
      });

      document.getElementById('privacy').addEventListener('click', function () {
        window.open(`https://api.getcashback.ai/tos/${version}.html`, "_blank");
      });

      // Add event listener for signin button - simple alert instead of HTML modification
      document.getElementById('signin-button').addEventListener('click', function () {
        alert('Cloud sync feature coming soon!');
      });

      // Analyze link click event
      document.getElementById('analyze').addEventListener('click', (event) => {
        event.preventDefault();
        showAnalyzeView();
        setActiveNavLink('analyze');
      });

      // Start analyze button click event
      document.getElementById('start-analyze-button').addEventListener('click', () => {
        document.getElementById('analyze-container').classList.remove('analysis-complete');
        document.getElementById('category-breakdown-container').style.display = 'none';
        runAnalysis();
      });

      // Mark all offers as redeemed button click event
      const markRedeemedButton = document.getElementById('mark-all-redeemed-button');
      if (markRedeemedButton) {
        markRedeemedButton.addEventListener('click', markOffersAsRedeemed);
      }

      // Add event listeners for range inputs
      document.getElementById('min-spend-min').addEventListener('input', updateCurrentView);
      document.getElementById('min-spend-max').addEventListener('input', updateCurrentView);
      document.getElementById('max-cashback-min').addEventListener('input', updateCurrentView);
      document.getElementById('max-cashback-max').addEventListener('input', updateCurrentView);
      document.getElementById('status-expired').addEventListener('change', updateCurrentView);
      document.getElementById('status-redeemed').addEventListener('change', updateCurrentView);
      document.getElementById('location-online').addEventListener('change', updateCurrentView);
      document.getElementById('location-in-store').addEventListener('change', updateCurrentView);
      document.getElementById('type-cashback').addEventListener('change', updateCurrentView);
      document.getElementById('type-discount').addEventListener('change', updateCurrentView);
      document.getElementById('type-points').addEventListener('change', updateCurrentView);

      // Update the loadAllOffers callback to show the right view
      loadAllOffers(function () {
        // This callback runs after offers are loaded

        // Load the last active view from localStorage
        const lastActiveView = localStorage.getItem('activeView') || 'home';

        // Set the appropriate view based on saved state
        if (lastActiveView === 'hunt-offers') {
          showHuntOffersView();
          setActiveNavLink('hunt-offers');
        } else if (lastActiveView === 'redeem') {
          showRedeemView();
          setActiveNavLink('redeem');
        } else if (lastActiveView === 'analyze') {
          showAnalyzeView();
          setActiveNavLink('analyze');
        } else if (lastActiveView === 'ai-summary') {
          showAISummaryView();
          setActiveNavLink('ai-summary');
        } else {
          // Default to home view
          showOffersView();
          setActiveNavLink('home');
        }
      });

      // Rest of the event listeners remain the same
      sortOptions.addEventListener('change', () => {
        currentSort = sortOptions.value;
        // Check which view is currently active and update accordingly
        updateCurrentView();
      });

      searchBox.addEventListener('input', () => {
        const clearButton = document.getElementById('search-clear');
        clearButton.style.display = searchBox.value ? 'block' : 'none';

        clearButton.addEventListener('click', function () {
          searchBox.value = '';
          searchBox.focus();
          clearButton.style.display = 'none';
          updateCurrentView();
        });

        currentSearch = searchBox.value.toLowerCase();
        // Check which view is currently active and update accordingly
        updateCurrentView();
      });

      // Home link click event
      document.getElementById('home').addEventListener('click', (event) => {
        event.preventDefault();
        showOffersView();
        setActiveNavLink('home');
      });

      // Hunt Offers link click event
      document.getElementById('hunt-offers').addEventListener('click', (event) => {
        event.preventDefault();
        showHuntOffersView();
        setActiveNavLink('hunt-offers');
      });

      // AI Summary link click event
      document.getElementById('ai-summary').addEventListener('click', (event) => {
        event.preventDefault();
        showAISummaryView();
        setActiveNavLink('ai-summary');
      });

      // Map view link click event
      document.getElementById('redeem').addEventListener('click', (event) => {
        event.preventDefault();
        showRedeemView();
        setActiveNavLink('redeem');
      });

      const leftColumn = document.querySelector('.left-column');

      if (leftColumn) {
        // Create the collapse arrow
        const collapseArrow = document.createElement('div');
        collapseArrow.className = 'collapse-arrow';
        leftColumn.appendChild(collapseArrow);

        // Add click handler
        collapseArrow.addEventListener('click', function () {
          leftColumn.classList.toggle('collapsed');

          // Save state to localStorage
          localStorage.setItem('leftColumnCollapsed', leftColumn.classList.contains('collapsed'));
        });

        // Check if previously collapsed
        if (localStorage.getItem('leftColumnCollapsed') === 'true') {
          leftColumn.classList.add('collapsed');
        }

        // Add spans to nav links for better control when collapsed
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
          const text = link.textContent.trim();
          link.innerHTML = `<span>${text}</span>`;
        });
      }


      // Update storage info
      updateStorageInfo();

      populateFilterDropdowns();

      // Make sure to call this after loading offers
      setTimeout(updateCurrentView, 500);
    })
    .catch(error => {
      console.error('Client validation failed:', error);
      // The validateClientID function will already show the Terms of Service modal
      // if validation fails, so we don't need to do anything else here
    });
});

// Load all offers from storage
function loadAllOffers(callback) {
  chrome.storage.local.get(null, function (result) {
    allOffers = [];
    cards = ['all'];
    let totalActive = 0;
    let totalCollected = 0;
    let totalActivated = 0;
    let totalRedeemed = 0;
    let totalExpired = 0;

    // Process all stored data
    for (const key in result) {
      if (key.includes('offercontainer_processed') && key != "offercontainer_processed") {
        const offerData = result[key];

        if (offerData && offerData.offers && offerData.offers.length > 0) {
          // Add card to filter options if not already present
          if (offerData.card && !cards.includes(offerData.card)) {
            cards.push(offerData.card);
          }

          // Process each offer
          offerData.offers.forEach(offer => {
            // Add bank and card info to each offer
            const enrichedOffer = {
              ...offer,
              bank: offerData.bank || 'Unknown Bank',
              card: offerData.card || 'Unknown Card',
              lastUpdated: offer.lastUpdated || new Date().toISOString() // Add lastUpdated if missing
            };

            allOffers.push(enrichedOffer);

            // Update counters
            totalCollected++;
            if (offer.activated) totalActivated++;
            if (offer.redeemed) totalRedeemed++;

            // Check if offer is expired
            if (new Date(offer.expiration) < new Date(new Date().toDateString())) {
              totalExpired++;
            }
          });

          totalActive += offerData.totalOffers || 0;
        }
      }
    }

    // Calculate total value
    const totalValue = calculateTotalValue(allOffers);
    console.log('Total Value:', totalValue);
    document.getElementById('total-value').textContent = `$${totalValue.toFixed(2)}`;
    getTotalEarned().then(totalEarned => {
      document.getElementById('earning').textContent = `$${totalEarned.toFixed(2)}`;
    });

    // Update stats
    activeOffersElement.textContent = totalActive;
    collectedOffersElement.textContent = totalCollected;
    activatedOffersElement.textContent = totalActivated;
    redeemedOffersElement.textContent = totalRedeemed;
    expiredOffersElement.textContent = totalExpired;

    // If a callback was provided, call it now that offers are loaded
    if (typeof callback === 'function') {
      callback();
    } else {
      // Otherwise just display offers based on current view
      updateCurrentView();
    }
  });
}

// Calculate total value from all offers
function calculateTotalValue(offers) {
  return offers.reduce((total, offer) => total + (parseFloat(offer.estValue) || 0), 0);
}

// Create offer card element
function createOfferCard(offer) {
  const offerCard = document.createElement('div');
  offerCard.className = 'offer-card';
  offerCard.style.position = 'relative';

  // Add delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-offer-btn';
  deleteBtn.textContent = '×';
  deleteBtn.title = 'Remove offer';
  deleteBtn.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent card click event
    confirmDeleteOffer(offer);
  });
  offerCard.appendChild(deleteBtn);

  // Clone the template for offer cards (not AI summary cards)
  const template = document.getElementById('offer-card-template');
  const clone = template.content.cloneNode(true);

  // Use shared functions to extract and format data
  if (!offer.expiration && offer.description) {
    offer.expiration = extractExpiryDateFromDescription(offer.description);
  }

  // Format expiry date using shared function
  const expiryText = formatExpiryDate(getExpiryDate(offer));

  // Extract minimum spend and maximum cashback using shared functions
  let minSpend = offer.minSpend || extractMinSpendFromDescription(offer.description) || '';
  let maxCashback = offer.maxCashback || extractMaxCashbackFromDescription(offer.description) || '';

  // Assess cashback ease
  const easeAssessment = assessCashbackEase(offer);

  // Fill in the template with offer data
  clone.querySelector('.offer-card-name').textContent = offer.card;
  clone.querySelector('.offer-logo').src = offer.logo;
  clone.querySelector('.offer-logo').alt = offer.merchantName;
  clone.querySelector('.offer-merchant').textContent = offer.merchantName || 'Unknown Merchant';

  // Calculate and display estimated value if the element exists
  const valueElement = clone.querySelector('.offer-value');
  if (valueElement) {
    // Use the estimateValue function and handle the promise
    estimateValue(offer).then(value => {
      // Format the value with dollar sign and 2 decimal places
      valueElement.textContent = value > 0 ? `(Est. $${value.toFixed(2)} for you)` : '(No est. value)';
    });
  }

  // Format cashback amount to include max cashback if it exists
  let cashbackDisplay = displayCashbackAmount(parseCashbackAmount(offer));
  const amountElement = clone.querySelector('.offer-amount');
  amountElement.textContent = cashbackDisplay;

  // Add redeem button if link is available - UPDATED to match hunt-button implementation
  const redeemButtonContainer = clone.querySelector('.redeem-button-container');
  const redeemLink = getRedeemLink(offer) || offer.merchantWebsite;
  if (redeemLink) {
    // Create a button element instead of an anchor
    const redeemButton = document.createElement('button');
    redeemButton.className = 'redeem-button';
    redeemButton.textContent = 'Redeem';

    // Add click event to open the link in a new tab
    redeemButton.addEventListener('click', (event) => {
      event.stopPropagation();
      recordAttemptedRedeem(offer);
      window.open(redeemLink, '_blank');
    });

    redeemButtonContainer.appendChild(redeemButton);
  } else {
    // Create a "Click for Details" button with opposite style
    const detailsButton = document.createElement('button');
    detailsButton.className = 'details-button';
    detailsButton.textContent = 'Terms';

    // Add click event to show offer details
    detailsButton.addEventListener('click', (event) => {
      event.stopPropagation();
      showOfferDetails(offer);
    });

    redeemButtonContainer.appendChild(detailsButton);
  }

  // Clear the separate min spend and max cashback elements
  clone.querySelector('.offer-min-spend').textContent = '';
  clone.querySelector('.offer-max-cashback').textContent = '';
  clone.querySelector('.offer-expiry').textContent = expiryText;

  // Set ease label if available
  if (easeAssessment.ease !== 'unknown') {
    const easeLabel = clone.querySelector('.effort-label');
    easeLabel.classList.add(`effort-${easeAssessment.ease}`);
    easeLabel.textContent = easeAssessment.ease === 'easy' ? 'Easy' :
      easeAssessment.ease === 'medium' ? 'Medium' : 'Hard';
  }

  // Append the template content to the card
  offerCard.appendChild(clone);

  // Add click event to show offer details
  offerCard.addEventListener('click', (event) => {
    // Don't trigger if clicking on the redeem button
    if (event.target.classList.contains('redeem-button')) {
      return;
    }
    showOfferDetails(offer);
  });

  return offerCard;
}

// Sort offers based on selected option
function sortOffers(offers, sortOption) {
  return [...offers].sort((a, b) => {
    switch (sortOption) {
      case 'recent':
        // Sort by lastUpdated timestamp (most recent first)
        const aTime = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
        const bTime = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
        return bTime - aTime; // Descending order (newest first)
      case 'expiry-asc':
        return getExpiryDate(a) - getExpiryDate(b);
      case 'expiry-desc':
        return getExpiryDate(b) - getExpiryDate(a);
      case 'value-desc':
        return getCashbackValue(b) - getCashbackValue(a);
      case 'value-asc':
        return getCashbackValue(a) - getCashbackValue(b);
      case 'effort-asc':
        return getEffortValue(a) - getEffortValue(b);
      case 'effort-desc':
        return getEffortValue(b) - getEffortValue(a);
      case 'cashbackfixed-desc':
        return getCashbackFixedValue(b) - getCashbackFixedValue(a);
      case 'cashbackpercent-desc':
        return getCashbackPercentValue(b) - getCashbackPercentValue(a);
      default:
        return 0;
    }
  });
}

// Helper function to get effort value (ease of cashback)
function getEffortValue(offer) {
  const easeAssessment = assessCashbackEase(offer);

  // Convert ease to numeric value for sorting
  switch (easeAssessment.ease) {
    case 'easy':
      return 1;
    case 'medium':
      return 2;
    case 'hard':
      return 3;
    default:
      return 4; // Unknown ease gets lowest priority
  }
}

// Helper function to extract cashback value
function getCashbackValue(offer) {
  return parseFloat(offer.estValue || 0);
}

function getCashbackFixedValue(offer) {
  return parseFloat(offer.cashbackFixed || 0);
}

function getCashbackPercentValue(offer) {
  return parseFloat(offer.cashbackPercent || 0);
}

// Show offer details in a modal
function showOfferDetails(offer) {
  // Remove any existing modals first to prevent duplicates
  const existingModals = document.querySelectorAll('.offer-modal');
  existingModals.forEach(modal => modal.remove());

  // Clone the template for offer details modal
  const template = document.getElementById('offer-details-template');
  const modal = template.content.cloneNode(true).querySelector('.offer-modal');

  // Process description if available
  let processedDescription = '';
  if (offer.description) {
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = offer.description;

    // Remove all style attributes from all elements
    const elementsWithStyle = tempDiv.querySelectorAll('*[style]');
    elementsWithStyle.forEach(el => {
      el.removeAttribute('style');
    });

    // Also remove all class attributes to prevent external styling
    const elementsWithClass = tempDiv.querySelectorAll('*[class]');
    elementsWithClass.forEach(el => {
      el.removeAttribute('class');
    });

    // Also remove x days left text
    const listItems = tempDiv.querySelectorAll('li');
    listItems.forEach(item => {
      if (item.textContent.toLowerCase().includes("days left")) {
        item.remove();
      }
    });

    // Set the sanitized HTML
    processedDescription = tempDiv.innerHTML;
  } else {
    processedDescription = 'No details available';
  }

  // Format expiry text using the shared getExpiryDate function
  let expiryText = formatExpiryDate(getExpiryDate(offer));

  // Fill in the template with offer data
  modal.querySelector('.modal-logo').src = offer.logo;
  modal.querySelector('.modal-logo').alt = offer.merchantName;
  modal.querySelector('.modal-merchant').textContent = offer.merchantName || 'Unknown Merchant';
  let cashbackDisplay = displayCashbackAmount(parseCashbackAmount(offer));

  // Fill in the template with offer data
  modal.querySelector('.modal-logo').src = offer.logo;
  modal.querySelector('.modal-logo').alt = offer.merchantName;
  modal.querySelector('.modal-merchant').textContent = offer.merchantName || 'Unknown Merchant';
  modal.querySelector('.modal-amount').textContent = cashbackDisplay;
  modal.querySelector('.modal-id').textContent = offer.id || 'Unknown';
  modal.querySelector('.modal-bank').textContent = offer.bank || 'Unknown';
  if (document.querySelector('.card-label').textContent === "Hide") {
    modal.querySelector('.modal-card').textContent = offer.card || 'Unknown';
  }
  else {
    modal.querySelector('.modal-card').textContent = "*";
  }
  modal.querySelector('.modal-expiry').textContent = expiryText;
  modal.querySelector('.modal-description').innerHTML = processedDescription;

  // Add to document
  document.body.appendChild(modal);

  // Add event listeners
  modal.querySelector('#close-modal').addEventListener('click', () => {
    modal.remove();
  });

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.remove();
    }
  });
}
// Event listeners
// Function to set active nav link
function setActiveNavLink(linkId) {
  // Remove active class from all nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });

  // Add active class to the selected link
  if (linkId) {
    const activeLink = document.getElementById(linkId);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }
}


// Update the showOffersView function to hide AI summary container
function showOffersView() {
  // Hide hunt offers and AI summary containers and show offers grid container
  document.getElementById('hunt-offers-container').style.display = 'none';
  document.getElementById('ai-summary-container').style.display = 'none';
  document.getElementById('offers-grid-container').style.display = 'block';
  document.getElementById('analyze-container').style.display = 'none';
  document.getElementById('map-view-container').style.display = 'none';
  document.querySelector('.controls-container').style.display = 'flex';
  document.getElementById('mark-redeemed-container').style.display = 'none';

  // Display offers
  filterAndDisplayOffers();
  // Save current view to localStorage
  localStorage.setItem('activeView', 'home');
}

// Function to show the Hunt Offers view
function showHuntOffersView() {
  // Hide offers grid container and AI summary container, show hunt offers container
  document.getElementById('offers-grid-container').style.display = 'none';
  document.getElementById('ai-summary-container').style.display = 'none';
  document.getElementById('hunt-offers-container').style.display = 'block';
  document.getElementById('analyze-container').style.display = 'none';
  document.getElementById('map-view-container').style.display = 'none';
  document.getElementById('mark-redeemed-container').style.display = 'none';
  // Hide search and filters as they don't apply to hunt offers view
  document.querySelector('.controls-container').style.display = 'none';
  // Save current view to localStorage
  localStorage.setItem('activeView', 'hunt-offers');

  // Create bank cards
  createBankCards();
}

// Function to create bank cards
function createBankCards() {
  const bankLinksGrid = document.getElementById('bank-links-grid');
  if (!bankLinksGrid) return;

  bankLinksGrid.innerHTML = '';

  // Get all banks from bankTemplates in shared.js
  const banks = Object.keys(bankTemplates);

  banks.forEach(bank => {
    const bankTemplate = bankTemplates[bank];
    if (!bankTemplate || !bankTemplate.allOffersUrl) return;

    // Clone the template for bank cards
    const template = document.getElementById('bank-card-template');
    const bankCard = template.content.cloneNode(true).querySelector('.bank-card');

    // Use the bank logo from bankTemplates if available, otherwise use fallback paths
    const logoSrc = bankTemplate.bankLogo ||
      `images/banks/${bank.toLowerCase().replace(/\s+/g, '-')}.png`;
    const fallbackLogo = 'images/icon128.png'; // Fallback to extension icon
    const bankDescription = bankTemplate.allOfferDescription || `Find and activate cashback offers for your ${bank} cards`;
    const disclaimer = bankTemplate.disclaimer || '';

    //bankCard.querySelector('.bank-logo').src = logoSrc;
    //bankCard.querySelector('.bank-logo').alt = bank;
    //bankCard.querySelector('.bank-logo').onerror = function () { this.src = fallbackLogo; };
    bankCard.querySelector('.bank-name').textContent = bank;
    bankCard.querySelector('.bank-description').textContent = bankDescription;
    bankCard.querySelector('.disclaimer').textContent = disclaimer;

    // Add event listeners
    bankCard.querySelector('.hunt-button').addEventListener('click', (event) => {
      event.stopPropagation();
      window.open(bankTemplate.allOffersUrl, '_blank');
    });

    bankCard.addEventListener('click', () => {
      window.open(bankTemplate.allOffersUrl, '_blank');
    });

    bankLinksGrid.appendChild(bankCard);
  });
}

function clearLocalStorage() {
  // Save the clientInfo before clearing
  chrome.storage.local.get('clientInfo', function (result) {
    const clientInfo = result.clientInfo;

    // Clear all storage
    chrome.storage.local.clear(function () {
      // Restore clientInfo if it existed
      if (clientInfo) {
        chrome.storage.local.set({ 'clientInfo': clientInfo }, function () {
          console.log('Storage cleared but clientInfo preserved');
        });
        // Update storage info display
        updateStorageInfo();
        // Reload the page to reflect changes
        window.location.reload();
      }
    });
  });
}

// Function to show the AI Summary view
function showAISummaryView() {
  // Hide offers grid container and hunt offers container, show AI summary container
  document.getElementById('offers-grid-container').style.display = 'none';
  document.getElementById('hunt-offers-container').style.display = 'none';
  document.getElementById('ai-summary-container').style.display = 'block';
  document.getElementById('analyze-container').style.display = 'none';
  document.getElementById('map-view-container').style.display = 'none';
  document.getElementById('mark-redeemed-container').style.display = 'none';

  // Show search and filters as they apply to AI summary view
  document.querySelector('.controls-container').style.display = 'flex';

  // Save current view to localStorage
  localStorage.setItem('activeView', 'ai-summary');

  // Display AI summary cards
  displayAISummary();
}

// Function to create AI summary cards
function createAISummaryCard(offer) {
  const offerCard = document.createElement('div');
  offerCard.className = 'offer-card';
  offerCard.style.position = 'relative';

  // Add delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-offer-btn';
  deleteBtn.textContent = '×';
  deleteBtn.title = 'Remove offer';
  deleteBtn.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent card click event
    confirmDeleteOffer(offer);
  });
  offerCard.appendChild(deleteBtn);

  // Clone the template for AI summary cards
  const template = document.getElementById('ai-summary-card-template');
  const clone = template.content.cloneNode(true);

  // Assess cashback ease
  const easeAssessment = assessCashbackEase(offer);

  // Fill in the template with offer data
  clone.querySelector('.offer-card-name').textContent = offer.card;
  clone.querySelector('.offer-merchant').textContent = offer.merchantName || 'Unknown Merchant';
  clone.querySelector('.merchant-website').href = offer.merchantWebsite || "";
  clone.querySelector('.merchant-category').textContent = offer.category || 'Other';
  clone.querySelector('.offer-logo').src = offer.logo;

  const redeemLink = clone.querySelector('.redeem-link');
  if (redeemLink) {
    if (offer.redeemLink) {
      redeemLink.href = offer.redeemLink;
      redeemLink.addEventListener('click', function (event) {
        event.stopPropagation();
      });
    }
    else {
      redeemLink.parentNode.style.display = 'none';
    }
  }

  // Set up location link (physical location)
  const locationLink = clone.querySelector('.redeem-location');
  if (locationLink) {
    const redeemLocation = offer.redeemLocation;
    // Create Google Maps URL using merchant name
    if (redeemLocation) {
      locationLink.textContent = redeemLocation;
      locationLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(redeemLocation)}`
      locationLink.addEventListener('click', function (event) {
        event.stopPropagation();
      });
    }
    else {
      locationLink.parentNode.style.display = 'none';
    }
  }
  // Format cashback amount to include max cashback if it exists
  let cashbackDisplay = displayCashbackAmount(parseCashbackAmount(offer));
  const amountElement = clone.querySelector('.offer-amount');
  amountElement.textContent = cashbackDisplay;

  // Style the ease label in the effort container
  if (easeAssessment.ease !== 'unknown') {
    const easeLabel = clone.querySelector('.effort-label');
    if (easeLabel) {
      const easeText = easeAssessment.ease === 'easy' ? 'Easy' :
        easeAssessment.ease === 'medium' ? 'Medium' : 'Hard';

      easeLabel.textContent = `${easeText}`;
      easeLabel.classList.add('effort-label');
      easeLabel.classList.add(`effort-${easeAssessment.ease}`);
    }
  }

  // Extract and display key terms
  const keyTermsList = clone.querySelector('.key-terms-list');
  if (keyTermsList) {
    // Remove any existing background styling
    keyTermsList.classList.add('key-terms-clean');

    const terms = easeAssessment.terms || [];

    terms.forEach(term => {
      const termItem = document.createElement('li');
      termItem.textContent = term.text;
      termItem.className = `term-item term-${term.type}`; // positive, negative, or neutral
      keyTermsList.appendChild(termItem);
    });
  }

  // Append the template content to the card
  offerCard.appendChild(clone);

  // Add click event to show offer details
  offerCard.addEventListener('click', (event) => {
    showOfferDetails(offer);
  });

  return offerCard;
}

function showRedeemView() {
  // Hide offers grid container and AI summary container, show hunt offers container
  document.getElementById('offers-grid-container').style.display = 'none';
  document.getElementById('ai-summary-container').style.display = 'none';
  document.getElementById('hunt-offers-container').style.display = 'none';
  document.getElementById('analyze-container').style.display = 'none';
  document.getElementById('map-view-container').style.display = 'none';
  document.getElementById('mark-redeemed-container').style.display = 'block';

  // Hide search and filters as they don't apply to hunt offers view
  document.querySelector('.controls-container').style.display = 'none';

  // Save current view to localStorage
  localStorage.setItem('activeView', 'redeem');

  // Create bank cards
  listOffersAttemptedRedeeming();
}

function listOffersAttemptedRedeeming() {
  // Get the container where the offers will be displayed
  const redeemContainer = document.getElementById('redeem-grid');
  redeemContainer.innerHTML = ''; // Clear any existing content

  // Filter offers that have been attempted to redeem
  const attemptedOffers = allOffers.filter(offer => offer.attemptedRedeem && !offer.redeemed);

  // Iterate over each attempted offer
  attemptedOffers.forEach(offer => {
    const redeemCard = createRedeemCard(offer);
    // Append the clone to the container
    redeemContainer.appendChild(redeemCard);
  });
}

function createRedeemCard(offer) {
  const offerCard = document.createElement('div');
  offerCard.className = 'offer-card';
  offerCard.style.position = 'relative';


  // Clone the template for AI summary cards
  const template = document.getElementById('redeem-line-template');
  const clone = template.content.cloneNode(true);

  // Fill in the template with offer data
  clone.querySelector('.redeem-offer-id').textContent = offer.id;
  clone.querySelector('.redeem-offer-bank').textContent = offer.bank;
  clone.querySelector('.redeem-offer-card').textContent = offer.card;
  clone.querySelector('.redeem-merchant-name').textContent = offer.merchantName || 'Unknown Merchant';
  clone.querySelector('.redeem-merchant-logo').src = offer.logo;
  clone.querySelector('.redeem-offer-expiry').textContent = formatExpiryDate(offer.expiration);

  let cashbackDisplay = displayCashbackAmount(parseCashbackAmount(offer));
  const amountElement = clone.querySelector('.redeem-offer-amount');
  amountElement.textContent = cashbackDisplay;

  // Append the template content to the card
  offerCard.appendChild(clone);

  // Add click event to show offer details
  const detailsButton = offerCard.querySelector('.details-button');
  detailsButton.addEventListener('click', (event) => {
    showOfferDetails(offer);
  });

  return offerCard;
}

// Function to confirm and delete an offer
function confirmDeleteOffer(offer) {
  if (confirm(`Are you sure you want to remove this offer from ${offer.merchantName || 'Unknown Merchant'}?`)) {
    deleteOfferFromStorage(offer);
  }
}

// Function to delete an offer from local storage
function deleteOfferFromStorage(offer) {
  // Get all items from storage
  chrome.storage.local.get(null, function (result) {
    const updatedStorage = {};
    console.log("Deleting offer:", offer.id, offer.card, offer.bank);

    // Iterate over all keys in storage
    for (const key in result) {
      if (key.startsWith('offercontainer_processed_')) {
        const bankCardData = result[key];
        if (bankCardData && bankCardData.offers) {
          // Filter out the offer to delete (matching id, card, and bank)
          // DO NOT USE bank as it was later added to be one of the key in offercontainer_processed.
          if ((bankCardData.card || 'Unknown Card') !== offer.card) {
            continue;
          }
          const updatedOffers = bankCardData.offers.filter(o =>
            !(o.id === offer.id)
          );
          // If there are remaining offers, keep the key in storage
          if (updatedOffers.length > 0) {
            updatedStorage[key] = { ...bankCardData, offers: updatedOffers };
          }
          else {
            chrome.storage.local.remove(key); // Remove the key from storage if there are no offers left
          }
        }
      }
    }

    // Save updated storage back to local storage
    chrome.storage.local.set(updatedStorage, function () {
      console.log('Offer deleted successfully');
      // Reload offers to update the display
      loadAllOffers();
      // Update storage info
      updateStorageInfo();
    });
  });
}

// Function to calculate and display storage usage
function updateStorageInfo() {
  chrome.storage.local.getBytesInUse(null, function (bytesInUse) {
    const totalBytes = 5242880; // Chrome extension storage limit is 5MB
    const usedMB = (bytesInUse / (1024 * 1024)).toFixed(2);
    const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);
    const percentUsed = ((bytesInUse / totalBytes) * 100).toFixed(1);

    const storageInfoElement = document.getElementById('storage-info');
    if (storageInfoElement) {
      const storageTextElement = storageInfoElement.querySelector('.storage-text');
      const progressBarElement = storageInfoElement.querySelector('.storage-progress-bar');

      if (storageTextElement) {
        storageTextElement.textContent = `🔒 Local storage: ${percentUsed}% filled`;
      }

      if (progressBarElement) {
        progressBarElement.style.width = `${percentUsed}%`;
      }
    }
  });
}

// Function to show the Map View
function showMapView() {
  // Hide other containers, show map container
  document.getElementById('offers-grid-container').style.display = 'none';
  document.getElementById('hunt-offers-container').style.display = 'none';
  document.getElementById('ai-summary-container').style.display = 'none';
  document.getElementById('analyze-container').style.display = 'none';
  document.getElementById('map-view-container').style.display = 'block';
  document.getElementById('mark-redeemed-container').style.display = 'none';

  // Initialize the map
  initializeMap();
}

// Function to initialize OpenStreetMap with Leaflet
function initializeMap() {
  const mapElement = document.getElementById('map');

  if (!mapElement._leaflet_id) {
    // Create map with default view - add a small delay to ensure the container is ready
    const map = L.map(mapElement).setView([37.7749, -122.4194], 12); // Default to San Francisco
    window.map = map; // Store the map instance in the global scope for future use

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = [position.coords.latitude, position.coords.longitude];

          // Add user marker
          L.circleMarker(userLocation, {
            radius: 8,
            fillColor: "#4285F4",
            color: "#FFFFFF",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
          }).addTo(map).bindPopup("Your Location");

          // After setting user location, add offer markers
          addOfferMarkersToMap(map);
          map.setView(userLocation, 13);
        },
        () => {
          console.log('Error: The Geolocation service failed.');
          // Still add offer markers even if user location fails
          addOfferMarkersToMap(map);
        }
      );
    } else {
      console.log('Error: Your browser doesn\'t support geolocation.');
      // Still add offer markers if geolocation not supported
      addOfferMarkersToMap(map);
    }
  }
}

// Function to add offer markers to the map
function addOfferMarkersToMap(map) {
  const mapOffersList = document.getElementById('map-offers-list');
  mapOffersList.innerHTML = '';
  mapOffersList.style.display = 'none';
  // Filter offers based on current filter and search
  let filteredOffers = getFilteredOffers().filter(offer => offer.redeemLocation);
  // Create markers for each offer with location data
  const markers = [];
  let markersAdded = 0;

  filteredOffers.forEach(offer => {
    // Get location for the offer (in a real implementation, you would use actual merchant location data)
    const location = getOfferLocation(offer, map.getCenter());

    if (location) {
      markersAdded++;

      // Create custom icon if logo is available
      let markerIcon;
      if (offer.logo) {
        // Create a custom icon with the merchant logo
        markerIcon = L.divIcon({
          html: `<img src="${offer.logo}" style="width:30px; height:30px; border-radius:50%; object-fit:cover;">`,
          className: 'custom-marker-icon',
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });
      } else {
        // Use default marker if no logo
        markerIcon = L.icon({
          iconUrl: 'images/icon48.png',
          iconSize: [30, 30],
          iconAnchor: [15, 15],
          popupAnchor: [0, -15]
        });
      }

      // Create marker with custom icon
      const marker = L.marker([location.lat, location.lng], { icon: markerIcon }).addTo(map);

      // Create popup content
      const popupContent = document.createElement('div');
      popupContent.className = 'custom-popup';

      // Add merchant logo if available
      if (offer.logo) {
        const logo = document.createElement('img');
        logo.src = offer.logo;
        logo.className = 'merchant-logo';
        logo.alt = offer.merchantName || 'Merchant logo';
        popupContent.appendChild(logo);
      }

      // Add merchant name
      const merchantName = document.createElement('div');
      merchantName.className = 'merchant-name';
      merchantName.textContent = offer.merchantName || 'Unknown Merchant';
      popupContent.appendChild(merchantName);

      // Add cashback amount
      const cashbackAmount = document.createElement('div');
      cashbackAmount.className = 'cashback-amount';
      cashbackAmount.textContent = offer.cashbackAmount || 'Unknown Amount';
      popupContent.appendChild(cashbackAmount);

      // Add expiry date
      const expiryDate = document.createElement('div');
      expiryDate.className = 'expiry-date';
      expiryDate.textContent = formatExpiryDate(getExpiryDate(offer));
      popupContent.appendChild(expiryDate);

      // Add button (redeem or details)
      const button = document.createElement('a');
      button.className = 'popup-button';
      const redeemLink = getRedeemLink(offer);

      if (redeemLink) {
        button.textContent = 'Redeem';
        button.href = redeemLink;
        button.target = '_blank';
      } else {
        button.textContent = 'Details';
        button.href = '#';
        button.onclick = (e) => {
          e.preventDefault();
          showOfferDetails(offer);
          map.closePopup();
        };
      }
      popupContent.appendChild(button);

      // Bind popup to marker
      marker.bindPopup(popupContent);
      markers.push(marker);

      // Add to the offers list below the map
      const offerCard = createOfferCard(offer);
      mapOffersList.appendChild(offerCard);
    }
  });

  window.markers = markers;
  // If markers were added, fit the map to show all markers
  if (markersAdded > 0) {
    const group = new L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.1));
  } else {
    mapOffersList.innerHTML = '<div class="no-offers">No offers found in this area</div>';
  }
}

// Helper function to get offer location
// In a real implementation, you would use actual merchant location data
function getOfferLocation(offer, mapCenter) {
  // Check if offer has location data
  if (offer.redeemLocationLat && offer.redeemLocationLon) {
    return {
      lat: offer.redeemLocationLat,
      lng: offer.redeemLocationLon
    };
  }

  // For demo purposes, generate a random location near the map center
  // This simulates merchants being located around the user
  const lat = mapCenter.lat + (Math.random() - 0.5) * 0.05;
  const lng = mapCenter.lng + (Math.random() - 0.5) * 0.05;

  return {
    lat: lat,
    lng: lng
  };
}

// Deduplicate offers functionality
document.getElementById('deduplicate-offers').addEventListener('click', deduplicateOffers);

function deduplicateOffers() {
  // Show confirmation dialog
  if (!confirm('This will remove duplicate offers, keeping only the most recently updated version of each offer. Continue?')) {
    return;
  }

  chrome.storage.local.get(null, function (items) {
    // Create a map to track unique offers by their bank+card+id combination
    const uniqueOffers = new Map();
    const duplicatesFound = { count: 0 };

    // First pass: identify the most recent version of each offer
    for (const key in items) {
      if (key.startsWith('offercontainer_processed_')) {
        const bankCardData = items[key];
        if (bankCardData && bankCardData.offers && Array.isArray(bankCardData.offers)) {
          bankCardData.offers.forEach(offer => {
            // Create a unique key for this offer
            const offerKey = `${bankCardData.bank || 'unknown'}_${bankCardData.card || 'unknown'}_${offer.id || 'unknown'}`;

            // Check if we've seen this offer before
            if (uniqueOffers.has(offerKey)) {
              const existingOffer = uniqueOffers.get(offerKey);
              // Keep the one with the most recent lastUpdated timestamp
              if (!existingOffer.lastUpdated ||
                (offer.lastUpdated && offer.lastUpdated > existingOffer.lastUpdated)) {
                uniqueOffers.set(offerKey, {
                  containerKey: key,
                  offer: offer,
                  lastUpdated: offer.lastUpdated
                });
              }
              duplicatesFound.count++;
            } else {
              // First time seeing this offer
              uniqueOffers.set(offerKey, {
                containerKey: key,
                offer: offer,
                lastUpdated: offer.lastUpdated
              });
            }
          });
        }
      }
    }

    // If no duplicates found, inform the user and exit
    if (duplicatesFound.count === 0) {
      alert('No duplicate offers found.');
      return;
    }

    // Second pass: rebuild offer containers with only unique offers
    const updatedContainers = {};

    for (const key in items) {
      if (key.startsWith('offercontainer_processed_')) {
        const bankCardData = items[key];
        if (bankCardData && bankCardData.offers && Array.isArray(bankCardData.offers)) {
          // Create a new array for the deduplicated offers
          const deduplicatedOffers = [];

          bankCardData.offers.forEach(offer => {
            const offerKey = `${bankCardData.bank || 'unknown'}_${bankCardData.card || 'unknown'}_${offer.id || 'unknown'}`;
            const bestOffer = uniqueOffers.get(offerKey);

            // Only keep this offer if it's the best version and belongs to this container
            if (bestOffer && bestOffer.containerKey === key && bestOffer.offer === offer) {
              deduplicatedOffers.push(offer);
            }
          });

          // Update the container with deduplicated offers
          const updatedContainer = { ...bankCardData };
          updatedContainer.offers = deduplicatedOffers;
          updatedContainer.lastUpdated = Date.now();
          updatedContainers[key] = updatedContainer;
        }
      }
    }

    // Save the updated containers back to storage
    chrome.storage.local.set(updatedContainers, function () {
      alert(`Deduplication complete. Removed ${duplicatesFound.count} duplicate offers.`);
      window.location.reload();
    });
  });
}

// CSV Export functionality
document.getElementById('export-csv-button').addEventListener('click', exportOffersToCSV);

function exportOffersToCSV() {
  // Get all offers from localStorage
  chrome.storage.local.get(null, function (items) {
    let allOffers = [];

    // Process each offer container
    for (const key in items) {
      if (key.startsWith('offercontainer_processed_')) {
        const bankCardData = items[key];
        if (bankCardData && bankCardData.offers && Array.isArray(bankCardData.offers)) {
          // Add bank and card info to each offer
          bankCardData.offers.forEach(offer => {
            allOffers.push({
              bank: bankCardData.bank,
              card: bankCardData.card,
              ...offer
            });
          });
        }
      }
    }

    if (allOffers.length === 0) {
      alert('No offers found to export');
      return;
    }

    // Collect all unique keys from all offers
    const allKeys = new Set();
    allOffers.forEach(offer => {
      Object.keys(offer).forEach(key => allKeys.add(key));
    });

    // Convert Set to Array for headers
    const headers = Array.from(allKeys);

    // Create CSV content
    let csvContent = headers.join(',') + '\n';

    // Add data rows
    allOffers.forEach(offer => {
      const row = headers.map(header => {
        // Escape quotes and wrap in quotes to handle commas in content
        const cell = offer[header] !== undefined ? String(offer[header]) : '';
        return `"${cell.replace(/"/g, '""')}"`;
      });
      csvContent += row.join(',') + '\n';
    });

    // Create and download the CSV file
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    // Set filename with date
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const yyyy = now.getFullYear();
    const date = yyyy + '_' + mm + '_' + dd;
    link.setAttribute('href', url);
    link.setAttribute('download', `getcashback_offers_${date}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

// Simplify the advanced filters toggle event listener
document.getElementById('advanced-filters-toggle').addEventListener('click', function () {
  const rightColumn = document.querySelector('.right-column');
  const filtersPanel = document.getElementById('advanced-filters-panel');

  // Only toggle if filters are not already visible
  if (!rightColumn.classList.contains('show-filters')) {
    rightColumn.classList.add('show-filters');
    filtersPanel.style.display = 'block'; // Explicitly set display to block
  }
  else {
    // hide filters if they are already visible
    rightColumn.classList.remove('show-filters');
    filtersPanel.style.display = 'none';
  }
});

// Simplify the filter panel close button event listener
document.getElementById('filter-panel-close').addEventListener('click', function () {
  const rightColumn = document.querySelector('.right-column');
  const filtersPanel = document.getElementById('advanced-filters-panel');

  rightColumn.classList.remove('show-filters');
  filtersPanel.style.display = 'none'; // Explicitly hide the panel
});

// Add event listener for local-toggle button
document.getElementById('local-toggle').addEventListener('click', function () {
  if (document.getElementById('map-view-container').style.display === 'none') {
    showMapView();
  }
  else {
    if (localStorage.getItem('activeView') === 'ai-summary') {
      showAISummaryView();
    }
    else {
      showOffersView();
    }
  }
});

document.getElementById('card-toggle').addEventListener('click', function () {
  const cardToggle = document.querySelector('.card-label');
  if (cardToggle.textContent === 'Hide') {
    const offerCardNames = document.getElementsByClassName('offer-card-name');
    for (const offerCardName of offerCardNames) {
      offerCardName.style.display = 'none';
    }
    cardToggle.textContent = 'Show';
  }
  else {
    const offerCardNames = document.getElementsByClassName('offer-card-name');
    for (const offerCardName of offerCardNames) {
      offerCardName.style.display = 'block';
    }
    cardToggle.textContent = 'Hide';
  }
});

function displayCardName() {
  const cardToggle = document.querySelector('.card-label');
  if (cardToggle.textContent === 'Hide') {
    const offerCardNames = document.getElementsByClassName('offer-card-name');
    for (const offerCardName of offerCardNames) {
      offerCardName.style.display = 'block';
    }
  }
  else {
    const offerCardNames = document.getElementsByClassName('offer-card-name');
    for (const offerCardName of offerCardNames) {
      offerCardName.style.display = 'none';
    }
  }
}

// Function to create a consistent ID from category name
function createCategoryId(category) {
  return `spend-${category.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
}

// Update the populateFilterDropdowns function to work with checkboxes instead of dropdowns
function populateFilterDropdowns() {
  const bankFilterContainer = document.getElementById('bank-filter-container');
  const cardFilterContainer = document.getElementById('card-filter-container');
  const categoryFilterContainer = document.getElementById('category-filter-container');

  // Clear existing options
  bankFilterContainer.innerHTML = '<div class="filter-title">Banks</div>';
  cardFilterContainer.innerHTML = '<div class="filter-title">Cards</div>';
  categoryFilterContainer.innerHTML = '<div class="filter-title">Category</div>';

  // Get unique banks and cards
  const banks = new Set();
  const cards = new Set();
  const categories = new Set();

  chrome.storage.local.get(null, function (items) {
    for (const key in items) {
      if (key.startsWith('offercontainer_processed_')) {
        const bankCardData = items[key];
        if (bankCardData && bankCardData.bank) {
          banks.add(bankCardData.bank);
        }
        if (bankCardData && bankCardData.card) {
          cards.add(bankCardData.card);
        }

        // Collect categories from offers
        if (bankCardData && bankCardData.offers && Array.isArray(bankCardData.offers)) {
          bankCardData.offers.forEach(offer => {
            if (offer.category) {
              categories.add(offer.category);
            }
          });
        }
      }
    }

    // Add banks as checkboxes
    banks.forEach(bank => {
      const checkboxContainer = document.createElement('div');
      checkboxContainer.className = 'checkbox-container';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `bank-${bank.replace(/\s+/g, '-').toLowerCase()}`;
      checkbox.value = bank;
      checkbox.className = 'filter-checkbox bank-checkbox';
      checkbox.addEventListener('change', updateCurrentView);

      const label = document.createElement('label');
      label.htmlFor = checkbox.id;
      label.textContent = bank;

      checkboxContainer.appendChild(checkbox);
      checkboxContainer.appendChild(label);
      bankFilterContainer.appendChild(checkboxContainer);
    });

    // Add cards as checkboxes
    cards.forEach(card => {
      const checkboxContainer = document.createElement('div');
      checkboxContainer.className = 'checkbox-container';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `card-${card.replace(/\s+/g, '-').toLowerCase()}`;
      checkbox.value = card;
      checkbox.className = 'filter-checkbox card-checkbox';
      checkbox.addEventListener('change', updateCurrentView);

      const label = document.createElement('label');
      label.htmlFor = checkbox.id;
      label.textContent = card;

      checkboxContainer.appendChild(checkbox);
      checkboxContainer.appendChild(label);
      cardFilterContainer.appendChild(checkboxContainer);
    });

    // Add categories as checkboxes
    categories.forEach(category => {
      const checkboxContainer = document.createElement('div');
      checkboxContainer.className = 'checkbox-container';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `category-${category.replace(/\s+/g, '-').toLowerCase()}`;
      checkbox.value = category;
      checkbox.className = 'filter-checkbox category-checkbox';
      checkbox.addEventListener('change', updateCurrentView);

      const label = document.createElement('label');
      label.htmlFor = checkbox.id;
      label.textContent = category;

      checkboxContainer.appendChild(checkbox);
      checkboxContainer.appendChild(label);
      categoryFilterContainer.appendChild(checkboxContainer);
    });
  });
}

// Reset filters
document.getElementById('reset-filters').addEventListener('click', function () {
  // Uncheck all checkboxes
  document.querySelectorAll('.filter-checkbox').forEach(checkbox => {
    checkbox.checked = false;
  });

  // Clear range inputs
  document.getElementById('min-spend-min').value = '';
  document.getElementById('min-spend-max').value = '';
  document.getElementById('max-cashback-min').value = '';
  document.getElementById('max-cashback-max').value = '';

  // Apply the reset filters
  updateCurrentView();
});

// Function to show the Analyze View
function showAnalyzeView() {
  // Hide other containers, show analyze container
  document.getElementById('offers-grid-container').style.display = 'none';
  document.getElementById('hunt-offers-container').style.display = 'none';
  document.getElementById('ai-summary-container').style.display = 'none';
  document.getElementById('analyze-container').style.display = 'flex';
  document.getElementById('map-view-container').style.display = 'none';
  document.getElementById('mark-redeemed-container').style.display = 'none';

  // Hide search and filters as they don't apply to analyze view
  document.querySelector('.controls-container').style.display = 'none';

  // Save current view to localStorage
  localStorage.setItem('activeView', 'analyze');
}

// Function to run the analysis process
async function runAnalysis() {
  const startButton = document.getElementById('start-analyze-button');
  const steps = document.querySelectorAll('.analyze-step');
  const resultsContainer = document.querySelector('.analyze-results');
  const resultsSummary = document.getElementById('analysis-summary-details');
  const resultsRecommendations = document.getElementById('analysis-recommendations-details');
  const robotAnimation = document.querySelector('.robot-animation');

  // Disable the start button
  startButton.disabled = true;
  startButton.textContent = 'Analysis in progress...';

  // Reset previous analysis
  steps.forEach(step => {
    step.classList.remove('active', 'completed');
  });
  resultsContainer.style.display = 'none';

  // Switch to enhanced glow animation
  robotAnimation.classList.add('analyzing');

  // Step 1: Use the existing HTML elements
  await processAnalysisStep(1, () => {
    // Extract expiration dates and update offers in localStorage
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('Extracting key attributes...');

        // Track how many offers were updated
        let processedOffers = 0;

        // Process each offer to extract and update expiration dates
        chrome.storage.local.get(null, function (items) {
          const updatePromises = [];
          const currentTime = new Date().getTime(); // Get current timestamp

          for (const key in items) {
            if (key.startsWith('offercontainer_processed_')) {
              const offerData = items[key];
              let wasUpdated = false;

              if (offerData && offerData.offers && offerData.offers.length > 0) {
                offerData.offers.forEach(offer => {
                  processedOffers++;

                  if (offer.description) {
                    // Extract expiration date from description if available
                    const extractedExpiry = extractExpiryDateFromDescription(offer.description);
                    // Update offer if expiration is empty or different
                    if (extractedExpiry && (!offer.expiration || offer.expiration !== extractedExpiry)) {
                      offer.expiration = extractedExpiry;
                      offer.lastUpdated = currentTime; // Update offer's lastUpdated
                      wasUpdated = true;
                    }

                    // Extract redeem location from description if available
                    const extractedRedeemLocation = getRedeemLocation(offer);
                    if (offer.redeemLocation != extractedRedeemLocation) {
                      offer.redeemLocation = extractedRedeemLocation;
                      offer.lastUpdated = currentTime;
                      wasUpdated = true;
                    }

                    const extractedMinSpend = extractMinSpendFromDescription(offer.description);
                    if (offer.minSpend != extractedMinSpend) {
                      offer.minSpend = extractedMinSpend;
                      offer.lastUpdated = currentTime;
                      wasUpdated = true;
                    }

                    const extractedMaxCashback = extractMaxCashbackFromDescription(offer.description);
                    if (offer.maxCashback != extractedMaxCashback) {
                      offer.maxCashback = extractedMaxCashback;
                      offer.lastUpdated = currentTime;
                      wasUpdated = true;
                    }

                    const extractedType = extractType(offer);
                    if (offer.type != extractedType) {
                      offer.type = extractedType;
                      offer.lastUpdated = currentTime;
                      wasUpdated = true;
                    }
                  }
                });

                // Save updated offers back to storage with updated container lastUpdated
                if (wasUpdated) {
                  offerData.lastUpdated = currentTime; // Update container's lastUpdated
                  updatePromises.push(new Promise(resolveUpdate => {
                    chrome.storage.local.set({ [key]: offerData }, resolveUpdate);
                  }));
                }
              }
            }
          }

          // Wait for all updates to complete
          Promise.all(updatePromises).then(() => {
            resolve();
          });
        });
      }, 2000);
    });
  });

  // Step 2: Use the existing HTML elements and classifyOffer function
  await processAnalysisStep(2, () => {
    // Categorize offers using classifyOffer function
    return new Promise(resolve => {
      console.log('Categorizing offers and calculating values...');
      // Set a timeout for the entire step
      const timeoutId = setTimeout(() => {
        console.log("Step 2 timeout reached after 60 seconds");
        resolve("Process timed out after 60 seconds");
        const modal = document.getElementById('category-spend-modal');
        if (modal.style.display === 'flex') {
          modal.style.display = 'none';
          // Process with existing preferences since user didn't make changes
          processValueEstimation();
        }
        resolve();
      }, 60000);
      // Show the spending preferences dialog
      chrome.storage.local.get('preferences', (result) => {
        let currentPreferences = result.preferences || {};
        let currentSpendByCategory = currentPreferences.avgSpendByCategory || {};

        // Get the modal element
        const modal = document.getElementById('category-spend-modal');
        const categoryInputsContainer = document.getElementById('category-inputs-container');

        // Clear any existing inputs
        categoryInputsContainer.innerHTML = '';

        // Add input for each category in the order defined in shared.js
        Object.keys(avgSpendByCategory).forEach(category => {
          const formGroup = document.createElement('div');
          formGroup.className = 'checkbox-container';

          const label = document.createElement('label');
          label.htmlFor = createCategoryId(category);
          label.textContent = category;
          formGroup.appendChild(label);

          const inputGroup = document.createElement('div');
          inputGroup.className = 'input-group';

          const dollarSign = document.createElement('span');
          dollarSign.textContent = '$';
          inputGroup.appendChild(dollarSign);

          const input = document.createElement('input');
          input.type = 'number';
          input.id = createCategoryId(category);
          input.name = category;
          // Use the value from currentSpendByCategory if available, otherwise use default
          input.value = currentSpendByCategory[category] !== undefined ?
            currentSpendByCategory[category] : avgSpendByCategory[category];
          input.min = '0';
          inputGroup.appendChild(input);

          formGroup.appendChild(inputGroup);
          categoryInputsContainer.appendChild(formGroup);
        });

        // Show the modal
        modal.style.display = 'flex';

        // Add event listeners for buttons
        const cancelButton = document.getElementById('cancel-spend-button');
        const saveButton = document.getElementById('save-spend-button');

        // Remove any existing event listeners
        const newCancelButton = cancelButton.cloneNode(true);
        const newSaveButton = saveButton.cloneNode(true);

        cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);
        saveButton.parentNode.replaceChild(newSaveButton, saveButton);

        // Add new event listeners
        newCancelButton.addEventListener('click', () => {
          modal.style.display = 'none';
          processValueEstimation();
          clearTimeout(timeoutId);
          resolve();
        });

        newSaveButton.addEventListener('click', () => {
          // Collect values from form
          const updatedSpendByCategory = { ...currentSpendByCategory };
          let hasChanges = false;

          Object.keys(avgSpendByCategory).forEach(category => {
            const input = document.getElementById(createCategoryId(category));
            if (input) { // Add null check
              const newValue = parseFloat(input.value) || 0;
              // Check if this value is different from the original
              if (newValue !== currentSpendByCategory[category]) {
                updatedSpendByCategory[category] = newValue;
                hasChanges = true;
              }
            }
          });
          // Only save to storage if changes were made
          if (hasChanges) {
            currentPreferences.avgSpendByCategory = updatedSpendByCategory;
            chrome.storage.local.set({ preferences: currentPreferences }, () => {
              console.log('Preferences updated with changes');
              modal.style.display = 'none';
              processValueEstimation();
            });
          } else {
            console.log('No changes to preferences, skipping save');
            modal.style.display = 'none';
            processValueEstimation();
          }
          clearTimeout(timeoutId); // Clear the timeout
          resolve();
        });
      });

      function processValueEstimation() {
        console.log('Processing categories and calculating values...');

        // Process each offer to classify and update categories
        chrome.storage.local.get(null, function (items) {
          const currentTime = new Date().getTime();
          let updatedOffers = 0;
          let updatedContainers = 0;
          const containersToUpdate = {};
          const valuePromises = [];

          for (const key in items) {
            if (key.startsWith('offercontainer_processed_')) {
              const offerData = items[key];
              let wasUpdated = false;

              if (offerData && offerData.offers && offerData.offers.length > 0) {
                offerData.offers.forEach(offer => {
                  // Use classifyOffer to determine category if not already set
                  const category = classifyOffer(offer);
                  if (offer.category != category) {
                    offer.category = category;
                    offer.lastUpdated = currentTime;
                    wasUpdated = true;
                    updatedOffers++;
                  }

                  // Calculate value directly
                  const valuePromise = estimateValue(offer).then(calculatedValue => {
                    // Round to 2 decimal places for comparison
                    calculatedValue = parseFloat(calculatedValue).toFixed(2);
                    existingValue = parseFloat(offer.estValue).toFixed(2);

                    // Update estValue if it's different from the calculated value
                    if (existingValue !== calculatedValue) {
                      offer.estValue = calculatedValue;
                      offer.lastUpdated = currentTime;
                      wasUpdated = true;
                      updatedOffers++;

                      // If this container was updated, queue it for storage update
                      if (wasUpdated) {
                        offerData.lastUpdated = currentTime;
                        containersToUpdate[key] = offerData;
                        updatedContainers++;
                      }
                    }
                  });
                  valuePromises.push(valuePromise);
                });
              }
            }
          }
          // Wait for all value estimations to complete before saving
          Promise.all(valuePromises).then(() => {
            // Save all updated containers at once
            if (Object.keys(containersToUpdate).length > 0) {
              chrome.storage.local.set(containersToUpdate, function () {
                console.log(`Updated ${updatedOffers} offers in ${updatedContainers} containers`);
                console.log('All categories and values processed successfully');
              });
            } else {
              console.log('No offers needed updating');
            }
          });
        });
      }
    });
  });

  // Step 3: Enrich details from external sources
  await processAnalysisStep(3, () => {
    return new Promise(resolve => {
      const timeoutId = setTimeout(async () => {
        console.log("Step 3 timeout reached after 40 seconds");
        resolve("Process timed out after 40 seconds")
      }, 40000);

      // Get merchant websites
      const merchantPromise = new Promise(resolveMerchant => {
        try {
          // Get all offer containers from storage
          chrome.storage.local.get(null, function (items) {
            const updatePromises = [];
            const currentTime = new Date().getTime();
            let websitesFromUrl = 0;
            let websitesFromFixMap = 0;
            let websitesFromDescription = 0; // Track URLs found in descriptions
            let merchantWebsitesFromDescription = [];

            // First pass: Check for merchant names that are websites or in the fix map
            for (const key in items) {
              if (key.startsWith('offercontainer_processed_')) {
                const offerData = items[key];
                let wasUpdated = false;

                if (offerData && offerData.offers && offerData.offers.length > 0) {
                  // Update offers in place
                  offerData.offers.forEach(offer => {
                    let merchantWebsiteFound = false;
                    // Step 3.1: Extract URLs from <a> tags in description
                    if (offer.description) {
                      const tempDiv = document.createElement('div');
                      tempDiv.innerHTML = offer.description;
                      const links = tempDiv.querySelectorAll('a');
                      for (const link of links) {
                        const text = link.textContent.trim();
                        const href = link.href.trim();
                        const isText = isUrlString(text);
                        const isHref = isUrlString(href);
                        if (isText || isHref) {
                          const url = isText ? text : href;
                          offer.merchantWebsite = url.startsWith('http') ? url : `https://${url}`;
                          offer.lastUpdated = currentTime;
                          websitesFromDescription++;
                          wasUpdated = true;
                          merchantWebsiteFound = true;
                          merchantWebsitesFromDescription.push(offer.merchantName.trim());
                          break;
                        }
                      }
                    }
                    // Step 3.2: Check if merchantName is already a website
                    if (offer.merchantName) {
                      const merchantName = offer.merchantName.trim();
                      if (!merchantWebsiteFound && isUrlString(merchantName.replace(/[^a-zA-Z0-9.-]/g, ''))) {
                        // Format as proper URL if needed
                        let website = merchantName.replace(/[^a-zA-Z0-9.-]/g, '');
                        if (!website.startsWith('http://') && !website.startsWith('https://')) {
                          website = 'https://' + website;
                        }
                        offer.merchantWebsite = website;
                        offer.lastUpdated = currentTime;
                        websitesFromUrl++;
                        wasUpdated = true;
                        merchantWebsiteFound = true;
                        console.log(`Merchant name is a website: ${merchantName} -> ${website}`);
                      }
                      // Step 3.3: Check if merchantName exists in merchantFixMap
                      if (!merchantWebsiteFound && merchantFixMap[merchantName]) {
                        offer.merchantWebsite = `https://${merchantFixMap[merchantName]}`;
                        offer.lastUpdated = currentTime;
                        websitesFromFixMap++;
                        wasUpdated = true;
                        console.log(`Found merchant in fix map: ${merchantName} -> ${offer.merchantWebsite}`);
                      }
                    }
                  });

                  // Only update storage if changes were made
                  if (wasUpdated) {
                    offerData.lastUpdated = currentTime;
                    updatePromises.push(new Promise(resolveUpdate => {
                      chrome.storage.local.set({ [key]: offerData }, resolveUpdate);
                    }));
                  }
                }
              }
            }

            // Wait for all updates to complete before proceeding to Wikidata
            Promise.all(updatePromises).then(() => {
              console.log(`Updated ${websitesFromUrl + websitesFromFixMap + websitesFromDescription} offers with website data from local checks (${websitesFromUrl} from URLs, ${websitesFromFixMap} from fix map, ${websitesFromDescription} from descriptions)`);

              // Step 3.4: Get unique merchant names that still need websites from Wikidata
              // This time we collect merchant names that weren't handled by steps 1-3
              const merchantsToProcess = new Set();

              // Collect all merchant names that weren't handled by steps 1 and 2
              for (const key in items) {
                if (key.startsWith('offercontainer_processed_')) {
                  const offerData = items[key];
                  if (offerData && offerData.offers && offerData.offers.length > 0) {
                    offerData.offers.forEach(offer => {
                      if (offer.merchantName) {
                        const merchantName = offer.merchantName.trim();

                        // Skip if it's a URL or in the fix map
                        const isUrl = isUrlString(merchantName);
                        const isInFixMap = merchantFixMap[merchantName];
                        const hasWebsiteFromDescription = merchantWebsitesFromDescription.includes(merchantName);

                        if (!isUrl && !isInFixMap && merchantName.length > 0 && !hasWebsiteFromDescription) {
                          // merchantsToProcess is a set so it will automatically handle duplicates 
                          merchantsToProcess.add(merchantName);
                        }
                      }
                    });
                  }
                }
              }

              console.log(`Found ${merchantsToProcess.size} unique merchants to enrich via Wikidata`);

              if (merchantsToProcess.size === 0) {
                resolve(`Enriched ${websitesFromUrl + websitesFromFixMap} offers with local data. No additional merchants found to enrich via Wikidata`);
                return;
              }

              // Format merchant names for SPARQL query with @en language tag
              const formattedNames = [...merchantsToProcess]
                .map(name => `"${name.replace(/"/g, '\\"')}"@en`)
                .join(" ");

              // Create SPARQL query that handles multiple merchant names in a single query
              const sparqlQuery = `
                SELECT ?merchantName ?website WHERE {
                  VALUES ?merchantName { ${formattedNames} }
                  
                  ?merchant rdfs:label ?merchantName.
                  ?merchant wdt:P856 ?website.
                  
                  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
                }
              `;

              // Log the query for debugging
              console.log('SPARQL Query:', sparqlQuery);

              // Encode the query for URL
              const encodedQuery = encodeURIComponent(sparqlQuery);
              const apiUrl = `https://query.wikidata.org/sparql?format=json&query=${encodedQuery}`;

              console.log('Wikidata API URL:', apiUrl);
              console.log('Fetching merchant data from Wikidata...');

              // Fetch data from Wikidata in a single request
              fetch(apiUrl)
                .then(response => {
                  if (!response.ok) {
                    throw new Error(`Wikidata API request failed: ${response.status}`);
                  }
                  return response.json();
                })
                .then(data => {
                  console.log('Wikidata response received');

                  // Process results and update offers
                  let wikidataWebsitesFound = 0;

                  if (data && data.results && data.results.bindings) {
                    const results = data.results.bindings;
                    console.log(`Found ${results.length} website matches from Wikidata`);

                    // Create a map of merchant name to website for faster lookup
                    const merchantWebsites = {};

                    results.forEach(result => {
                      if (result.merchantName && result.website) {
                        const merchantName = result.merchantName.value.replace(/@en$/, '');
                        const website = result.website.value;
                        merchantWebsites[merchantName] = website;
                      }
                    });

                    console.log(`Created map of ${Object.keys(merchantWebsites).length} merchant names to websites`, merchantWebsites);

                    // Get all offer containers from storage again
                    chrome.storage.local.get(null, function (items) {
                      const wikidataUpdatePromises = [];

                      // Process each container
                      for (const key in items) {
                        if (key.startsWith('offercontainer_processed_')) {
                          const offerData = items[key];
                          let wasUpdated = false;

                          if (offerData && offerData.offers && offerData.offers.length > 0) {
                            // Update offers in place
                            offerData.offers.forEach(offer => {
                              if (offer.merchantName) {
                                const merchantName = offer.merchantName.trim();
                                const isUrl = isUrlString(merchantName);
                                const isInFixMap = merchantFixMap[merchantName];
                                const hasWebsiteFromDescription = merchantWebsitesFromDescription.includes(merchantName);
                                if (!isUrl && !isInFixMap && merchantName.length > 0 && !hasWebsiteFromDescription && merchantWebsites[merchantName] != offer.merchantWebsite) {
                                  offer.merchantWebsite = merchantWebsites[merchantName];
                                  offer.lastUpdated = currentTime;
                                  wikidataWebsitesFound++;
                                  wasUpdated = true;
                                  console.log(`Updated offer for ${merchantName} with website from Wikidata: ${offer.merchantWebsite}`);
                                }
                              }
                            });

                            // Only update storage if changes were made
                            if (wasUpdated) {
                              offerData.lastUpdated = currentTime;
                              wikidataUpdatePromises.push(new Promise(resolveUpdate => {
                                chrome.storage.local.set({ [key]: offerData }, resolveUpdate);
                              }));
                            }
                          }
                        }
                      }

                      // Wait for all updates to complete
                      Promise.all(wikidataUpdatePromises).then(() => {
                        const result = `Enriched ${websitesFromUrl + websitesFromFixMap} offers with local data and ${wikidataWebsitesFound} offers with Wikidata`;
                        console.log(result);
                        resolveMerchant(result);
                      });
                    });
                  } else {
                    const result = `Enriched ${websitesFromUrl + websitesFromFixMap} offers with local data. No additional website data found in Wikidata response`;
                    console.log(result);
                    resolveMerchant(result);
                  }
                })
                .catch(error => {
                  console.error('Error fetching from Wikidata:', error);
                  resolveMerchant(`Enriched ${websitesFromUrl + websitesFromFixMap} offers with local data. Error with Wikidata: ${error.message}`);
                });
            });
          });
        } catch (error) {
          console.error('Error in merchant enrichment process:', error);
          resolve(`Error enriching merchant data: ${error.message}`);
        }
      });
      // Create geocoding promise
      const geocodingPromise = new Promise(resolveGeocoding => {
        try {
          let offersNeedingGeocoding = [];
          chrome.storage.local.get(null, function (items) {
            for (const key in items) {
              if (key.startsWith('offercontainer_processed_')) {
                const offerData = items[key];
                if (offerData && offerData.offers && offerData.offers.length > 0) {
                  offerData.offers.forEach(offer => {
                    if (offer.redeemLocation && (!offer.redeemLocationLat || !offer.redeemLocationLon)) {
                      offersNeedingGeocoding.push(offer);
                    }
                  });
                }
              }
            }
            // Extract unique locations to avoid duplicate geocoding requests
            const uniqueLocations = [...new Set(offersNeedingGeocoding.map(offer => offer.redeemLocation))];

            if (uniqueLocations.length === 0) {
              console.log("No locations need geocoding");
              resolveGeocoding("No locations need geocoding");
              return;
            }

            console.log(`Found ${uniqueLocations.length} unique locations that need geocoding`);

            // Submit locations for geocoding with a longer timeout
            console.log("Submitting geocoding request...");

            fetch('https://api.getcashback.ai/geocode', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ addresses: uniqueLocations }),
            })
              .then(response => {
                if (!response.ok) {
                  throw new Error(`Geocoding request failed: ${response.status}`);
                }
                return response.json();
              }).then(geocodeResults => {
                console.log("Geocoding results received:", geocodeResults);
                // Update offers with geocoded coordinates
                if (geocodeResults && geocodeResults.results.length > 0) {
                  // Create a map for quick lookup of coordinates by address
                  const locationMap = new Map();

                  // Process geocoding response format
                  geocodeResults.results.forEach(result => {
                    // Get the original address from the query text
                    const originalAddress = result.query.text;

                    // Map the coordinates to the original address
                    locationMap.set(originalAddress, {
                      lat: result.lat,
                      lon: result.lon
                    });

                    console.log(`Mapped coordinates to original address: ${originalAddress} -> (${result.lat}, ${result.lon})`);
                  });

                  // Update all offers with the geocoded coordinates
                  let updatedCount = 0;
                  const geocodeUpdatePromises = [];
                  const currentTime = new Date().getTime();

                  // Get all offer containers from storage again
                  chrome.storage.local.get(null, function (items) {
                    for (const key in items) {
                      if (key.startsWith('offercontainer_processed_')) {
                        const offerData = items[key];
                        let wasUpdated = false;

                        if (offerData && offerData.offers && offerData.offers.length > 0) {
                          offerData.offers.forEach(offer => {
                            if (offer.redeemLocation
                              && (!offer.redeemLocationLat || !offer.redeemLocationLon)
                            ) {
                              console.log(`Updating coordinates for offer with redeemLocation: ${offer.redeemLocation}`);
                              const coords = locationMap.get(offer.redeemLocation);
                              console.log(`Found coordinates for ${offer.redeemLocation}:`, coords);
                              if (coords) {
                                offer.redeemLocationLat = coords.lat;
                                offer.redeemLocationLon = coords.lon;
                                offer.lastUpdated = currentTime;
                                updatedCount++;
                                wasUpdated = true;
                              }
                            }
                          });

                          if (wasUpdated) {
                            offerData.lastUpdated = currentTime;
                            geocodeUpdatePromises.push(new Promise(resolveUpdate => {
                              chrome.storage.local.set({ [key]: offerData }, resolveUpdate);
                            }));
                          }
                        }
                      }
                    }

                    // Wait for all geocoding updates to complete
                    Promise.all(geocodeUpdatePromises).then(() => {
                      console.log(`Updated coordinates for ${updatedCount} offers`);
                      resolveGeocoding(`Updated coordinates for ${updatedCount} offers`);
                    }).catch(error => {
                      console.error("Error updating geocoded data:", error);
                      resolveGeocoding(`Error updating geocoded data: ${error.message}`);
                    });
                  });
                } else {
                  console.log("Geocoding completed but no results were returned");
                  resolveGeocoding("Geocoding completed but no results were returned");
                }
              })
          });
        } catch (error) {
          console.error("Geocoding error:", error);
          resolveGeocoding(`Geocoding error: ${error.message}`);
        }
      });

      // Wait for both promises to complete
      Promise.all([merchantPromise, geocodingPromise])
        .then(([merchantResult, geocodingResult]) => {
          console.log("Both merchant and geocoding processes completed");
          clearTimeout(timeoutId);
          resolve(`${merchantResult}. ${geocodingResult}`);
        })
        .catch(error => {
          console.error("Error in enrichment processes:", error);
          clearTimeout(timeoutId);
          resolve(`Error in enrichment processes: ${error.message}`);
        });
    });
  });

  // Step 4: Use the existing HTML elements
  await processAnalysisStep(4, () => {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('Generating recommendations...');
        loadAllOffers(() => {
          console.log('Reloaded all offers for final summary');
          resolve();
        });
      }, 2000);
    });
  });

  const recommendations = [
    "Sort by value → Use top offers first → <a href='#' id='sortby-value'>clicking here</a> takes you there.",
    "Filter low-effort offers → Quick online redemptions → <a href='#' id='filter-online'>click here</a> will give you all online offers.",
    "Set reminders → For anything expiring in the next 7–10 days → <a href='#' id='sortby-expiration'>click here</a> to see offers by expiration date."
  ];
  // Display results
  resultsSummary.innerHTML = `Analyzed 
    ${allOffers.length} 
    offers across 
    ${new Set(allOffers.map(o => o.bank)).size}
    banks and 
    ${new Set(allOffers.map(o => o.card)).size} 
    cards. Based on estimated spend amount you provided: 
    ${allOffers.filter(o => o.estValue > 0).length} offers have values. The total potential value of those offers is
    $${calculateTotalValue(allOffers).toFixed(0)}. That's an average of 
    $${(calculateTotalValue(allOffers) / allOffers.filter(o => o.estValue > 0).length).toFixed(2)} 
    per offer! Click the button below to see a breakdown by categories.</p>`;

  resultsRecommendations.innerHTML = `${recommendations.map(rec => `<li>${rec}</li>`).join('')}`;

  // Show results and reset button
  resultsContainer.style.display = 'block';
  startButton.disabled = false;
  startButton.textContent = 'Run Analysis Again?';
  robotAnimation.classList.remove('analyzing');
  document.getElementById('analyze-container').classList.add('analysis-complete');
  document.getElementById('analysis-summary-details-category-breakdown').addEventListener('click', () => {
    showCategoryBreakdownView();
  });

  document.getElementById("sortby-value").addEventListener('click', (event) => {
    event.stopPropagation();
    sortOptions.value = 'value-desc';
    showOffersView();
    setActiveNavLink('home');
  });
  document.getElementById("filter-online").addEventListener('click', (event) => {
    event.stopPropagation();
    showOffersView();
    setActiveNavLink('home');
    buttonAdvancedFilter.click();
    onlineFilter.checked = true;
  });
  document.getElementById("sortby-expiration").addEventListener('click', (event) => {
    event.stopPropagation();
    sortOptions.value = 'expiry-asc';
    showOffersView();
    setActiveNavLink('home');
  });
}

// Helper function to process each analysis step
async function processAnalysisStep(stepNumber, processFn) {
  const steps = document.querySelectorAll('.analyze-step');

  // Mark previous steps as completed
  steps.forEach(step => {
    const num = parseInt(step.dataset.step);
    if (num < stepNumber) {
      step.classList.remove('active');
      step.classList.add('completed');
    } else if (num > stepNumber) {
      step.classList.remove('active', 'completed');
    }
  });

  // Mark current step as active
  const currentStep = document.querySelector(`.analyze-step[data-step="${stepNumber}"]`);
  currentStep.classList.add('active');
  currentStep.classList.remove('completed');

  // Update step content display
  const stepContents = document.querySelectorAll('.step-content');
  stepContents.forEach((content, index) => {
    if (index === stepNumber - 1) {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });

  // Run the process function
  const result = await processFn();

  // Mark step as completed
  currentStep.classList.remove('active');
  currentStep.classList.add('completed');

  return result;
}

// Add this new function to handle filtering in any view
function updateCurrentView() {
  // Check which view is currently active and update accordingly
  const activeView = localStorage.getItem('activeView');
  if (activeView === 'ai-summary') {
    displayAISummary();
  } else if (activeView === 'home') {
    filterAndDisplayOffers();
  }
  if (document.getElementById('map-view-container').style.display === 'block') {
    const map = window.map;
    const markers = window.markers;
    if (markers) {
      markers.forEach(marker => marker.remove());
    }
    addOfferMarkersToMap(map);
  }
}

// Extract the common filtering logic into a separate function
function getFilteredOffers() {
  // Get all filter values
  const searchTerm = document.getElementById('offer-search').value.toLowerCase().trim();
  const pluralSearchTerm = nlp(searchTerm).nouns().toPlural().out() || searchTerm + "s";
  const singularSearchTerm = nlp(searchTerm).nouns().toSingular().out() || searchTerm;
  const selectedBanks = Array.from(document.querySelectorAll('.bank-checkbox:checked')).map(cb => cb.value);
  const selectedCards = Array.from(document.querySelectorAll('.card-checkbox:checked')).map(cb => cb.value);
  const selectedCategories = Array.from(document.querySelectorAll('.category-checkbox:checked')).map(cb => cb.value);
  const selectedTypes = Array.from(document.querySelectorAll('.type-checkbox:checked')).map(cb => cb.value);
  const selectedLocations = Array.from(document.querySelectorAll('.location-checkbox:checked')).map(cb => cb.value);
  const selectedStatuses = Array.from(document.querySelectorAll('.status-checkbox:checked')).map(cb => cb.value);
  const minSpendMin = document.getElementById('min-spend-min').value ? parseFloat(document.getElementById('min-spend-min').value) : 0;
  const minSpendMax = document.getElementById('min-spend-max').value ? parseFloat(document.getElementById('min-spend-max').value) : Infinity;
  const maxCashbackMin = document.getElementById('max-cashback-min').value ? parseFloat(document.getElementById('max-cashback-min').value) : 0;
  const maxCashbackMax = document.getElementById('max-cashback-max').value ? parseFloat(document.getElementById('max-cashback-max').value) : Infinity;

  // Filter offers by all criteria
  let filteredOffers = allOffers.filter(offer => {
    const normalizedDescription = getPlainText(offer.description)
      .split(/(?<=[.?!])\s+/) // Split into sentences
      .filter(sentence =>
        !/(not eligible|exclusions?|excludes?|excluding)/i.test(sentence)
      )
      .join(' ')
      .toLowerCase();
    // Handle advanced card filtering from checkboxes
    let matchesCard = true;
    if (selectedCards.length > 0) {
      matchesCard = selectedCards.includes(offer.card);
    }
    // Handle bank filtering - more lenient
    const matchesBank = selectedBanks.length === 0 ||
      (offer.bank && selectedBanks.includes(offer.bank));

    // Category filter
    let matchesCategory = true;
    if (selectedCategories.length > 0) {
      const offerCategory = offer.category;
      matchesCategory = selectedCategories.includes(offerCategory);
    }

    // Handle search filtering
    const matchesSearch = searchTerm === '' ||
      (offer.merchantName && offer.merchantName.toLowerCase().split(/\W+/).includes(singularSearchTerm)) ||
      (offer.merchantName && offer.merchantName.toLowerCase().split(/\W+/).includes(pluralSearchTerm)) ||
      (offer.category && offer.category.toLowerCase().split(/\W+/).includes(singularSearchTerm)) ||
      (offer.category && offer.category.toLowerCase().split(/\W+/).includes(pluralSearchTerm)) ||
      new RegExp(`\\b(${singularSearchTerm}|${pluralSearchTerm})\\b`, 'i').test(normalizedDescription);

    // Determine offer type
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(offer.type);

    // Determine location type
    let locationType = [];
    if (offer.redeemLink) {
      locationType.push('online');
    }
    if (offer.redeemLocation) {
      locationType.push('in-store');
    }

    // Determine status
    let status = 'active';
    if (offer.expiration && new Date(offer.expiration) < new Date(new Date().toDateString())) {
      status = 'expired';
    }
    if (offer.redeemed) status = 'redeemed';

    // Match location and status
    const matchesLocation = selectedLocations.length === 0 || selectedLocations.some(s => locationType.includes(s.toLowerCase()));
    const matchesStatus = (status.toLowerCase() === 'active' && selectedStatuses.length === 0) ||
      selectedStatuses.some(s => s.toLowerCase() === status);

    // Min Spend filter
    let matchesMinSpend = true;
    if (offer.minSpend) {
      // Convert minSpend from string to number (remove $ and convert to float)
      const minSpendValue = parseFloat(offer.minSpend.toString().replace(/[^\d.]/g, ''));
      if (!isNaN(minSpendValue)) {
        if (minSpendValue < minSpendMin || minSpendValue > minSpendMax) {
          matchesMinSpend = false;
        }
      }
    }
    else if (minSpendMin > 0) {
      // If minSpendMin is set but offer has no minSpend value, filter it out
      matchesMinSpend = false;
    }

    // Max Cashback filter
    let matchesMaxCashback = true;
    if (offer.maxCashback) {
      // Convert maxCashback from string to number (remove $ and convert to float)
      const maxCashbackValue = parseFloat(offer.maxCashback.toString().replace(/[^\d.]/g, ''));
      if (!isNaN(maxCashbackValue)) {
        if (maxCashbackValue < maxCashbackMin || maxCashbackValue > maxCashbackMax) {
          matchesMaxCashback = false;
        }
      }
    } else if (maxCashbackMin > 0) {
      // If maxCashbackMin is set but offer has no maxCashback value, filter it out
      matchesMaxCashback = false;
    }

    // Return true only if all filters match
    return matchesCard && matchesBank && matchesCategory && matchesType && matchesSearch && matchesStatus &&
      matchesMinSpend && matchesMaxCashback && matchesLocation;
  });

  // Sort offers
  filteredOffers = sortOffers(filteredOffers, sortOptions.value);

  // Update filter counts in UI
  const filterLabel = document.querySelector('.filter-label');
  if (filterLabel) {
    filterLabel.textContent = `(${filteredOffers.length})`;
  }

  // Update local map counts
  const localLabel = document.querySelector('.local-label');
  if (localLabel) {
    localLabel.textContent = `(${filteredOffers.filter(o => o.redeemLocation ? true : false).length})`;
  }

  return filteredOffers;
}

// Now simplify filterAndDisplayOffers to use the common function
function filterAndDisplayOffers() {
  // Clear current display
  offersGrid.innerHTML = '';

  // Get filtered offers
  const filteredOffers = getFilteredOffers();

  // Display offers or show empty state
  if (filteredOffers.length === 0) {
    offersGrid.innerHTML = '<div class="no-offers">No offers found</div>';
    return;
  }

  // Create and append offer cards
  filteredOffers.forEach(offer => {
    const offerCard = createOfferCard(offer);
    offersGrid.appendChild(offerCard);
  });

  displayCardName();
}

// Simplify displayAISummary to use the common function
function displayAISummary() {
  const summaryGrid = document.getElementById('ai-summary-grid');
  summaryGrid.innerHTML = '';

  // Get filtered offers
  const filteredOffers = getFilteredOffers();

  // Display offers or show empty state
  if (filteredOffers.length === 0) {
    summaryGrid.innerHTML = '<div class="no-offers">No offers found</div>';
    return;
  }

  // Create and append AI summary cards
  filteredOffers.forEach(offer => {
    const summaryCard = createAISummaryCard(offer);
    summaryGrid.appendChild(summaryCard);
  });

  displayCardName();
}

function recordAttemptedRedeem(offer) {
  // Update the offer in local storage
  console.log(`Processing offer with id ${offer.id}, bank ${offer.bank}, and card ${offer.card}`);

  chrome.storage.local.get(null, function (items) {
    for (const key in items) {
      if (key.startsWith('offercontainer_processed_')) {
        const offerData = items[key];
        if (offerData && offerData.offers && offerData.bank === offer.bank && offerData.card === offer.card) {
          const updatedOffers = offerData.offers.map(o => {
            if (o.id === offer.id) {
              return { ...o, attemptedRedeem: true };
            }
            else {
              return o;
            }
          });

          // Save updated offers back to storage
          chrome.storage.local.set({ [key]: { ...offerData, offers: updatedOffers } }, function () {
            console.log('Offer updated with attemptedRedeem flag');
          });
        }
      }
    }
  });
}

// Function to handle marking offers as redeemed
function markOffersAsRedeemed() {
  // Get all redeem line items in the redeem list (changed from offer-card to redeem-line-item)
  const redeemItems = document.querySelectorAll('#redeem-grid .redeem-line-item');
  let hasRedeemedOffers = false;

  console.log(`Found ${redeemItems.length} redeem items to process`);

  // Process each redeem item
  redeemItems.forEach((item) => {
    // Find the amount spent input within this item
    const amountInput = item.querySelector('.amount-spent-input');
    if (!amountInput || !parseFloat(amountInput.value) > 0) {
      //parseFloat("") is NaN
      console.log('Skipping item with no amount or zero amount');
      return;
    }

    // Find the corresponding offer in allOffers
    const offerId = item.querySelector('.redeem-offer-id').textContent;
    const bankName = item.querySelector('.redeem-offer-bank').textContent;
    const cardName = item.querySelector('.redeem-offer-card').textContent;

    console.log(`Processing redeem item: ${offerId} (${bankName} - ${cardName})`);

    // Find the matching offer in the global allOffers array
    const matchingOffer = allOffers.find(offer =>
      offer.id === offerId &&
      offer.bank === bankName &&
      offer.card === cardName
    );

    if (!matchingOffer) {
      console.log(`No matching offer found for ${merchantName}`);
      return;
    }

    console.log(`Found matching offer with ID: ${matchingOffer.id}`);

    // Get the amount spent
    const amountSpent = parseFloat(amountInput.value);

    // Calculate earned cashback
    let earned = 0;
    let minSpendMet = true;
    parseCashbackAmount(matchingOffer);
    let minSpend = matchingOffer.minSpend || extractMinSpendFromDescription(matchingOffer.description) || '';
    let maxCashback = matchingOffer.maxCashback || extractMaxCashbackFromDescription(matchingOffer.description) || '';
    minSpend = parseFloat(matchingOffer.minSpend?.replace(/[$,]/g, '')) || 0;
    maxCashback = parseFloat(matchingOffer.maxCashback?.replace(/[$,]/g, '')) || Infinity;
    // Check minimum spend requirement
    if (minSpend) {
      minSpendMet = amountSpent >= minSpend;
      console.log(`Min spend requirement: $${minSpend}, Met: ${minSpendMet}`);
    }
    // Calculate earned amount if minimum spend is met
    if (minSpendMet) {
      if (matchingOffer.cashbackPercent) {
        // Percentage cashback
        const percentage = parseFloat(matchingOffer.cashbackPercent.replace('%', '')) / 100;
        earned = amountSpent * percentage;
      } else if (matchingOffer.cashbackFixed) {
        // Fixed dollar amount - target amount between "earn" and "back"
        earned = parseFloat(matchingOffer.cashbackFixed.replace(/[$,]/g, ''));
      }
      if (earned > maxCashback) {
        earned = maxCashback;
      }
      hasRedeemedOffers = true;
      // Update the offer in storage
      chrome.storage.local.get(null, function (items) {
        for (const key in items) {
          if (key.startsWith('offercontainer_processed_')) {
            const offerData = items[key];
            if (offerData && offerData.offers
              && offerData.bank === matchingOffer.bank
              && offerData.card === matchingOffer.card) {
              const updatedOffers = offerData.offers.map(offer => {
                if (offer.id === matchingOffer.id) {
                  console.log(`Updating offer in storage: ${offer.id}`);
                  return {
                    ...offer,
                    amountSpent: amountSpent,
                    earned: earned,
                    redeemed: true,
                    redeemedDate: new Date().toISOString()
                  };
                }
                return offer;
              });
              // Save updated offers back to storage
              chrome.storage.local.set({ [key]: { ...offerData, offers: updatedOffers } });
            }
          }
        }
      });
    }
  });

  // If any offers were redeemed, show celebration and refresh
  if (hasRedeemedOffers) {
    console.log('Showing celebration and refreshing page');
    showCelebration();
  } else {
    alert('No offers were redeemed. Please check your the amount spent have met the terms.');
    console.log('No offers were redeemed');
  }
}

function showCelebration() {
  console.log('Showing celebration animation');
  const celebrationContainer = document.createElement('div');
  celebrationContainer.className = 'celebration-container';
  document.body.appendChild(celebrationContainer);

  // Create and append style for the celebration
  const style = document.createElement('style');
  style.textContent = `
    .celebration-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      overflow: hidden;
    }
    
    .falling-money {
      position: absolute;
      top: -80px;
      animation: fall linear, sway ease-in-out infinite;
      animation-fill-mode: forwards;
      width: 40px;
      height: 40px;
      opacity: 0.9;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.2));
    }
    
    @keyframes fall {
      to {
        transform: translateY(calc(100vh + 80px));
      }
    }
    
    @keyframes sway {
      0% { margin-left: -10px; }
      50% { margin-left: 10px; }
      100% { margin-left: -10px; }
    }
  `;
  document.head.appendChild(style);

  // Create falling money icons
  for (let i = 0; i < 50; i++) {
    const money = document.createElement('div');
    money.className = 'falling-money';

    // Use the icon.png image
    money.style.backgroundImage = 'url("/images/icon.png")';

    // Randomize position, size, and animation duration
    const left = Math.random() * 100;
    const size = 30 + Math.random() * 40;
    const fallDuration = 3 + Math.random() * 5;
    const swayDuration = 2 + Math.random() * 4;
    const delay = Math.random() * 3;

    money.style.left = `${left}%`;
    money.style.width = `${size}px`;
    money.style.height = `${size}px`;
    money.style.animationDuration = `${fallDuration}s, ${swayDuration}s`;
    money.style.animationDelay = `${delay}s`;

    celebrationContainer.appendChild(money);
  }

  console.log('Celebration animation started');

  // Remove celebration after animation completes and refresh the page
  setTimeout(() => {
    document.body.removeChild(celebrationContainer);
    document.head.removeChild(style);
    console.log('Celebration animation ended');

    // Refresh the page after celebration
    window.location.reload();
  }, 5000); // Increased to 5 seconds to allow more time to see the animation
}

// Function to show category breakdown view
function showCategoryBreakdownView() {
  // Get the category breakdown container
  const breakdownContainer = document.getElementById('category-breakdown-container');
  const tableBody = document.getElementById('category-breakdown-body');

  // Clear any existing rows
  tableBody.innerHTML = '';

  // Group offers by category
  const categoryMap = {};

  allOffers.forEach(offer => {
    const category = offer.category || 'Other';

    if (!categoryMap[category]) {
      categoryMap[category] = {
        totalOffers: 0,
        valuableOffers: 0,
        totalValue: 0
      };
    }

    categoryMap[category].totalOffers++;

    if (offer.estValue > 0) {
      categoryMap[category].valuableOffers++;
      categoryMap[category].totalValue += parseFloat(offer.estValue);
    }
  });

  // Sort categories by total value (descending)
  const sortedCategories = Object.keys(categoryMap).sort((a, b) =>
    categoryMap[b].totalValue - categoryMap[a].totalValue
  );

  // Add a row for each category
  sortedCategories.forEach(category => {
    const row = document.createElement('tr');
    const stats = categoryMap[category];

    // Calculate average value
    const avgValue = stats.valuableOffers > 0
      ? stats.totalValue / stats.valuableOffers
      : 0;

    // Create cells
    const cells = [
      category,
      stats.totalOffers,
      stats.valuableOffers,
      `$${stats.totalValue.toFixed(2)}`,
      `$${avgValue.toFixed(2)}`
    ];

    cells.forEach(cellContent => {
      const td = document.createElement('td');
      td.textContent = cellContent;
      row.appendChild(td);
    });

    tableBody.appendChild(row);
  });

  // Add a total row
  const totalRow = document.createElement('tr');
  totalRow.className = 'total-row';

  const totalOffers = allOffers.length;
  const totalValuableOffers = allOffers.filter(o => o.estValue > 0).length;
  const totalEstValue = calculateTotalValue(allOffers);
  const totalAvgValue = totalValuableOffers > 0
    ? totalEstValue / totalValuableOffers
    : 0;

  const totalCells = [
    'TOTAL',
    totalOffers,
    totalValuableOffers,
    `$${totalEstValue.toFixed(2)}`,
    `$${totalAvgValue.toFixed(2)}`
  ];

  totalCells.forEach(cellContent => {
    const td = document.createElement('td');
    td.textContent = cellContent;
    totalRow.appendChild(td);
  });

  tableBody.appendChild(totalRow);

  // After populating the table, initialize sorting
  initCategoryTableSorting();

  // Show the breakdown container
  document.getElementById('category-breakdown-container').style.display = 'block';

  // Add event listener to close button
  document.getElementById('close-breakdown-button').addEventListener('click', () => {
    document.getElementById('category-breakdown-container').style.display = 'none';
  });
}

// Add event listeners for sortable table headers
function initCategoryTableSorting() {
  const sortableHeaders = document.querySelectorAll('.category-breakdown-table th.sortable');

  sortableHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const sortType = header.getAttribute('data-sort');
      const isAscending = header.classList.contains('sort-asc');

      // Remove sort classes from all headers
      sortableHeaders.forEach(h => {
        h.classList.remove('sort-asc', 'sort-desc', 'active');
      });

      // Add appropriate sort class to clicked header
      header.classList.add(isAscending ? 'sort-desc' : 'sort-asc', 'active');

      // Sort the table
      sortCategoryTable(sortType, !isAscending);
    });
  });
}

// Sort the category breakdown table
function sortCategoryTable(sortType, ascending) {
  const tableBody = document.getElementById('category-breakdown-body');
  const rows = Array.from(tableBody.querySelectorAll('tr:not(.total-row)'));

  // Save the total row if it exists
  const totalRow = tableBody.querySelector('.total-row');

  // Sort the rows
  rows.sort((a, b) => {
    let valueA, valueB;

    switch (sortType) {
      case 'category':
        valueA = a.cells[0].textContent.trim();
        valueB = b.cells[0].textContent.trim();
        return ascending ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);

      case 'offers':
        valueA = parseInt(a.cells[1].textContent.trim(), 10);
        valueB = parseInt(b.cells[1].textContent.trim(), 10);
        break;

      case 'valuable':
        valueA = parseInt(a.cells[2].textContent.trim(), 10);
        valueB = parseInt(b.cells[2].textContent.trim(), 10);
        break;

      case 'total':
        valueA = parseFloat(a.cells[3].textContent.trim().replace('$', ''));
        valueB = parseFloat(b.cells[3].textContent.trim().replace('$', ''));
        break;

      case 'average':
        valueA = parseFloat(a.cells[4].textContent.trim().replace('$', ''));
        valueB = parseFloat(b.cells[4].textContent.trim().replace('$', ''));
        break;
    }

    return ascending ? valueA - valueB : valueB - valueA;
  });

  // Clear the table
  tableBody.innerHTML = '';

  // Add the sorted rows
  rows.forEach(row => {
    tableBody.appendChild(row);
  });

  // Add the total row back at the end if it exists
  if (totalRow) {
    tableBody.appendChild(totalRow);
  }
}

// Add event listener for purge button
document.getElementById('purge-button').addEventListener('click', function () {
  // Get all offer containers from Chrome storage
  chrome.storage.local.get(null, function (items) {
    let expiredCount = 0;
    const updatePromises = [];
    const currentDate = new Date(new Date().toDateString());

    // Process each offer container
    for (const key in items) {
      if (key.startsWith('offercontainer_processed_')) {
        const offerData = items[key];
        if (offerData && offerData.offers && offerData.offers.length > 0) {
          // Count expired offers in this container
          const expiredOffers = offerData.offers.filter(offer => {
            if (!offer.expiration) return false;
            const expiryDate = new Date(offer.expiration);
            return expiryDate < currentDate;
          });

          expiredCount += expiredOffers.length;
        }
      }
    }

    // If no expired offers, show message and return
    if (expiredCount === 0) {
      alert('No expired offers to purge.');
      return;
    }

    // Confirm with user
    const confirmMessage = `Are you sure you want to purge ${expiredCount} expired offer${expiredCount !== 1 ? 's' : ''}?`;
    if (confirm(confirmMessage)) {
      // Process each offer container again to remove expired offers
      for (const key in items) {
        if (key.startsWith('offercontainer_processed_')) {
          const offerData = items[key];
          if (offerData && offerData.offers && offerData.offers.length > 0) {
            // Filter out expired offers
            const updatedOffers = offerData.offers.filter(offer => {
              if (!offer.expiration) return true;
              const expiryDate = new Date(offer.expiration);
              return expiryDate >= currentDate;
            });

            // Only update storage if offers were removed
            if (updatedOffers.length < offerData.offers.length) {
              const updatedData = { ...offerData, offers: updatedOffers };
              updatePromises.push(new Promise(resolve => {
                chrome.storage.local.set({ [key]: updatedData }, resolve);
              }));
            }
          }
        }
      }

      // Wait for all updates to complete
      Promise.all(updatePromises).then(() => {
        // Show success message
        alert(`Successfully purged ${expiredCount} expired offer${expiredCount !== 1 ? 's' : ''}.`);
        window.location.reload(); // Refresh the page after purging offers
      });
    }
  })
});

// Function to show Terms of Service modal
function showTermsOfServiceModal() {
  // Create modal container if it doesn't exist
  let tosModal = document.getElementById('tos-modal');
  if (!tosModal) {
    tosModal = document.createElement('div');
    tosModal.id = 'tos-modal';
    tosModal.className = 'modal';

    // Use the template from HTML
    const template = document.getElementById('tos-modal-template');
    if (!template) {
      console.error('Terms of Service template not found in HTML');
      alert('Could not display Terms of Service. Please try again later.');
      return;
    }

    tosModal.appendChild(template.content.cloneNode(true));
    document.body.appendChild(tosModal);

    document.getElementById('decline-tos-button').addEventListener('click', () => {
      tosModal.style.display = 'none';
      window.close();
    });

    document.getElementById('agree-tos-button').addEventListener('click', () => {
      handleRegistration();
    });
  }

  // Show the modal first - make sure it's visible
  tosModal.style.display = 'block';

  // Set initial loading message
  const tosContent = document.getElementById('tos-content');
  if (tosContent) {
    tosContent.innerHTML = 'Loading Terms of Service...';

    // Then fetch Terms of Service from API
    fetchTermsOfService();
  } else {
    console.error('tos-content element not found in modal');
  }

  populateClientInfo();
}

// Function to fetch Terms of Service from API
function fetchTermsOfService() {
  const tosContent = document.getElementById('tos-content');
  if (!tosContent) {
    console.error('tos-content element not found');
    return;
  }

  // Prepare request data
  const requestData = {
    version: version
  };

  console.log('Fetching Terms of Service from API...');

  // Fetch TOS from API
  fetch('https://api.getcashback.ai/tos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestData)
  })
    .then(response => {
      console.log('API response received:', response.status);
      if (!response.ok) {
        throw new Error(`Failed to fetch Terms of Service: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Terms of Service data received:', data);
      if (data && data.content) {
        tosContent.innerHTML = data.content;
      } else {
        throw new Error('Invalid Terms of Service data');
      }
    })
    .catch(error => {
      console.error('Error fetching Terms of Service:', error);
      tosContent.innerHTML = `
      <p>Unable to load Terms of Service from server. Please try again later.</p>
      <p>Error: ${error.message}</p>
    `;
    });
}

// Function to populate client info
function populateClientInfo() {
  chrome.storage.local.get('clientInfo', function (result) {
    if (result.clientInfo) {
      document.getElementById('register-client-id').textContent = result.clientInfo.clientID;
      document.getElementById('register-version').textContent = version;
      document.getElementById('register-email').value = result.clientInfo.email || ''; // Set the email value or defaul
    }
  });
}

// Function to handle registration
function handleRegistration() {
  const email = document.getElementById('register-email').value;

  if (!email) {
    alert('Please enter your email address.');
    return;
  }

  // Email validation using regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Please enter a valid email address.');
    return;
  }

  // Update client info in storage
  chrome.storage.local.get('clientInfo', function (result) {
    if (result.clientInfo) {
      // Prepare registration data
      const registrationData = {
        clientID: result.clientInfo.clientID,
        version: version,
        email: email
      };

      const agreeButton = document.getElementById('agree-tos-button');
      const declineButton = document.getElementById('decline-tos-button');
      agreeButton.disabled = true;
      agreeButton.textContent = 'Registering...';
      declineButton.style.display = 'none';

      // Send registration data to server
      fetch('https://api.getcashback.ai/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Registration failed: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Registration response received:', data);

          // Check if the registration was successful based on the success key
          if (!data || data.success !== true) {
            throw new Error(data.message || 'Registration failed on server');
          }

          const updatedClientInfo = {
            ...result.clientInfo,
            email: email
          };

          chrome.storage.local.set({ clientInfo: updatedClientInfo }, function () {
            console.log('Updated client info with email:', email);
          });

          alert('Please check your email for verification instructions.');
          window.close();
        })
        .catch(error => {
          console.error('Registration error:', error);
          alert(`Registration failed: ${error.message}. Please try again later.`);
        });
    }
  });
}
// Function to validate client ID with the server
function validateClientID() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('clientInfo', function (result) {
      if (!result.clientInfo || !result.clientInfo.clientID) {
        console.error('No client ID found in storage');
        showTermsOfServiceModal();
        reject(new Error('No client ID found'));
        return;
      }

      const clientInfo = result.clientInfo;
      const clientID = clientInfo.clientID;
      const currentTime = new Date().getTime();

      // Check if we need to validate with the server
      if (!clientInfo.email) {
        // No email, show terms of service
        console.log('No email found, showing Terms of Service');
        showTermsOfServiceModal();
        reject();
        return;
      } else if (!clientInfo.registered) {
        // Email exists but not registered, check license
        console.log('Email found but not registered, checking license');
      } else if (clientInfo.nextCheck && currentTime < clientInfo.nextCheck) {
        // Already registered and not time to check again
        console.log('Already registered and not time to check again');
        resolve(true);
        return;
      }

      console.log('Validating client ID:', clientID);

      // Prepare validation data
      const validationData = {
        clientID: clientID,
        version: version,
        email: clientInfo.email
      };

      // Send validation request to server
      fetch('https://api.getcashback.ai/check-license', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(validationData)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Validation failed: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Validation response received:', data);

          // Only update storage if response was ok
          const updatedClientInfo = { ...clientInfo };

          const ttlInDays = 1;

          if (data && data.success === true) {
            console.log('Client ID validation successful');
            updatedClientInfo.registered = true;
            updatedClientInfo.nextCheck = currentTime + (ttlInDays * 24 * 60 * 60 * 1000); // Convert days to milliseconds

            // Save updated client info
            chrome.storage.local.set({ clientInfo: updatedClientInfo }, function () {
              console.log('Updated client info with successful validation');
            });

            resolve(true);
          } else {
            console.log('Client ID validation failed');
            updatedClientInfo.registered = false;

            // Save updated client info
            chrome.storage.local.set({ clientInfo: updatedClientInfo }, function () {
              console.log('Updated client info with failed validation');
            });

            // Show terms of service if validation failed
            showTermsOfServiceModal();
            reject(new Error(data.message || 'Client validation failed'));
          }
        })
        .catch(error => {
          console.error('Validation error:', error);
          showTermsOfServiceModal();
          reject(error);
        });
    });
  });
}

document.getElementById("verify").addEventListener("click", function () {
  if (confirm('Do you want to manually update data pack for your Chrome extension to get new offer providers and improved categorization?')) {
    chrome.storage.local.get('clientInfo', function (result) {
      if (!result.clientInfo || !result.clientInfo.clientID || !result.clientInfo.email) {
        alert('No client information found. Please register first.');
        return;
      }
      const clientInfo = result.clientInfo;
      const clientID = clientInfo.clientID;
      // Prepare validation data
      const validationData = {
        clientID: clientID,
        version: version,
        configUpdateReqd: true
      };

      // Send validation request to server
      fetch('https://api.getcashback.ai/check-license', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(validationData)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Verification failed: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Verification response received:', data);

          if (data && data.success === true) {
            const config = JSON.stringify(data.config);
            const encoder = new TextEncoder();
            const configData = encoder.encode(config);
            crypto.subtle.digest('SHA-256', configData).then(hashBuffer => {
              const hashArray = Array.from(new Uint8Array(hashBuffer));
              const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
              console.log("Checksum", hexHash); // this is your checksum

              // Update client info with successful verification
              const currentTime = new Date().getTime();
              const ttlInDays = 1; // 1 day TTL
              let updatedClientInfo = {
                ...clientInfo,
                registered: true,
                nextCheck: currentTime + (ttlInDays * 24 * 60 * 60 * 1000),
              };

              if (hexHash !== clientInfo.checksum) {
                updatedClientInfo = {
                  ...updatedClientInfo,
                  checksum: hexHash,
                  config: config
                };
                if (data.config.bankTemplates) {
                  // Merge with existing templates or replace them
                  Object.keys(bankTemplates).forEach(key => delete bankTemplates[key]);
                  Object.assign(bankTemplates, data.config.bankTemplates);
                  console.log('Bank templates updated from remote source', bankTemplates);
                }
                if (data.config.categoryKeywords) {
                  // Merge with existing keywords or replace them
                  Object.keys(categoryKeywords).forEach(key => delete categoryKeywords[key]);
                  Object.assign(categoryKeywords, data.config.categoryKeywords);
                  console.log('Category keywords updated from remote source', categoryKeywords);
                }
              }
              chrome.storage.local.set({ clientInfo: updatedClientInfo }, function () {
                console.log('Client ID validation successful');
                if (hexHash === clientInfo.checksum) {
                  alert('The data pack for your Chrome extension is already up to date!');
                }
                else {
                  alert('Your Chrome extension is successfully updated!');
                  window.location.reload();
                }
              });
            });
          } else {
            // Remove registration info on failure
            const updatedClientInfo = {
              clientID: clientInfo.clientID
              // Intentionally removing email, nextCheck and registered
            };

            chrome.storage.local.set({ clientInfo: updatedClientInfo }, function () {
              console.log('Removed registration info due to failed verification');
              alert('Your Chrome extension verification failed. You will need to register it again.');
              window.close();
            });
          }
        })
        .catch(error => {
          console.error('Verification error:', error);

          // Show error message
          alert(`Verification failed: ${error.message}. Please try again later.`);
        });
    });
  }
});