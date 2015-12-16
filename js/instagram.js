define([], function (){

	var _collection = [];
	var _count = 0;


	var render = function(data){
		for(var em in data){
			var liTmpl = "";
			for(var i=0,len=data[em].srclist.length;i<len;i++){
				
				liTmpl += '<li>\
								<div class="img-box">\
									<a class="img-bg" rel="example_group" href="'+data[em].bigSrclist[i]+'" title="'+data[em].text[i]+'"></a>\
									<img lazy-src="'+data[em].srclist[i]+'" alt="">\
								</div>\
							</li>';
			}
			$('<section class="archives album"><h1 class="year">'+data[em].year+'<em>'+data[em].month+'月</em></h1>\
				<ul class="img-box-ul">'+liTmpl+'</ul>\
				</section>').appendTo($(".instagram"));
		}

		$(".instagram").lazyload();
		changeSize();

		
		$("a[rel=example_group]").fancybox();
	}

	var replacer = function(str){
		var arr = str.split("/");
		return "/assets/ins/"+arr[arr.length-1];
		// if(str.indexOf("outbound-distilleryimage") >= 0 ){
		// 	var cdnNum = str.match(/outbound-distilleryimage([\s\S]*?)\//)[1];
		// 	var arr = str.split("/");
		// 	return "http://distilleryimage"+cdnNum+".ak.instagram.com/"+arr[arr.length-1];
		// }else{
		// 	var url = "http://photos-g.ak.instagram.com/hphotos-ak-xpf1/";
		// 	var arr = str.split("/");
		// 	return url+arr[arr.length-1];
		// }

		// data[em].srclist[i] = data[em].srclist[i].replace("http://photos-g.ak.instagram.com/hphotos-ak-xpf1/", "/assets/ins/")
		// 		.replace("http://distilleryimage11.ak.instagram.com/", "/assets/ins/")
		// 		.replace("http://distilleryimage4.ak.instagram.com/", "/assets/ins/")
		// 		.replace("http://distilleryimage9.ak.instagram.com/", "/assets/ins/");
	}

	var ctrler = function(data){
		var imgObj = {};
		for(var i=0,len=data.length;i<len;i++){
			var d = new Date(data[i].created_time*1000);
			var y = d.getFullYear();
			var m = d.getMonth()+1;
			var src = replacer(data[i].images.low_resolution.url);
			var bigSrc = replacer(data[i].images.standard_resolution.url);
			var text = data[i].caption.text;
			var key = y+"-"+m;
			if(imgObj[key]){
				imgObj[key].srclist.push(src);
				imgObj[key].bigSrclist.push(bigSrc);
				imgObj[key].text.push(text);
			}else{
				imgObj[key] = {
					year:y,
					month:m,
					srclist:[bigSrc],
					bigSrclist:[bigSrc],
					text:[text]
				}
			}
		}
		render(imgObj);
	}

	var getList = function(url){
		$(".open-ins").html("图片来自instagram，正在加载中…");
		$.ajax({
			url: url,
			type:"GET",
			// dataType:"jsonp",
			success:function(re){
				if(re.meta.code == 200){
					_collection = _collection.concat(re.data);
					var next = re.pagination.next_url;
					if(next){
						_count++;
						getList("/instagram/ins"+_count+".json");
					}else{
						$(".open-ins").html("图片来自instagram，点此访问");
						ctrler(_collection);
					}
				}else{
					alert("access_token timeout!");
				}
			},
			error: function(re){
				console.log(re);
			}
		});
	}
	

	var changeSize = function(){	
		if($(document).width() <= 600){
			$(".img-box").css({"width":"auto", "height":"auto"});
		}else{
			var width = $(".img-box-ul").width();
			var size = Math.max(width*0.26, 157);
			$(".img-box").width(size).height(size);
		}
	}

	var bind = function(){
		$(window).resize(function(){
			changeSize();
		});
	}

	return {
		init:function(){
			//getList("https://api.instagram.com/v1/users/438522285/media/recent/?access_token=438522285.2082eef.ead70f432f444a2e8b1b341617637bf6&count=100");
			var insid = $(".instagram").attr("data-client-id");
			if(!insid){
				alert("Didn't set your instagram client_id.\nPlease see the info on the console of your brower.");
				console.log("Please open 'http://instagram.com/developer/clients/manage/' to get your client-id.");
				return;
			}
			getList("/instagram/ins"+_count+".json");
			//getList("https://api.instagram.com/v1/users/438522285/media/recent/?client_id="+insid+"&count=100");
			bind();
		}
	}
});