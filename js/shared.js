// Shared library for GetCashback extension
// Local storage data structure
// 'bank': bank
// 'offercontainer_raw': raw HTML string
// 'offercontainer_processed_${bank}_${card}': {
//   'bank': bank,
//   'card': card,
//   'totalOffers': totalOffers,
//   'offers': [
//       'id': offerId,
//       'description': description,
//       'logo': logo,
//       'merchantName': merchantName,
//       'merchantWebsite': merchantWebsite,
//       'cashbackAmount': cashbackAmount,
//       'expiration': expiration,
//       'redeemLink': redeemLink,
//       'redeemLocation': redeemLocation,
//       'redeemLocationLat': redeemLocationLat,
//       'redeemLocationLon': redeemLocationLon,
//       'category': category,
//       'estValue': estValue,
//       'minSpend': minSpend,
//       'maxCashback': maxCashback,
//       'type': type,
//       'activated': true | false,
//       'redeemed': true | false,
//       'attemptedRedeem': true | false,
//       'lastUpdated': lastUpdated
//   ],
//   'lastUpdated': lastUpdated
// }
// Define a template variable as a dictionary for different banks
const bankTemplates = {
  'American Express': {
    'allOffersUrl': 'https://global.americanexpress.com/offers',
    'bankLogo': 'https://www.americanexpress.com/content/dam/amex/us/merchant/supplies-uplift/product/images/img-WEBLOGO1-01.jpg',
    'disclaimer': 'Disclaimer: We are not affiliated with any banks or offer providers. This tool helps you discover and manage offers already available in your own accounts. All cashback and rewards are processed directly by the banks or merchants, according to their program terms and conditions.',
    'activationAttribute': 'div[id="{offerId}"] button[data-test-id="button-row"]',
    'inlineOfferDescription': true,
    'cardSelector': 'div[data-testid="simple_switcher_selected_option_display"]',
    'activateButton': 'div[id="{offerId}"] button.offer-cta-v',
    'offerContainer': {
      'type': 'xpath',
      'value': '//section[@class="offers-list"]'
    },
    'card': {
      'type': 'xpath',
      'value': '//div[@data-testid="simple_switcher_selected_option_display"]/@aria-label'
    },
    // The following are all based on all offers page
    'offers': {
      'type': 'xpath',
      //'value': '//div[@role="button" and @data-cy="commerce-tile"]'
      'value': '//div[@data-locator-id="merchantOffer"]'
    },
    'merchantName': {
      'type': 'xpath',
      'value': '//div[contains(@class, "offer-info")]/p[2]/text()'
    },
    'cashbackAmount': {
      'type': 'xpath',
      'value': '//div[contains(@class, "offer-info")]/p[1]/text()'
    },
    'logo': {
      'type': 'xpath',
      'value': '//img[1]/@src'
    },
    'offerId': {
      'type': 'xpath',
      'value': '//div[@aria-label="offer info"]/@id'
    },
    'redeemLink': {
      'type': 'xpath',
      'value': '//button[contains(@class, "offer-cta-v")]/a/@href'
    },
    'description': {
      'type': 'xpath',
      'value': '//section[contains(@class, "offer-details")]'
    },
    'expiration': {
      'type': 'xpath',
      'value': '//span[@data-testid="expirationDate"]/text()'
    }
  },
  'Bank of America': {
    'allOffersUrl': 'https://secure.bankofamerica.com/customer-deals/',
    'bankLogo': 'https://www1.bac-assets.com/homepage/spa-assets/images/assets-images-global-logos-bac-logo-v2-CSX3648cbbb.svg',
    'disclaimer': 'Disclaimer: We are not affiliated with any banks or offer providers. This tool helps you discover and manage offers already available in your own accounts. All cashback and rewards are processed directly by the banks or merchants, according to their program terms and conditions.',
    'activationAttribute': '[data-deal-id="{offerId}"]',
    'inlineOfferDescription': true,
    'offerContainer': {
      'type': 'xpath',
      'value': '//div[@id="bamdAvailableDeals" or @id="bamdWidgetWrapper"]'
    },
    'card': {
      'type': 'xpath',
      'value': '//span[@id="singleAcnt"]/text()'
    },
    // The following are all based on all offers page
    'offers': {
      'type': 'xpath',
      'value': '//div[@aria-describedby="company_product_desc_ada"]'
    },
    'merchantName': {
      'type': 'xpath',
      'value': '//div[@id="company_product_desc_ada"]//img/@alt'
    },
    'cashbackAmount': {
      'type': 'xpath',
      'value': '//span[@class="deal-offer-percent"]/text()'
    },
    'logo': {
      'type': 'xpath',
      'value': '//div[@id="company_product_desc_ada"]//img/@src'
    },
    'offerId': {
      'type': 'xpath',
      'value': '//a/@data-deal-id'
    },
    'redeemLink': {
      'type': 'xpath',
      'value': '//div[@class="col3_dealinfo"]//a/@href'
    },
    'description': {
      'type': 'xpath',
      'value': '//div[@class="col3_dealinfo"]'
    },
    'expiration': {
      'type': 'xpath',
      'value': '//p[contains(@class, "deal-exp-date")]/text()'
    }
  },
  'Capital One': {
    'allOffersUrl': 'https://capitaloneoffers.com/c1-offers/',
    'applyLink': 'https://i.capitalone.com/G7Htl2QMG',
    'disclaimer': 'Disclaimer: We are not affiliated with any banks or offer providers. This tool helps you discover and manage offers already available in your own accounts. All cashback and rewards are processed directly by the banks or merchants, according to their program terms and conditions.',  
    'allOffersJson': 'https://capitaloneoffers.com/c1-offers?_data=routes/c1-offers._index&limit=500&offset=',
    'inlineOfferDescription': true,
    'activationAttribute': 'div.standard-tile',
    'activateButton': {
      'type': 'xpath',
      'value': '//button[contains(text(), "Activate In-Store")]'
    },
    'termsButton': {
      'type': 'xpath',
      'value': '//span[contains(text(), "offer terms")]'
    },
    'closeButtonPostActivation': '#radix-\\:rb\\: button',
    'offerContainer': {
      'type': 'xpath',
      'value': '//div[contains(@class, "offers")]'
    },
    'card': {
      'type': 'xpath',
      'value': '//p[contains(@class, "md:block")]/text()'
    },
    // The following are all based on all offers page
    'offers': {
      'type': 'xpath',
      'value': '//div[contains(@class, "standard-tile")]'
    },
    'merchantName': {
      'type': 'xpath',
      'value': '//div[contains(@class, "content-image")]//img/@alt'
    },
    'cashbackAmount': {
      'type': 'xpath',
      'value': '//div[contains(@class, "standard-tile")]/div[2]/text()'
    },
    'logo': {
      'type': 'xpath',
      'value': '//div[contains(@class, "standard-tile")]//img/@src'
    },
    'offerId': {
      'type': 'xpath',
      'value': '//div[contains(@class, "standard-tile")]//img/@src'
    },
    'redeemLink': {
      'type': 'text',
      'value': 'https://capitaloneoffers.com/c1-offers/'
    },
    'description': {
      'type': 'xpath',
      'value': '//div[contains(@class, "content-container")]'
    }
  },
  'Chase': {
    'allOffersUrl': 'https://secure.chase.com/web/auth/dashboard#/dashboard/merchantOffers/offer-hub',
    'applyLink': 'https://www.referyourchasecard.com/19s/4172W0IZKK',
    'bankLogo': 'https://www.chase.com/etc/designs/chase-ux/css/img/newheaderlogo.svg',
    'disclaimer': 'Disclaimer: We are not affiliated with any banks or offer providers. This tool helps you discover and manage offers already available in your own accounts. All cashback and rewards are processed directly by the banks or merchants, according to their program terms and conditions.',
    'activationAttribute': '[id="{offerId}"]',
    'inlineOfferDescription': false,
    'offerContainer': {
      'type': 'xpath',
      //'value': '//div[@data-testid="offerTileGridContainer" or @id="connected-ovd-homepage-entrypoint-container"]'
      //'value': '//div[@data-testid="offerTileGridContainer"]'
      'value': '//div[@id="app-container"]'
    },
    'card': {
      'type': 'xpath',
      'value': '//mds-select[@id="select-credit-card-account"]/mds-select-option[@selected="true"]/@label'
      // 'value': '//span[@class="mds-select__decoration-button"]/text()'
      //'value': '//div[@data-testid="AccountInfoToken"]/following-sibling::div[1]/span/text()'
    },
    // The following are all based on all offers page
    'offers': {
      'type': 'xpath',
      //'value': '//div[@role="button" and @data-cy="commerce-tile"]'
      'value': '//div[@class="offerTileGridItemContainer" or @role="listitem"]'
    },
    'merchantName': {
      'type': 'xpath',
      'value': '(//span[contains(@class, "semanticColorTextRegular")])[1]/text()'
    },
    'cashbackAmount': {
      'type': 'xpath',
      'value': '(//span[contains(@class, "semanticColorTextRegular")])[2]/text()'
    },
    'logo': {
      'type': 'xpath',
      'value': '//img[@data-testid="logo"]/@src'
    },
    'offerId': {
      'type': 'xpath',
      //'value': '//div[@role="button" and @data-cy="commerce-tile"]/@id'
      'value': '//div[@class="offerTileGridItemContainer" or @role="listitem"]/div/@id'
    },
    'redeemLink': {
      'type': 'xpath',
      'value': '//a[@id="cardlytics-link-tag-0"]/@href'
    },
    'description': {
      'type': 'xpath',
      'value': '//div[@data-cy="offer-detail-text-and-disclaimer-link-container"]'
    }
  },
  'Paypal': {
    'allOffersUrl': 'https://www.paypal.com/offers/',
    'bankLogo': 'https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg',
    'disclaimer': 'Disclaimer: We are not affiliated with any banks or offer providers. This tool helps you discover and manage offers already available in your own accounts. All cashback and rewards are processed directly by the banks or merchants, according to their program terms and conditions.',
    'activateFirst': true,
    'activationAttribute': 'button[data-cy="tertiary_offer_card__tile"]',
    'inlineOfferDescription': true,
    'activateButton': 'button[data-cy="base_offer_card__auto_save"]',
    'offerContainer': {
      'type': 'xpath',
      'value': '//div[@data-cy="tertiary_card_list__grid"]'
    },
    'card': {
      'type': 'text',
      'value': 'Paypal'
    },
    // The following are all based on all offers page
    'offers': {
      'type': 'xpath',
      'value': '//section[@data-cy="tertiary_offer_card"]'
    },
    'merchantName': {
      'type': 'xpath',
      'value': '//div[@class="shopping-view-dvg3v2-text_caption-line_clamp_2" or @class="saved-offers-dvg3v2-text_caption-line_clamp_2"]/text()'
    },
    'cashbackAmount': {
      'type': 'xpath',
      'value': '//div[@class="shopping-view-3zwvz-text_body-line_clamp_2" or @class="saved-offers-3zwvz-text_body-line_clamp_2"]/text()'
    },
    'logo': {
      'type': 'xpath',
      'value': '//img[@data-cy="logo__image"]/@src'
    },
    'offerId': {
      'type': 'xpath',
      'value': '//div[@class="shopping-view-dvg3v2-text_caption-line_clamp_2" or @class="saved-offers-dvg3v2-text_caption-line_clamp_2"]/text()'
    },
    'redeemLink': {
      'type': 'xpath',
      'value': '//a[@class="shopping-view-pevsdf-button_base-text_button_lg-btn_full_width" or @class="saved-offers-pevsdf-button_base-text_button_lg-btn_full_width"]/@href'
    },
    'description': {
      'type': 'xpath',
      'value': '//article[@data-cy="responsive_modal_dialog"]'
    }
  },
  'Wells Fargo': {
    'allOffersUrl': 'https://web.secure.wellsfargo.com/auth/deals-portal',
    'allOffersButton': 'button[data-testid="deals-view-all"]',
    'disclaimer': 'Disclaimer: We are not affiliated with any banks or offer providers. This tool helps you discover and manage offers already available in your own accounts. All cashback and rewards are processed directly by the banks or merchants, according to their program terms and conditions.',
    'activationAttribute': '[data-id="{offerId}"]',
    'inlineOfferDescription': true,
    'closeButtonPostActivation': 'button[data-testid="modal-lightbox-close-icon"]',
    'offerContainer': {
      'type': 'xpath',
      'value': '//div[@data-en="available-deals"]'
    },
    'card': {
      'type': 'text',
      'value': 'Wells Fargo Card'
    },
    // The following are all based on all offers page
    'offers': {
      'type': 'xpath',
      'value': '//div[@role="button"]'
    },
    'merchantName': {
      'type': 'xpath',
      'value': '//div[@role="button"]/@aria-label'
    },
    'cashbackAmount': {
      'type': 'xpath',
      'value': '//p[@data-testid="available-cashback"]/text()'
    },
    'logo': {
      'type': 'xpath',
      'value': '//img[1]/@src'
    },
    'offerId': {
      'type': 'xpath',
      'value': '//div/@data-id'
    },
    'redeemLink': {
      'type': 'xpath',
      'value': '//a[@id="merchant-link-1"]/@href'
    },
    'description': {
      'type': 'xpath',
      'value': '//div[@data-testid="DealDetailsTerms"]'
    },
    'expiration': {
      'type': 'xpath',
      'value': '//p[@data-testid="daysLeft"]/text()'
    }
  },
  'Want More?': {
    'allOffersUrl': 'https://forms.gle/GDb9PSxhYu25Menk7',
    'allOfferDescription': 'Missing your favorite cashback providers? Click below and help us improve!',
  }
};

