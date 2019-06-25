var express = require('express'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    natural = require('natural'),
    SpellChecker = require('simple-spellchecker')

var app = express();
app.use(cors());
app.use(bodyParser.json());

const ChangeMsg = (word, text) => {
    return new Promise((resolve, reject) => {
        return SpellChecker.getDictionary("en-US", (err, dictionary) => {
            if (!err) {
                var misspelled = !dictionary.spellCheck(word);
                if (misspelled) {
                    var suggestions = dictionary.getSuggestions(word);
                    let cose = 0
                    let str = ""
                    for (const item of suggestions) {
                        if (natural.JaroWinklerDistance(item, word) > cose) {
                            cose = natural.JaroWinklerDistance(item, word)
                            str = item
                        }
                    }
                    text = text.replace(word, str)

                }
                resolve(text)
            }
        })
    })
}

const Suggestions = (word) => {
    return new Promise((resolve, reject) => {
        return SpellChecker.getDictionary("en-US", (err, dictionary) => {
            if (!err) {
                var misspelled = !dictionary.spellCheck(word);
                if (misspelled) {
                    var suggestions = dictionary.getSuggestions(word);

                    resolve("" + suggestions)

                }
            }
        })
    })
}

app.get("/suggestions/:text", async function (req, response) {
    let text = req.params.text
    let tokenizer = new natural.TreebankWordTokenizer();
    let ArrayWord = tokenizer.tokenize(text)
    let lstWord = []
    let lstSuggesByWord = []
    let strResult = ""
    for (const e of ArrayWord) {
        let word = "" + e
        let strSugges = ""
        strSugges = await Suggestions(word)
        if (strSugges !== ""){
            lstWord.push(word)
            lstSuggesByWord.push(strSugges)
        }
    }

    let index = 0
    for (const e of lstWord) {
        let word = "" + e
        strResult += `"` + word + `":` + `"` + lstSuggesByWord[index].toString() + `",`
        index++
    }
    strResult = strResult.substr(0, strResult.length-1)
    let t = JSON.parse(("{" + strResult + "}"))
    response.json(t)

});

app.get("/spellchecker/:text", async function (req, response) {
    let text = req.params.text
    let tokenizer = new natural.TreebankWordTokenizer();
    let ArrayWord = tokenizer.tokenize(text)
    for (const e of ArrayWord) {
        let word = "" + e
        text = await ChangeMsg(word, text)
    }
    response.json(text)

});


app.listen(3000);
