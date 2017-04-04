 /*
    weibo.php?act=add&content=xxx	添加一条
    返回：{error:0, id: 新添加内容的ID, time: 添加时间}
   */


  document.cookie = 'num = 0';  //存储页码
  n = getCookie('num');

  page();  //页码
  // 初始化页面
  $.ajax({
    url:'weibo.php',
    data:{
      act:'get',
      page:n+1
    },
    success:function(data){
      var data = eval('('+data+')')
      $.each(data,function(i,e){
        view(e);
      });
    }
  });

  // 点击提交留言
	$('#btn1').click(function(){
    show();
    page();
  });

  // 按enter留言
  $(window).keydown(function(ev){
    if(ev.which === 13){
      ev.preventDefault();
      show();
      page();
    }
  })

  // 添加一条留言
  function show(){
    $.ajax({
      url:'weibo.php',
      data:{
        act:'add',
        content:$('#tijiaoText').val()
      },
      success:function(data){
        data = eval('('+data+')');
        if(!data.error){
          view(data);
          window.location.reload();  //刷新当前页面
        }
      }
    })
  }

  //请求页码
  function page(){
    $.ajax({
      url:'weibo.php',
      data:{
        act:'get_page_count'
      },
      success:function(data){
        count = eval('('+data+')');
        document.cookie = 'cou ='+count.count;

        if(count.count<=5){
          $('#page').html('');
          for(var i=0; i<count.count; i++){
            $('#page').append($(`<a href="javascript:void(0)">${i+1}</a>`))
          }
        }else{
          $('#page').html('');
          for(var i=0; i<5; i++){
            $('#page').append($(`<a href="javascript:void(0)">${i+1}</a>`))
          }
        }

        // 第一个默认为激活状态
        $('#page').children('a:eq('+n+')').attr('class','active');

        $('#page').children('a').off().click(function(){
          var _this = this;
          pageC(_this)
        });
      }
    });
  }

  // 生成留言结构
  function view(obj){

    obj.content || $('#tijiaoText').val();
    obj.acc || 0;
    obj.ref || 0;

    var date = new Date(obj.time*1000);//服务器时间是以秒为单位。
    var year = date.getFullYear();
    var Month = date.getMonth()+1;
    var d = date.getDate();
    var sen = date.getSeconds();
    var min = date.getMinutes();
    var Hou = date.getHours();
    function tDou(n){
      return n<10?'0'+n:''+n;
    }

    var str = year+'-'+tDou(Month)+'-'+tDou(d)+' '+tDou(Hou)+':'+tDou(min)+':'+tDou(sen)
    $('#div1').append($(`
      <div class="reply" data-id="${obj.id}">
          <p class="replyContent">${obj.content}</p>
          <p class="operation">
            <span class="replyTime">${str}</span>
            <span class="handle">
              <a href="javascript:;" class="top">${obj.acc}</a>
              <a href="javascript:;" class="down_icon">${obj.ref}</a>
              <a href="javascript:;" class="cut">删除</a>
            </span>
          </p>
      </div>`))

    // 为删除按钮添加事件
    $('a[class=cut]').off().click(function(){
      var pareve = $(this).closest('div');
      $.ajax({
        url:'weibo.php',
        data:{
          act:'del',
          id:pareve.attr('data-id')
        },
        success:function(data){
          data = eval('('+data+')');
          if(data.error === 0){
            $(pareve).remove();    //在DOM中移出当前结构
            //点击删除之后,根据当前cookie请求数据 渲染页面
            $.ajax({
              url:'weibo.php',
              data:{
                act:'get',
                page:eval('('+getCookie('num')+')')+1
              },
              success:function(data){
                var data = eval('('+data+')');
                $('#div1').html('');
                $.each(data,function(i,e){
                  view(e);
                });
              }
            })
          }
        }
      })
    })

    //顶
    $('a[class=top]').off().click(function(){
      var _this = this;
      var pareve = $(this).closest('div');
      $.ajax({
        url:'weibo.php',
        data:{
          act:'acc',
          id:pareve.attr('data-id')
        },
        success:function(data){
          data = eval('('+data+')');
          if(data.error === 0){
            $(_this).text($(_this).text()*1+1);
          }
        }
      })
    })

    //踩
    $('a[class=down_icon]').off().click(function(){
      var _this = this;
      var pareve = $(this).closest('div');
      $.ajax({
        url:'weibo.php',
        data:{
          act:'ref',
          id:pareve.attr('data-id')
        },
        success:function(data){
          data = eval('('+data+')');
          if(data.error === 0){
            $(_this).text($(_this).text()*1+1);
          }
        }
      })
    })
  }

  // 点击页码
  function pageC(obj){
    var inTxt = $(obj).html()*1;
    if(inTxt > 3){
      var i1 = inTxt-3,
          i2 = inTxt+2;

      if(i2 > getCookie('cou')-1){
        i2 = getCookie('cou')-1;
        i1 = i2-5;
        if(i2-5 < 0) i1 = 0;
      }

      $('#page').html('');
      for(var i=i1; i<i2; i++){
        $('#page').append($(`<a href="javascript:void(0)">${i+1}</a>`))
      };

      $('#page').children('a').off().click(function(){
        document.cookie = 'num = '+$(this).html();
        var _this = this;
        pageC(_this)
      });
    }else{
      $('#page').html('');
      for(var i=0; i<5; i++){
        $('#page').append($(`<a href="javascript:void(0)">${i+1}</a>`))
      }

      $('#page').children('a').off().click(function(){
        document.cookie = 'num = '+$(this).html();
        var _this = this;
        pageC(_this)
      });

    }

    $('#page').children('a').removeAttr('class');  //清空class样式
    $(obj).attr('class','active');

    for(var i=0; i<$('#page').children('a').length; i++){
      if($('#page').children('a:eq('+i+')').html() == inTxt){
        $('#page').children('a:eq('+i+')').attr('class','active');
      }
    }

    document.cookie = 'num = '+$(obj).html();  //根据点击的页码设置cookie
    //根据cookie请求数据 渲染页面
    $.ajax({
      url:'weibo.php',
      data:{
        act:'get',
        page:eval('('+getCookie('num')+')')+1
      },
      success:function(data){
        var data = eval('('+data+')');
        $('#div1').html('');
        $.each(data,function(i,e){
          view(e);
        });
      }
    });
  }

  function getCookie(name){
    let arr = document.cookie.split('; ');
    let valSting = '';
    arr.forEach((e,i)=>{
      let key = e.split('=')[0];
      let val = e.split('=')[1];
      if(key == name){
        valSting = val;
      }
    });
    return valSting;
  }
