const auth = require('./config');
const cheerio = require('cheerio');
const Steam = require('steam');
const fs = require('fs');
const SteamTotp = require('steam-totp');
const SteamWebLogOn = require('steam-weblogon');
const request = require('request');
Steam.servers = [{host:'162.254.197.180', port: 27017}];

var steamClient = new Steam.SteamClient(),
    steamUser = new Steam.SteamUser(steamClient),
    steamFriends = new Steam.SteamFriends(steamClient),
    steamWebLogOn = new SteamWebLogOn(steamClient, steamUser);
steamClient.connect();
steamClient.on('servers', function(server) {
    //console.log(server);
});
console.log(auth.username);
steamClient.on('connected', function() {
    console.log("Connected to Steam.");
    steamUser.logOn({
        account_name: auth.username,
        password: auth.password,
        two_factor_code: SteamTotp.getAuthCode(auth.sharedSecret)
    });
});

steamClient.on('logOnResponse', function onSteamLogOn(logonResp) {
    //console.log("logOnResponse");
    //console.log("logOnResponse", logonResp.eresult);
    if (logonResp.eresult == Steam.EResult.OK) {
        
        //console.log("logOnResponse OK");
        steamFriends.setPersonaState(Steam.EPersonaState.Busy);
        websession(steamWebLogOn, function (_requestCommunity) {
            GetCountry(steamClient, _requestCommunity, function (e) {
                console.log(e);
                fs.writeFile("./data/steam_countries.json", JSON.stringify(e, null, 4), function(err) {
                    console.log("The file was saved!");
                    setTimeout(function(){	
                        console.log("done!");
                        steamClient.disconnect();
                    }, 500);
                
                }); 
            });
        });
    }
});
steamClient.on('loggedOff', function onSteamLogOff(eresult) {
    console.log("Logged off from Steam.");
});

steamClient.on('error', function onSteamError(error) {
    console.log("Connection closed by server - ", error);
    steamClient.connect();
});


function websession(steamWebLogOn, callback) {	
	var _requestCommunity;
	var _j1;
	var defaultTimeout = 30000;
	var communityURL = 'https://steamcommunity.com';
	console.log("websession start");
	steamWebLogOn.webLogOn(function(sessionID, newCookie) {
		var requestWrapper1 = request.defaults({
			timeout: defaultTimeout
		});
        _j1 = request.jar();

		_requestCommunity = requestWrapper1.defaults({jar: _j1});
		newCookie.forEach(function(name) {
			_j1.setCookie(request.cookie(name), communityURL);
		});
		console.log(JSON.stringify(newCookie));
		console.log(sessionID);
		//console.log("websession done");
		callback(_requestCommunity, sessionID);
	});
}
function GetCountry(steamClient, _requestCommunity, callback){
    _requestCommunity.get("https://steamcommunity.com/profiles/"+steamClient.steamID+"/edit", async function (error, response, body) {
        var EndJson = {};
        var $ = cheerio.load(body);
        var countrys =  $("#country option");
        var p = Promise.resolve();
        countrys.each(function(i, elem) {
            p = p.then(async function(){
                
                var country = $(this);
                var key = country.attr("value");
                if(key){
                    CountryJson = {
                        name: country.html(),
                        states: await GetState(key, steamClient.steamID, _requestCommunity)
                    };
                    console.log(key);
                    EndJson[key] = CountryJson
                }
                return;
            }.bind(this));
        });
        p = p.then(function(){
            callback(EndJson);
        })
    });
}

function GetState(countryKey, steamID, _requestCommunity) {
    return new Promise(function (resolve,) {
        _requestCommunity.post({
            url:"https://steamcommunity.com/actions/EditProcess?sId="+steamID,
            form:{
                json: 1,
                type: "locationUpdate",
                country: countryKey,
                sId:steamID
            }
        }, async function (error, response, body) {
            var StateJson = {};
            var bodyjson = JSON.parse(body);
            for (let i = 0; i < bodyjson.state.length; i++) {
                const state = bodyjson.state[i];
                var stateKey = state.attribs.key;
                if(stateKey){
                    var citys = await GetCity(countryKey, stateKey, steamID, _requestCommunity);
                    StateJson[stateKey] = {
                        name: state.val,
                        cities: citys
                    }
                }
            }
            resolve(StateJson);
        });
    })
}
function GetCity(countryKey, stateKey, steamID, _requestCommunity) {
    return new Promise(function (resolve) {
        _requestCommunity.post({
            url:"https://steamcommunity.com/actions/EditProcess?sId="+steamID, 
            form:{
                json: 1,
                sId:steamID,
                type: "locationUpdate",
                country: countryKey,
                state: stateKey
            }
        }, function (error, response, body) {
            var bodyjson = JSON.parse(body);
            var CityJson = {};
            for (let i = 0; i < bodyjson.city.length; i++) {
                const city = bodyjson.city[i];
                if(city.attribs.key && city.attribs.key != "")
                    CityJson[city.attribs.key] = { name:city.val };
            }
            resolve(CityJson);
        });
    })
}