var db = require('./database');
var errors = require('../routing/errors');
var admin_crypt = require('./admin_crypt');

//checking for moderator and him/her status for common pages
function status_common(req, res, next) {
    if(req.cookies.hanako_admin) {
        //decrypt
        var name = admin_crypt.decrypt(req.cookies.hanako_admin);
        var name_arr;
        //separation name and IP
        try {
            name_arr = name.split('_');
        }
        catch(err) {
            next();
        }
        //request to DB
        db.admins.findOne({where: {
            name: name_arr[0],
            active: 1
        }}).then(function(moderator) {
            if(moderator && name_arr[1] == req.ip) {
                res.locals.modId = moderator.id;
                res.locals.modStatus = moderator.status;
                next();
            }
            else {
                next();
            }
        }, function(err) {
            console.log(err);
            next();
        });
    }
    else {
        next();
    }
};

module.exports = status_common;