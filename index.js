var express = require('express'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    natural = require('natural'),
    SpellChecker = require('simple-spellchecker')

var app = express();
app.use(cors());
app.use(bodyParser.json());

InitDatatable = async () => {
    
}
app.get("/spellchecker/:text", async function (req, response) {
    let text = req.params.text
    let tokenizer = new natural.TreebankWordTokenizer();
    let ArrayWord = tokenizer.tokenize(text)
    var p3 = new Promise((resolve, reject) => {
        ArrayWord.forEach((e, index) => {
            let word = "" + e
            SpellChecker.getDictionary("en-US", (err, dictionary) => {
                if (!err) {
                    var misspelled = !dictionary.spellCheck(word);
                    if (misspelled) {
                        console.log(word);
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
                }
                if (index === ArrayWord.length - 1) {
                    // response.json(text)
                    resolve(text);
                }
            });
        });
    });

    await Promise.all([p3]).then(values => {
        console.log(values);
        response.json(text)
    });
});


app.listen(3000);
