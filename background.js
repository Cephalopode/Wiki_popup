// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

chrome.runtime.onInstalled.addListener(function () {
  console.log('Wiki Popup started');
  chrome.storage.sync.set({
    options: {
      'targetLang': ['fr', 'en', 'es', 'zh'],
      'popupcolor': "purple",
      'tonecolors': "yes",
      'fontSize': "small"
    }
  })
  // chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
  //   chrome.declarativeContent.onPageChanged.addRules([{
  //     conditions: [new chrome.declarativeContent.PageStateMatcher({
  //       pageUrl: { hostEquals: 'developer.chrome.com' },
  //     })],
  //     actions: [new chrome.declarativeContent.ShowPageAction()]
  //   }]);
  // });
});

chrome.browserAction.onClicked.addListener(function () {
  chrome.storage.local.get({ enabled: false }, (dat) => {
    if (!dat.enabled) {
      chrome.storage.local.set({ enabled: true });
      // chrome.browserAction.setBadgeBackgroundColor({'color': [255, 0, 0, 255]})
      chrome.browserAction.setBadgeText({'text': 'On'})
    }
    else {
      chrome.browserAction.setBadgeText({'text': '' })
      chrome.storage.local.set({ enabled: false });
    }
    console.log('status: ' + dat.enabled);
  })
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'isEnabled') {
    chrome.storage.local.get({ enabled: false }, (dat) => {
      console.log('enabled: ' + dat.enabled);
      sendResponse({ enabled: dat.enabled });
    });
  }
  else if (request.action === 'getSettings') {
    chrome.storage.sync.get(null, (dat) => {
      console.log('settings: ' + dat.options);
      sendResponse({ options: dat.options });
    });
  }
  else if (request.action === "getTrans") {
     $.ajax({
      method: 'get', 
      url: request.params.url,
      data: request.params.data,
      headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Headers': "Content-Type",
          'Access-Control-Allow-Origin': '*',
      },
      success: function () { console.log('success: ' + this.url) },
      error: function () { console.log('failed: ' + this.url); }
    }).then(sendResponse).catch(sendResponse)
  }
  return true;

})