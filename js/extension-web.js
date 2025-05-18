(function () {
  if (typeof window.chrome === "undefined") window.chrome = {};
  if (!window.chrome.storage) window.chrome.storage = {};
  if (!window.chrome.storage.local) {
    const DB_NAME = "getcashback_storage";
    const STORE_NAME = "local";
    let dbPromise = null;

    function getDB() {
      if (dbPromise) return dbPromise;
      dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = function (event) {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };
        request.onsuccess = function (event) {
          resolve(event.target.result);
        };
        request.onerror = function (event) {
          reject(event.target.error);
        };
      });
      return dbPromise;
    }

    window.chrome.storage.local = {
      get: function (keys, callback) {
        getDB().then(db => {
          const tx = db.transaction(STORE_NAME, "readonly");
          const store = tx.objectStore(STORE_NAME);
          let result = {};
          if (!keys) {
            // Get all
            const req = store.getAllKeys();
            req.onsuccess = function () {
              const allKeys = req.result;
              let count = allKeys.length;
              if (count === 0) return callback(result);
              allKeys.forEach(key => {
                const getReq = store.get(key);
                getReq.onsuccess = function () {
                  result[key] = getReq.result;
                  if (--count === 0) callback(result);
                };
              });
            };
          } else if (Array.isArray(keys)) {
            let count = keys.length;
            if (count === 0) return callback(result);
            keys.forEach(key => {
              const getReq = store.get(key);
              getReq.onsuccess = function () {
                result[key] = getReq.result;
                if (--count === 0) callback(result);
              };
            });
          } else if (typeof keys === "string") {
            const getReq = store.get(keys);
            getReq.onsuccess = function () {
              result[keys] = getReq.result;
              callback(result);
            };
          } else if (typeof keys === "object") {
            const keyArr = Object.keys(keys);
            let count = keyArr.length;
            if (count === 0) return callback(result);
            keyArr.forEach(key => {
              const getReq = store.get(key);
              getReq.onsuccess = function () {
                result[key] = getReq.result !== undefined ? getReq.result : keys[key];
                if (--count === 0) callback(result);
              };
            });
          }
        });
      },
      set: function (items, callback) {
        getDB().then(db => {
          const tx = db.transaction(STORE_NAME, "readwrite");
          const store = tx.objectStore(STORE_NAME);
          const keys = Object.keys(items);
          let count = keys.length;
          keys.forEach(key => {
            const req = store.put(items[key], key);
            req.onsuccess = function () {
              if (--count === 0 && typeof callback === "function") callback();
            };
          });
        });
      },
      remove: function (keys, callback) {
        getDB().then(db => {
          const tx = db.transaction(STORE_NAME, "readwrite");
          const store = tx.objectStore(STORE_NAME);
          if (typeof keys === "string") keys = [keys];
          let count = Array.isArray(keys) ? keys.length : 0;
          if (!count) {
            if (typeof callback === "function") callback();
            return;
          }
          keys.forEach(key => {
            const req = store.delete(key);
            req.onsuccess = function () {
              if (--count === 0 && typeof callback === "function") callback();
            };
          });
        });
      },
      clear: function (callback) {
        getDB().then(db => {
          const tx = db.transaction(STORE_NAME, "readwrite");
          const store = tx.objectStore(STORE_NAME);
          const req = store.clear();
          req.onsuccess = function () {
            if (typeof callback === "function") callback();
          };
        });
      },
      getBytesInUse: function (keys, callback) {
        getDB().then(db => {
          const tx = db.transaction(STORE_NAME, "readonly");
          const store = tx.objectStore(STORE_NAME);
          let totalBytes = 0;
          function calcSize(obj) {
            try {
              return new Blob([JSON.stringify(obj)]).size;
            } catch (e) {
              return 0;
            }
          }
          if (!keys) {
            // All keys
            const req = store.getAll();
            req.onsuccess = function () {
              const all = req.result;
              all.forEach(val => { totalBytes += calcSize(val); });
              callback(totalBytes);
            };
          } else if (typeof keys === "string") {
            const req = store.get(keys);
            req.onsuccess = function () {
              totalBytes = calcSize(req.result);
              callback(totalBytes);
            };
          } else if (Array.isArray(keys)) {
            let count = keys.length;
            if (count === 0) return callback(0);
            keys.forEach(key => {
              const req = store.get(key);
              req.onsuccess = function () {
                totalBytes += calcSize(req.result);
                if (--count === 0) callback(totalBytes);
              };
            });
          }
        });
      }
    };
  }
})();

