/* файл: app.js */ 
$( document ).ready(function() {
	$('.table img').click(function (e){
    $.magnificPopup.open({
      items: {
             src: $(this).attr('src')
        },
        type: 'image'
    });
	});
});

function validateEmail(email){ 
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
		
		// return (email.indexOf('@')+1);
    }

function showerr(data){
new PNotify({
    title: false,
    text: data,
    type: 'error',
    buttons: {
        sticker: false
    },
    icon: false
});
}

function showsuccess(data){
new PNotify({
    title: false,
    text: data,
    type: 'success',
    buttons: {
        sticker: false
    },
    icon: false
});
}

function showmsg(data){
new PNotify({
    title: false,
    text: data,
    buttons: {
        sticker: false
    },
    icon: false
});
}

function sendData() {
	$('.senddata-btn').attr('data-title', $(this).html());
	$('.senddata-btn').html('Подождите...');
	$('.senddata-btn').prop('disabled', true );
    //читаем данные из формы
	var email = $('input[name=emaile]').val();
	var countAccs = $('input[name=count]').val();
	var selectFunds = $('select[name=funds]').val();
	var selectType = $('select[name=item]').val();
	selectType = selectType ? selectType : $('input[name=item]').val();
	var minCount = $('option[value="' + selectType + '"]').attr('data-min_order');
	var countType = $('td[data-id=' + selectType + ']').html();
	var coupon = $('#coupon_hidden').val();
	
	if (!validateEmail(email))
	{
		var err = 'Указан неверный email адрес';
		$('.senddata-btn').html($(this).attr('data-title'));
		$('.senddata-btn').prop( "disabled", false );
		showerr(err);
		return false;
	}
	if (parseInt(countAccs) < parseInt(minCount))
	{
		var err = 'Мин. кол-во для заказа: ' + minCount;
		$('.senddata-btn').html($(this).attr('data-title'));
		$('.senddata-btn').prop( "disabled", false );
		showerr(err);
		return false;
	}
	if (parseInt(countType) < parseInt(countAccs))
	{
		var err = 'Такого количества товара нет';
		$('.senddata-btn').html($(this).attr('data-title'));
		$('.senddata-btn').prop( "disabled", false );
		showerr(err);
		return false;
	}
	
	
	if(window.request_wait)
	{
		showerr('Запрос к серверу уже отправлен');
		return;
	}
	window.request_wait = true;
	$.post("/order/?rand="+Math.random(), { email: email, count:countAccs, type: selectType, fund: selectFunds, coupon: coupon},
	function(data) {
		
		console.log(data);
		if(data=='QIWI not supported')
	  {
			showerr('QIWI не доступен');
			return;
	  }
		
		try
        {
			var res = JSON.parse(data);
			if(res.ok == 'TRUE'){
				if(typeof window.pay_type=='undefined' || window.pay_type==0){
					$('.btnbuy').html('Оплатить');
					$('.paytable .payitem').text(res.name);
					$('.paytable .paycount').text(res.count);
					$('.paytable .payprice').text(res.price);
					$('.paytable #payfund').text(res.fund);
					$('.paytable #paybill').text(res.bill);
					$('.paytable #payfund').attr("data-clipboard-text", res.fund);
					$('.paytable #paybill').attr("data-clipboard-text", res.bill);

					if(res.check_pay == '1'){
					$('.hide_btc_pay').hide();
					$('.txt_info').hide();
					$('#oplatault').html('<a href="'+res.buy_mar+'" target="_blank" class="btn btn-outline-dark">Оплатить</a>');							
					
			        }else{
					$('.hide_btc_pay').show();	
					$('.txt_info').show();
					$('#oplatault').html('');	
					}
                    if(res.check_pay == '2'){
					$('.hide_btc_pay').show();	
					$('.txt_info').show();
					$('#oplatault').html('<a href="'+res.buy_mar+'" target="_blank" class="btn btn-outline-dark">Оплатить</a>');							
			        }
					if(res.paid==true){
						$('#oplatault').html('');
						$('.checkpaybtn').attr('onclick','window.location ="'+res.check_url+'"');
						$('.checkpaybtn').text('Скачать');
					}else{
						$('.checkpaybtn').attr('onclick',"checkpay('" + res.check_url + "')");
					}
					$('#paymodal').modal('toggle');
				}else
				if(typeof res.pay_url!='undefined'){
					document.location = res.pay_url;
				}else{
					console.log('Undefined FUND');
				}
			
			}
			else
			if(typeof(res.error) !== "undefined" && res.error !== null) {
				showerr(res.error);
			}
		}
		catch(err)
		{
			$('.senddata-btn').html($(this).attr('data-title'));
			$('.senddata-btn').prop( "disabled", false );
			showerr('Платёж не работает!');
		}
	}).always(function(){
		$('.senddata-btn').html($(this).attr('data-title'));
		$('.senddata-btn').prop( "disabled", false );
		window.request_wait = false;
	}).fail(function(error) { 
		$('.senddata-btn').html($(this).attr('data-title'));
		$('.senddata-btn').prop( "disabled", false );
		window.request_wait = false;
		showerr('Платёж не работает!');
	});
            
}

