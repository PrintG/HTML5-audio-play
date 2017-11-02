
/**
 * Created by Fly on 2017-10-31.
 */
//如果不传第二个参数,则默认匹配当前页面url
function MatchUrlData(key, data){
    data = data || location.href;
    data = window.decodeURIComponent(data).split("?")[1];
    if(!key || data === "" || !data) return;
    data = data.split("&");

    var i, v, dataL = data.length;
    for(i = 0; i < dataL; i++){
        v = data[i].split("=");
        if(v[0] === key) return v[1];
    }
}












