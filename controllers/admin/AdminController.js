/**
 * Created by michel_feng on 15/10/21.
 */

var AdminUser = require('../../models/admin/AdminUser');

var AdminController = {
    login: function (req, res) {
        var username = req.body.username;
        var password = req.body.password;
        if (username && password) {
            AdminUser.findByName(username, function (err, user) {
                if (err) {
                    res.render('admin/login', {err: "未知错误，请重试"});
                } else {
                    if (!user || !user.verifyPassword(password)) {
                        res.render('admin/login', {err: "用户名或密码不正确"});
                    } else {
                        req.session.user = user.username;
                        res.redirect('/admin/index');
                    }
                }
            });
        } else {
            res.redirect('/admin/login');
        }
    },
    logout: function (req, res) {
        delete req.session.user;
        res.redirect('/admin/login');
    },
    index: function (req, res) {
        res.render('admin/index', {username: req.session.user});
    },
    checkAuth: function (req, res) {
        if (!(req.session && req.session.user)) {
            res.redirect('/admin/login');
        } else {
            res.render('admin/index', {username: req.session.user});
        }
    }
}

module.exports = AdminController;