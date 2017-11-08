/*==============================*/
//     * author -> Print        //
//     * QQ -> 2662256509       //
/*=============================*/
(function(win, doc){
    //ajax请求的协议
    var ajaxProtocal = location.protocol;
    ajaxProtocal = ajaxProtocal==="file:"?"http:":ajaxProtocal;
    //解决HTML5 requestAnimationFrame兼容
    (function(win){
        var vendors = ['webkit', 'moz'];
        for(var x = 0; x < vendors.length && !win.requestAnimationFrame; ++x) {
            win.requestAnimationFrame = win[vendors[x] + 'RequestAnimationFrame'];
            win.cancelAnimationFrame = win[vendors[x] + 'CancelAnimationFrame'] ||    // Webkit中此取消方法的名字变了
                win[vendors[x] + 'CancelRequestAnimationFrame'];
        }
        if(!win.requestAnimationFrame){
            win.requestAnimationFrame = function(fn){
                return setTimeout(fn,1000/60);
            }
        }
        if(!win.cancelAnimationFrame){
            win.cancelAnimationFrame = function(timer){
                clearTimeout(timer);
            }
        }
    })(win);



    var $doc = $(doc),
        $oMainContainer = $(".main").find(".main-container"),   //主要内容容器
        $oMainContent = $oMainContainer.find(".content"),   //内容部分
        $oMusicContainer = $oMainContent.find(".music-container"),  //音乐操作和音乐列表的容器
        $oMusicOpers = $oMusicContainer.find(".music-oper li"), //清空列表
        $oMusicWrapper = $oMusicContainer.find(".music-wrapper"),  //音乐列表父级
        $oMusicList = $oMusicWrapper.find(".music-list"), //音乐列表
        $oScrollBar = $oMusicWrapper.find(".scroll-bar"), //滚动条父级
        $oScrollEle = $oScrollBar.find("i"), //滚动条
        $oMainPlay = $oMainContainer.find(".main-player"),  //播放控件和进度条+音量容器
        $oMainOperBtn = $oMainPlay.find(".oper-music");   // 播放暂停 上一曲 下一曲 控件的父级
        $oMainPrevBtn = $oMainOperBtn.find(".btn-prev"),    //上一曲
        $oMainPlayBtn = $oMainOperBtn.find(".btn-play"),    //播放/暂停
        $oMainNextBtn = $oMainOperBtn.find(".btn-next"),    //下一曲
        $oMainProgress = $oMainPlay.find(".music-progress"),    //音乐进度条部分
        $oMainProgressContent = $oMainProgress.find(".progress-content"),   //进度条内容部分(歌曲名和播放时间)
        $oMainProgressContentName = $oMainProgressContent.find(".content-name a"),  //歌曲名
        $oMainProgressContentTime = $oMainProgressContent.find(".content-time"),    //歌曲播放时间
        $oMainProgressBar = $oMainProgress.find(".progress-bar"),   //进度条父级
        $oMainProgressBarLine = $oMainProgressBar.find(".progress-bar-line"),   //进度条线
        $oMainProgressBarDot = $oMainProgressBar.find(".progress-bar-dot"), //进度条点
        $oMainMusicVolumn = $oMainPlay.find(".music-volumn"),   //调整音量大小控件父级
        $oMainVolumnBtn = $oMainMusicVolumn.find(".volumn-icon"),   //音量按钮
        $oMainVolumnProgress = $oMainMusicVolumn.find(".volumn-progress"),  //音量进度条容器
        $oMainVolumnProgressLine = $oMainVolumnProgress.find(".volumn-progress-line"),  //音量进度条线
        $oMainVolumnProgressDot = $oMainVolumnProgress.find(".volumn-progress-dot"),   //音量进度条点
        $oMainShow = $oMainContent.find(".music-show"), //音乐信息展示 + 歌词 容器
        $oMainMusicInfo = $oMainShow.find(".music-info"),   //音乐信息展示容器
        $oMainMusicInfoLogo = $oMainMusicInfo.find(".music-logo img"),   //音乐logo
        $oMainMusicInfoName = $oMainMusicInfo.find("div .music-info-name a"), //音乐名称
        $oMainMusicInfoSinger = $oMainMusicInfo.find("div .music-info-singer a"), //音乐作者
        $oMainMusicInfoAlbums = $oMainMusicInfo.find("div .music-info-albums a"), //音乐专辑
        $oMainMusicLyrics = $oMainShow.find(".music-lyrics-wrap .music-lyrics"), //储存歌词的标签
        $oBlurBg = $(".bg-blur"), //模糊背景
        $oMask = $(".mask"),  //背景遮罩
        oAudio = $(".song-play")[0];   //音频标签

    var $currentPlaying,  //播放当前歌曲的某列
        timer1,  //储存用于修改进度的定时器
        timer2,  //储存用于修改进度条进度的定时器
        timer3;  //储存歌词滚动的定时器

    //检测IE浏览器
    if (!!window.ActiveXObject || "ActiveXObject" in window){
        $oMask.css("background-color","rgba(0,0,0,0.9)");
    }

    //初始化部分
    setVolumnProgress(100);

    //================== 滚动条部分 ====================//
    var parentOffset = $oScrollEle.parent().offset().top,
        save_y = 0; //保留上一次松开时的位置

    $oScrollEle.mousedown(function(e){
        var _y = e.clientY - parentOffset + $doc.scrollTop(); //初始点击的位置
        var $this = $(this);
        $this.addClass("active");

        $doc.mousemove(function(e){
            var _ny = e.clientY - parentOffset + $doc.scrollTop(); //当前移动的位置
            var _top = _ny - _y + save_y;

            var max = $oScrollBar.height()-$this.height();

            _top = Math.max(0, Math.min(max, _top));  //限制滚动最大最小距离

            $this.css("top", _top);

            //更新内容区域的位置
            var prop = _top/(max);
            $oMusicList.css("top", -prop * ($oMusicList.height()-$oMusicWrapper.height()));

            e.preventDefault && e.preventDefault(); //阻止默认事件
        }).mouseup(function(){
            save_y = parseFloat($this.css("top")); //保留当前偏移量值
            $(this).off("mousemove"); //解绑事件
            $this.removeClass("active");
        });
    });
    //点击滚动
    $oScrollBar.click(function(e){
        if(e.target === this || e.srcElement === this){
            var _top = e.clientY - $(this).offset().top - $(document).scrollTop();

            var scrollEleH = $oScrollEle.height(),
                scrollBarH = $oScrollBar.height();

            //限制滚动的值
            _top = Math.max( scrollEleH/2, Math.min( scrollBarH-scrollEleH/2 ,_top ) );

            //改变滚动条位置
            $oScrollEle.animate({
                "top" : _top - scrollEleH/2
            },300);

            //改变内容位置
            var prop = ( _top-scrollEleH/2 )/( scrollBarH-scrollEleH );
            $oMusicList.animate({
                "top" : -prop * ($oMusicList.height()-$oMusicWrapper.height())
            },300);

            //保留位置
            save_y = _top - $oScrollEle.height()/2;
        }
    });

    //滚轮滚动
    $oMusicWrapper.mousewheel(function(e,v){
        var _top = parseFloat( $oMusicList.css("top") ) + v*20;
        var max = $oMusicWrapper.height()-$oMusicList.height();
        _top = Math.min( 0, Math.max( max, _top ) );

        $oMusicList.css("top", _top);
        //滚动条滚动
        var _top = ( _top/max * ($oScrollBar.height()-$oScrollEle.height()) );
        $oScrollEle.css("top", _top);

        save_y = _top;
    });

    //更新滚动条高度
    updateScrollHieght();
    function updateScrollHieght(){
        var _barH = $oScrollBar.height();
        var _height = ($oMusicWrapper.height()/$oMusicList.height()) * _barH;
        $oScrollEle.height(Math.min(_height, _barH));
    }


    //================== 搜索框部分 ====================//
    var $search = $(".search"),
        $searchInput = $search.find("input"),
        $searchBtn = $search.find(".search-icon");

    $searchBtn.click(goSearch);

    $searchInput.keydown(function(e){
        if(e.keyCode === 13){
            goSearch();
        }
    });

    //跳转到搜索页面
    function goSearch(){
        var $val = $searchInput.val();
        if($val) {
            sessionStorage && sessionStorage.clear();
            location.href = "./search.html?w=" + $searchInput.val() + "&page=1";
        }
    }

    //================== 截取音乐数据部分 ====================//
    var SongData = window.decodeURIComponent(location.href);

    var _storage = localStorage;
    if(!_storage.getItem("index")){
        _storage.setItem("index", 0);
    }
    var _songid, _page, _w, _index, i,
        _isRepeat;  //数据是否重复

    //如果传了参数
    if(/\?/.test(SongData)) {
        //保证值都是存在的
        _songid = +MatchUrlData("songid");
        _page = MatchUrlData("page");
        _w = MatchUrlData("w");
        if(_songid && _page && _w){
            //把数据放入本地储存中
            _index = +_storage.getItem("index");
            for(i = 0; i < _index; i++){
                //检测是否重复
                if(_songid === +MatchUrlData("songid" ,_storage.getItem(i))){
                    _isRepeat = true;
                }
            }
            if(!_isRepeat) {
                _storage.setItem(_index, "data?songid=" + _songid + "&w=" + _w + "&page=" + _page);
                _storage.setItem("index", _index + 1);
            }
            location.href = location.href.split("?")[0];
        }else{
            Prop("缺少参数, 添加音乐失败", true);
        }
    }

    //根据本地储存的值来添加播放列表
    var $index = +_storage.getItem("index"),
        curData,    //当前的数据
        songData = [];  //ajax请求音乐数据返回的数据的集合
    //如果列表存在值，则显示提示
    if(+_storage.getItem("index") !== 0){
        Prop("正在获取音乐列表, 请稍后...");
    }
    for(i = 0; i < $index; i++){
        curData = _storage.getItem(i);
        getData(MatchUrlData("songid",curData), MatchUrlData("w",curData), MatchUrlData("page",curData), i, function(data, index){
            songData[index] = data;
            //判断是否是最后一个请求完成
            if(index === $index - 1){
                //检测所有请求是否都已经完成
                var success = false;    //是否获取成功
                var detectTimer = setInterval(function(){
                    var isempty = false;    //是否存在空数据
                    for(var k = 0; k < $index; k++){
                       if(!songData[k]){
                           isempty = true;
                       }
                   }
                    if(!isempty){
                       var songDataLength = songData.length,
                           listContent = "";   //用于储存元素的字符串

                       //把所有音乐填入到列表
                       for(var j = 0; j < songDataLength; j++){
                           var currentData = songData[j],
                               dataSongName = currentData.songname,
                               dataSingerName = currentData.singername,
                               dataM4a = currentData.m4a;

                           //把歌曲添加到列表
                           listContent += "<li class=\"song\">" +
                               "<div class=\"checkbox-wrap\">" +
                               "<span class=\"checkbox iconfont\"></span>" +
                               "<span class=\"number\">"+(j+1)+"</span>" +
                               "</div>" +
                               "<div class=\"song-name\">" +
                               "<span>"+dataSongName+"</span>" +
                               "<div class=\"icon-list-menu\">" +
                               "<a href=\"javascript:;\" class=\"menu-song-play\" data-url=\""+dataM4a+"\" data-singername=\""+dataSingerName+"\" data-songid=\""+currentData.songid+"\" data-songname=\""+dataSongName+"\" data-albumpic-big=\""+currentData.albumpic_big+"\" data-albumname=\""+currentData.albumname+"\"></a>" +
                               "<a href=\""+dataM4a+"\" class=\"menu-song-download\" download=\"音乐播放\"></a>" +
                               "</div>" +
                               "</div>" +
                               "<span class=\"song-singer\">"+dataSingerName+"</span>" +
                               "<span class=\"song-time\"></span>" +
                               "</li>";
                       }

                       $oMusicList[0].innerHTML += listContent;


                       //为按钮注册事件
                       $oMusicList.find(".song .song-name .icon-list-menu .menu-song-play").click(playFn);
                       //删除音乐列表
                       $oMusicList.find(".song .song-time").click(function(){
                           var $thisParent = $(this).parent(),
                               isPlaying = false;   //当前播放的是否是这首音乐
                           //如果是正在播放的列表
                           if( $currentPlaying && $currentPlaying[0] === $thisParent[0]){
                               $currentPlaying = null;
                               oAudio.pause();
                               $oMainPlayBtn.removeClass("playing");
                               isPlaying = true;
                           }
                           $thisParent.remove();

                           if(isPlaying){
                               $oMainPlayBtn.click();   //自动播放第一首
                           }

                           //遍历将本地储存中的数据删除
                           var currentSongId = +$thisParent.find(".song-name .icon-list-menu .menu-song-play").attr("data-songid"),
                               localStorageLength = +_storage.getItem("index");
                           for(var i = 0; i < localStorageLength; i ++){
                               if(currentSongId === +MatchUrlData("songid" ,_storage[i])){
                                   _storage.removeItem(i);
                                   _storage.setItem("index", +_storage.getItem("index")-1);
                                   break;
                               }
                           }
                           //重新排版索引
                           var num = 0, tmp = {};
                           for(var key in _storage){
                               tmp[key] = _storage[key];
                           }
                           //清空_storage对象中的音乐数据
                           for(key in _storage){
                               if(!isNaN(+key)) {
                                   _storage.removeItem(key);
                               }
                           }
                           //重新排版填入数据
                           for(key in tmp){
                               if(!isNaN(+key)){
                                   _storage.setItem(num, tmp[key]);
                                   num ++;
                               }
                           }

                           //重新排版行号
                           $oMusicList.find(".song .checkbox-wrap .number").each(function(i,v){
                               $(v).text(i+1);
                           });

                       });
                       //停止定时器
                       clearInterval(detectTimer);
                       success = true;

                       Prop("获取音乐列表成功！", true);
                       //更新滚动条高度
                       updateScrollHieght();
                       //自动播放第一首音乐
                        $oMainPlayBtn.click();
                    }
                }, 100);
                setTimeout(function(){
                    if(!success){
                        Prop("音乐获取超时,请刷新页面重新获取！");
                    }
                }, 15000);
            }
        });
    }

    //读取添加的音乐的数据
    /*
        _songId -> 音乐ID   _w -> 关键字   _page -> 匹配第几页   index -> 音乐的序列号 (必填)  callBack -> 请求成功的回调函数
    */
    function getData(_songId, _w, _page, index, callBack){
        $.ajax({
            type : "GET",
            url : ajaxProtocal+"//route.showapi.com/213-1?showapi_appid=48418&showapi_sign=a0bdadc363dd4d1b8b6fcd1610f23422&keyword="+encodeURIComponent(_w)+"&page="+_page,
            success : function(data){
                if(typeof data === "string"){
                    Prop("您的操作过于频繁,请刷新重试");
                    return;
                }
                data = data.showapi_res_body.pagebean;
                var contentList = data.contentlist,
                    content_l = contentList.length;
                var currentSong;
                //匹配歌曲
                for(var i = 0; i < content_l; i++){
                    if(contentList[i].songid === +_songId){
                        currentSong = contentList[i];
                    }
                }
                //匹配歌曲失败
                if(!currentSong){
                    Prop("匹配歌曲失败！请重试");
                    return;
                }
                //把数据传给回调函数
                callBack && callBack(currentSong, index);
            },
            error : function(){
            }
        });
    }

    //读取音乐歌词
    oAudio.addEventListener("loadstart",function(){
        getLyrics();
    },false);
    function getLyrics(){
        var currentA = findCurrentA();
        //如果元素不存在,则退出函数
        if(!currentA){
            return;
        }
        $oMainMusicLyrics.html("<li class=\"active\">正在获取歌词中...</li>");
        $.ajax({
            "type" : "GET",
            "url" : ajaxProtocal+"//route.showapi.com/213-2?showapi_appid=48418&showapi_sign=a0bdadc363dd4d1b8b6fcd1610f23422&musicid="+currentA.attr("data-songid"),
            success : function(data){
                if(!data.showapi_res_body.lyric){
                    $oMainMusicLyrics.html("<li class=\"active\">歌词获取失败,该音乐可能没有歌词</li>");
                    return;
                }
                $oMainMusicLyrics.html("");
                var content = document.createElement("p");
                content.innerHTML = data.showapi_res_body.lyric;
                //如果为没有填词的纯音乐
                var OffsetSplit = content.innerHTML.split("[offset:0]\n");
                if(!OffsetSplit[1]){
                    $oMainMusicLyrics.html("<li class=\"active\">"+OffsetSplit[0].split("]")[1]+"</li>");
                    return;
                }

                data = OffsetSplit[1].split("[");
                var i,v, v_1,
                    _Frag = document.createDocumentFragment();
                for(i = 0; i < data.length; i++){
                    v = data[i].split("]");
                    v_1 = v[1];
                    //如果歌词为空或者undefined则跳过
                    if(v_1 !== undefined && v_1 !== "\n"){
                        v[1] = v_1.split("\n")[0];
                        //创建储存歌词的元素
                        var oLi = document.createElement("li");
                        oLi.setAttribute("data-time", v[0]);
                        oLi.innerHTML = v[1].replace(/&amp;apos;/g,"'");
                        _Frag.appendChild(oLi);
                    }
                }
                $oMainMusicLyrics.append(_Frag);

                var $oMainMusicLyricsList = $oMainMusicLyrics.find("li");
                $oMainMusicLyricsList.eq(0).addClass("first");

                //歌词滚动
                var dataTime, $v, $active,
                    n = 0,  //歌词滚动的行号
                    sIndex = 0; //开始遍历的位置
                lyricsRoll();
                function lyricsRoll(){
                    if(!oAudio.paused){
                        $oMainMusicLyricsList.each(function(i,v){
                            $v = $(v);
                            dataTime = $v.attr("data-time").split(":");
                            dataTime = +dataTime[0]*60 + +dataTime[1];
                            if(oAudio.currentTime >= dataTime){
                                $v.addClass("active").siblings().removeClass("active");
                            }
                        });
                        $active = $oMainMusicLyrics.find("li.active");
                        $oMainMusicLyrics.css({
                            "top" : -$active.index()*(10+$active.height())
                        });
                    }

                    timer3 = requestAnimationFrame(lyricsRoll);
                }
            },
            error : function(){
                $oMainMusicLyrics.html("<li class=\"active\">歌词获取失败！</li>");
            }
        });
    }

    //================== 操作音乐部分 ====================//
    //列表中的播放按钮点击事件
    function playFn(){
        var $this = $(this);
        oAudio.src = $this.attr("data-url");
        oAudio.play();
        $oMainPlayBtn.addClass("playing");
        $this.parent().parent().parent().addClass("playing").siblings().removeClass("playing");
        $currentPlaying = $oMusicList.find("li.playing");
        //更新数据
        updateMsg();
    }

    //======== 播放/暂停/上一曲/下一曲 ========//
    //暂停/播放
    $oMainPlayBtn.click(function(){
        var $this = $(this);

        //如果当前没有播放的歌曲,则默认播放第一首音乐
        if(!$currentPlaying) {
            $currentPlaying = $oMusicList.find("li.song").eq(0);
            //如果当前没有第一首音乐,则不进行播放
            if($currentPlaying.length !== 0){
                oAudio.src = findCurrentA().attr("data-url");
                oAudio.play();
                $currentPlaying.addClass("playing");
                $this.addClass("playing");
                //更新数据
                updateMsg();
            }else{
                $currentPlaying = null;
                Prop("当前没有音乐播放,请添加音乐");
                Prop();
            }
        }else{
            oAudio.paused ? oAudio.play() : oAudio.pause();
            $this.toggleClass("playing");
            oAudio.paused ? $currentPlaying.removeClass("playing") : $currentPlaying.addClass("playing");
        }
    });
    //限制点击频率
    var confinePrev = true,
        confineNext = true;
    //上一曲
    $oMainPrevBtn.click(function(){
        if($currentPlaying){
        	//限制点击频率 0.5s/次
	        if(confinePrev === true || new Date() - confinePrev > 500) {
	            nIndex = $currentPlaying.index() - 2;
	            if (nIndex === -1) {
	                nIndex = $oMusicList.find("li.song").length - 1;
	            }
	            changeSong(nIndex);
	            confinePrev = new Date();
	        }
        }
    });
    //下一曲
    $oMainNextBtn.click(function(){
    	if($currentPlaying){
	        //限制点击频率 0.5s/次
	        if(confineNext === true || new Date() - confineNext > 500) {
	            nIndex = $currentPlaying.index();
	            if (nIndex >= $oMusicList.find("li.song").length) {
	                nIndex = 0;
	            }
	            changeSong(nIndex);
	            confineNext = new Date();
	        }
    	}
    });
    //======== 播放进度条/音乐进度条/更新信息 ========//
    //更新进度条的内容信息 + 歌曲展示的logo和信息
    function updateMsg(){
        var curA = findCurrentA();
        var songName = curA.attr("data-songname"),
            singerName = curA.attr("data-singername"),
            albumName = curA.attr("data-albumname"),
            albumPic = curA.attr("data-albumpic-big");

        albumName = albumName===""?"暂无专辑":albumName;

        $oMainProgressContentName.eq(0).attr("href","https://www.baidu.com/s?w="+songName).text(songName);
        $oMainProgressContentName.eq(1).attr("href","https://baike.baidu.com/item/"+singerName).text(singerName);
        $oMainMusicInfoLogo.attr("src", albumPic);
        $oBlurBg.css("backgroundImage", "url("+albumPic+")");

        //更改右侧音乐展示部分
        $oMainMusicInfoName.text(songName).attr({
            "href" : "https://www.baidu.com/s?w="+songName,
            "title" : songName
        });
        $oMainMusicInfoSinger.text(singerName).attr({
            "href" : "https://baike.baidu.com/item/"+singerName,
            "title" : singerName
        });
        $oMainMusicInfoAlbums.text(albumName).attr({
            "href" : albumName==="暂无专辑"?"javascript:;":"https://www.baidu.com/s?w="+albumName,
            "title" : albumName
        });

        //初始更新一下音乐长度
        oAudio.ondurationchange = function(){
            clearInterval(timer1);
            var dur = oAudio.duration;
            timer1 = setInterval(updateTime,150);
            updateTime();
            function updateTime(){
                if(!oAudio.paused){
                    var cur = oAudio.currentTime;
                    //更新显示的时间数据
                    $oMainProgressContentTime.text(toTwo(cur/60)+":"+toTwo(cur%60)+" / "+toTwo(dur/60)+":"+toTwo(dur%60));
                }
            }
            updateProgress();
            function updateProgress(){
                cancelAnimationFrame(timer2);
                if(!oAudio.paused){
                    var prop = oAudio.currentTime/oAudio.duration*100;
                    $oMainProgressBarLine.css("width",prop+"%");
                    $oMainProgressBarDot.css("left",prop+"%");
                }
                timer2 = requestAnimationFrame(updateProgress);
            }

        };
    }

    //拖动进度条改变音乐播放进度
    var prevX = 0;  //上一次拖动到的位置
    $oMainProgressBarDot.mousedown(function(e){
        if($currentPlaying){
            oAudio.pause();
            var parOffsetX = $(this).parent().offset().left,
                BarDotWidth = $oMainProgressBarDot.width()/2,
                ProgressBarWidth = $oMainProgressBar.width();
            var _x = e.clientX - parOffsetX;
            $doc.mousemove(function(e){
                var _nx = e.clientX - parOffsetX;

                var _left = _nx - _x + (oAudio.currentTime/oAudio.duration*ProgressBarWidth) + BarDotWidth;

                //限制最大最小距离
                _left = Math.max(0, Math.min(ProgressBarWidth, _left));

                //转为百分比
                _left = _left/ProgressBarWidth*100;

                $oMainProgressBarDot.css({
                    "left" : _left+"%"
                });
                $oMainProgressBarLine.css({
                    "width" : _left+"%"
                });

                e.preventDefault();
            }).mouseup(function(e){
                var cur = oAudio.currentTime,
                    dur = oAudio.duration;

                //保留值,顺便限制一下大小值
                prevX = Math.max(0, Math.min(ProgressBarWidth, e.clientX - parOffsetX - BarDotWidth));

                oAudio.currentTime = (prevX/ProgressBarWidth)*dur;

                if(oAudio.currentTime/dur === 1){
                    prevX = 0;
                }
                oAudio.play();
                $oMainPlayBtn.addClass("playing");

                //更新显示的时间数据
                $oMainProgressContentTime.text(toTwo(cur/60)+":"+toTwo(cur%60)+" / "+toTwo(dur/60)+":"+toTwo(dur%60));

                // oAudio.play();
                $(this).off("mousemove mouseup");
            });
        }
    });

    // 拖拽/点击 改变音量
    var VolumnPrevX = $oMainVolumnProgress.width(),
        VolumnProgressWidth = $oMainVolumnProgress.width(),
        VolumnProgressLeft = $oMainVolumnProgress.offset().left,
        VolumnProgressDotWidth = $oMainVolumnProgressDot.width()/2;

    //点击按钮 静音/正常
    $oMainVolumnBtn.click(function(){
        setVolumnProgress(oAudio.volume?0:100);
        VolumnPrevX = oAudio.volume?0:VolumnProgressWidth;
        oAudio.volume = oAudio.volume?0:1;
        $(this).toggleClass("mute");
    });

    //拖动进度条改变音量
    $oMainVolumnProgressDot.mousedown(function(e){
        var _ox = e.clientX - VolumnProgressLeft + VolumnProgressDotWidth;
        $doc.mousemove(function(e){
            var _nx = e.clientX - VolumnProgressLeft + VolumnProgressDotWidth;

            var _left = _nx - _ox + VolumnPrevX;

            //限制最大最小范围,并转化为百分比
            _left = Math.max(0, Math.min(VolumnProgressWidth, _left))/VolumnProgressWidth*100;

            oAudio.volume = _left/100;
            oAudio.volume?$oMainVolumnBtn.removeClass("mute"):$oMainVolumnBtn.addClass("mute");
            setVolumnProgress(_left);

        }).mouseup(function(e){
            VolumnPrevX = Math.max(0, Math.min(VolumnProgressWidth, e.clientX - VolumnProgressLeft - VolumnProgressDotWidth));

            $doc.off("mousemove mouseup");
        });
    });

    //设置音量进度条位置(0-100)
    function setVolumnProgress(num){
        $oMainVolumnProgressLine.css("width" , num+"%");
        $oMainVolumnProgressDot.css("left", num+"%");
    }

    //清空列表
    $oMusicOpers.click(function(){
        $oMusicList.find(".song").remove("");

        //数据从本地储存中移除
        for(var key in _storage){
            if(key !== "index"){
                _storage.removeItem(key);
            }
        }
        _storage.setItem("index", 0);

        //刷新页面
        location.reload();
    });

    //当音乐播放完毕时自动跳到下一首
    oAudio.addEventListener("timeupdate", function(){
    	if($currentPlaying){
	        var TimeProp = +(this.currentTime/this.duration).toFixed(2),
	            nIndex = $currentPlaying.index();
	        if(nIndex >= $oMusicList.find("li.song").length){
	            nIndex = 0;
	        }
	        if(TimeProp >= 1){
	            changeSong(nIndex);
	        }
    	}
    }, false);


    //====== 一些功能函数 =====//
    //改变正在播放的音乐(上一曲,下一曲)
    function changeSong(nIndex){
        var $lists = $lists = $oMusicList.find("li.song");
        $currentPlaying.removeClass("playing");
        $oMainPlayBtn.removeClass("playing");
        $currentPlaying = $lists.eq(nIndex);   //往下一个播放
        oAudio.src = findCurrentA().attr("data-url");
        updateMsg();    //更新数据
        $oMainPlayBtn.click();   //开始播放
    }

    //查找当前播放的列表的带有数据的a标签元素
    function findCurrentA(){
        return $currentPlaying && $currentPlaying.find(".song-name .icon-list-menu .menu-song-play");
    }

    //把一位数转为两位数(String) 如  1 -> 01
    function toTwo(num){
        num = Math.floor(num);
        return num<10?"0"+num:""+num;
    }

    //================== 错误处理 ====================//
    oAudio.addEventListener("error", function(){
    	Prop("音乐加载出错,页面将在3秒后自动刷新");
    	setTimeout(function(){
    		location.href = location.href;
    	},3000);
    }, false);


    //================== 弹窗操作 ====================//

    //如果有内容的话则弹出,没内容的话则隐藏
    //out -> 为true时显示后自动消失
    function Prop(str,out){
        var $propWin = $(".propWin");
        str?$propWin.html(str).fadeIn(800):$propWin.fadeOut(800);
        if(out){
            $propWin.fadeOut(800);
        }
    }

})(window, document);