function checkpay(url)
{

    var loadingText = $('.checkpaybtn').attr('data-loading-text');
    if ($('.checkpaybtn').html() !== loadingText) {
      $('.checkpaybtn').data('original-text', $('.checkpaybtn').html());
      $('.checkpaybtn').html(loadingText);
    }

if(window.request_wait)
{
	showerr('Запрос к серверу уже отправлен');
	return;
}
window.request_wait = true;

$.get(url+"?rand="+Math.random(), function(data) {
  $('.checkpaybtn').html($('.checkpaybtn').data('original-text'));
  console.log(data);
  if(data=='QIWI not supported')
  {
		showerr('QIWI не доступен');
		return;
  }
  
  var res = JSON.parse(data);
  if(res.status == "wait_30_sec")
  {
	  showerr('Подождите еще '+res.res+' секунд');
  }
  else
  if(res.status == "ok")
  {
	$('#oplatault').html('');
	$('.checkpaybtn').attr('onclick','window.location ="'+res.chkurl+'"');
	$('.checkpaybtn').text('Скачать');
  }
  else
  {
		showerr('Платеж не найден')
  }
}).always(function(){
		window.request_wait = false;
	}).fail(function(error) { 
		window.request_wait = false;
		showerr('Платёж не работает!');
	});
}

var getedId=0;
var numOfItems=0;
var selectedValueId=0;
var setedWayForMoney=0;
var firstInstrStat=false;
var secondInstrStat=false;
var thirdInstrStat=false;
var getedInstrId=0;
var instrIdStat=[];
var getedInstNewId=0;
var agreeLicenseChecked=false;

function BuyButtonClick(getedId){
	numOfItems=document.getElementById('number-of-items-'+getedId).value;
	document.getElementById('end-number').value=numOfItems;
	document.getElementById('item-selected').value=getedId;
}

function setWayForMoney(setedWayForMoney){
	document.getElementById('fundsSelect').value=setedWayForMoney;
}

function setEmail(){
	document.getElementById('row-box-email').value=document.getElementById('alert-box-email').value;
	sendData();
}

function instrClick(getedInstId){
	if ((instrIdStat[getedInstId] == false)  (instrIdStat[getedInstId] == null)) {
		instClose(1);
		instClose(2);
		instClose(3);
		instClose(4);
		instOpen(getedInstId);
	} else {
		instClose(getedInstId);
	}
}

function instOpen(getedInstNewId){
	document.getElementById('instrArrow'+getedInstNewId).src=arrowDown.png;
	document.getElementById('instrText'+getedInstNewId).style.display=block;
	instrIdStat[getedInstNewId] = true;
}

function instClose(getedInstNewId){
	document.getElementById('instrText'+getedInstNewId).style.display=none;
	document.getElementById('instrArrow'+getedInstNewId).src=arrow.png;
	instrIdStat[getedInstNewId] = false;	
}

function checkAgreeLicense(){
	if (document.getElementById('agreeLicense').checked==true){
		document.getElementById('setEmailButton').disabled=false;
	} else {
		document.getElementById('setEmailButton').disabled=true;
	}
}

$( document ).ready(function() {
  
  var inpcp;
  var svcpn;
  $('#coupon').popover({
  	html: true,
  	placement: 'left',
 	content: function() {
		inpcp = $(this).parent().find('.popover_content');
		inpcp.find('input').attr('value', coupon);
  		return inpcp.html();
  	}
  });
  $('#coupon').click(function (e) {
	svcpn = $(this).parent().find('.popover').find('input');
  	svcpn.bind("change paste keyup", function() {
       coupon = $(this).val(); 
    });
  });
  $('body').on('click', function (e) {
      $('#coupon').each(function () {
          if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
			$(this).popover('hide');
          }
      });
  });



    var clipboard1 = new Clipboard('#payfund');
    var clipboard2 = new Clipboard('#paybill');
    clipboard1.on('success', function(e) {
    showsuccess('Скопировано!');
    });

    clipboard2.on('success', function(e) {
    showsuccess('Скопировано!');
    });


});
function in_array(needle, haystack, strict) {
    var found = false, key, strict = !!strict;
 
    for (key in haystack) {
        if ((strict && haystack[key] === needle) || (!strict && haystack[key] == needle)) {
            found = true;
            break;
        }
    }
 
    return found;
}
function print_r(arr, level) {
    var print_red_text = "";
    if(!level) level = 0;
    var level_padding = "";
    for(var j=0; j<level+1; j++) level_padding += "    ";
    if(typeof(arr) == 'object') {
        for(var item in arr) {
            var value = arr[item];
            if(typeof(value) == 'object') {
                print_red_text += level_padding + "'" + item + "' :\n";
                print_red_text += print_r(value,level+1);
		} 
            else 
                print_red_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
        }
    } 

    else  print_red_text = "===>"+arr+"<===("+typeof(arr)+")";
    return print_red_text;
}
function setCookie(name, value, props) {
	props = props || {}
	var exp = props.expires
	if (typeof exp == "number" && exp) {
		var d = new Date()
		d.setTime(d.getTime() + exp*1000)
		exp = props.expires = d
	}
	if(exp && exp.toUTCString) { props.expires = exp.toUTCString() }

	value = encodeURIComponent(value)
	var updatedCookie = name + "=" + value
	for(var propName in props){
		updatedCookie += "; " + propName
		var propValue = props[propName]
		if(propValue !== true){ updatedCookie += "=" + propValue }
	}
	document.cookie = updatedCookie

}