const categoryKeywords = {
  "Food / Dining": ["restaurant", "dining", "grill", "cafe", "burger", "bistro", "eatery", "pizza", "brewery", "food", "meal", "lunch", "dinner", "breakfast", "bar", "pub", "taco", "sushi", "steakhouse", "bakery", "cookie", "coffee", "tea", "deli", "ice cream", "masala", "momo", "cantina", "vitality bowls", "biriyani", "chocolate", "wine", "sandwich", "pasta", "seafood", "bbq", "barbecue", "ramen", "noodle", "buffet", "cuisine", "chef", "catering", "takeout", "panda express", "snack", "starbucks", "meet fresh", "alcohol", "chicken", "fish"],
  "Groceries": ["grocery", "supermarket", "fresh", "organic", "food store", "produce", "butcher", "pantry", "farmer market", "grocery service", "dairy", "meat", "poultry", "seafood", "vegetable", "fruit", "frozen food", "canned good", "bulk food", "natural food", "sam's club"],
  "Retail": ["clothing", "cloth", "apparel", "shoe", "store", "outlet", "fashion", "retail", "shop", "boutique", "department store", "mall", "accessory", "jewelry", "wear", "garment", "shirt", "dress", "cleaning product", "organizing product", "mattress", "flower", "fabric", "bra", "underwear", "furniture", "fragrance", "deodorant", "gear", "lego", "electronic", "home good", "decor", "kitchenware", "appliance", "hardware", "tool", "toy", "book", "gift", "cosmetic", "beauty", "makeup", "skincare", "handbag", "luggage", "watch", "water bottle", "PC", "laptop", "tablet", "scent", "rose", "pet", "dog", "cat", "puppy", "cookware", "gadget", "wardrobe", "footwear", "tieks", "patagonia", "bike", "fragrancenet.com", "netgear", "clothes"],
  "Gas / Auto": ["gas", "fuel", "auto", "car wash", "oil change", "mechanic", "tire", "vehicle", "automotive", "car", "truck", "repair", "maintenance", "part", "dealership", "garage", "body shop", "transmission", "brake", "engine", "battery", "diesel", "electric vehicle", "charging station"],
  "Travel / Lodging": ["hotel", "motel", "resort", "airline", "rental car", "airbnb", "flight", "vacation", "travel", "booking", "lodging", "stay", "accommodation", "trip", "tourism", "cruise", "airport", "vacation rental", "rental", "destination", "tour", "excursion", "adventure", "beach", "backpacking", "hostel", "bed and breakfast", "all-inclusive", "passport", "international", "domestic", "reservation", "rental car", "train", "bus", "shuttle", "airfare", "Madame Tussauds"],
  "Entertainment": ["movie", "amusement", "park", "museum", "zoo", "entertainment", "concert", "theater", "cinema", "show", "event", "ticket", "performance", "festival", "game", "sport", "music", "streaming", "play", "comedy", "nightlife", "club", "bar", "lounge", "arcade", "bowling", "golf", "theme park", "water park", "aquarium", "gallery", "exhibit", "tour", "attraction", "ticketsmarter", "audiobook", "kindle", "podcast", "newsletter", "news", "paramount+", "starz", "discovery+", "everand"],
  "Services / Utilities": ["utility", "internet", "cell", "phone", "insurance", "cable", "bill", "water", "electric", "provider", "coverage", "banking", "financial", "legal", "consulting", "accounting", "tax", "cleaning", "landscaping", "plumbing", "electrical", "contractor", "repair", "installation", "maintenance", "security", "protection", "monitoring", "software", "cloud", "storage", "hosting", "domain", "development", "design", "marketing", "advertising", "printing", "postal", "moving", "wireless", "zoom", "mailchimp.com", "quickbooks", "online safety"],
  "Health / Wellness": ["pharmacy", "dental", "fitness", "gym", "health", "wellness", "optical", "med", "medical", "doctor", "clinic", "hospital", "therapy", "vitamin", "supplement", "multivitamin", "probiotic", "superfood", "immunity", "gut", "skin", "hair", "metabolism", "treadmill", "trainer", "weight", "exercise", "yoga", "muscle", "mri", "dentist", "optometrist", "chiropractor", "massage", "spa", "salon", "beauty", "cosmetic", "procedure", "treatment", "rehabilitation", "physical therapy", "mental health", "counseling", "nutrition", "diet", "organic", "natural", "holistic", "alternative medicine", "meditation", "mindfulness", "sleep", "glass", "lens", "eyeware", "vision", "electrolyte", "nutrient", "hydration", "betterhelp", "cleanser", "serums", "moisturizers", "eye exam"],
  "Education": ["learning", "course", "training", "research", "education", "masterclass", "school", "university", "tutor", "homework"]
};

