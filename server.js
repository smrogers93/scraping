var express = require("express");
var exphbs = require("express-handlebars")
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models")

var app = express();
var PORT = process.env.PORT || 3000

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var MONGODB_URI = process.env.MONGOLAB_GRAY_URI || "mongodb://localhost/scraper";
mongoose.connect(MONGODB_URI);

app.get("/", function(req, res) {
    res.render("index");
});

app.get("/all", function(req, res) {
    db.Article.find({})
    .then(function(dbArticle) {
        res.render("index", {dbArticle})
    })
    .catch(function(err) {
        res.json(err)
    })
})

app.get("/scrape", function(req, res) {
    axios.get("https://nytimes.com").then(function(response) {
        var $ = cheerio.load(response.data);
        
        $("article").each(function(i, element) {
            var title = $(element).find("h2").text()
            var link = $(element).find("a").attr("href")

            if (title && link) {
                db.Article.create({
                    title: title,
                    link: link
                },
                function(err, inserted) {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log(inserted)
                    }
                })
            }
        })
    })
    console.log("success")
})

app.post("/articles:id", function(req, res) {
    db.Note.create(req.body)
        .then(function(dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true })
        })
        .then(function(dbArticle) {
            res.json(dbArticle)
        })
        .catch(function(err) {
            res.json(err)
        })
})


































app.listen(PORT, function() {
    console.log("App running on port 3000!");
});