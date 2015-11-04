/**
 * Created by William on 15/10/20.
 */
var crypto = require('crypto');
var xml = require('node-xml-lite');
var _ = require('underscore');

var RecJson = {
    FromUserName: 'uid',
    ToUserName: 'sp',
    CreateTime: 'createTime',
    MsgId: 'id',
    MsgType: 'type',
    Content: 'text'
};


var utils = {
    sha1: function sha1(plainText) {
        var sha = crypto.createHash('sha1').update(plainText);
        return sha.digest('hex');
    },

    parse2Json: function parse2Json(req, callback) {
        var chunks = [];
        req.on('data', function (data) {
            chunks.push(data);
        });
        req.on('end', function () {
            req.rawBody = Buffer.concat(chunks).toString();
            // 将Xml转成对象
            var recJson = parseXml2Json(req.rawBody);
            callback(null, recJson);
        });
    },

    parse2Xml: function parse2Xml(sendJson, callback) {
        var template = ['<xml>\n',
            '<ToUserName><![CDATA[' + sendJson.ToUserName + ']]></ToUserName>\n',
            '<FromUserName><![CDATA[' + sendJson.FromUserName + ']]></FromUserName>\n',
            '<CreateTime>' + sendJson.CreateTime + '</CreateTime>\n',
            '<MsgType><![CDATA[' + sendJson.MsgType + ']]></MsgType>\n'
        ];
        switch (sendJson.MsgType) {
            case 'text':
                template.push('<Content><![CDATA[' + sendJson.Content + ']]></Content>\n');
                break;
            case 'image':
                template.push('<Image>\n');
                template.push('<MediaId><![CDATA[' + sendJson.MediaId + ']]></MediaId>\n');
                template.push('</Image>\n');
                break;
            case 'voice':
                template.push('<Voice>\n');
                template.push('<MediaId><![CDATA[' + sendJson.MediaId + ']]></MediaId>\n');
                template.push('</Voice>\n');
                break;
            case 'video':
                template.push('<Video>\n');
                template.push('<MediaId><![CDATA[' + sendJson.MediaId + ']]></MediaId>\n');
                template.push('<Title><![CDATA[' + sendJson.Title + ']]></Title>\n');
                template.push('<Description><![CDATA[' + sendJson.Description + ']]></Description>\n');
                template.push('</Video>\n');
                break;
            case 'music':
                template.push('<Music>\n');
                template.push('<Title><![CDATA[' + sendJson.Title + ']]></Title>\n');
                template.push('<Description><![CDATA[' + sendJson.Description + ']]></Description>\n');
                template.push('<MusicURL><![CDATA[' + sendJson.MusicURL + ']]></MusicURL>\n');
                if (sendJson.HQMusicUrl) {
                    template.push('<HQMusicUrl><![CDATA[' + sendJson.HQMusicUrl + ']]></HQMusicUrl>\n');
                }
                if (sendJson.ThumbMediaId) {
                    template.push('<ThumbMediaId><![CDATA[' + sendJson.ThumbMediaId + ']]></ThumbMediaId>\n');
                }

                template.push('</Music>\n');
                break;
        }
        template.push('</xml>');

        return template.join('');
    }
};
function parseXml2Json(xmlText) {
    var json = xml.parseString(xmlText);
    _.each(json.childs, function (val) {
        if (val && val.name) {
            RecJson[val.name] = val.childs[0];
        }
    });
    return RecJson;
}

module.exports = utils;

