/**
 * Created by GXP on 2015/10/22.
 */
$(document).on('click', '#find_job', function () {
    window.location.href = '/weixin/company';
});
$(document).on('click', '#personal_center', function () {
    window.location.href = '/weixin/teacher';
});
$(document).on('click', '#back', function () {
    history.go(-1);
});

function previewImage(file) {
    if (file.files && file.files[0]) {
        var img = document.getElementById('upload_head');
        var reader = new FileReader();
        reader.onload = function (evt) {
            img.src = evt.target.result;
        }
        reader.readAsDataURL(file.files[0]);
    }
}