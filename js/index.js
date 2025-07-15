// DOM elements
const offersGrid = document.getElementById('offers-grid');
const sortOptions = document.getElementById('sort-options');
const heroSearchBox = document.querySelector('.hero-searchbox');
const searchBox = document.getElementById('offer-search');
const buttonAdvancedFilter = document.getElementById('advanced-filters-toggle');
const onlineFilter = document.getElementById('location-online');
const offersGridContainer = document.getElementById('offers-grid-container');
const filterContainer = document.getElementById('filter-container');
const bankFilterContainer = document.getElementById('bank-filter-container');
const searchBoxLabel = document.getElementById('offer-search-label');
const spendAmountLabel = document.getElementById('spend-amount-label');
const statRow = document.querySelector('.stat-row');
const statLabel = document.getElementById('stat-label');
const noOfferLabel = document.getElementById('no-offer-label');
const edgeButton = document.querySelector('.edge-button');
const chromeButton = document.querySelector('.chrome-button');
const filterLabel = document.getElementById('filter-label');
const sourceLabel = document.getElementById('source-label');
const iosButton = document.querySelector('.ios-button');
const androidButton = document.querySelector('.android-button');
const windowsButton = document.querySelector('.windows-button');

// Global variables
let allOffers = [];
let cards = [];
let currentFilter = 'all';
let currentSearch = '';
let spendAmount = 100;
let merchant = '';
let provider = [];

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
});

function installPWA() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      deferredPrompt = null;
    });
  }
}

function isStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true
    || document.referrer.startsWith('android-app://');
}