// chrome.runtime.getManifest polyfill for web
(function () {
  if (!window.chrome) window.chrome = {};
  if (!window.chrome.runtime) window.chrome.runtime = {};
  window.chrome.runtime.getManifest = function () {
    return { version: "1.0.0" };
  };
})();

chrome.storage.local.get('clientInfo', function (result) {
  if (!result.clientInfo) {
    // Generate a new UUID using crypto.randomUUID()
    const uuid = crypto.randomUUID();

    // Create client info object with boolean registration status
    const clientInfo = {
      clientID: uuid,
      registered: false,
      createdAt: new Date().toISOString()
    };

    // Store in Chrome local storage
    chrome.storage.local.set({ clientInfo: clientInfo }, function () {
      console.log('Client ID initialized:', clientInfo.clientID);
    });
  } else {
    console.log('Client ID already exists:', result.clientInfo.clientID);
  }
});

// Load and parse CSV, then store in chrome.storage.local
(function () {
  window.offersLoaded = false;
  const decryptionKey = "8b93e8c2-3c68-4f57-9b6f-d4cb935e4d79";
  const remoteUrl = "https://api.getcashback.ai/search";
  let csvFile = "";

  fetch(remoteUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ passKey: decryptionKey })
  })
    .then(response => {
      if (!response.ok) throw new Error("Failed to get CSV file hash");
      return response.json();
    })
    .then(data => {
      if (!data.hash) throw new Error("No hash in response");
      csvFile = data.hash;
      console.log("Received CSV file hash:", csvFile);

      function parseCSV(text) {
        const lines = text.trim().split(/\r?\n/);
        const headers = lines[0].split(",");
        return lines.slice(1).map(line => {
          const values = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"' && line[i + 1] === '"') {
              current += '"';
              i++;
            } else if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(current);
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current);
          const obj = {};
          headers.forEach((h, idx) => obj[h.trim()] = values[idx] ? values[idx].trim() : "");
          return obj;
        });
      }

      // First, check clientInfo for csvFile tracking
      chrome.storage.local.get(['clientInfo'], function (result) {
        let clientInfo = result.clientInfo || {};
        const prevCsvFile = clientInfo.csvFile;

        // Now check if any offercontainer_processed_ keys exist and have offers
        chrome.storage.local.get(null, function (allData) {
          const offerKeys = Object.keys(allData).filter(k => k.startsWith("offercontainer_processed_"));
          let shouldLoadCSV = false;
          // If the csvFile has changed, force reload
          if (prevCsvFile !== csvFile) {
            console.log("CSV file has changed, reloading...");
            shouldLoadCSV = true;
          } else if (offerKeys.length === 0) {
            console.log("No offercontainer_processed_ keys found, reloading...");
            shouldLoadCSV = true;
          } else {
            // Check if all offer counts are zero
            shouldLoadCSV = offerKeys.every(k => {
              const group = allData[k];
              return !group || !Array.isArray(group.offers) || group.offers.length === 0;
            });
            if (shouldLoadCSV) {
              console.log("No offers, reloading...");
            }
          }
          if (!shouldLoadCSV) {
            console.log("Offers already loaded in storage, skipping CSV load.");
            window.offersLoaded = true;
            return;
          }

          // Remove existing offercontainer_processed_ keys
          chrome.storage.local.remove(offerKeys, function () {
            console.log("Removed old offercontainer_processed_ keys:", offerKeys);
          });

          // If we reach here, we need to load from CSV
          fetch(remoteUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ passKey: decryptionKey, includeOfferData: true })
          })
            .then(res => {
              if (!res.ok) throw new Error("Failed to load CSV");
              return res.json();
            })
            .then(resData => {
              const encryptedBase64 = resData.offerData;
              // 1) Clean & parse Base64
              const b64 = encryptedBase64.replace(/[^A-Za-z0-9+/=]/g, '');
              const data = CryptoJS.enc.Base64.parse(b64);
              // 2) Extract “Salted__” + salt
              const hdr = CryptoJS.lib.WordArray.create(data.words.slice(0, 2), 8);
              if (hdr.toString(CryptoJS.enc.Latin1) !== 'Salted__') {
                throw new Error('Missing “Salted__” header.');
              }
              const salt = CryptoJS.lib.WordArray.create(data.words.slice(2, 4), 8);
              const ct = CryptoJS.lib.WordArray.create(data.words.slice(4), data.sigBytes - 16);

              // 3) Derive key+IV & decrypt
              // EVP_BytesToKey using SHA-256 (OpenSSL ≥1.1.0 default)
              function deriveKeyIv_SHA256(password, salt) {
                const keyIv = CryptoJS.lib.WordArray.create();
                let prev = CryptoJS.lib.WordArray.create();
                const keyLen = 32, ivLen = 16;
                while (keyIv.sigBytes < keyLen + ivLen) {
                  prev = CryptoJS.SHA256(prev.concat(CryptoJS.enc.Utf8.parse(password)).concat(salt));
                  keyIv.concat(prev);
                }
                return {
                  key: CryptoJS.lib.WordArray.create(keyIv.words.slice(0, keyLen / 4), keyLen),
                  iv: CryptoJS.lib.WordArray.create(keyIv.words.slice(keyLen / 4, keyLen / 4 + ivLen / 4), ivLen)
                };
              }
              const { key, iv } = deriveKeyIv_SHA256(decryptionKey, salt);
              const dec = CryptoJS.AES.decrypt(
                { ciphertext: ct },
                key,
                { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
              );

              // 4) UTF-8 decode
              const u8 = new Uint8Array(dec.sigBytes);
              for (let i = 0; i < dec.sigBytes; i++) {
                const w = dec.words[i >>> 2];
                u8[i] = (w >>> (24 - (i % 4) * 8)) & 0xFF;
              }

              const csvText = new TextDecoder('utf-8', { fatal: false }).decode(u8);
              const offers = parseCSV(csvText);

              // Group by bank and card
              const grouped = {};
              offers.forEach(offer => {
                const bank = offer.bank || "Unknown";
                const card = offer.card || "Unknown";
                const key = `offercontainer_processed_${bank}_${card}`;
                if (!grouped[key]) {
                  grouped[key] = {
                    bank,
                    card,
                    totalOffers: 0,
                    offers: [],
                    lastUpdated: offer.lastUpdated || new Date().toISOString()
                  };
                }
                // Map fields to required structure
                grouped[key].offers.push({
                  id: offer.id,
                  description: offer.description,
                  logo: offer.logo,
                  merchantName: offer.merchantName,
                  merchantWebsite: offer.merchantWebsite,
                  cashbackAmount: offer.cashbackAmount,
                  expiration: offer.expiration,
                  redeemLink: offer.redeemLink,
                  redeemLocation: offer.redeemLocation,
                  redeemLocationLat: offer.redeemLocationLat,
                  redeemLocationLon: offer.redeemLocationLon,
                  category: offer.category,
                  estValue: offer.estValue,
                  minSpend: offer.minSpend,
                  maxCashback: offer.maxCashback,
                  type: offer.type,
                  activated: (typeof offer.activated === "string" ? offer.activated.toLowerCase() : offer.activated) === "true" || offer.activated === true,
                  redeemed: (typeof offer.redeemed === "string" ? offer.redeemed.toLowerCase() : offer.redeemed) === "true" || offer.redeemed === true,
                  attemptedRedeem: (typeof offer.attemptedRedeem === "string" ? offer.attemptedRedeem.toLowerCase() : offer.attemptedRedeem) === "true" || offer.attemptedRedeem === true,
                  lastUpdated: offer.lastUpdated || new Date().toISOString()
                });
                grouped[key].totalOffers++;
                grouped[key].lastUpdated = offer.lastUpdated || grouped[key].lastUpdated;
              });

              // Store each group in chrome.storage.local
              Object.keys(grouped).forEach(key => {
                const item = {};
                item[key] = grouped[key];
                chrome.storage.local.set(item, function () {
                  console.log("Stored", key, "with", grouped[key].totalOffers, "offers");
                });
              });
            })
            .then(() => {
              // Update clientInfo with current csvFile
              clientInfo.csvFile = csvFile;
              chrome.storage.local.set({ clientInfo }, function () {
                console.log("Updated clientInfo.csvFile to", csvFile);
                window.offersLoaded = true;
              });
            })
            .catch(err => {
              console.error("Error loading or parsing CSV:", err);
            });
        });

      });
    });
})();