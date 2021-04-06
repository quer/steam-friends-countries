steam-friends-countries
=======================

Im been using [steam-friends-countries](https://github.com/Holek/steam-friends-countries), for a long time, eks [steam user on map](http://steam.quers.net/map). But it is not up to date, and is abanden. So i have updated the json, and uploaded the scraper script. 

Go to the link above, to read what this is for.

Last updated: 23-11-2019

Usage
======================
### Data
the data can be found in `data/steam_countries.json`
the data will look like this:
``` json
{
    "US": {
        "name": "United States",
        "states": {
            "AK": {
                "name": "Alaska",
                "cities": {
                    "59": {
                        "name": "Anchorage",
                        "coordinates": {
                            "lat": 61.2180556,
                            "lng": -149.9002778
                        }
                    },
                    "60": {
                        "name": "Barrow",
                        "coordinates": {
                            "lat": 71.29055559999999,
                            "lng": -156.788611
                        }
                    },
                    "61": {
                        "name": "Bethel",
                        "coordinates": {
                            "lat": 60.7922222,
                            "lng": -161.7558334
                        }
                    },
                    "62": {
                        "name": "College",
                        "coordinates": {
                            "lat": 64.8569444,
                            "lng": -147.8027777
                        }
                    },
                    "63": {
                        "name": "Fairbanks",
                        "coordinates": {
                            "lat": 64.8377778,
                            "lng": -147.7163888
                        }
                    },
```
### main.js
This file will get all the countrys, stats And Citys.
To run this, add steam account login to `config.js`, it used to login to steam and get the profile edit page, to get all countrys from page source code. and to requist each states and Citys, whit the steam users cookies, to let steam know it a real account make the requist, to be allow to make the requests.
##### info
it is not made for updatede the file that allready exist, it will get a fresh of the hole thing, and overide the file, you shoud make it check if the place exist.

### main.js
This file will get all missing places location. it will use google maps api, to get locations of a place. 

Help
======================
If you like what i have done, can you help me rewrite  this README.md, to make more sense :) 