// Merchant name to domain mapping for redeem links
const merchantFixMap = {
  'Visible by Verizon': 'visible.com',
  'Frank & Eileen': 'frankandeileen.com',
  'AT&T': 'att.com',
  'AT&T Mobility': 'www.att.com/plans/wireless',
  'T-Mobile': 't-mobile.com',
  'Barnes & Noble': 'barnesandnoble.com',
  'Bed Bath & Beyond': 'bedbathandbeyond.com',
  'H&M': 'hm.com',
  'M&M\'s': 'mms.com',
  'P&G': 'pg.com',
  'P.F. Chang\'s': 'pfchangs.com',
  'J.Crew': 'jcrew.com',
  'Lowe\'s': 'lowes.com',
  'Macy\'s': 'macys.com',
  'Kohl\'s': 'kohls.com',
  'Walgreens': 'walgreens.com',
  'Walmart': 'walmart.com',
  'Target': 'target.com',
  'Best Buy': 'bestbuy.com',
  'Staples': 'staples.com',
  'LEGO': 'lego.com',
  'Norton': 'norton.com'
};

const extractionPatterns = {
  cashbackFixed: /earn\s+\$(\d+(?:\.\d+)?)(?:\s+back)?/i,
  cashbackPercentage: /earn\s+(\d+(?:\.\d+)?)%(?:\s+back)?/i,
  cashbackPoints: /earn\s+\+?(\d{1,3}(?:,\d{3})*)(?:\s+[^\d]+?)?\s+(?:points?|pts|miles?)(?:\s+back)?/i,
  maxRedemptions: /up\s+to\s+(\d+)(?:\s+times|\s*x)/i,
  cashbackAmount: /(?<!(?:spend|for)\s*)\$(\d+(?:\.\d+)?)/i,
  discountPattern: /not\s+(?:a\s+)?(?:.*\s+)?cash\s*back(?:\s+offer|\s+deal)?|this\s+is\s+not\s+(?:a\s+)?cash\s*back|no\s+cash\s*back/i,
  addressPatterns: [
    /\d+\s(?:\w+\s+)*(?:Expy|Real|Avenue|Ave|Boulevard|Blvd|Circle|Cir|Court|Ct|Drive|Dr|Lane|Ln|Parkway|Pkwy|Place|Pl|Plaza|Plz|Road|Rd|Square|Sq|Street|St|Terrace|Ter|Trail|Trl|Way|Wy)([\w\s]+)?[,\s]+([A-Za-z\s]+)?[,\s]+([A-Za-z]{2,})[,\s]+(\d{5}(?:-\d{4})?)/gi
  ],
  redeemLinkHref: /(?:must|required to)(?:\s+\w+)*\s+link|specific\s+link\s+(?:required|needed)|use\s+link|follow\s+this\s+link/i,
  redeemLinkText: /(?:must|required to)(?:\s+\w+)*\s+link|specific\s+link\s+(?:required|needed)|use\s+link|follow\s+this\s+link(?:.*?)((?:https?:\/\/)?[a-z0-9][-a-z0-9]*\.[a-z0-9][-a-z0-9.]*(?:\/[^\s]*|\?[^\s]*)?)/i,
  minSpend: [
    // Match $ amount after "spend", with word boundaries to prevent over-matching
    // Updated to make commas optional in numbers like $1,000
    /spend(?:\s+\w+)*\s+(\$\d+(?:,\d{3})*(?:\.\d+)?)\b/i,
    // Match "spend $X or more"
    /spend(?:\s+\w+)*\s+(\$\d+(?:,\d{3})*(?:\.\d+)?)\s+or more/i,
    // Additional common patterns with better boundaries
    /minimum\s+purchase\s+of\s+(\$\d+(?:,\d{3})*(?:\.\d+)?)\b/i,
    /purchase\s+of\s+(\$\d+(?:,\d{3})*(?:\.\d+)?)\s+or more/i,
    /minimum\s+(\$\d+(?:,\d{3})*(?:\.\d+)?)\b/i
  ],
  maxCashback: [
    // Pattern from both popup.js and wallet.js
    /(\$\d+(?:\.\d+)?)\s+cash\s?back\s+maximum/i,
    /limit(?:\s+\w+)*\s+(\$\d+(?:\.\d+)?)\s+back/i,
    // Additional common patterns
    /maximum\s+cash\s?back\s+of\s+(\$\d+(?:\.\d+)?)/i,
    /up\s+to\s+(\$\d+(?:\.\d+)?)\s+cash\s?back/i,
    /earn\s+up\s+to\s+(\$\d+(?:\.\d+)?)/i,
    /cash\s?back\s+up\s+to\s+(\$\d+(?:\.\d+)?)/i
  ],
  expiryDate: [
    // "by", "Expires" or "Expire" followed by any words and then MM/DD/YY format
    /(expires?|by)(?:\s+\w+){0,5}\s+(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/i,

    // "by", "Expires" or "Expire" followed by any words and then Month DD, YYYY format
    /(expires?|by)(?:\s+\w+){0,5}\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{2,4})/i,

    // "by", "Expires" or "Expire" followed by any words and then YYYY-MM-DD format
    /(expires?|by)(?:\s+\w+){0,5}\s+(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/i
  ],
  difficultyPatterns: [
    {
      pattern: /online only/i, penalty: 1, reason: 'Online only',
      term: { text: "Online purchases only", type: "neutral" }
    },
    {
      pattern: /in[\s-]store only/i, penalty: 1, reason: 'In-store only',
      term: { text: "In-store purchases only", type: "negative" }
    },
    {
      pattern: /(?:must|required to)(?:\s+\w+)*\s+link|specific\s+link\s+(?:required|needed)|use\s+link|follow\s+this\s+link/i,
      penalty: 1, reason: 'Must use specific link',
      term: { text: "Must use specific link", type: "negative" }
    },
    {
      pattern: /first\s+(purchase|transaction|payment)|single\s+(purchase|transaction)|one\s+time\s+(only|use)|one\s+(offer|purchase|transaction)\s+per\s+(customer|account|card)/i,
      penalty: 1,
      reason: 'Single redemption only',
      term: { text: "Single redemption only", type: "negative" }
    },
    {
      pattern: /new\s+(customer|user)/i, penalty: 2, reason: 'New customers only',
      term: { text: "New customers only", type: "negative" }
    },
    {
      pattern: /promo\s+code|promocode|coupon\s+code/i, penalty: 1, reason: 'Requires promo code',
      term: { text: "Promo code required", type: "negative" }
    },
    {
      pattern: /sms|text\s+message|mobile\s+number/i, penalty: 2, reason: 'Requires SMS',
      term: { text: "SMS registration required", type: "negative" }
    },
    {
      pattern: /(select|participating)\s+location/i, penalty: 2, reason: 'Location restrictions',
      term: { text: "Select locations only", type: "negative" }
    },
    {
      pattern: /(select|eligible)\s+(product|service|item|items)/i, penalty: 2, reason: 'Product/service restrictions',
      term: { text: "Eligible products only", type: "negative" }
    }
  ]
};

// Fetch configuration from Chrome storage and replace bankTemplates and categoryKeywords if available
if (typeof chrome !== 'undefined' && chrome.storage) {
  chrome.storage.local.get(['clientInfo'], function (result) {
    if (result.clientInfo && result.clientInfo.config) {
      try {
        const configData = JSON.parse(result.clientInfo.config);
        if (configData.bankTemplates) {
          // Clear all existing properties
          Object.keys(bankTemplates).forEach(key => { delete bankTemplates[key]; });
          Object.assign(bankTemplates, configData.bankTemplates);
          console.log('Bank templates replaced with configuration from storage');
        }
        if (configData.categoryKeywords) {
          // Clear all existing properties
          Object.keys(categoryKeywords).forEach(key => { delete categoryKeywords[key]; });
          Object.assign(categoryKeywords, configData.categoryKeywords);
          console.log('Category keywords replaced with configuration from storage');
        }
        if (configData.merchantFixMap) {
          // Clear all existing properties
          Object.keys(merchantFixMap).forEach(key => { delete merchantFixMap[key]; });
          Object.assign(merchantFixMap, configData.merchantFixMap);
          console.log('Merchant website map replaced with configuration from storage');
        }
        if (configData.extractionPatterns) {
          // Function to parse regex string in format "/pattern/flags"
          function parseRegexString(regexStr) {
            // Extract pattern and flags from string like "/pattern/flags"
            const match = regexStr.match(/^\/(.*)\/([gimuy]*)$/);
            if (match) {
              const [, pattern, flags] = match;
              return new RegExp(pattern, flags);
            }
            return new RegExp(regexStr);
          }

          // Clear all existing properties
          Object.keys(extractionPatterns).forEach(key => { delete extractionPatterns[key]; });

          // Process each pattern from the config
          for (const [key, value] of Object.entries(configData.extractionPatterns)) {
            if (Array.isArray(value)) {
              // Handle array of patterns (like minSpend, maxCashback, etc.)
              extractionPatterns[key] = value.map(item => {
                if (typeof item === 'object' && item !== null) {
                  // Handle complex patterns like difficultyPatterns
                  return {
                    ...item,
                    pattern: typeof item.pattern === 'string' ?
                      parseRegexString(item.pattern) : item.pattern
                  };
                } else {
                  // Simple string pattern
                  return parseRegexString(item);
                }
              });
            } else if (typeof value === 'object' && value !== null) {
              // Handle complex objects
              extractionPatterns[key] = { ...value };
              if (value.pattern) {
                extractionPatterns[key].pattern = parseRegexString(value.pattern);
              }
            } else {
              // Simple string pattern
              extractionPatterns[key] = parseRegexString(value);
            }
          }

          console.log('Extraction patterns replaced with configuration from storage');
        }
      } catch (e) {
        console.error('Error parsing clientInfo.config:', e);
      }
    }
  });
}

const avgSpendByCategory = {
  "Food / Dining": 30,
  "Groceries": 100,
  "Retail": 100,
  "Gas / Auto": 60,
  "Travel / Lodging": 250,
  "Entertainment": 75,
  "Services / Utilities": 150,
  "Health / Wellness": 113,
  "Education": 90,
  "Other": 100
};

function getTextWithLineBreaks(element) {
  let text = '';
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase();
      if (['br', 'p', 'div', 'li', 'ul', 'ol', 'section', 'span'].includes(tag)) {
        text += getTextWithLineBreaks(node) + '\n';
      } else {
        text += getTextWithLineBreaks(node);
      }
    }
  }
  return text;
}