function hideInstallButtonsIfStandalone() {
  if (isStandaloneMode()) {
    if (iosButton) iosButton.style.display = 'none';
    if (androidButton) androidButton.style.display = 'none';
    if (windowsButton) windowsButton.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Placeholder animation for search box
  const phrases = [
    "Hey Max, I'm planning to spend about $120 on groceries this week. Any good deals I should know about?",
    "Thinking of sending flowers to my mom — around $50 budget. Got any offers?",
    "I'm about to order a few things on Amazon. Anything I can stack for cashback?",
    "Looking to book a trip next month — any travel cashback options?",
    "Need to pick up a few health supplements and vitamins — maybe $60 total. Anything worth activating?",
    "My TV is broken. I need a new one. I heard good things about LG OLED TV. Any deals?"
  ];
  let phraseIndex = 0;
  let charIndex = 0;
  let typing = true;
  function typePlaceholder() {
    if (!typing) return;
    const currentPhrase = phrases[phraseIndex];
    searchBox.setAttribute('placeholder', currentPhrase.slice(0, charIndex));
    if (charIndex < currentPhrase.length) {
      charIndex++;
      setTimeout(typePlaceholder, 60);
    } else {
      typing = false;
      setTimeout(erasePlaceholder, 1500);
    }
  }
  function erasePlaceholder() {
    const currentPhrase = phrases[phraseIndex];
    if (charIndex > 0) {
      charIndex--;
      searchBox.setAttribute('placeholder', currentPhrase.slice(0, charIndex));
      setTimeout(erasePlaceholder, 30);
    } else {
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typing = true;
      setTimeout(typePlaceholder, 500);
    }
  }
  typePlaceholder();

  const userAgent = navigator.userAgent;
  const isEdge = userAgent.indexOf("Edg") !== -1;
  const isChrome = userAgent.indexOf("Chrome") !== -1 && !isEdge;

  if (edgeButton && chromeButton) {
    // Show/hide buttons based on browser detection
    if (isEdge) {
      edgeButton.style.display = '';
      chromeButton.style.display = 'none';
    } else if (isChrome) {
      edgeButton.style.display = 'none';
      chromeButton.style.display = '';
    } else {
      // For other browsers, show Chrome
      edgeButton.style.display = 'none';
      chromeButton.style.display = '';
    }
  }

  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
  const isMacOS = /Macintosh|Mac OS X/.test(userAgent) && !isIOS;
  const isIPadOS = /\(iPad/.test(userAgent);
  const isWindows = /Windows/.test(userAgent);

  if (iosButton && windowsButton && chromeButton) {
    if (isIOS || isMacOS || isIPadOS) {
      iosButton.style.display = '';
      windowsButton.style.display = 'none';
      androidButton.style.display = 'none';
    } else if (isWindows) {
      iosButton.style.display = 'none';
      windowsButton.style.display = '';
      androidButton.style.display = 'none';
    } else {
      iosButton.style.display = 'none';
      windowsButton.style.display = 'none';
      androidButton.style.display = '';
    }
  }

  hideInstallButtonsIfStandalone();
  document.addEventListener('visibilitychange', hideInstallButtonsIfStandalone);

  if (iosButton) {
    iosButton.addEventListener('click', function (e) {
      installPWA();
    });
  }
  if (androidButton) {
    androidButton.addEventListener('click', function (e) {
      installPWA();
    });
  }
  if (windowsButton) {
    windowsButton.addEventListener('click', function (e) {
      installPWA();
    });
  }
  // Add event listeners for range inputs
  document.getElementById('type-cashback').addEventListener('change', updateCurrentView);
  document.getElementById('type-discount').addEventListener('change', updateCurrentView);
  document.getElementById('type-points').addEventListener('change', updateCurrentView);
  document.getElementById('type-coupon').addEventListener('change', updateCurrentView);
  sortOptions.addEventListener('change', updateCurrentView);
  searchBox.addEventListener('input', function () {
    const offerSearch = document.getElementById('offer-search');
    const charRemaining = document.getElementById('offer-search-char-remaining');
    if (offerSearch && charRemaining) {
      const maxLen = 120;
      function updateCharCount() {
        const remaining = maxLen - offerSearch.value.length;
        charRemaining.textContent = `${remaining} characters left`;
        if (remaining < 10) {
          charRemaining.style.color = 'red';
        } else {
          charRemaining.style.color = '#888';
        }
      }
      offerSearch.addEventListener('input', updateCharCount);
      updateCharCount();
    }
  });
  buttonAdvancedFilter.addEventListener('click', function () {
    if (searchBox.value.trim() !== '') {
      fetch('https://us-west1-fast-planet-461216-n6.cloudfunctions.net/askMax', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: searchBox.value })
      })
        .then(response => response.json())
        .then(data => {
          if (data) {
            if (typeof data.spendAmount !== 'undefined') spendAmount = data.spendAmount;
            if (typeof data.searchTerm !== 'undefined') currentSearch = data.searchTerm;
            if (typeof data.merchant !== 'undefined') merchant = data.merchant;
            if (typeof data.provider !== 'undefined') provider = data.provider;
            gTagSearchInput();
            offersGridContainer.style.display = '';
            console.log('currentSearch:', currentSearch);
            searchBoxLabel.textContent = merchant? (merchant + (currentSearch===null ? "" : " " + currentSearch)): (currentSearch || 'something');
            spendAmountLabel.textContent = "$" + (spendAmount || '100').toLocaleString();
            statRow.style.display = '';
            // Fetch offers
            const pluralSearchTerm = (window.nlp && currentSearch) ? (nlp(currentSearch).nouns().toPlural().out() || currentSearch + "s") : (currentSearch ? currentSearch + "s" : "");
            const searchTermArray = currentSearch? [currentSearch] : null;
            if (pluralSearchTerm && pluralSearchTerm !== currentSearch) searchTermArray.push(pluralSearchTerm);
            const pluralMerchant = (window.nlp && merchant) ? (nlp(merchant).nouns().toPlural().out() || merchant + "s") : (merchant ? merchant + "s" : "");
            const merchantArray = merchant? [merchant] : null;
            if (pluralMerchant && pluralMerchant !== merchant) merchantArray.push(pluralMerchant);
            console.log("getOffers body: ", JSON.stringify({ spendAmount, searchTerm: searchTermArray, merchant: merchantArray, provider: provider }));
            fetch('https://us-west1-fast-planet-461216-n6.cloudfunctions.net/getOffers', {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ spendAmount, searchTerm: searchTermArray, merchant: merchantArray, provider: provider })
            })
              .then(res => res.json())
              .then(json => {
                allOffers = json.offers;
                Promise.all(
                  allOffers.map(offer =>
                    estimateValue(offer, spendAmount || 100).then(value => {
                      offer.estValue = value;
                    })
                  )
                ).then(() => {
                  populateFilterDropdowns();
                  updateCurrentView();
                });
              })
          }
        })
    }
  });

  let filterDots = 0;
  let filterLabelAnimating = true;
  function animateFilterLabel() {
    if (!filterLabelAnimating) return;
    filterDots = (filterDots + 1) % 4; // cycles 0,1,2,3
    filterLabel.textContent = 'Please give me a few moments to get ready' + '.'.repeat(filterDots) || '.';
    setTimeout(animateFilterLabel, 400);
  }
  animateFilterLabel();

  if (filterLabel) {
    // Fetch count and banks from backend
    fetch('https://us-west1-fast-planet-461216-n6.cloudfunctions.net/getOffers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: new Date().toDateString() })
    })
      .then(response => response.json())
      .then(data => {
        const count = data.count.toLocaleString() || "0";
        const banks = data.banks.length;
        filterLabel.textContent = `I found ${count} offers. Now, tell me where you're shopping, what you're buying, and your budget — I'll find you the best deals.`;
        
        // Create favicon icons for each bank
        let bankFavicons = '';
        if (data.banks && data.banks.length > 0) {
          data.banks.forEach(bank => {
            if (bankTemplates[bank] && bankTemplates[bank].allOffersUrl) {
              const url = new URL(bankTemplates[bank].allOffersUrl);
              // Extract top-level domain from hostname
              const hostnameParts = url.hostname.split('.');
              const topLevelDomain = hostnameParts.length >= 2 ? hostnameParts.slice(-2).join('.') : url.hostname;
              const faviconUrl = `https://www.google.com/s2/favicons?domain=${topLevelDomain}&sz=32`;
              bankFavicons += `<img src="${faviconUrl}" alt="${bank}" style="width: 20px; height: 20px; border-radius: 50%; margin-right: 4px; vertical-align: middle;" />`;
            }
          });
        }
        
        sourceLabel.innerHTML = `${bankFavicons}${banks} sources`;
        sourceLabel.style.display = '';
        filterLabelAnimating = false; // Stop the animation
        heroSearchBox.style.display = '';
      })
      .catch(() => {
        filterLabel.textContent = 'I am unable to fetch cashback offers at this time.';
        filterLabelAnimating = false; // Stop the animation
      });
  }

  //loadJsonOffers();

  // const offersLoadedInterval = setInterval(function () {
  //   console.log('Offer loaded?', window.offersLoaded);
  //   if (window.offersLoaded) {
  //     clearInterval(offersLoadedInterval);
  //     loadAllOffers(() => {
  //       populateFilterDropdowns();
  //       updateCurrentView();
  //       heroSearchBox.style.display = '';
  //     });
  //   }
  // }, 1000);
});

