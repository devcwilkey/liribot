require("dotenv").config();
var keys = require("./keys.js");
var Spotify = require('node-spotify-api');
var axios = require('axios');
var moment = require('moment');
var fs = require('fs');
var action = process.argv[2];
var userValue = process.argv.splice(3);
var userValueSpace = userValue.join(' ');
var userValueWeb = userValue.join('%20');
var spotify = new Spotify(keys.spotify);

function doTheThing(action, userValueWeb, userValueSpace){
    switch(action) {
        case "concert-this":
            if(userValueWeb){
                var URL = "https://rest.bandsintown.com/artists/" + userValueWeb + "/events?app_id=codingbootcamp";
                console.log(URL);
                axios.get(URL).then(function(response){
                    if(response.data.length !== 0){
                        for(i=0; i < response.data.length;  i++){
                            var eventArtist = "";
                            for(j=0; j < response.data[i].lineup.length; j++){
                                eventArtist += response.data[i].lineup[j];
                                if((i+1) !== response.data[i].lineup.length){
                                    eventArtist+= " ";
                                }
                            }
                            var eventDate = response.data[i].datetime;
                            var randomFormat = "MM/DD/YYYY";
                            var convertedDate = moment(eventDate);
                            convertedDate = convertedDate.format(randomFormat);
                            if( i.length === 1){
                                console.log("------ 0" + (i + 1) + "/" + response.data.length + " ------");
                            } else {
                                console.log("------ " + (i + 1) + "/" + response.data.length + " ------");
                            }
                            console.log("Concert Date: " + convertedDate);

                            console.log("Concert Artist: " + eventArtist);
                            var venueLocation = response.data[i].venue.city + ", " + response.data[i].venue.region + " " + response.data[i].venue.country;
                            console.log("Concert Location: " + venueLocation);
                        }
                    } else {
                        console.log("No Concert Information Found for the Band/Group/Artist: " + userValueSpace);
                    }
                });
            } else {
                console.log("No Concert information was provided to search for....");
            }
            break;
        case "spotify-this-song":
            if(userValueSpace){
                spotify.search({ type: 'track', query: userValueSpace }, function(err, data) {
                    if(this.limitSearch){
                        console.log("LIMITED SEARCH");
                    }
                    if (err) {
                        return console.log('Error occurred: ' + err);
                    }
                    if(data.tracks.total > 0){
                        if(data.tracks.total > 20){
                            loop = 20;
                        } else {
                            loop = data.tracks.total;
                        }
                        console.log("-----------")
                        for(i=0; i < loop; i++){
                            //console.log(data);
                            var cleanArtist = "";
                            for(k=0; k < data.tracks.items[i].artists.length; k++){
                                cleanArtist += data.tracks.items[i].artists[k].name;
                                if((k+1) !== data.tracks.items[i].artists.length){
                                    cleanArtist += ", ";
                                }
                            }
                            console.log("Artist on Song: " + cleanArtist);
                            console.log("Track Title: " + data.tracks.items[i].name);
                            console.log("Preview Url: " + data.tracks.items[i]["preview_url"]);
                            console.log("Album Title: " + data.tracks.items[i].album.name);
                            console.log("-----------")
                        }
                    } else {
                        console.log("No Track Details Found");
                    }
                });
            } else {
                console.log("No Search Criteria Provided - Searching for the The Sign by Ace of Base")
                spotify.request('https://api.spotify.com/v1/tracks/0hrBpAOgrt8RXigk83LLNE', function(err,data){
                    console.log("-----------");
                    console.log("Artist on Song: " + data.artists[0].name);
                    console.log("Track Title: " + data.name);
                    console.log("Preview Url: " + data["preview_url"]);
                    console.log("Album Title: " + data.album.name);
                    console.log("-----------");
                });
            }   
            break;
        case "movie-this":
            if(userValueWeb){
                axios.get("http://www.omdbapi.com/?t=" + userValueWeb +"&y=&plot=short&apikey=trilogy").then(function(response){
                    if(response.data.Response !== 'False'){
                        console.log("-----------");
                        console.log("Title: " + response.data.Title);
                        console.log("Year of Release: " + response.data.Year);
                        for(i=0;i < response.data.Ratings.length; i++){
                            if(response.data.Ratings[i].Source === 'Internet Movie Database'){
                                var imdbRating = response.data.Ratings[i].Value;
                            }
                            if(response.data.Ratings[i].Source === 'Rotten Tomatoes'){
                                var rtRating = response.data.Ratings[i].Value;
                            }
                        }
                        console.log("IMDB Rating: " + imdbRating);
                        console.log("Rotten Tomato Rating: " + rtRating);
                        console.log("Country Produced: " + response.data.Country);
                        console.log("Language: " + response.data.Language);
                        console.log("Tiny Plot: " + response.data.plot);
                        console.log("Actors: " + response.data.Actors);
                        console.log("-----------");
                    } else {
                        console.log("Movie with that Title, Not Found!");
                    }
                });
            } else {
                doTheThing("movie-this","Mr%20Nobody","Mr Nobody");
            }
            break;
        case "do-what-it-says":
            fs.readFile('random.txt','utf8',function(err,data){
                if(err) throw err;
                    if(data){
                        var newData = data.split(',');
                        var searchTerms = newData[1].split(' ');
                        var searchTermsWeb = searchTerms.join('%20');
                        doTheThing(newData[0],searchTermsWeb,newData[1]);
                    }
                }
            );
            break;
        default:
            console.log("Enter an appropriate Command Dawg");
            break;
    }
}

doTheThing(action, userValueWeb, userValueSpace);