function getPlainText(description) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = description;
  return getTextWithLineBreaks(tempDiv).replace(/\n{2,}/g, '\n').trim();
}

function classifyOffer(offer) {
  if (!offer.description) {
    return "Other";
  }
  if (typeof nlp != 'undefined') {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = offer.description;

    const text = getTextWithLineBreaks(tempDiv).toLowerCase().replace(/\n{2,}/g, '\n').trim();
    const merchantName = offer.merchantName ? offer.merchantName.toLowerCase() : '';

    // Use compromise to parse the description text
    const descDoc = nlp(text);

    // Extract only nouns from non-negative sentences
    const nonNegativeSentences = descDoc.sentences().filter(s => !s.verbs().isNegative().found);

    // Get complete noun phrases as an array (preserving multi-word phrases)
    let nounPhrases = nonNegativeSentences.nouns().normalize({
      whitespace: true,
      case: true,
      punctuation: true,  // This removes punctuation
      unicode: true,
      contractions: true,
      acronyms: true,
      parentheses: true,
      possessives: true,
      plurals: false,
      verbs: false
    })
      .toSingular() // more effective than normalize() function
      .out('array');

    // Process merchant name separately
    if (merchantName) {
      nounPhrases.push(merchantName);
    }

    // Remove duplicates and empty strings from nouns array
    nounPhrases = [...new Set(nounPhrases)].filter(phrase => phrase.length > 0);

    // Score each category based on noun phrase matches
    let scores = {};

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      // Score based on noun phrase matches with keywords
      let score = 0;

      for (const phrase of nounPhrases) {
        // Check if any keyword matches the phrase as a whole or if the phrase contains the keyword
        for (const keyword of keywords) {
          const keywordLower = keyword.toLowerCase();

          if (
            phrase === keywordLower || // Exact match
            new RegExp(`\\b${keywordLower}\\b`).test(phrase) || // Word boundary match
            phrase.startsWith(`${keywordLower}-`) || // Hyphenated word starting with keyword
            phrase.endsWith(`-${keywordLower}`) // Hyphenated word ending with keyword
          ) {
            score += 1;
          }
        }
      }
      scores[category] = score;
    }
    // Pick the highest scoring category
    const bestMatch = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    return bestMatch[1] > 0 ? bestMatch[0] : "Other";
  }
}