function gTagSearchInput() {
  // Google Analytics event for hero-search-input as a whole
  if (typeof gtag === 'function') {
    gtag('event', 'hero_search_input', {
      'spend_amount': spendAmount,
      'search_term': currentSearch
    });
  }
}

// Load all offers from storage
function loadAllOffers(callback) {
  chrome.storage.local.get(null, function (result) {
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
            // Update counters
            totalCollected++;
            // Check if offer is expired
            if (getExpiryDate(offer) && new Date(getExpiryDate(offer)) < new Date(new Date().toDateString())) {
              totalExpired++;
            }
            else {
              // Add bank and card info to each offer
              const enrichedOffer = {
                ...offer,
                bank: offerData.bank || 'Unknown Bank',
                card: offerData.card || 'Unknown Card',
                lastUpdated: offer.lastUpdated || new Date().toISOString() // Add lastUpdated if missing
              };
              allOffers.push(enrichedOffer);
            }
            if (offer.activated) totalActivated++;
            if (offer.redeemed) totalRedeemed++;
          });
          totalActive += offerData.totalOffers || 0;
        }
      }
    }
    Promise.all(
      allOffers.map(offer =>
        estimateValue(offer, 100).then(value => {
          offer.estValue = value;
        })
      )
    ).then(() => {
      // If a callback was provided, call it now that offers are loaded
      if (typeof callback === 'function') {
        callback();
      }
    });
  })
}

