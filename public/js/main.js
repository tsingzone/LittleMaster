/**
 * Created by GXP on 2015/10/22.
 */

$(document).on('click', '#back', function () {
    history.go(-1);
});

function previewImage(id,file) {
    if (file.files && file.files[0]) {
        var img = document.getElementById(id);
        var reader = new FileReader();
        reader.onload = function (evt) {
            img.src = evt.target.result;
        }
        reader.readAsDataURL(file.files[0]);
    }
};

var $_GET = (function(){
    var url = window.document.location.href.toString();
    var u = url.split("?");
    if(typeof(u[1]) == "string"){
        u = u[1].split("&");
        var get = {};
        for(var i in u){
            var j = u[i].split("=");
            get[j[0]] = j[1];
        }
        return get;
    } else {
        return {};
    }
})();