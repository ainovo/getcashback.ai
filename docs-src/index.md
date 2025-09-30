---
layout: null
title: GetCashback.ai Help Center
description: Find answers to your questions about GetCashback.ai - your AI-powered cashback copilot
---

<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{{ page.title }}</title>
  <meta name="description" content="{{ page.description }}">
  <link rel="icon" href="{{ '/images/icon48.png' | relative_url }}" type="image/png">
  <link rel="stylesheet" href="{{ '/css/index.css' | relative_url }}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    .docs-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    
    .docs-hero {
      text-align: center;
      margin-bottom: 60px;
    }
    
    .docs-hero h1 {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 16px;
      color: white;
    }
    
    .docs-hero p {
      font-size: 20px;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 32px;
    }
    
    .search-container {
      max-width: 600px;
      margin: 0 auto;
      position: relative;
    }
    
    .topics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-top: 60px;
      align-items: stretch;
    }
    
    .topic-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-radius: 16px;
      padding: 32px;
      transition: transform 0.2s, box-shadow 0.2s;
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      flex-direction: column;
    }
    
    .topic-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
    }
    
    .topic-header {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .topic-icon {
      width: 48px;
      height: 48px;
      margin-right: 16px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      flex-shrink: 0;
    }
    
    .topic-icon img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 50%;
    }
    
    .topic-card h3 {
      font-size: 24px;
      font-weight: 600;
      margin: 0;
      color: white;
    }
    
    .topic-card p {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 20px;
      line-height: 1.5;
    }
    
    .topic-links {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .topic-links li {
      margin-bottom: 8px;
    }
    
    .topic-links a {
      color: rgba(255, 255, 255, 0.9);
      text-decoration: none;
      font-size: 14px;
      transition: color 0.2s;
    }
    
    .topic-links a:hover {
      color: white;
      text-decoration: underline;
    }
    
    .icon-intro { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .icon-privacy { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
    .icon-mobile { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
    .icon-extension { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
    .icon-clients { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
    .icon-max { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); }
    .icon-offers { background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); }
    .icon-faq { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); }
    
    @media (max-width: 1024px) {
      .topics-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    @media (max-width: 768px) {
      .docs-hero h1 {
        font-size: 36px;
      }
      
      .topics-grid {
        grid-template-columns: 1fr;
      }
      
      .topic-card {
        padding: 24px;
      }
    }
    
    .topic-card.hidden {
      display: none;
    }
    
    .topic-card-link {
      text-decoration: none;
      color: inherit;
      display: flex;
    }
    
    .topic-card-link:hover {
      text-decoration: none;
      color: inherit;
    }
  </style>
</head>

<body>
  <!-- Header Bar -->
  <div class="header-bar">
    <div class="logo-title">
      <img src="{{ '/images/icon48.png' | relative_url }}" alt="GetCashback.ai" class="logo" width="50" />
      <a href="https://getcashback.ai" style="text-decoration: none;"><h1 class="title">GetCashback.ai</h1></a>
    </div>
    <div class="header-buttons">
      <a class="header-button ios-button" href="https://testflight.apple.com/join/fDWWqBay" target="_blank">
        <svg fill="#000000" height="20px" width="20px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve">
          <path d="M0,0v512h512V0H0z M265.1,142.1c9.4-11.4,25.4-20.1,39.1-21.1c2.3,15.6-4.1,30.8-12.5,41.6c-9,11.6-24.5,20.5-39.5,20
       C249.6,167.7,256.6,152.4,265.1,142.1z M349.4,339.9c-10.8,16.4-26,36.9-44.9,37.1c-16.8,0.2-21.1-10.9-43.8-10.8
       c-22.7,0.1-27.5,11-44.3,10.8c-18.9-0.2-33.3-18.7-44.1-35.1c-30.2-46-33.4-99.9-14.7-128.6c13.2-20.4,34.1-32.3,53.8-32.3
       c20,0,32.5,11,49.1,11c16,0,25.8-11,48.9-11c17.5,0,36,9.5,49.2,26c-43.2,23.7-36.2,85.4,7.5,101.9
       C360,322.1,357.1,328.1,349.4,339.9z" />
        </svg>
        <span class="button-text">App (Beta)</span>
      </a>
      <a class="header-button chrome-button"
        href="https://chromewebstore.google.com/detail/getcashbackai-your-cashba/peckgggpikdpgcgdodoljaclafolemde"
        target="_blank">
        <svg class="button-icon" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="10" r="10" fill="#FFFFFF" />
          <circle cx="10" cy="10" r="4" fill="#FFFFFF" />
          <path d="M10,5h8.33a10,10,0,0,0-17.32,0L5.67,12.5l.004-.001A5,5,0,0,1,10,5Z" fill="#EA4335" />
          <path d="M14.33,12.5,10,20a10,10,0,0,0,8.66-15H10l-.001.004A5,5,0,0,1,14.33,12.5Z" fill="#FBBC04" />
          <path d="M5.67,12.5,1.34,5a10,10,0,0,0,8.66,15l4.33-7.5-.003-.003a5,5,0,0,1-8.66.003Z" fill="#34A853" />
          <circle cx="10" cy="10" r="3" fill="#1A73E8" />
        </svg>
        <span class="button-text">Extension</span>
      </a>
    </div>
  </div>

  <!-- Main Content -->
  <div class="docs-container">
    <div class="docs-hero">
      <h1>Help Center</h1>
      <p>Find answers to your questions about GetCashback.ai</p>
      <div class="search-container">
        <div class="hero-searchbox">
          <input type="text" id="search-input" class="hero-search-input" placeholder="Search for help articles..." />
        </div>
      </div>
    </div>

    <div class="topics-grid">
      <!-- Get to Know GetCashback.ai -->
      <a href="{{ '/articles/get-to-know-getcashback/' | relative_url }}" class="topic-card-link">
        <div class="topic-card">
          <div class="topic-header">
            <div class="topic-icon icon-intro">
              <img src="{{ '/images/icon128.png' | relative_url }}" alt="GetCashback.ai Icon">
            </div>
            <h3>Get to Know GetCashback.ai</h3>
          </div>
          <p>Learn the basics of how GetCashback.ai works and how it can help you maximize your cashback rewards.</p>
        </div>
      </a>

      <!-- Browser Extension -->
      <a href="{{ '/articles/browser-extension/' | relative_url }}" class="topic-card-link">
        <div class="topic-card">
          <div class="topic-header">
            <div class="topic-icon icon-extension">🧩</div>
            <h3>Browser Extension</h3>
          </div>
          <p>Get help with installing and using the GetCashback.ai browser extension for Chrome and Edge.</p>
        </div>
      </a>

      <!-- Mobile App -->
      <a href="{{ '/articles/mobile-app/' | relative_url }}" class="topic-card-link">
        <div class="topic-card">
          <div class="topic-header">
            <div class="topic-icon icon-mobile">📱</div>
            <h3>Mobile App</h3>
          </div>
          <p>Learn how to install GetCashback.ai mobile app on your iOS or Android device.</p>
        </div>
      </a>

      <!-- Ask Max -->
      <a href="{{ '/articles/ask-max/' | relative_url }}" class="topic-card-link">
        <div class="topic-card">
          <div class="topic-header">
            <div class="topic-icon icon-max">
              <img src="{{ '/images/max.png' | relative_url }}" alt="Max AI Assistant">
            </div>
            <h3>Ask Max</h3>
          </div>
          <p>Get help from Max, your AI cashback copilot, and learn how to make the most of AI-powered features.</p>
        </div>
      </a>

      <!-- Linking Offers -->
      <a href="{{ '/articles/linking-offers/' | relative_url }}" class="topic-card-link">
        <div class="topic-card">
          <div class="topic-header">
            <div class="topic-icon icon-offers">🔗</div>
            <h3>Linking Offers</h3>
          </div>
          <p>Understand how to automatically link cashback offers to your accounts.</p>
        </div>
      </a>

      <!-- FAQs -->
      <a href="{{ '/articles/faqs/' | relative_url }}" class="topic-card-link">
        <div class="topic-card">
          <div class="topic-header">
            <div class="topic-icon icon-faq">❓</div>
            <h3>FAQs</h3>
          </div>
          <p>Find quick answers to the most commonly asked questions about GetCashback.ai.</p>
        </div>
      </a>
    </div>
  </div>

  <!-- Footer -->
  <footer class="site-footer">
    <div class="footer-container">
      <div class="footer-logo-col">
        <img src="{{ '/images/icon128.png' | relative_url }}" alt="GetCashback.ai" class="footer-logo" width="40" />
      </div>
      <div class="footer-col">
        <div class="footer-title">Built by <a href="https://ainovo.co">Ainovo Co.</a> with AI</div>
        <!-- Social Logos -->
        <div class="footer-social-logos">
          <a href="https://www.linkedin.com/company/ainovoco" target="_blank">
            <svg height="24px" width="24px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 382 382" xml:space="preserve">
              <path style="fill:#0077B7;" d="M347.445,0H34.555C15.471,0,0,15.471,0,34.555v312.889C0,366.529,15.471,382,34.555,382h312.889
                     C366.529,382,382,366.529,382,347.444V34.555C382,15.471,366.529,0,347.445,0z M118.207,329.844c0,5.554-4.502,10.056-10.056,10.056
                     H65.345c-5.554,0-10.056-4.502-10.056-10.056V150.403c0-5.554,4.502-10.056,10.056-10.056h42.806
                     c5.554,0,10.056,4.502,10.056,10.056V329.844z M86.748,123.432c-22.459,0-40.666-18.207-40.666-40.666S64.289,42.1,86.748,42.1
                     s40.666,18.207,40.666,40.666S109.208,123.432,86.748,123.432z M341.91,330.654c0,5.106-4.14,9.246-9.246,9.246H286.73
                     c-5.106,0-9.246-4.14-9.246-9.246v-84.168c0-12.556,3.683-55.021-32.813-55.021c-28.309,0-34.051,29.066-35.204,42.11v97.079
                     c0,5.106-4.139,9.246-9.246,9.246h-44.426c-5.106,0-9.246-4.14-9.246-9.246V149.593c0-5.106,4.14-9.246,9.246-9.246h44.426
                     c5.106,0,9.246,4.14,9.246,9.246v15.655c10.497-15.753,26.097-27.912,59.312-27.912c73.552,0,73.131,68.716,73.131,106.472
                     L341.91,330.654L341.91,330.654z" />
            </svg>
          </a>
          <a href="https://www.instagram.com/ainovo.co/" target="_blank">
            <svg height="24px" width="24px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 551.034 551.034" xml:space="preserve">
              <g id="XMLID_13_">

                <linearGradient id="XMLID_2_" gradientUnits="userSpaceOnUse" x1="275.517" y1="4.5714" x2="275.517"
                  y2="549.7202" gradientTransform="matrix(1 0 0 -1 0 554)">
                  <stop offset="0" style="stop-color:#E09B3D" />
                  <stop offset="0.3" style="stop-color:#C74C4D" />
                  <stop offset="0.6" style="stop-color:#C21975" />
                  <stop offset="1" style="stop-color:#7024C4" />
                </linearGradient>
                <path id="XMLID_17_" style="fill:url(#XMLID_2_);" d="M386.878,0H164.156C73.64,0,0,73.64,0,164.156v222.722
             c0,90.516,73.64,164.156,164.156,164.156h222.722c90.516,0,164.156-73.64,164.156-164.156V164.156
             C551.033,73.64,477.393,0,386.878,0z M495.6,386.878c0,60.045-48.677,108.722-108.722,108.722H164.156
             c-60.045,0-108.722-48.677-108.722-108.722V164.156c0-60.046,48.677-108.722,108.722-108.722h222.722
             c60.045,0,108.722,48.676,108.722,108.722L495.6,386.878L495.6,386.878z" />

                <linearGradient id="XMLID_3_" gradientUnits="userSpaceOnUse" x1="275.517" y1="4.5714" x2="275.517"
                  y2="549.7202" gradientTransform="matrix(1 0 0 -1 0 554)">
                  <stop offset="0" style="stop-color:#E09B3D" />
                  <stop offset="0.3" style="stop-color:#C74C4D" />
                  <stop offset="0.6" style="stop-color:#C21975" />
                  <stop offset="1" style="stop-color:#7024C4" />
                </linearGradient>
                <path id="XMLID_81_" style="fill:url(#XMLID_3_);" d="M275.517,133C196.933,133,133,196.933,133,275.516
             s63.933,142.517,142.517,142.517S418.034,354.1,418.034,275.516S354.101,133,275.517,133z M275.517,362.6
             c-48.095,0-87.083-38.988-87.083-87.083s38.989-87.083,87.083-87.083c48.095,0,87.083,38.988,87.083,87.083
             C362.6,323.611,323.611,362.6,275.517,362.6z" />

                <linearGradient id="XMLID_4_" gradientUnits="userSpaceOnUse" x1="418.306" y1="4.5714" x2="418.306"
                  y2="549.7202" gradientTransform="matrix(1 0 0 -1 0 554)">
                  <stop offset="0" style="stop-color:#E09B3D" />
                  <stop offset="0.3" style="stop-color:#C74C4D" />
                  <stop offset="0.6" style="stop-color:#C21975" />
                  <stop offset="1" style="stop-color:#7024C4" />
                </linearGradient>
                <circle id="XMLID_83_" style="fill:url(#XMLID_4_);" cx="418.306" cy="134.072" r="34.149" />
              </g>
            </svg>
          </a>
          <a href="https://www.tiktok.com/@ainovo.co" target="_blank">
            <svg height="24px" width="24px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 333335 333336"
              shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality"
              fill-rule="evenodd" clip-rule="evenodd">
              <path
                d="M72464 0h188407c39856 0 72464 32609 72464 72465v188407c0 39855-32608 72464-72464 72464H72464C32608 333336 0 300727 0 260872V72465C0 32609 32608 0 72464 0zm127664 70642c337 2877 825 5661 1461 8341l6304 2c1170 9991 4006 19119 8465 26697 7282 6745 16797 10904 28280 11641v9208c2131 444 4350 746 6659 894v29690c-14847 1462-27841-3426-42981-12531l2324 50847c0 16398 61 23892-8738 38977-20546 35222-58194 36677-82176 18323-12269-4256-23069-12466-29881-23612-19875-32516-1959-85512 55687-90966l-94 7835v1970c3105-646 6365-1144 9794-1468v31311c-12484 2057-20412 5890-24119 12980-7424 14197-4049 26526 3716 34309 16276 2796 34401-8481 31673-43351V70644h33628z"
                fill="#1a121f" />
              <path
                d="M200128 70642c3093 26406 18915 45038 44510 46681v25046l-165 15v-21275c-25595-1642-40311-17390-43404-43796l-27114-1v111095c3912 50005-35050 51490-49955 32531 17482 10934 45867 3826 42501-39202V70641h33628zm-72854 184165c-15319-3153-29249-12306-37430-25689-19875-32516-1959-85512 55687-90966l-94 7835c-53444 8512-58809 65920-44009 89802 5707 9209 15076 15686 25846 19019z"
                fill="#26f4ee" />
              <path
                d="M207892 78985c1761 15036 7293 28119 16454 36903-12866-6655-20630-19315-23062-36905l6609 2zm36580 47511c2181 463 4456 777 6824 929v29690c-14847 1462-27841-3426-42981-12531l2324 50847c0 16398 61 23892-8738 38977-21443 36760-61517 36743-85239 15810 30930 17765 84928 3857 84829-56453v-55496c15141 9105 28134 13993 42981 12530v-24302zm-99036 21460c3105-646 6365-1144 9794-1468v31311c-12484 2057-20412 5890-24119 12980-10441 19964 474 36238 14923 41365-18075-649-36010-19214-23555-43031 3707-7089 10474-10923 22958-12980v-28177z"
                fill="#fb2c53" />
              <path
                d="M201068 77313c3093 26406 17809 42154 43404 43796v29689c-14847 1462-27841-3425-42981-12530v55496c119 72433-77802 77945-100063 42025-14800-23881-9435-81290 44009-89802v30147c-12483 2057-19250 5891-22958 12980-22909 43808 56997 69872 51475-706V77313l27114 1z"
                fill="#fefefe" />
            </svg>
          </a>
        </div>
      </div>
      <div class="footer-col">
        <div class="footer-title">Product</div>
        <a href="https://testflight.apple.com/join/fDWWqBay">iOS App (Beta)</a>
        <a href="https://play.google.com/apps/testing/ai.getcashback.android">Android App (Beta)</a>
        <a href="https://chromewebstore.google.com/detail/getcashbackai-your-cashba/peckgggpikdpgcgdodoljaclafolemde">Chrome
          Extension</a>
        <a href="https://microsoftedge.microsoft.com/addons/detail/getcashbackai-your-cas/mkiiailpejmomkpmpkllhlbmmhihahii">Microsoft Edge
          Extension</a>
        <a href="../wallet.html">Extension Live Demo (Desktop Only)</a>
      </div>
      <div class="footer-col">
        <div class="footer-title">Resources</div>
        <a href="{{ '/' | relative_url }}">Help Center</a>
        <a href="mailto:support@getcashback.ai">Email Support</a>
        <a href="https://www.reddit.com/r/GetCashback/">Reddit</a>
      </div>
      <div class="footer-col">
        <div class="footer-title">Legal</div>
        <a href="https://api.getcashback.ai/tos/1.html">Privacy Policy</a>
        <a href="https://api.getcashback.ai/tos/1.html">Terms &amp; Conditions</a>
      </div>
    </div>
  </footer>
  
  <script src="{{ '/js/lunr.min.js' | relative_url }}"></script>
  <script>
    // Jekyll + Lunr.js Search functionality
    document.addEventListener('DOMContentLoaded', function() {
      const searchInput = document.getElementById('search-input');
      const topicCardLinks = document.querySelectorAll('.topic-card-link');
      const topicsGrid = document.querySelector('.topics-grid');
      
      let searchIndex = null;
      let searchData = null;
      let searchResults = null;
      
      // Load search index
      fetch('{{ "/search.json" | relative_url }}')
        .then(response => response.json())
        .then(data => {
          searchData = data;
          
          // Build Lunr index
          searchIndex = lunr(function() {
            this.field('title', { boost: 10 });
            this.field('description', { boost: 5 });
            this.field('content');
            this.ref('url');
            
            data.forEach(function(doc, index) {
              this.add({
                title: doc.title,
                description: doc.description,
                content: doc.content,
                url: doc.url,
                id: index
              });
            }, this);
          });
        })
        .catch(error => {
          console.error('Error loading search index:', error);
        });
      
      searchInput.addEventListener('input', function() {
        const searchTerm = this.value.trim();
        
        if (searchTerm === '' || searchTerm.length < 2) {
          // Show all topic cards
          if (searchResults) {
            searchResults.remove();
            searchResults = null;
          }
          topicCardLinks.forEach(function(cardLink) {
            cardLink.classList.remove('hidden');
          });
          return;
        }
        
        if (!searchIndex) {
          console.log('Search index not loaded yet');
          return;
        }
        
        try {
          // Perform search with Lunr
          const results = searchIndex.search(searchTerm);
          
          // Hide all topic cards
          topicCardLinks.forEach(function(cardLink) {
            cardLink.classList.add('hidden');
          });
          
          // Remove previous search results
          if (searchResults) {
            searchResults.remove();
          }
          
          // Create search results
          if (results.length > 0) {
            const matchingArticles = results.map(result => {
              return searchData.find(article => article.url === result.ref);
            }).filter(Boolean);
            
            searchResults = document.createElement('div');
            searchResults.className = 'search-results';
            searchResults.innerHTML = `
              <h2 style="color: white; margin-bottom: 24px; font-size: 24px;">Search Results (${matchingArticles.length})</h2>
              <div class="topics-grid">
                ${matchingArticles.map(article => `
                  <a href="{{ site.baseurl }}${article.url}" class="topic-card-link">
                    <div class="topic-card">
                      <h3 style="color: white; margin-bottom: 12px;">${article.title}</h3>
                      <p style="color: rgba(255, 255, 255, 0.8);">${article.description}</p>
                    </div>
                  </a>
                `).join('')}
              </div>
            `;
            topicsGrid.parentNode.insertBefore(searchResults, topicsGrid);
          } else {
            searchResults = document.createElement('div');
            searchResults.className = 'search-results';
            searchResults.innerHTML = `
              <div style="text-align: center; color: rgba(255, 255, 255, 0.8); margin: 40px 0;">
                <h2 style="color: white; margin-bottom: 16px;">No results found</h2>
                <p>Try searching with different keywords or browse our help topics below.</p>
              </div>
            `;
            topicsGrid.parentNode.insertBefore(searchResults, topicsGrid);
            
            // Show all topic cards when no results found
            topicCardLinks.forEach(function(cardLink) {
              cardLink.classList.remove('hidden');
            });
          }
        } catch (error) {
          console.error('Search error:', error);
        }
      });
    });
  </script>
</body>
</html>