// Function to get element based on template
function getElementFromTemplate(bank, elementKey, context = document, getAllNodes = false) {
  if (!bankTemplates[bank] || !bankTemplates[bank][elementKey]) {
    console.log(`Template not found for ${bank} - ${elementKey}`);
    return null;
  }

  let parsedContext = context;
  if (!context.getElementById) {
    const parser = new DOMParser();
    parsedContext = parser.parseFromString(context, "text/html");
  }

  const template = bankTemplates[bank][elementKey];
  console.log("getElementFromTemplate context for %s:", elementKey, parsedContext);
  switch (template.type) {
    case 'id':
      return parsedContext.getElementById ? parsedContext.getElementById(template.value) : null;
    case 'class':
      return parsedContext.getElementsByClassName ? parsedContext.getElementsByClassName(template.value)[0] : null;
    case 'selector':
      return parsedContext.querySelector ? parsedContext.querySelector(template.value) : null;
    case 'selectorAll':
      return parsedContext.querySelectorAll ? parsedContext.querySelectorAll(template.value) : null;
    case 'xpath':
      // Enhanced XPath handling for any context
      try {
        // Create a snapshot type XPath result
        const xpathResult = parsedContext.evaluate(
          template.value,
          parsedContext, // Use the provided context
          null,
          getAllNodes ? XPathResult.ORDERED_NODE_SNAPSHOT_TYPE : XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        );

        if (getAllNodes) {
          // Return all matching nodes for XPath
          const result = [];
          for (let i = 0; i < xpathResult.snapshotLength; i++) {
            result.push(xpathResult.snapshotItem(i));
          }
          return result.length > 0 ? result : null;
        } else {
          // Return just the first node
          return xpathResult.singleNodeValue;
        }
      } catch (e) {
        console.error('XPath evaluation error:', e);
        return null;
      }
    default:
      console.log(`Unknown template type: ${template.type}`);
      return null;
  }
}

// For unknown reasons, result is not null only when it's MutationObserver. 
function getDynamicElementFromTemplate(result, callback, bank, elementKey, context = document, getAllNodes = false) {
  // Try to find dynamically loaded element
  let timeout;
  if (!result) {
    // Try to find the AJAX loaded element
    const observer = new MutationObserver((mutations, obs) => {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        console.log("DOM is stable. Extracting final data...");
        // Use template to find the container (in document context)
        result = getElementFromTemplate(bank, elementKey, context, getAllNodes);

        if (result) {
          callback(result);
          obs.disconnect();
        }
      }, 2000); // Wait 2 second after the last change
    });
    // Observe changes in the entire document
    observer.observe(document.body, { childList: true, subtree: true });
  }
}

// Process offer container to extract structured data
function processOfferContainer(container, bank) {
  let data = {
    card: '',
    totalOffers: 0,
    offers: []
  };

  if (!container || !bank || !bankTemplates[bank]) {
    console.log(`Invalid container or bank: ${container}, ${bank}`);
    return data;
  }

  // Extract card information using template
  const cardElement = getElementFromTemplate(bank, 'card', container);
  console.log(cardElement);
  if (cardElement) {
    data.card = cardElement.textContent.trim();
  }

  // Extract total number of offers using template
  const totalOffersElement = getElementFromTemplate(bank, 'totalOfferCount', container);
  if (totalOffersElement) {
    console.log(totalOffersElement);
    const totalText = totalOffersElement.textContent.trim();
    const match = totalText.match(/\d+/);
    data.totalOffers = match ? parseInt(match[0], 10) : 0;
  }

  // Extract offers using template - simplified approach
  let offerElements = [];

  if (bankTemplates[bank]['offers']) {
    // Use the enhanced getElementFromTemplate with getAllNodes=true for collection types
    const elements = getElementFromTemplate(bank, 'offers', container, true);

    if (elements) {
      // Handle both array and NodeList results
      console.log(elements);
      offerElements = Array.isArray(elements) ? elements :
        (elements.length !== undefined ? Array.from(elements) : [elements]);
    }
  }

  // Process each offer element
  offerElements.forEach((offerElement, index) => {
    console.log("Processing:", getElementFromTemplate(bank, 'offerId', offerElement.innerHTML));
    const offer = {
      id: getElementFromTemplate(bank, 'offerId', offerElement.outerHTML).textContent.replace("id=", ""),
      description: '', // Changed from descriptions array to a single description string
      logo: getElementFromTemplate(bank, 'logo', offerElement.innerHTML).textContent.replace("src=", ""),
      merchantName: getElementFromTemplate(bank, 'merchantName', offerElement.innerHTML).textContent,
      cashbackAmount: getElementFromTemplate(bank, 'cashbackAmount', offerElement.innerHTML).textContent.replace(" cash back", ""),
    };
    data.offers.push(offer);
  });
  console.log("Count of offers", data.offers.length);

  return data;
}

