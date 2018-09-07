

//<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>

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

    if (sel.length > 0) {
        if ($('.wiki-popup')) {
            $('.wiki-popup').remove();
        }
        rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
        console.log('selected:' + rect.right + "  " + rect.y);
        let doc_lang_code = document.documentElement.lang
        if (doc_lang_code.search('^.+[-_]') > -1) {
            doc_lang = doc_lang_code.match('^.+[-_]')[0].slice(0, -1)
        }
        else if (doc_lang_code.length > 0) {
            doc_lang = doc_lang_code
        }
        else {
            doc_lang = 'en'
        }
        let trans = await getTrans(sel, "wikidata", doc_lang);
        var div = $('<div class="wiki-popup">')
            .append($('<p>' + trans + '</p>'))
            .css({
                "left": rect.right + window.pageXOffset + 'px',
                "top": rect.y + window.pageYOffset + 'px',
                "background-color": 'yellow',
                'position': 'absolute',
                'transform': 'translate(0%, -100%)',
                'padding': '20px'
            })
            .appendTo(document.body);
    }
    else {
        $('.wiki-popup').remove();
    }
}


let getTrans = async (word, method, sourceLang) => {
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
        params = {
            url: "https://cors-anywhere.herokuapp.com/https://www.wikidata.org/w/api.php?",
            example: 'https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&languages=fr|en|es|zh&props=labels|descriptions&titles=barbell&normalize=1',
            data: {
                format: 'json', action: 'wbgetentities', sites: sourceLang + 'wiki', languages: 'fr|en|es|zh',
                props: 'labels|descriptions', titles: word, normalize: '1'
            }
        }
    }


    result_json = await $.ajax({
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
    if (method === "sparql") {
        result = JSON.stringify(result_json.results.bindings);
    }
    else {
        result = ''
        if (result_json === '-1') {
            return 'Entity not found...'
        }
        for (var entity in result_json.entities) {
            result += JSON.stringify(result_json.entities[entity].labels) + "\n";
        }
    }
    return result;
}