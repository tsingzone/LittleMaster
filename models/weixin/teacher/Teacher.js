/**
 * Created by michel_feng on 15/10/22.
 */
var DBUtils = require('../../../db_utils');
var _ = require('underscore');

var Teacher = {
    getUserCenterData: function (source, callback) {
        var sql = "select \
                        weixin_user.id as id,\
                        weixin_user.nickname as nickname,\
                        weixin_user.head_img as headImg,\
                        teacherSign.teacher_id as teacherId,\
                        teacherSign.signCount as signCount,\
                        teacherCollect.collectCount as collectCount\
                    from weixin_user\
                    left join (\
                        select id from teacher_infor\
                    ) as teacher\
                    on weixin_user.id = teacher.user_id\
                    left join (\
                        select count(id) as signCount, teacher_id from teacher_sign\
                        where teacher_sign.`status` = 1 and teacher_sign.progress <> 0\
                    ) as teacherSign\
                    on teacher.id = teacherSign.teacher_id\
                    left join (\
                        select count(id) as collectCount, teacher_id from teacher_sign\
                        where teacher_sign.`status` = 1 and teacher_sign.progress = 0 and teacher_sign.collection = 1\
                    ) as teacherCollect\
                    on teacher.id = teacherCollect.teacher_id\
                    where weixin_user.id = ?";
        DBUtils.getDBConnection().query(sql, [source.id], callback);
    },
    getProfile: function (source, callback){
        var sql = "select 1+1 as result";
        DBUtils.getDBConnection().query(sql, [source.id], callback);
    }
}


module.exports = Teacher;