var Crypt = require('easy-encryption');
var captcha = require('node-captcha');
var url = require('url');
var random = require('random-token').create('0987654321');

var crypt_config = require('../../configs/crypt_captcha');
var captcha_config = require('../../configs/captcha');

//return captcha options
function c_options(text) {
    var options = captcha_config;
    options.fileMode = 2;
    options.text = text;
    return options;
};

//generate key
function key_generate() {
    var options = c_options();
    var key = random(options.size);
    return crypt_generate().encrypt(key);
};

//encrypt/decrypt object generate
function crypt_generate() {
    var captcha_obj = {
        secret: crypt_config.secret + new Date().getHours(),
        iterations: crypt_config.iterations
    };
    return new Crypt(captcha_obj);
};

//render captcha image
function captcha_render(req, res) {
    var url_parts = url.parse(req.url, true);
    var key = url_parts.query.key;
    if(key) {
        var c_need =  crypt_generate().decrypt(key);
        captcha(c_options(c_need), function(text, data) {
            res.end(data);
        });
    }
    else {
        captcha_generate(req, res);
    }
};

//redirect to new captcha
function captcha_generate(req, res) {
    var key = key_generate();
    res.redirect('/testing?key=' + key);
};

//captcha checking (main function)
function captcha_test(key, value) {
    try {
        var need_key = crypt_generate().decrypt(key);
        if(need_key == value) {
            return 200;
        }
        else {
            return null;
        }
    }
    catch(err) {
        return null;
    }
};

//captcha checking (router for AJAX)
function captcha_checking_r(req, res) {
    var key_encrypted = req.body.c_key;
    var value = req.body.c_value;
    res.end(captcha_test(key_encrypted, value));

};

//captcha checking (function)
function captcha_checking_f(key_encrypted, value) {
    return captcha_test(key_encrypted, value);
};

//new captcha (router for AJAX)
function new_captcha(req, res) {
    var key = key_generate();
    res.end(key);
};

//new captcha (function)
function new_captcha_return(req, res) {
    var key = key_generate();
    return key;
};

exports.render = captcha_render;
exports.check_r = captcha_checking_r;
exports.check_f = captcha_checking_f;
exports.new_ajax = new_captcha;
exports.new = new_captcha_return;