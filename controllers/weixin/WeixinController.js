/**
 * Created by michel_feng on 15/11/5.
 */

var xml = require('node-xml-lite');
var _ = require('underscore');
var urllib = require('urllib');

var util = require('../../utils/Utils');
var Config = require('../../configs');
var wx_config = Config.getConfig().weixinconfig;
var Memcached = require('../../utils/Memcached');
var logger = require('../../logger').logger('WeixinController');

var WeixinController = {
    createNew: function () {
        var weixin = {};

        // ==== 私有属性 start ====
        var memCache = Memcached.createNew();

        var sendInfo = SendInfo.createNew();
        var parse = Parse.createNew();

        var urls = {
            getAccessTokenUrl: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={appId}&secret={appSecret}',
            getAccessTokenByCodeUrl: 'https://api.weixin.qq.com/sns/oauth2/access_token?appid={appId}&secret={appSecret}&code={code}&grant_type=authorization_code',
            validAccessTokenUrl: 'https://api.weixin.qq.com/sns/auth?access_token={accessToken}&openid={openId}',
            getUserUrl: 'https://api.weixin.qq.com/cgi-bin/user/info?access_token={accessToken}&openid={openId}&lang=zh_CN',

        };
        // ==== 私有属性 end ====

        // ==== 实例方法 start ====
        // 验证sign值
        weixin.checkSign = function (req, res) {
            var signature = req.query.signature;
            var nonce = req.query.nonce;
            var timestamp = req.query.timestamp;
            var echostr = req.query.echostr;
            var plainText = [wx_config.token, nonce, timestamp].sort().join('');
            var sign = util.sha1(plainText);
            if (sign != signature) {
                res.status(400).send('Bad Request');
            } else {
                res.send(echostr);
            }
        };
        // 回复消息
        weixin.replyInfo = function (req, res) {
            parse.requestToJson(req, function (err, data) {
                sendInfo.FromUserName = data.ToUserName;
                sendInfo.ToUserName = data.FromUserName;
                sendInfo.CreateTime = Math.floor(Date.now() / 1000);
                // 业务处理
                sendInfo.MsgType = 'text';
                sendInfo.Content = 'SOS';
                // 返回信息
                res.send(parse.toXml(sendInfo));
            });
        };

        // 获取acces_token
        weixin.getAccessToken = function (openId, callback) {
            memCache.getObject('WX_ACCESS_TOKEN', function (err, result) {
                if (result) {
                    var data = {
                        access_token: result,
                        openid: openId
                    };
                    callback(null, data);
                } else {
                    var url = strReplace(urls.getAccessTokenUrl, wx_config);
                    urllib.request(url, function (err, data) {
                        if (err) {
                            logger.error(error);
                            return;
                        }
                        json = JSON.parse(data.toString());
                        var result = {
                            access_token: json.access_token,
                            openid: openId
                        };
                        memCache.putObject('WX_ACCESS_TOKEN', json.access_token, 7200, function (err) {
                            callback(null, result);
                        });
                    });
                }
            });
        };

        // 通过用户授权code获取access_token
        weixin.getAccessTokenByCode = function (code, callback) {
            var url = strReplace(urls.getAccessTokenByCodeUrl, {
                appId: wx_config.appId,
                appSecret: wx_config.appSecret,
                code: code
            });
            var that = this;
            urllib.request(url, function (err, data) {
                if (err) {
                    logger.error(error);
                    return;
                }
                that.getAccessToken(JSON.parse(data.toString()).openid, callback);
            });
        };

        // 验证access_token
        weixin.validAccessToken = function (accessToken, openId, callback) {
            var url = strReplace(urls.validAccessTokenUrl, {
                accessToken: accessToken,
                openId: openId
            });
            urllib.request(url, function (err, data) {
                if (err) {
                    logger.error(error);
                    return;
                }
                callback(null, data);
            });
        };

        // 获取用户信息
        weixin.getUser = function (accessToken, openId, callback) {
            var url = strReplace(urls.getUserUrl, {
                accessToken: accessToken,
                openId: openId
            });
            urllib.request(url, function (err, data) {
                if (err) {
                    logger.error(error);
                    return;
                }
                callback(null, data);
            });
        };

        // 根据Code获取用户信息
        weixin.getUserByCode = function (code, callback) {
            var that = this;
            that.getAccessTokenByCode(code, function (err, data) {
                that.getUser(data.access_token, data.openid, callback);
            });
        };


        weixin.getUserByOpenId = function (openId, callback) {
            var that = this;
            that.getAccessToken(openId, function (err, data) {
                that.getUser(data.access_token, openId, callback);
            });
        };

        // ==== 实例方法 end ====
        return weixin;
    }
};

/**
 * 发送给用户的消息的数据对象
 * @type {{createNew: Function}}
 */
var SendInfo = {
    createNew: function (opts) {
        var sendInfo = {
            FromUserName: '',
            ToUserName: '',
            CreateTime: '',
            MsgType: '',
            Content: '',
            MediaId: '',
            Title: '',
            Description: '',
            MusicURL: '',
            HQMusicUrl: '',
            ThumbMediaId: ''
        };
        if (opts) {
            for (var opt in opts) {
                if (sendInfo.hasOwnProperty(opt)) {
                    sendInfo[opt] = opts[opt];
                }
            }
        }
        return sendInfo;
    }
};

