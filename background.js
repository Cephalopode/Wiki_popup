// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({ color: '#3aa757' }, function (ret) {
    console.log('The color is green');
  });
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
    }
    else {
      chrome.storage.local.set({ enabled: false });
    }
    console.log('status: ' + dat.enabled);
  })
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'switchState') {
    chrome.storage.local.get({ enabled: false }, (dat) => {
      console.log('retour ' + dat.enabled);
      sendResponse({ enabled: dat.enabled });
    });
  }
  return true;

})