function loadJsonOffers() {
  fetch('/data/manifest.json')
    .then(response => {
      if (!response.ok) throw new Error('Failed to fetch manifest.json');
      return response.json();
    })
    .then(fileList => {
      // fileList should be an array of file names, e.g. ["capitalone.json", "amex.json"]
      if (!Array.isArray(fileList)) {
        throw new Error('Manifest is not an array of file names');
      }
      // Fetch all JSON files in parallel
      return Promise.all(
        fileList.map(fileName =>
          fetch(`/data/${fileName}`)
            .then(response => {
              if (!response.ok) throw new Error('Failed to fetch ' + fileName);
              // Get last-modified header
              const lastUpdated = response.headers.get('last-modified') || new Date().toISOString();
              return response.json().then(offersData => ({
                offersData,
                lastUpdated,
                fileName
              }));
            })
        )
      );
    })
    .then(results => {
      results.forEach(({ offersData, lastUpdated, fileName }) => {

        // Use file name (without .json) as bank and card
        const name = fileName.replace(/\.json$/i, '');
        // Helper to normalize offers
        function normalizeOffer(offer) {
          return {
            bank: name,
            card: name,
            lastUpdated,
            id: offer.domain,
            logo: `https://images.capitaloneshopping.com/api/v1/logos?height=170&domain=${offer.domain}&type=cropped&fallback=true`,
            merchantName: offer.displayName,
            cashbackAmount: offer.cardLinkedOffer ? offer.cardLinkedOffer.rewardDisplay : offer.reward_display,
            merchantWebsite: offer.domain,
            description: `
          <div>
            ${offer.availability.online ? "<p>Online</p>" : ""} 
            <ul>
              ${offer.reward_categories ? offer.reward_categories.map(cat => `<li>${cat.name}: ${cat.type == "fixed" ? "$" + cat.amount / 100 : cat.amount / 100 + "%"}</li>`).join('') : ""}
            </ul>
            ${offer.availability.inStore ? "<p>In-Store</p>" : ""}
            <ul>
              ${offer.cardLinkedOffer?.endDate ? "<li>Expire on " + offer.cardLinkedOffer.endDate.split('T')[0] + "</li>" : ""}
              ${offer.cardLinkedOffer?.packageMax ? "<li>Up to $" + offer.cardLinkedOffer.packageMax / 100 + "</li>" : ""}
            </ul>
          </div>
          <div>
            <div>
              <div>
                <h3>Merchant details</h3>
                <p>${offer.availability.online ? "Online: To redeem the offer you must make an eligible purchase at " + offer.domain + ". " + offer.terms_and_conditions + "To earn the payout, you must be a Capital One cardholder or bank account holder, and logged in to your account on capitalone.com or the Capital One Mobile app." : ""}</p>
                <p>${offer.cardLinkedOffer ? "In-Store: " + offer.cardLinkedOffer.termsAndConditions : ""}</p>
              </div>
              <div>
                <h3>How to receive the payout</h3>
                <p>Payouts are usually issued within 45 days of an eligible purchase but may take longer in some cases. Your account must be open and in good standing at the time we attempt to award the payout. In the event you have more than one account, we may apply the payout to any active credit card or bank account that is open and in good standing. This offer is valid for your use only and cannot be used to buy and resell goods or services to other persons or third parties.</p>
              </div>
              <div>
                <h3>What is a qualifying online purchase?</h3>
                <p>To make a qualifying online purchase, you must use the link below, and then complete a purchase at the selected merchant's site, in the window opened by the Capital One Offers tile, within 24 hours. If an offer specifically lists an available coupon on this page, you may use it on the merchant's site, subject to any coupon-related conditions that we display, but you must do so within 24 hours of activating the offer and during the same open browser session triggered by your offer activation. Use of any other coupons, cash back, or promotional websites after selecting an offer and before making a purchase will invalidate your offer. Use of VPNs and ad blockers may also invalidate your offer. Online purchases made on websites without first being redirected by a Capital One Offers tile are not qualifying online purchases.</p>
              </div>
              <div>
                <h3>How is the payout calculated?</h3>
                <p>The payout for qualifying online purchases is calculated using the subtotal amount of your eligible purchase, which is calculated after any eligible coupons are applied, and excludes taxes, shipping, credits, and other fees. A payout earned through this offer is in addition to any rewards regularly earned with your card. If you return or cancel an otherwise qualifying purchase, you are not eligible for a payout. Payouts for subscription services are only awarded to new customers in their first billing period after the merchant has confirmed your payment has processed. Payouts are not available on trial memberships, unless otherwise stated.</p>
                <p>Read the complete <a href="https://capitaloneoffers.com/Capital-One-Offers-Terms-and-Conditions.pdf" target="_blank">Capital One Offers terms and conditions</a>.</p>
              </div>
            </div>
          </div>
          <div>
            <a href="https://capitaloneoffers.com/c1-offers/" target="_blank">Activate & Shop Now</a>
          </div>`,
            category: offer.easeCategory
          };
        }
        // Push all offers from both standard into allOffers
        if (offersData.offers && offersData.offers.standard && Array.isArray(offersData.offers.standard.offers)) {
          offersData.offers.standard.offers.forEach(offer => {
            const normalizedOffer = normalizeOffer(offer);
            parseCashbackAmount(normalizedOffer);
            estimateValue(normalizedOffer, 100).then(
              value => {
                normalizedOffer.estValue = value;
                allOffers.push(normalizedOffer);
              });
          });
        }
      });
    })
    .catch(e => {
      console.error('Error loading offers:', e);
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
  clone.querySelector('.offer-bank-name').textContent = offer.bank;
  clone.querySelector('.offer-logo').src = offer.logo;
  clone.querySelector('.offer-logo').alt = offer.merchantName;
  clone.querySelector('.offer-merchant').textContent = offer.merchantName || offer.bank;
  clone.querySelector('.offer-merchant-summary-icon').style.display = offer.merchantAISummary ? '' : 'none';
  clone.querySelector('.offer-merchant-summary-text').textContent = offer.merchantAISummary || '';


  // Calculate and display estimated value if the element exists
  const valueElement = clone.querySelector('.offer-value');
  if (valueElement) {
    valueElement.textContent = (offer.estValue && parseInt(offer.estValue) !== 0) ? `(Est. $${parseFloat(offer.estValue).toFixed(2)} for you · Eligibility may vary)` : '(No est. value)';
  }

  // Format cashback amount to include max cashback if it exists
  let cashbackDisplay = displayCashbackAmount(parseCashbackAmount(offer));
  const amountElement = clone.querySelector('.offer-amount');
  amountElement.textContent = cashbackDisplay;

  // Add redeem button if link is available - UPDATED to match hunt-button implementation
  const redeemButtonContainer = clone.querySelector('.redeem-button-container');
  const applyLink = bankTemplates[offer.bank]?.applyLink;
  const redeemButton = redeemButtonContainer.querySelector('.redeem-button');
  const loginLink = bankTemplates[offer.bank]?.allOffersUrl;
  const loginAnchor = redeemButtonContainer.querySelector('.redeem-button-log-in');
  loginAnchor.href = loginLink;
  if (applyLink) {
    // Add click event to open the link in a new tab
    redeemButton.addEventListener('click', (event) => {
      event.stopPropagation();
      window.open(applyLink, '_blank');
    });
  }
  else {
    redeemButton.style.display = 'none'; // Hide the button if no link is presen
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
      if (item.textContent.toLowerCase().includes("saved")) {
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
  modal.querySelector('.modal-merchant').textContent = offer.merchantName || offer.bank;
  let cashbackDisplay = displayCashbackAmount(parseCashbackAmount(offer));

  // Fill in the template with offer data
  modal.querySelector('.modal-logo').src = offer.logo;
  modal.querySelector('.modal-logo').alt = offer.merchantName;
  modal.querySelector('.modal-merchant').textContent = offer.merchantName || offer.bank;
  modal.querySelector('.modal-amount').textContent = cashbackDisplay;
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
// Update the populateFilterDropdowns function to work with checkboxes instead of dropdowns
function populateFilterDropdowns() {
  // Clear existing options
  bankFilterContainer.innerHTML = '';

  // Get unique banks and cards
  const banks = Array.from(new Set(allOffers.map(offer => offer.bank)));

  // Add banks as checkboxes
  banks.forEach(bank => {
    const checkboxContainer = document.createElement('div');
    checkboxContainer.className = 'hero-suggestion-btn';

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
}
// Add this new function to handle filtering in any view
function updateCurrentView() {
  // Check which view is currently active and update accordingly
  filterAndDisplayOffers();
}

// Extract the common filtering logic into a separate function
function getFilteredOffers() {
  // Get all filter values
  // const searchTerm = currentSearch;
  // const pluralSearchTerm = nlp(searchTerm).nouns().toPlural().out() || searchTerm + "s";
  // const singularSearchTerm = nlp(searchTerm).nouns().toSingular().out() || searchTerm;
  // const pluralSearchTermPhraseRegex = new RegExp('\\b' + pluralSearchTerm.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&').replace(/\s+/g, '\\s?') + '\\b', 'i');
  // const singularSearchTermPhraseRegex = new RegExp('\\b' + singularSearchTerm.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&').replace(/\s+/g, '\\s?') + '\\b', 'i');
  // console.log('Search term:', singularSearchTerm, pluralSearchTerm);
  const selectedBanks = Array.from(document.querySelectorAll('.bank-checkbox:checked')).map(cb => cb.value);
  const selectedTypes = Array.from(document.querySelectorAll('.type-checkbox:checked')).map(cb => cb.value);

  // Filter offers by all criteria
  let filteredOffers = allOffers.filter(offer => {
    // const normalizedDescription = getPlainText(offer.description)
    //   .toLowerCase()
    //   .split(/(?<=[.?!])(?=\s*[A-Z])/) // Split into sentences
    //   .filter(sentence =>
    //     !/(not eligible|exclusions?|excludes?|excluding|not applicable|not qualifying)/i.test(sentence)
    //   )
    //   .join(' ');
    // Handle bank filtering - more lenient
    const matchesBank = selectedBanks.length === 0 ||
      (offer.bank && selectedBanks.includes(offer.bank));
    // Handle search filtering
    // const matchesSearch = searchTerm === '' ||
    //   (offer.merchantName && offer.merchantName.toLowerCase().split(/\W+/).includes(singularSearchTerm)) ||
    //   (offer.merchantName && offer.merchantName.toLowerCase().split(/\W+/).includes(pluralSearchTerm)) ||
    //   // (offer.category && offer.category.toLowerCase().split(/\W+/).includes(singularSearchTerm)) ||
    //   // (offer.category && offer.category.toLowerCase().split(/\W+/).includes(pluralSearchTerm)) ||
    //   (offer.merchantWebsiteTitle && offer.merchantWebsiteTitle.toLowerCase().split(/\W+/).includes(singularSearchTerm)) ||
    //   (offer.merchantWebsiteTitle && offer.merchantWebsiteTitle.toLowerCase().split(/\W+/).includes(pluralSearchTerm)) ||
    //   (offer.merchantWebsiteDescription && offer.merchantWebsiteDescription.toLowerCase().split(/\W+/).includes(singularSearchTerm)) ||
    //   (offer.merchantWebsiteDescription && offer.merchantWebsiteDescription.toLowerCase().split(/\W+/).includes(pluralSearchTerm)) ||
    //   (singularSearchTerm.includes(' ')? offer.merchantName && singularSearchTermPhraseRegex.test(offer.merchantName.toLowerCase()): false) ||
    //   (pluralSearchTerm.includes(' ')? offer.merchantName && pluralSearchTermPhraseRegex.test(offer.merchantName.toLowerCase()): false) ||
    //   (singularSearchTerm.includes(' ')? offer.merchantWebsiteTitle && singularSearchTermPhraseRegex.test(offer.merchantWebsiteTitle.toLowerCase()): false) ||
    //   (pluralSearchTerm.includes(' ')? offer.merchantWebsiteTitle && pluralSearchTermPhraseRegex.test(offer.merchantWebsiteTitle.toLowerCase()): false) ||
    //   (singularSearchTerm.includes(' ')? offer.merchantWebsiteDescription && singularSearchTermPhraseRegex.test(offer.merchantWebsiteDescription.toLowerCase()): false) ||
    //   (pluralSearchTerm.includes(' ')? offer.merchantWebsiteDescription && pluralSearchTermPhraseRegex.test(offer.merchantWebsiteDescription.toLowerCase()): false);
    // new RegExp(`\\b(${singularSearchTerm}|${pluralSearchTerm})\\b`, 'i').test(normalizedDescription);

    // Determine offer type
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(offer.type);
    // Return true only if all filters match
    // return matchesBank && matchesType && matchesSearch;
    return matchesBank && matchesType;
  });

  // Sort offers
  filteredOffers = sortOffers(filteredOffers, sortOptions.value);

  if (filteredOffers.length === 0) {
    noOfferLabel.style.display = '';
    statLabel.style.display = 'none';
  }
  else {
    // Calculate total value
    noOfferLabel.style.display = 'none';
    statLabel.style.display = '';
    const totalValue = calculateTotalValue(filteredOffers);
    console.log('Total Value:', totalValue);
    document.getElementById('total-value').textContent = `$${(totalValue / filteredOffers.length).toFixed(2)}`;
  }

  return filteredOffers;
}

// Now simplify filterAndDisplayOffers to use the common function
function filterAndDisplayOffers() {
  // Clear current display
  offersGrid.innerHTML = '';

  // Get filtered offers
  const filteredOffers = getFilteredOffers();

  // Create and append offer cards
  filteredOffers.slice(0, 50).forEach(offer => {
    const offerCard = createOfferCard(offer);
    offersGrid.appendChild(offerCard);
  });

  allOffers && allOffers.length > 0 ? filterContainer.style.display = '' : filterContainer.style.display = 'none';
  allOffers && allOffers.length > 0 ? bankFilterContainer.style.display = '' : bankFilterContainer.style.display = 'none';
}