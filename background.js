// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

chrome.runtime.onInstalled.addListener(function () {
  console.log('Wiki Popup started');
  chrome.storage.sync.set({
    options: {
      'targetLang': ['fr', 'en', 'es', 'zh'],
      'popupcolor': "grey",
      'fontSize': "small"
    }
  })
});

chrome.browserAction.onClicked.addListener(function () {
  chrome.storage.local.get({ enabled: false }, (dat) => {
    if (!dat.enabled) {
      chrome.storage.local.set({ enabled: true });
      // chrome.browserAction.setBadgeBackgroundColor({'color': [255, 0, 0, 255]})
      chrome.browserAction.setBadgeText({ 'text': 'On' })
    }
    else {
      chrome.browserAction.setBadgeText({ 'text': '' })
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
  return true;

})
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'getTrans') {
    let { word, sourceLang, targetLang } = request.params

    const langList = targetLang.join('|')
    let params = {
      url: "https://www.wikidata.org/w/api.php?",
      example: 'https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&languages=fr|en|es|zh&props=labels|descriptions&titles=barbell&normalize=1',
      data: {
        format: 'json', action: 'wbgetentities', sites: sourceLang + 'wiki', languages: langList,
        props: 'labels|descriptions', titles: word, normalize: '1'
      }
    }

    let retPromise = new Promise((resolve, reject) => {
      $.ajax({
        method: 'get',
        url: params.url,
        data: params.data,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Origin': '*',
        },
        complete: function (res) { console.log('post: ' + this.url); },
        success: function (ret) { console.log('success', ret); resolve(ret) },
        error: function (err) { console.log('err' + err); reject(err) },
      })
    })
    retPromise.then(result_json => {
      if (!result_json.success || Object.keys(result_json.entities)[0] === "-1") {
        sendResponse({ err: 'Entity not found...' })
      } else {
        var entity = Object.values(result_json.entities)[0]
        sendResponse({ entity: entity })
      }
    }).catch(err => {
      console.log(err)
      sendResponse({ err: "Network error..." })
    })
  }
  return true
})