// New function to count collected but not redeemed offers
function updateCollectedOffersCount() {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(null, function (items) {
      let collectedCount = 0;

      // Look for collected offers in storage
      for (const key in items) {
        // Check for collected offers data
        if (key.startsWith('collected_offers_')) {
          const offers = items[key];
          if (Array.isArray(offers)) {
            // Count offers that have been collected but not redeemed and not expired
            const unredeemed = offers.filter(offer => !offer.redeemed && getExpiryDate(offer) >= new Date());
            collectedCount += unredeemed.length;
          }
        }
      }

      console.log('Updated badge with collected unredeemed offers count:', collectedCount);
    });
  }
}

// Add this to the end of the file
// Initialize badge when extension loads
if (typeof chrome !== 'undefined' && chrome.runtime) {
  // Update badge when extension loads
  updateCollectedOffersCount();

  // Listen for changes in storage to update badge
  if (chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener(function (changes, namespace) {
      if (namespace === 'local') {
        // Check if any collected offers have changed
        const hasCollectedOfferChanges = Object.keys(changes).some(key =>
          key.startsWith('collected_offers_')
        );

        if (hasCollectedOfferChanges) {
          // Update badge count when collected offers change
          updateCollectedOffersCount();
        }
      }
    });
  }
}

/**
 * Extract expiration date from offer description
 * @param {string} description - The offer description text
 * @returns {string|null} - ISO date string or null if not found
 */
function extractExpiryDateFromDescription(description) {
  if (!description) return null;

  // Ensure description is a string
  const desc = String(description);

  // Common date patterns in offer descriptions
  const patterns = extractionPatterns.expiryDate;

  for (const pattern of patterns) {
    const match = desc.match(pattern);
    if (match) {
      let year, month, day;

      if (pattern.toString().includes('Jan(?:uary)?|Feb')) {
        // Handle Month DD, YYYY format
        const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
        // Find the index of the first capture group that contains a month name
        let monthIndex = 0;
        for (let i = 1; i < match.length; i++) {
          if (match[i] && monthNames.some(m => match[i].toLowerCase().startsWith(m.substring(0, 3)))) {
            monthIndex = i;
            break;
          }
        }

        const monthName = match[monthIndex].toLowerCase();
        month = monthNames.findIndex(m => monthName.startsWith(m.substring(0, 3))) + 1;
        day = parseInt(match[monthIndex + 1], 10);
        year = parseInt(match[monthIndex + 2], 10);
      } else if (pattern.toString().includes('\\d{4})[\\\/\\-]')) {
        // Handle YYYY-MM-DD format
        // Find the index of the first capture group that looks like a 4-digit year
        let yearIndex = 0;
        for (let i = 1; i < match.length; i++) {
          if (match[i] && /^\d{4}$/.test(match[i])) {
            yearIndex = i;
            break;
          }
        }

        year = parseInt(match[yearIndex], 10);
        month = parseInt(match[yearIndex + 1], 10);
        day = parseInt(match[yearIndex + 2], 10);
      } else {
        // Handle MM/DD/YYYY or MM/DD/YY format
        // Find the first group of digits that looks like a month
        let monthIndex = 0;
        for (let i = 1; i < match.length; i++) {
          if (match[i] && /^\d{1,2}$/.test(match[i]) && parseInt(match[i], 10) >= 1 && parseInt(match[i], 10) <= 12) {
            monthIndex = i;
            break;
          }
        }

        month = parseInt(match[monthIndex], 10);
        day = parseInt(match[monthIndex + 1], 10);
        year = parseInt(match[monthIndex + 2], 10);
      }

      // Handle 2-digit years by converting to 4-digit
      if (year < 100) {
        // Assume 20xx for years less than 100
        year = 2000 + year;
      }

      // Validate date components
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 2000) {
        // In Javascript, months are 0-indexed, so subtract 1 from month
        return month + '/' + day + '/' + year;
      }
    }
  }

  return null;
}

/**
 * Extract minimum spend amount from offer description
 * @param {string} description - The offer description text
 * @returns {string|null} - Minimum spend amount or null if not found
 */
function extractMinSpendFromDescription(description) {
  if (!description) return null;

  // Common patterns for minimum spend in descriptions
  const patterns = extractionPatterns.minSpend;

  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      // Validate that we have a proper currency amount
      const extractedValue = match[1].trim();
      // Ensure it starts with $ and contains only digits, optional commas, and possibly one decimal point
      if (/^\$\d+(?:,\d{3})*(?:\.\d+)?$/.test(extractedValue)) {
        return extractedValue;
      }
    }
  }

  return null;
}

/**
 * Extract maximum cashback amount from offer description
 * @param {string} description - The offer description text
 * @returns {string|null} - Maximum cashback amount or null if not found
 */