/**
 * 接收用户发送的消息的数据对象
 * @type {{createNew: Function}}
 */
var ReceiveInfo = {
    createNew: function (opts) {
        var receiveInfo = {
            FromUserName: '',
            ToUserName: '',
            CreateTime: '',
            MsgId: '',
            MsgType: '',
            Content: ''
        };
        if (opts) {
            for (var opt in opts) {
                if (receiveInfo.hasOwnProperty(opt)) {
                    receiveInfo[opt] = opts[opt];
                }
            }
        }
        return receiveInfo;
    }
};

/**
 * 转换工具
 * @type {{createNew: Function}}
 */
var Parse = {
    createNew: function () {
        var parse = {};
        var xmlToJson = function (xmlData) {
            var json = xml.parseString(xmlData);
            var receiveInfo = ReceiveInfo.createNew();
            _.each(json.childs, function (val) {
                if (val && val.name) {
                    receiveInfo[val.name] = val.childs[0];
                }
            });
            return receiveInfo;
        };
        var root = NodeInfo.createNew('xml')
            .addChildNode(NodeInfo.createNew('ToUserName', true))
            .addChildNode(NodeInfo.createNew('FromUserName', true))
            .addChildNode(NodeInfo.createNew('CreateTime'))
            .addChildNode(NodeInfo.createNew('MsgType', true));

        parse.requestToJson = function (req, callback) {
            var chunks = [];
            req.on('data', function (data) {
                chunks.push(data);
            });
            req.on('end', function () {
                var xmlData = Buffer.concat(chunks).toString();
                var recJson = xmlToJson(xmlData);
                callback(null, recJson);
            });
        };
        parse.toXml = function (sendInfo) {
            var node = {};
            switch (sendInfo.MsgType) {
                case 'text':
                    var content = NodeInfo.createNew('Content', true);
                    node = root.addChildNode(content);
                    break;
                case 'image':
                    var image = NodeInfo.createNew('Image')
                        .addChildNode(NodeInfo.createNew('MediaId', true));
                    node = root.addChildNode(image);
                    break;
                case 'voice':
                    var voice = NodeInfo.createNew('Voice')
                        .addChildNode(NodeInfo.createNew('MediaId', true));
                    node = root.addChildNode(voice);
                    break;
                case 'video':
                    var video = NodeInfo.createNew('Video')
                        .addChildNode(NodeInfo.createNew('MediaId', true))
                        .addChildNode(NodeInfo.createNew('Title', true))
                        .addChildNode(NodeInfo.createNew('Description', true));
                    node = root.addChildNode(video);
                    break;
                case 'music':
                    var music = NodeInfo.createNew('Music')
                        .addChildNode(NodeInfo.createNew('Title', true))
                        .addChildNode(NodeInfo.createNew('Description', true))
                        .addChildNode(NodeInfo.createNew('MusicURL', true))
                        .addChildNode(NodeInfo.createNew('HQMusicUrl', true))
                        .addChildNode(NodeInfo.createNew('ThumbMediaId', true));
                    node = root.addChildNode(music);
                    break;
            }
            return node.toString(sendInfo);
        };
        return parse;
    }
};

/**
 * XML格式的结点
 * @type {{createNew: Function}}
 */
var NodeInfo = {
    createNew: function (tagName, escape) {
        var nodeInfo = {};

        var _beginTagName = ['<', tagName, '>'].join('');
        var _value = escape ? ['<![CDATA[', '{', tagName, '}', ']]'].join('') : ['{', tagName, '}'].join('');
        var _endTagName = ['<', '/', tagName, '>'].join('');

        var childNodes = [];
        var stringBuilder = StringBuilder.createNew();
        nodeInfo.addChildNode = function (childNode) {
            childNodes.push.apply(childNodes, childNode.toArray());
            return this;
        };
        nodeInfo.toArray = function () {
            stringBuilder.append(_beginTagName);
            if (escape) {
                stringBuilder.append(_value);
            } else {
                stringBuilder.append(childNodes.join(''));
            }
            stringBuilder.append(_endTagName);
            return stringBuilder.toArray();
        };
        nodeInfo.toString = function (param) {
            var str = this.toArray().join('');
            return strReplace(str, param);
        };
        return nodeInfo;
    }
};

var strReplace = function (str, data) {
    return str.replace(/{\w+}/g, function (matchs) {
        return data[matchs.slice(1, -1)];
    });
};

/**
 * 用于字符串拼接的工具
 * @type {{createNew: Function}}
 */
var StringBuilder = {
    createNew: function () {
        var stringBuilder = {};
        var stringArray = [];
        stringBuilder.toArray = function () {
            return stringArray;
        };
        stringBuilder.append = function (param) {
            if (param instanceof Array) {
                stringArray.concat(param)
            } else {
                stringArray.push(param);
            }
            return this;
        };
        stringBuilder.toString = function () {
            return stringArray.join('');
        };
        return stringBuilder;
    }
};

module.exports = WeixinController;
