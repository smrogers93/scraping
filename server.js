var express = require("express");
var exphbs = require("express-handlebars")
var mongojs = require("mongojs");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

var databaseUrl = "scraper";
var collections = ["scrapedData"];

var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
    console.log("Database Error:", error);
})

var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraper";
mongoose.connect(MONGODB_URI);

app.get("/", function(req, res) {
    res.render("index");
});

app.get("/all", function(req, res) {
    db.scrapedData.find({})
    .then(function(dbArticle) {
        res.json(dbArticle)
    })
    .catch(function(err) {
        res.json(err)
    });
});

app.get("/scrape", function(req, res) {
    axios.get("https://nytimes.com").then(function(response) {
        var $ = cheerio.load(response.data);
        
        $("article").each(function(i, element) {
            var title = $(element).find("h2").text()
            var link = $(element).find("a").attr("href")

            if (title && link) {
                db.scrapedData.save({
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
    res.send("Scrape Complete")
})


































app.listen(3000, function() {
    console.log("App running on port 3000!");
});