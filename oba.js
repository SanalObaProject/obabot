require('dotenv').config();

var Discord = require('discord.io');
var logger = require('winston');
var request = require('request');

const icoBenchPublicKey = process.env.ICOBENCHPUBLICKEY;
const icoBenchPrivateKey = process.env.ICOBENCHPRIVATEKEY;

const CryptoJS = require('crypto-js');
const Coinmarketcap = require('node-coinmarketcap-api');
const coinmarketcap = new Coinmarketcap();
let global_market;

(async () => {
    global_market = await coinmarketcap.global();
})();

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';


// Initialize Discord Bot
var bot = new Discord.Client({
    token: process.env.DISCORDAPITOKEN,
    autorun: true
});


bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on('disconnect', function (errMsg, code) {
    console.log('---Bot disconnected with code ', code, ' for reason ', errMsg, '---');
    bot.connect();
});

bot.on('message', function (user, userID, channelID, message, evt) {
    if (message.substring(0, 6) === 'obabot') {
        cmd = message.substring(6).split(' ');
        console.log(cmd);
        if (cmd[1] === "merhaba" && cmd.length === 2) {
            msg = "Merhaba " + '<@' + userID + '>' + "! :) Bugün nasılsınız?";
            bot.sendMessage({
                to: channelID, message: msg
            });
        }
        if (cmd[1] === "var" && cmd.length === 3) {
            msg = "Hey " + "<@pasalog>" + "\nİstek : " + cmd[2];
            bot.sendMessage({
                to: channelID, message: msg
            });
        }
    }
    if (message.substring(0, 1) === 'i') {
        msg = "Ben de iyiyim teşekkürler :)"
        bot.sendMessage({
            to: channelID, message: msg
        });
    }


    if (message.substring(0, 1) === '!') {
        command = message.substring(1).split(' ');
        if (command[0] === "icobenchshowtrendicos" && command.length === 1) {
            let test = new ICObench();
            test.get(channelID, "icos/trending", (data) => {
                console.log(data)
            });
        }
        if (command[0] = "icobenchshowicos>4" && command.length === 1) {
            let test = new ICObench();
            test.get(channelID, "icos/all", (data) => {
                console.log(data)
            });
        }
        if (command[0] === compare && command.length === 2) {
            var args = command[1].split("/");
            compare(channelID, args[0], args[1]);
        }
    }
});

function compare(channelID, arg1, arg2) {
    const cmc_url = 'https://api.coinmarketcap.com/v1/ticker/';
    request({
        url: cmc_url,
        json: true
    }, function (error, response, body) {

        const cmc_object = body;
        for (const x in cmc_object) {
            if (arg1 === cmc_object[x].symbol.toLowerCase()) {
                var arg1_price = cmc_object[x].price_usd;
            }
        }
        for (var y in cmc_object) {
            if (arg2 === cmc_object[y].symbol.toLowerCase()) {
                var arg2_price = cmc_object[y].price_usd;
            }
        }
        let rate = arg1_price / arg2_price;
        bot.sendMessage({
            to: channelID, message: body
        });
    });
}

function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

class ICObench {
    constructor() {
        this.publicKey = icoBenchPublicKey;
        this.privateKey = icoBenchPrivateKey;
        this.apiUrl = 'https://icobench.com/api/v1/';
    }

    get(channelID, action, callback, data = {}) {
        let dataJSON = JSON.stringify(data);

        let sign = CryptoJS.HmacSHA384(dataJSON, this.privateKey);
        sign = CryptoJS.enc.Base64.stringify(sign);

        request.post(this.apiUrl + action, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-ICObench-Key': this.publicKey,
                'X-ICObench-Sig': sign,
            },
            forever: true,
            json: data
        }, function (error, response, body) {
            let msg = 'Trend ICOs from ICObench;\n';
            for (var x in body.results) {
                msg += '\n' + body.results[x].name + '\t\t' + body.results[x].rating + '\t\t' + body.results[x].url
            }
            bot.sendMessage({
                to: channelID, message: msg
            });
            console.log(body.results);
        });
    }

    get(channelID, action, callback, data = {}) {
        let dataJSON = JSON.stringify(data);

        let sign = CryptoJS.HmacSHA384(dataJSON, this.privateKey);
        sign = CryptoJS.enc.Base64.stringify(sign);

        request.post(this.apiUrl + action, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-ICObench-Key': this.publicKey,
                'X-ICObench-Sig': sign,
            },
            forever: true,
            json: data
        }, function (error, response, body) {
            let msg = 'Trend ICOs from ICObench;\n';
            for (var x in body.results) {
                msg += '\n' + body.results[x].name + '\t\t' + body.results[x].rating + '\t\t' + body.results[x].url
            }
            bot.sendMessage({
                to: channelID, message: msg
            });
            console.log(body.results);
        });
    }
}
