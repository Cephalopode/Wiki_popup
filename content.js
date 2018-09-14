

'use strict';

document.addEventListener('click', async function (event) {

    chrome.runtime.sendMessage({ action: 'isEnabled' }, (ret) => {
        if (ret.enabled) {
            displayPopup()
        }
        else {
            console.log('disabled');
        }
    });

})
var displayPopup = async () => {

    var sel = window.getSelection().toString();

    if (sel.length < 1) {
        $('.wiki-popup').remove();
        return
    }
    if ($('.wiki-popup')) {
        $('.wiki-popup').remove();
    }

    chrome.runtime.sendMessage({ action: 'getSettings' }, async (ret) => {
        let settings = ret.options
        console.log('selected:' + sel + ' ' + $('html').attr('xml:lang') + JSON.stringify(settings));
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
        let trans = await getTrans(sel, "wikidata", doc_lang, settings.targetLang);
        let rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
        var div = $('<div class="wiki-popup">')
            .append($('<p>' + trans + '</p>'))
            .css({
                "left": rect.right + window.pageXOffset + 'px',
                "top": rect.y + window.pageYOffset + 'px',
                "background-color": settings.popupcolor,
                'position': 'absolute',
                'transform': 'translate(0%, -100%)',
                'padding': '20px',
            })
            .appendTo(document.body);
        $('.wiki-popup').css({ 'z-index': 999 })
    })

}


let getTrans = async (word, method, sourceLang, targetLang) => {
    var params;
    if (method === "sparkql") {
        params = {
            url: "https://query.wikidata.org/sparql?",
            data: {
                format: 'json',
                query:
                    `SELECT ?country ?country_EN ?country_DE ?country_FR
                    WHERE {
                    ?country rdfs:label "${word}"@fr;
                    SERVICE wikibase:label { bd:serviceParam wikibase:language "en".
                            ?country rdfs:label ?country_EN.
                    }
                    SERVICE wikibase:label { bd:serviceParam wikibase:language "fr".
                            ?country rdfs:label ?country_DE.
                    } hint:Prior hint:runLast false.
                    SERVICE wikibase:label { bd:serviceParam wikibase:language "zh".
                            ?country rdfs:label ?country_FR.
                    } hint:Prior hint:runLast false.
                }`
            }
        }
    }
    else {
        const langList = targetLang.join('|')
        params = {
            url: "https://cors-anywhere.herokuapp.com/https://www.wikidata.org/w/api.php?",
            example: 'https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&languages=fr|en|es|zh&props=labels|descriptions&titles=barbell&normalize=1',
            data: {
                format: 'json', action: 'wbgetentities', sites: sourceLang + 'wiki', languages: langList,
                props: 'labels|descriptions', titles: word, normalize: '1'
            }
        }
    }


    let result_json = await $.ajax({
        method: 'post',
        url: params.url,
        data: params.data,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
        },
        complete: function () { console.log('post: ' + this.url) }
    })
    console.log(result_json)
    let result = ''
    if (method === "sparql") {
        result = JSON.stringify(result_json.results.bindings);
    }
    else {
        if (result_json === '-1') {
            return 'Entity not found...'
        }
        for (var ent_i in result_json.entities) {
            let entity = result_json.entities[ent_i]
            result += entity.id + "<br/>"
            //result += JSON.stringify(result_json.entities[entity].labels) + "\n";
            for (var lang_i in entity.labels) {
                let lang = entity.labels[lang_i]
                result += lang.language + ':  ' + lang.value;
                if (typeof entity.descriptions[lang_i] !== "undefined") {
                    result += ', ' + entity.descriptions[lang_i].value
                }
                result += "<br/>"
            }
        }
    }
    return result;
}
