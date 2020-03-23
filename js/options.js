// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let selectInList = (l, v) => {
  for (var i = 0; i < l.length; i++) {
    if (l[i].value == v) {
      l[i].selected = true;
      break;
    }
  }
}
function restoreOptions() {
  var optionsPromise = chrome.storage.sync.get(null, (storage) => {
    let options = storage.options;

    let addLang = () => {
      $('.langItem').eq(-1).after($(langList))
      $('.langItem').eq(-2).appendTo('#langLists')
      $('.langItem').eq(-2).after('<br/>')
    }
    let deleteLang = () => {
      $('.langItem').eq(-1).remove();
      $('br').eq(-1).remove()
      $('.langItem').eq(-1).prependTo('#langListsLast')

    }

    for (const lang of options.targetLang.slice(0, -1)) {
      $(langList + '<br/>').appendTo('#langLists')
      selectInList($('.langItem > select').last()[0], lang)
    }
    $(langList).appendTo('#langListsLast')
    selectInList($('.langItem > select').last()[0], options.targetLang.slice(-1))
    for (var i = 0; i < document.optform.popupcolor.length; i++) {
      if (document.optform.popupcolor[i].value ==
        options.popupcolor) {
        document.optform.popupcolor[i].selected = true;
        break;
      }
    }
    $('#langListsLast').css({ display: 'flex', 'align-items': 'center' })


    let addButt = $(`<img src='../images/plus.svg'/ >`).appendTo('#langListsLast').click(addLang).css({ cursor: 'pointer', height: '30px', width: '30px', 'padding-left': '5px' })
    let deleteButt = $(`<img src='../images/minus.svg'/>`).appendTo('#langListsLast').click(deleteLang).css({ cursor: 'pointer', height: '30px', width: '30px', 'padding-left': '5px' })

    if (options.fontSize == 'smaller') {
      document.optform.fontSize[0].selected = true;
    } else if (options.fontSize == 'small') {
      document.optform.fontSize[1].selected = true;
    } else {
      document.optform.fontSize[2].selected = true;
    }

  });
  document.optform.nbLang = 3;
}

function saveOptions() {
  let options = {
    'targetLang': [...document.optform.langItem].map((a) => a.value),
    'popupcolor': document.optform.popupcolor.value,
    'fontSize': document.optform.fontSize.value
  };
  let setting = chrome.storage.sync.set({
    options
  });
}

let langList = `<div class="control select langItem" id="langitem"><select name="langItem" data-placeholder="Choose a Language...">
  <option value="af">Afrikanns</option>
  <option value="sq">Albanian</option>
  <option value="ar">Arabic</option>
  <option value="hy">Armenian</option>
  <option value="eu">Basque</option>
  <option value="bn">Bengali</option>
  <option value="bg">Bulgarian</option>
  <option value="ca">Catalan</option>
  <option value="km">Cambodian</option>
  <option value="zh">Chinese (Mandarin)</option>
  <option value="hr">Croation</option>
  <option value="cs">Czech</option>
  <option value="da">Danish</option>
  <option value="nl">Dutch</option>
  <option value="en">English</option>
  <option value="et">Estonian</option>
  <option value="fj">Fiji</option>
  <option value="fi">Finnish</option>
  <option value="fr">French</option>
  <option value="ka">Georgian</option>
  <option value="de">German</option>
  <option value="el">Greek</option>
  <option value="gu">Gujarati</option>
  <option value="he">Hebrew</option>
  <option value="hi">Hindi</option>
  <option value="hu">Hungarian</option>
  <option value="is">Icelandic</option>
  <option value="id">Indonesian</option>
  <option value="ga">Irish</option>
  <option value="it">Italian</option>
  <option value="ja">Japanese</option>
  <option value="jw">Javanese</option>
  <option value="ko">Korean</option>
  <option value="la">Latin</option>
  <option value="lv">Latvian</option>
  <option value="lt">Lithuanian</option>
  <option value="mk">Macedonian</option>
  <option value="ms">Malay</option>
  <option value="ml">Malayalam</option>
  <option value="mt">Maltese</option>
  <option value="mi">Maori</option>
  <option value="mr">Marathi</option>
  <option value="mn">Mongolian</option>
  <option value="ne">Nepali</option>
  <option value="no">Norwegian</option>
  <option value="fa">Persian</option>
  <option value="pl">Polish</option>
  <option value="pt">Portuguese</option>
  <option value="pa">Punjabi</option>
  <option value="qu">Quechua</option>
  <option value="ro">Romanian</option>
  <option value="ru">Russian</option>
  <option value="sm">Samoan</option>
  <option value="sr">Serbian</option>
  <option value="sk">Slovak</option>
  <option value="sl">Slovenian</option>
  <option value="es">Spanish</option>
  <option value="sw">Swahili</option>
  <option value="sv">Swedish </option>
  <option value="ta">Tamil</option>
  <option value="tt">Tatar</option>
  <option value="te">Telugu</option>
  <option value="th">Thai</option>
  <option value="bo">Tibetan</option>
  <option value="to">Tonga</option>
  <option value="tr">Turkish</option>
  <option value="uk">Ukranian</option>
  <option value="ur">Urdu</option>
  <option value="uz">Uzbek</option>
  <option value="vi">Vietnamese</option>
  <option value="cy">Welsh</option>
  <option value="xh">Xhosa</option>
</select></div>`




document.addEventListener('DOMContentLoaded',
  restoreOptions);
document.querySelector("form").addEventListener("submit",
  saveOptions);

