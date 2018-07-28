var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var request = require('request');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
var Twit = require('twit');
const { BitlyClient } = require('bitly');
const bitly = new BitlyClient('f79c7ba529e328cef89ca22ecba1092b9f785cac', {});



var fs = require('fs'),
    request = require('request'),
    path = require('path'),
    Twit = require('twit'),
    config = require(path.join(__dirname, 'config.js'));
var originPrice;
var price;
var counter = 0;
var whichImage = 0;
var testLink;
const download = require('image-downloader')
var data;
var title;
var tweet;
var percentOff;

var T = new Twit(config);

var dailyDeals = "https://epndeals.api.ebay.com/epndeals/v1?marketplace=us&campaignid=5338330297&toolid=100034&rotationId=711-53200-19255-0&type=DAILY&format=json";
request(dailyDeals, function (error, response, body) {

    if (!error && response.statusCode === 200) {
        data = JSON.parse(body);



        for (var i = 1; i < data.items.length; i++) {

            const options = {
                url: data.items[i].imageUrl,
                dest: path.join(__dirname, '/images/skinnypig' + i + '.png')        // Save to /path/to/dest/photo.jpg
            }


            download.image(options)
                .then(({ filename, image }) => {
                    console.log('File saved to', filename)
                })
                .catch((err) => {
                    console.error(err)
                })
        }

        fs.readdir(__dirname + '/images', function (err, files) {
            if (err) {
                console.log(err);
            }
            else {
                var images = [];
                files.forEach(function (f) {
                    images.push(f);
                });

            }
        });

        setInterval(function () {
            whichImage++;
            counter++;
            price = data.items[counter].price;
            originPrice = data.items[counter].originPrice;
            title = data.items[counter].title;
            dealLink = data.items[counter].itemUrl;
            bitly
                .shorten(data.items[counter].itemUrl)
                .then(function (result) {
                    

                    if (data.items[counter].price != null && data.items[counter].price != "" && data.items[counter].originPrice != null && data.items[counter].originPrice != "") {

                        percentOff = Math.floor((data.items[counter].originPrice.slice(1).replace(",", "") - data.items[counter].price.toFixed(2).replace(",", "")) / data.items[counter].originPrice.slice(1).replace(",", "") * 100);
                        tweet = ["SALE! \n\n" + title + "\n\nOnly $" + price.toFixed(2) + ", retail " + originPrice + "!\n\n" + result.url,
                        "AWESOME DEAL! \n\n" + title + "\n\nGet it for just $" + price.toFixed(2) + ", retail " + originPrice + "!\n\n" + result.url,
                        "STEAL! \n\n" + title + "\n\nOn sale for $" + price.toFixed(2) + ", " + percentOff + "% OFF!\n\n" + result.url,
                        "GET IT FAST! \n\n" + title + "\n\nJust $" + price.toFixed(2) + ", down from " + originPrice + "!\n\n" + result.url,
                        percentOff + "% OFF!\n\n" + title + "\n\nOn sale for just $" + price.toFixed(2) + "!\n\n" + result.url];
                    } else if (data.items[counter].price != null && data.items[counter].originPrice == null) {
                        tweet = ["SALE! \n\n" + title + "\n\nOnly $" + price.toFixed(2) + "!\n\n" + result.url];
                    }
                    else {
                        tweet = ["SALE! \n\n" + title + "\n\nClick link below for sale details! \n\n" + result.url];
                    }

                    console.log('Opening an image...');
                    var image_path = path.join(__dirname, '/images/' + 'skinnypig' + whichImage + '.png'),
                        b64content = fs.readFileSync(image_path, { encoding: 'base64' });

                    console.log('Uploading an image...');

                    T.post('media/upload', { media_data: b64content }, function (err, data, response) {
                        if (err) {
                            console.log('ERROR:');
                            console.log(err);
                        }
                        else {
                            console.log('Image uploaded!');
                            console.log('Now tweeting it...');

                            T.post('statuses/update', {
                                status: tweet[Math.floor(Math.random() * tweet.length)],
                                media_ids: new Array(data.media_id_string)
                            },
                                function (err, data, response) {
                                    if (err) {
                                        console.log('ERROR:');
                                        console.log(err);
                                    }
                                    else {
                                        console.log('Posted an image!');

                                    }
                                }
                            );
                        }
                    });



                })
                .catch(function (error) {
                    console.error(error);
                });

            

         
        }, 5000);






    }


});