function extractMaxCashbackFromDescription(description) {
  if (!description) return null;

  // Common patterns for maximum cashback in descriptions
  const patterns = extractionPatterns.maxCashback;

  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

/**
 * Calculate and format the expiration date string
 * @param {string} expiryDate - The expiration date in ISO format
 * @returns {string} Formatted expiration date string
 */
function formatExpiryDate(expiryDate) {
  let expiryText = 'No expiration date';
  if (expiryDate !== Infinity && expiryDate) {
    const now = new Date(new Date().toDateString());
    const expiryDateObj = expiryDate instanceof Date ? expiryDate : new Date(expiryDate);
    const formattedDate = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(expiryDateObj);

    if (expiryDateObj < now) {
      expiryText = 'Expired';
    } else {
      expiryText = `Expires on ${formattedDate}`;
    }
  }
  return expiryText;
}

/**
 * Get expiration date as timestamp for sorting and comparison
 * @param {Object} offer - The offer object
 * @returns {number} - Timestamp or Infinity if no valid date found
 */
function getExpiryDate(offer) {
  // Check if offer.expiration exists and is a valid date string
  if (!offer.expiration) {
    return Infinity; // Return Infinity for offers with no expiration
  }

  // Try to create a Date object and check if it's valid
  const expiryDate = new Date(offer.expiration);

  // Check if the date is valid (invalid dates return NaN when converted to number)
  if (isNaN(expiryDate.getTime())) {
    return Infinity; // Return Infinity for invalid dates
  }

  return expiryDate;
}

/**
 * Helper function to extract redeem link from offer description
 * @param {Object} offer - The offer object
 * @returns {string|null} - URL to redeem the offer or null if not found
 */
function getRedeemLink(offer) {
  // If offer already has a redeemLink property, use that
  if (offer.redeemLink) return offer.redeemLink;

  // Check if description exists
  if (!offer.description) return null;

  // Create a temporary element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = offer.description;

  const redeemLink = getElementFromTemplate(offer.bank, 'redeemLink', offer.description)?.textContent.replace(/href/gi, "").trim() || '';
  if (redeemLink) return redeemLink;

  // Check if the offer requires a specific link
  const specificLinkRequired = tempDiv.textContent.match(extractionPatterns.redeemLinkHref);

  if (specificLinkRequired) {
    // Find all links in the description
    const links = tempDiv.querySelectorAll('a');
    if (links.length > 0) {
      // Return the first link (most likely the redeem link)
      return links[0].href;
    }

    // Look for URLs in text after "must use" or similar phrases
    const urlMatch = tempDiv.textContent.match(extractionPatterns.redeemLinkText);
    if (urlMatch && urlMatch[2]) {
      // Strip trailing period if it exists (sentence ending)
      let url = urlMatch[2].replace(/\.$/, '');
      // Add https:// prefix if not present
      return url.startsWith('http') ? url : `https://${url}`;
    }

    // If specific link is required but not found, return null
    return null;
  }

  // If no specific link is required, try to generate a merchant website URL
  if (offer.merchantName) {
    // Check if we have a direct mapping for this merchant
    if (merchantFixMap[offer.merchantName]) {
      return `https://www.${merchantFixMap[offer.merchantName]}`;
    }
  }

  return null;
}

// Helper function to assess how easy cashback can be earned
function assessCashbackEase(offer) {
  let score = 10; // Start with perfect score
  let reasons = [];
  let terms = []; // Add terms array to store key terms

  if (!offer.description) return { ease: 'unknown', score: 5, reasons: ['No description available'], terms: [] };

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = `<p>${offer.cashbackAmount}</p>${offer.description}`;
  const description = tempDiv.textContent.toLowerCase();

  // Common patterns that indicate difficulty (could be expanded based on actual data)
  const difficultyPatterns = extractionPatterns.difficultyPatterns;

  // Apply all pattern checks
  difficultyPatterns.forEach(item => {
    if (item.checkFunction) {
      // For patterns that use a custom check function
      const result = item.checkFunction(description);
      if (result.match) {
        score -= result.penalty;
        reasons.push(result.reason);
        terms.push(result.term);

        // Remove the positive term for low minimum spend
        // No longer adding: terms.push({ text: `Low minimum spend: $${result.value}`, type: "positive" });
      }
    } else if (item.pattern) {
      // For patterns with regex
      const match = description.match(item.pattern);
      if (match) {
        // For patterns with thresholds (like minimum spend)
        if (item.threshold !== undefined && match[1]) {
          const amount = parseFloat(match[1].replace('$', ''));
          if (amount > item.threshold) {
            score -= item.penalty;
            reasons.push(item.reason);
            terms.push(item.term);
          }
        } else {
          // For patterns without thresholds
          score -= item.penalty;
          reasons.push(item.reason);
          terms.push(item.term);
        }
      }
    }
  });

  // Determine ease category based on score
  let ease;
  if (score >= 8) {
    ease = 'easy';
  } else if (score >= 6) {
    ease = 'medium';
  } else {
    ease = 'hard';
  }

  return { ease, score, reasons, terms };
}

/**
 * Helper function to extract physical addresses from offer description
 * @param {Object} offer - The offer object
 * @returns {string|null} - First physical address to redeem the offer or null if none found
 */
function getRedeemLocation(offer) {
  // Check if description exists
  if (!offer.description) return null;

  // Create a temporary element to parse HTML if description contains HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = offer.description;

  // Directly replace HTML elements that represent line breaks with actual newlines
  let htmlWithNewlines = tempDiv.innerHTML
    .replace(/<br\s*\/?>/gi, ', ')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/span>/gi, '\n')
    .replace(/<p>/gi, '')
    .replace(/<div>/gi, '')
    .replace(/<span>/gi, '')
    .replace(/<a\w*>/gi, '\n')
    .replace(/<\/a>/gi, '\n')
    .replace(/,/gi, ', ');

  // Update the div with our modified HTML
  tempDiv.innerHTML = htmlWithNewlines;
  // Get text with our newlines intact
  let plainText = tempDiv.textContent || offer.description;
  // Simplified address patterns
  const addressPatterns = extractionPatterns.addressPatterns;
  // Try each pattern to find an address
  for (const pattern of addressPatterns) {
    const match = plainText.match(pattern);
    if (match && match[0]) {
      // Format the address: normalize spaces and commas
      return match[0]
        .replace(/[\r\n]+/g, ' ') // Replace line breaks with spaces
        .replace(/\s+/g, ' ') // Normalize multiple spaces
        .replace(/\s*,\s*/g, ', ') // Normalize commas
        .trim();
    }
  }
  // Return array of locations or null if none found
  return null;
}

/**
 * Estimate the value of an offer based on cashback amount, category spending, and constraints
 * @param {Object} offer - The offer object
 * @returns {Promise<number>} - Promise resolving to estimated value in dollars
 */
function estimateValue(offer, spend = null) {
  return new Promise((resolve) => {
    if (!offer) {
      resolve(0);
      return;
    }

    // Get category for the offer
    const category = offer.category || 'Other';

    // Get average spend for this category from preferences or defaults
    chrome.storage.local.get('preferences', (result) => {
      let avgSpend = parseFloat(spend) || 0;
      if (avgSpend === 0) {
        // Try to get user preferences first
        if (result.preferences &&
          result.preferences.avgSpendByCategory &&
          result.preferences.avgSpendByCategory[category]) {
          avgSpend = result.preferences.avgSpendByCategory[category];
        } else {
          // Fall back to default values
          avgSpend = avgSpendByCategory[category] || 0;
        }
        avgSpend = parseFloat(avgSpend);
      }
      // If no cashback amount, return 0
      if (!offer.cashbackAmount) {
        resolve(0);
        return;
      }
      parseCashbackAmount(offer);
      let minSpend = offer.minSpend || extractMinSpendFromDescription(offer.description) || '';
      let maxCashback = offer.maxCashback || extractMaxCashbackFromDescription(offer.description) || '';
      minSpend = parseFloat(offer.minSpend?.replace(/[$,]/g, '')) || 0;
      maxCashback = parseFloat(offer.maxCashback?.replace(/[$,]/g, '')) || Infinity;
      // If minimum spend is higher than average spend for category, return 0
      if (minSpend > avgSpend && minSpend > 0) {
        resolve(0);
        return;
      }
      let value = 0;
      if (offer.cashbackPercent) {
        // Percentage cashback
        const percentage = parseFloat(offer.cashbackPercent.replace('%', '')) / 100;
        value = avgSpend * percentage;
      } else if (offer.cashbackFixed) {
        // Fixed dollar amount - target amount between "earn" and "back"
        value = parseFloat(offer.cashbackFixed.replace(/[$,]/g, ''));
        // Cap value at maxCashback
      }
      if (value > maxCashback) {
        value = maxCashback;
      }
      // Check for "up to X times" to multiply the value
      if (offer.maxRedemptions) {
        const times = parseInt(offer.maxRedemptions, 10);
        if (!isNaN(times) && times > 0) {
          value *= times;
        }
      }
      resolve(value);
    });
  });
}

/**
 * Extracts the type of offer from its description.
 * @param {Object} offer - The offer object containing description.
 * @returns {string} - "discount" or "cashback"
 */
