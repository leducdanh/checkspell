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
