
// TODO: 
// - disambiguation handling
// - add wiktionary
// - window position
// - window appearance

'use strict';

document.addEventListener('click', async function (event) {

    chrome.runtime.sendMessage({ action: 'isEnabled' }, (ret) => {
        if (ret.enabled) {
            displayPopup()
        }
    });

})
var displayPopup = async () => {

    var sel = window.getSelection().toString();

    if (sel.length < 1) {
        $('.wiki-popup').remove();
        $(document).off('keypress')
        return
    }
    if ($('.wiki-popup')) {
        $('.wiki-popup').remove();
    }
    let css = $(`<link rel="stylesheet" href="${chrome.extension.getURL('css/popup.css')}">`)
    css.appendTo(window.document.getElementsByTagName('head')[0])

    chrome.runtime.sendMessage({ action: 'getSettings' }, async (ret) => {
        let settings = ret.options
        let doc_lang = detectLang(sel)
        let rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
        let clock = $(`<img class="wiki-clock" src='` + chrome.extension.getURL('images/clock.svg') + `' />`).
            css({
                "left": rect.right + window.pageXOffset + 'px',
                "top": rect.y + window.pageYOffset + 'px',
            }).appendTo(document.body)

        let trans
        try {
            let entity = await getTrans(
                {
                    word: sel,
                    sourceLang: doc_lang,
                    targetLang: settings.targetLang
                }
            )
            window.entity = entity
            trans = objectToString(entity);
        } catch (err) {
            trans = err
        }
        $('.wiki-clock').remove()
        rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
        let div = $('<div class="wiki-popup">')
            .append($('<p style=margin:0px>' + trans + '</p> <i>Press a number to access Wikipedia page</i>'))
            .css({
                "left": rect.right + window.pageXOffset + 'px',
                "top": rect.y + window.pageYOffset + 'px',
                "background-color": settings.popupcolor,
                'font-size': settings.fontSize
            })
            .appendTo(document.body);

        $('.wiki-popup').css({ 'z-index': 9999999999 })
        $(document).on('keypress', (e) => {
            let labels_array = Object.values(entity.labels)
            for (let n in labels_array) {
                if (e.which - 49 === parseInt(n)) {
                    window.open('http://' + labels_array[n].language + '.wikipedia.org/wiki/' + labels_array[n].value)
                }
            }
        })
    })


}


let getTrans = async (params) => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: 'getTrans', params: params }, (resp) => {
            if (resp.err) {
                reject(resp.err)
            } else {
                resolve(resp.entity)
            }
        })
    })
}

let objectToString = (entity) => {
    let result = ''
    var i = 1
    for (var lang_i in entity.labels) {
        let lang = entity.labels[lang_i]
        result += i++ + ' ' + lang.language + ' : ' + lang.value;
        if (typeof entity.descriptions[lang_i] !== "undefined") {
            result += ', ' + entity.descriptions[lang_i].value
        }
        result += "<br/>"
    }

    return result
}

let detectLang = (sel) => {
    let doc_lang_code = document.documentElement.lang
    let doc_lang = 'en'
    if (doc_lang_code.search('^.+[-_]') > -1) {
        doc_lang = doc_lang_code.match('^.+[-_]')[0].slice(0, -1)
    }
    else if (doc_lang_code.length > 0) {
        doc_lang = doc_lang_code
    }
    else if (typeof $('html').attr('xml:lang') !== "undefined") {
        doc_lang = $('html').attr('xml:lang')
    }
    //If string contains CJK characters assign corresponding source language
    const JaRe = /[\u3040-\u30ff\uff66-\uff9f]/
    const KoRe = /[\u1100-\u11ff]/
    const HanziRe = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/
    const CyrillicRe = /[\u0400-\u04ff]/
    if (sel.match(JaRe)) {
        doc_lang = 'ja'
    }
    else if (sel.match(KoRe)) {
        doc_lang = 'ko'
    }
    else if (sel.match(HanziRe)) {
        doc_lang = 'zh'
    } else if (sel.match(CyrillicRe)) {
        doc_lang = 'ru'
    }

    return doc_lang
}
