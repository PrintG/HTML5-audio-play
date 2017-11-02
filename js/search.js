/**
 * Created by Fly on 2017-10-29.
 */
(function () {
    var $main = $(".main"),
        $tip = $main.find(".tip"),  //显示提示
        $searchList = $main.find(".search-list tbody"); //展示数据内容

    var _w = MatchUrlData("w"); //获取传进来的值
    var _page = parseInt(MatchUrlData("page"));
    document.title = _w+"-搜索";

    //ajax请求歌曲搜索数据
    $.ajax({
        type : "GET",
        url : "https://route.showapi.com/213-1?showapi_appid=48418&showapi_sign=a0bdadc363dd4d1b8b6fcd1610f23422&keyword="+encodeURIComponent(_w)+"&page="+_page,
        success : function(data){
            data = data.showapi_res_body.pagebean;

            if(!data){
                alert("列表加载出错！请刷新页面");
            }

            //储存总页数,解决API资源错误问题
            var storage = window.sessionStorage;
            if(storage && storage.getItem("allPages") === null){
                storage.setItem("allPages", data.allPages);
            }
            var allPages = +storage.getItem("allPages");

            if(data.allPages === 0){
                $tip.html("<span>未找到相关信息！3秒后自动跳转到播放器</span>");
                setTimeout(function(){
                        location.href = "./index.html";
                }, 3000);
            }else {
                $tip.html("搜索成功！ 共 <span>" + data.allNum + "</span> 条与 <span>" + _w + "</span> 相关的音乐。 <br><span class='page'>当前为第" + data.currentPage + "/" + allPages + "页</span>");
            }

            //把数据填入
            var contentList = data.contentlist;
            fillData(contentList);
            function fillData(songData){
                var sl = songData.length;

                var i,j,oTr,oTd,
                    oTrFragment = document.createDocumentFragment(),
                    correlateDataArray = ["songname","singername","albumname"];  //对应数据的下标

                for(i = 0; i < sl; i++){
                    oTr = document.createElement("tr");
                    for(j = 0; j < 4; j++){
                        oTd = document.createElement("td");
                        if(j <= 2){
                            oTd.title = oTd.innerHTML = songData[i][correlateDataArray[j]];

                        }else if(j === 3){
                            oTd.className = "add";
                            var oA = document.createElement("a");
                            oA.href = "javascript:;";
                            oA.innerHTML = "点击添加到播放器";
                            (function(i){
                                oA.onclick = function(){
                                        addSong(i)
                                };
                            })(i);

                            oTd.appendChild(oA);
                        }
                        oTr.appendChild(oTd);
                    }
                    oTrFragment.appendChild(oTr);
                }
                $searchList.append(oTrFragment);

            }
            function addSong(index){
                storage && storage.clear();
                if(contentList[index].songid === 0){
                    alert("请选择其他音乐,该音乐无法播放");
                    return;
                }
                window.location.href = "./index.html?songid="+contentList[index].songid+"&page="+data.currentPage+"&w="+_w;
            }

            //分页器
            var $pagination = $(".pagination"),
                $prev = $pagination.find(".prev"),
                $next = $pagination.find(".next");
            $pagination.show();

            //上一页
            $prev.click(function(){
                if(data.currentPage === 1){
                    alert("已经是第一页了！");
                }else{
                    location.href = "./search.html?w="+_w+"&page="+(_page - 1);
                }
            });
            //下一页
            $next.click(function(){
                if(data.currentPage === allPages){
                    alert("已经是最后一页了！");
                }else{
                    window.location.href = "./search.html?w="+_w+"&page="+(_page + 1);
                }
            });
        },
        error : function(e){
            $tip.html("<span>搜索失败！请重试 <a href='./index.html'>点我返回主页</a></span>");
        }
    });



})();












