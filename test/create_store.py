# -*- coding: utf-8 -*-

import requests,json,re,time

sourceLang = "en"
langList = "fr"
word = "test"

data = {
    "format": 'json', 
    "action": 'wbgetentities', 
    "sites": sourceLang + 'wiki', 
    "languages": langList,
    "props": 'labels|descriptions', 
    "titles": word, 
    "normalize": '1'
}

headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Origin': '*',
    }
		
r = requests.get('https://www.wikidata.org/w/api.php?',params=data,headers=headers)
print(r.text)


