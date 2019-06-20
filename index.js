var express = require('express'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    natural = require('natural'),
    SpellChecker = require('simple-spellchecker')

var app = express();
app.use(cors());
app.use(bodyParser.json());


app.get("/spellchecker/:text", function (req, response) {
    let text = req.params.text
    let tokenizer = new natural.TreebankWordTokenizer();
    let ArrayWord = tokenizer.tokenize(text)
    ArrayWord.forEach((e, index) => {
        let word = "" + e
        SpellChecker.getDictionary("en-US", function (err, dictionary) {
            if (!err) {
                var misspelled = !dictionary.spellCheck(word);
                if (misspelled) {
                    var suggestions = dictionary.getSuggestions(word);
                    let cose = 0
                    let str = ""
                    for (let i = 0; i < suggestions.length; i++) {
                        if (natural.JaroWinklerDistance(suggestions[i], word) > cose) {
                            cose = natural.JaroWinklerDistance(suggestions[i], word)
                            str = suggestions[i]
                        }
                    }
                    text = text.replace(word, str)
                }
            }
            if (index === ArrayWord.length-1) {
                response.json(text)
            }
        });
    });
});


app.listen(3000);