function extractType(offer) {
  if (!offer.description) {
    return "cashback"; // Default to cashback if no description
  }

  // Create a temporary div to handle HTML content
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = offer.description;
  const text = tempDiv.textContent.toLowerCase();

  // Split the text into sentences
  const sentences = text.split(/[.!?]+\s+/);

  // The pattern to look for in each individual sentence
  const discountPattern = extractionPatterns.discountPattern;

  // Check each sentence individually
  for (const sentence of sentences) {
    if (discountPattern.test(sentence)) {
      return "discount";
    }
  }

  if (offer.cashbackPoints) {
    return "points";
  }

  return "cashback";
}

async function getMerchantWebsite(offer) {
  if (!offer.merchantName) {
    return null;
  }

  const query = `
      SELECT ?website WHERE {
        ?company rdfs:label "${offer.merchantName.trim()}"@en.
        ?company wdt:P856 ?website.
      } LIMIT 1
    `;

  const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    headers: { 'Accept': 'application/sparql-results+json' }
  });

  const data = await response.json();
  return data?.results?.bindings?.[0]?.website?.value || null;
}

// Helper function to check if a merchant name is a website URL
function isUrlString(string) {
  if (!string) return false;
  // Regular expression to validate domain format
  const urlPattern = /^(?:https?:\/\/)?[a-zA-Z0-9][a-zA-Z0-9-]{0,63}[a-zA-Z0-9](?:\.[a-zA-Z]{2,63})+(\/[^\s]*)?$/;
  // Check if the string matches the domain pattern
  return urlPattern.test(string);
}

function recordAttemptedRedeem(offer) {
  // Update the offer in local storage
  chrome.storage.local.get(null, function (items) {
    for (const key in items) {
      if (key.startsWith('offercontainer_processed_')) {
        const offerData = items[key];
        if (offerData && offerData.offers) {
          const updatedOffers = offerData.offers.map(o => {
            if (o.id === offer.id && o.bank === offer.bank && o.card === offer.card) {
              return { ...o, attemptedRedeem: true };
            }
            return o;
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

/**
 * Sum up the earned amount from all redeemed offers.
 * @returns {Promise<number>} - The total earned amount from redeemed offers.
 */
function getTotalEarned() {
  return new Promise((resolve, reject) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(null, function (items) {
        let totalEarned = 0;

        // Iterate through all items in storage
        for (const key in items) {
          if (key.startsWith('offercontainer_processed_')) {
            const offerData = items[key];
            if (offerData && offerData.offers) {
              // Sum up the earned amounts of redeemed offers
              offerData.offers.forEach(offer => {
                if (offer.redeemed && offer.earned) {
                  totalEarned += parseFloat(offer.earned) || 0;
                }
              });
            }
          }
        }

        console.log('Total earned from redeemed offers:', totalEarned);
        resolve(totalEarned);
      });
    } else {
      reject(new Error('Chrome storage is not available.'));
    }
  });
}

function parseCashbackAmount(offer) {
  const cashbackAmount = offer.cashbackAmount.trim();
  // Check for "up to X times" to multiply the value
  const timesMatch = cashbackAmount.match(extractionPatterns.maxRedemptions);
  if (timesMatch && timesMatch[1]) {
    const times = parseInt(timesMatch[1], 10);
    if (!isNaN(times) && times > 0) {
      offer.maxRedemptions = times;
    }
  }
  if (cashbackAmount.includes('%')) {
    // Percentage cashback
    const percentageMatch = cashbackAmount.match(extractionPatterns.cashbackPercentage);
    if (percentageMatch && percentageMatch[1]) {
      offer.cashbackPercent = percentageMatch[1];
    }
    else {
      offer.cashbackPercent = cashbackAmount;
    }
  }
  if (cashbackAmount.includes('$')) {
    // Fixed dollar amount - target amount between "earn" and "back"
    const earnBackMatch = cashbackAmount.match(extractionPatterns.cashbackFixed);
    if (earnBackMatch && earnBackMatch[1]) {
      offer.cashbackFixed = earnBackMatch[1];
    } else {
      // Fall back to the first dollar amount if no "earn $X back" pattern
      const dollarMatch = cashbackAmount.match(extractionPatterns.cashbackAmount);
      if (dollarMatch && dollarMatch[1]) {
        offer.cashbackFixed = dollarMatch[1];
      }
      else {
        offer.cashbackFixed = '';
      }
      // Double check description to remove non-cashback amounts
      if (offer.description) {
        const dollarMatchDescription = offer.description.match(extractionPatterns.cashbackAmount);
        if (!dollarMatchDescription) {
          offer.cashbackFixed = '';
        }
      }
    }
  }
  if (/points?|pts/i.test(cashbackAmount)) {
    const pointMatch = cashbackAmount.match(extractionPatterns.cashbackPoints);
    if (pointMatch && pointMatch[1]) {
      offer.cashbackPoints = pointMatch[1];
    }
  }
  return offer;
}

function displayCashbackAmount(offer) {
  let displayCashbackAmountText = 'No cashback';
  let minSpend = offer.minSpend || extractMinSpendFromDescription(offer.description) || '';
  let maxCashback = offer.maxCashback || extractMaxCashbackFromDescription(offer.description) || '';

  if (offer.cashbackPercent) {
    displayCashbackAmountText = `Earn ${offer.cashbackPercent.replace(/%/g, "")}%`;
    if (maxCashback) {
      displayCashbackAmountText += `, up to $${maxCashback.replace(/\$/g, "")}`;
    }
  } else if (offer.cashbackFixed) {
    displayCashbackAmountText = `Earn $${offer.cashbackFixed.replace(/\$/g, "")}`;
    if (maxCashback) {
      displayCashbackAmountText += `, up to $${maxCashback.replace(/\$/g, "")}`;
    }
  } else if (offer.cashbackPoints) {
    if (offer.cashbackPoints !== "1") {
      displayCashbackAmountText = `Earn ${offer.cashbackPoints} points`;
    }
    else {
      displayCashbackAmountText = `Earn ${offer.cashbackPoints} point`;
    }
  }
  if (offer.maxRedemptions) {
    displayCashbackAmountText += `, up to ${offer.maxRedemptions} times`;
  }
  if (minSpend) {
    displayCashbackAmountText = `Spend $${minSpend.replace(/\$/g, "")} or more, ` + displayCashbackAmountText.toLowerCase();
  }
  return displayCashbackAmountText;
}

function extractKeywordsFromDescription(offer) {
  if (!offer.description) {
    return [];
  }
  if (typeof nlp != 'undefined') {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = offer.description;

    const text = tempDiv.textContent.toLowerCase();

    // Use compromise to parse the description text
    const descDoc = nlp(text);

    // Extract only nouns from non-negative sentences
    const nonNegativeSentences = descDoc.sentences();//.filter(s => !s.verbs().isNegative().found);

    // Get complete noun phrases as an array (preserving multi-word phrases)
    let nounPhrases = nonNegativeSentences.nouns().normalize({
      whitespace: true,
      case: true,
      punctuation: true,  // This removes punctuation
      unicode: true,
      contractions: true,
      acronyms: true,
      parentheses: true,
      possessives: true,
      plurals: false,
      verbs: false
    })
      .toSingular() // more effective than normalize() function
      .out('array');

    // Remove duplicates and empty strings from nouns array
    nounPhrases = [...new Set(nounPhrases)].filter(phrase => phrase.length > 0);
    return nounPhrases;
  }
}