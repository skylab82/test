var loginAddress = "https://restappservice.betflag.it/AccountUtil/Login";
var iframeAddress = "https://m.betflag.it/app-casino.aspx?home=true";//"https://m.betflag.it/app-casino.aspx?token=";
var serviceAddress = "https://serviceippica-mobile.mediasystemtechnologies.it:4445/IppicaDataService/";
var disableResize = false;

$(document).ready(function() {
  var TAG = CheckTAG();
  var ifd;
  // setto indirizzo iframe senza token
  $('#myFrame').attr('src', iframeAddress);


  //di default il Nav di navigazione è sempre visibile
  HideNav(false);
  //fase di controllo se è già stato effettuato un login
  if (isLogged() == true){
    $(".logout-login").css("display", "block");
    $(".open-login").css("display", "none");
    getSaldoAfterGame();
  }
/*
  $('#myFrame').on('load', function() {
    if (isLogged()== true){
      token = JSON.parse(sessionStorage.getItem("login")).Token;
      console.log(token);
      ifd = document.getElementById("myFrame");
      ifd.contentWindow.postMessage(token, '*');
    }else {
      logout();
    }
  });
*/

  if (localStorage.getItem("usernameValue") != undefined){
    $('#login_username').val(localStorage.getItem("usernameValue"));
    $('#rememberMe')[0].checked = true;
  }

  $('#login').click(function(event) {
    event.preventDefault();


    //osType = checkSO(TAG);

    var username = $('#login_username').val();
    var password = $('#login_password').val();

    $(".loader").css("display", "block");
    // memorizzo username se la checkbox è checked
    if ($('#rememberMe')[0].checked) {
        localStorage.setItem("usernameValue", username);
    } else {
        localStorage.removeItem("usernameValue");
    }

    if ((username != undefined && username != '') && (password != undefined && password != '')) {

        var data = { CodTipoTag: TAG, Username: username, Password: password };
        $.ajax({
                type: "POST",
                url: loginAddress,
                data: JSON.stringify(data),
                crossDomain: true,
                contentType: 'application/json;application/x-www-form-urlencoded;charset=utf-8;',
                dataType: "json",
                success: function (data) {
                  if (data.Result == 0) {
                      sessionStorage.removeItem("login");
                      sessionStorage.setItem("login", JSON.stringify(data));
                      sessionStorage.removeItem("username");
                      sessionStorage.setItem("username", username);
                      sessionStorage.setItem("clientCode", data.ClientCode);
                      getSaldoAfterGame();
                      $('#login-modal').modal('toggle');
                      $(".logout-login").css("display", "block");
                      $(".open-login").css("display", "none");
                      /* setto indirizzo iframe con il corretto token
                      $('#myFrame').attr('src', iframeAddress+data.Token);
                      */
                      //invio token per autenticazione
                      var ifd = document.getElementById("myFrame");
                      ifd.contentWindow.postMessage(data.Token, '*');

                      $(".loader").css("display", "none");
                      //StatusBar.overlaysWebView(true);

                  }else{
                    sessionStorage.removeItem("login");
                    sessionStorage.removeItem("saldo");
                    sessionStorage.removeItem("username");
                    sessionStorage.removeItem("clientCode");
                    $(".loader").css("display", "none");
                    $('#text-login-msg').html(data.ResultDescription.replace(/_/g, " "));
                    $('#login_password').val('');

                  }
                },
                error: function (data, status, jqXHR) {
        			//ko
              //console.log(data);

                    //alert(data + ' - ' + status + " - " + jqXHR);
                }
        });

      }else {
        $(".loader").css("display", "none");
        $('#text-login-msg').html('USERNAME O PASSWORD NON CORRETTI');
        //qui messaggi errore
      }

      //automatic Resize Iframe

      $(window).on('autoResize', autoResize);

    });



  function getSaldo(){
    var saldoItem = sessionStorage.getItem("saldo");
    if (saldoItem) {
        var saldo = parseFloat(saldoItem) / 100;
    }
    return saldo.toFixed(2);
  }


  //cambio di stato sul nav-tabs
  $('#myTab a').click(function (e) {
     e.preventDefault()
     $(this).tab('show')

   })
   //lancio la pagina di registrazione utente esterna
   $('#login_register_btn').click(function(event) {
     var ref = window.open('https://www.betflag.it/registrati.aspx', '_blank', 'location=yes');
   })

   $(".navLink").click(function (e) {
       e.preventDefault();
       var url = $(this).attr('data-url');
       window.open(url, '_blank', 'location=yes');
   });

});



function autoResize(iframe) {
/*
  if (isLogged()== true){
    token = JSON.parse(sessionStorage.getItem("login")).Token;
    console.log(token);
    ifd = document.getElementById("myFrame");

    ifd.contentWindow.postMessage(token, '*');
  }
*/
  if (disableResize!=true){
      var h = $(iframe).height()-130; //130 = margin-top + margin-bottom
      $(iframe).height(h);
        disableResize = true;
  }
}


function getSaldoAfterGame(){
  var gruppo = 2, concessione = 15007, pvend = 15007;
  var token = JSON.parse(sessionStorage.getItem("login")).Token;
  $.ajax({
        url: serviceAddress + 'GetBalance?',
        type: 'GET',
        async: true,
        cache: false,
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        dataType: "jsonp",
        processdata: false,
        crossDomain: true,
        data: {"gruppo": gruppo, "conc": concessione, "pvend": pvend, "token": token},
        success: function (result) {
      //ok
          if (result != null) {
              sessionStorage.setItem("saldo", result);
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          logout();
      //ko
      //alert(textStatus);
            alert(errorThrown);
        }
    });
  }

/*
function forgotPassword(){
  window.open('https://m.betflag.it/ForgotPassword.aspx', '_blank', 'location=yes');
}
function forgotUsername(){
  window.open('https://m.betflag.it/ForgotUsername.aspx', '_blank', 'location=yes');
}
*/



function getSectionPart() {
  var sezione = '';
  var app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
  if (app) {
      // PhoneGap application
      sezione = "app";
  } else {
      // mobile Web page
      sezione = "mobile";
  }
  return sezione;
}

/* Tipo_giocata
30 Mobile Site, browser con sito ottimizzato per la fruizione da dispositivo mobile con sistema operativo Android /Unix like
31 Mobile Site, browser con sito ottimizzato per la fruizione da dispositivo mobile con sistema operativo iOS/Apple
34 Mobile Site, browser con sito ottimizzato per la fruizione da dispositivo mobile con altro sistema operativo

40 Applicazione client per Smartphone con sistema operativo Android/Unix like
41 Applicazione client per Smartphone con sistema operativo iOS/Apple
44 Applicazione client per Smartphone con altro sistema operativo

50 Applicazione client per Tablet con sistema operativo Android /Unix like
51 Applicazione client per Tablet con sistema operativo iOS/apple
54 Applicazione client per Tablet con altro sistema operativo
*/
function CheckTAG(app) {
    if (app == undefined || app == null || app == '')
        app = getSectionPart();

    var TAG = 34;
    var userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.search("android") > -1) {
        TAG = 30;
        if (app = "app") {
            if ((userAgent.search("mobile") > -1))
                TAG = 40;
            else {
                TAG = 50;
            }
        }
    }
    else if ((userAgent.search("iphone") > -1) || (userAgent.search("ipod") > -1) || (userAgent.search("ipad") > -1)) {
        TAG = 31;
        if (app = "app") {
            if (!(userAgent.search("ipad") > -1)) {
                TAG = 41;
            }
            else TAG = 51;
        }
    }
    return TAG;
}


  //visualizzazione interfaccia App true = nasconde, false=visibile
  function HideNav(toggle){
    var OS = CheckTAG();

    //resetto altezza iFrame 100%
    $('#myFrame').height('100%');

    if(toggle==true){
      $(".header-main").css("display", "none");
      $(".navbar-fixed-bottom").css("display", "none");
      $("#myFrame").css({"margin": "0px"});
      $('#myFrame').height('100%');
    }else{
      $(".header-main").css("display", "block");
      $(".navbar-fixed-bottom").css("display", "block");
      $("#myFrame").css("margin-top", "70px");
      //$("#myFrame").css("margin-bottom", "60px");
      $("#myFrame").css({"margin-bottom": "60px"});
      disableResize = false;

      //StatusBar.overlaysWebView(true);
    }
  }

  function closedModal(){
    $('.nav-tabs a[href="#1"]').tab('show');
  }


// Funzione di logout
  function logout() {
    sessionStorage.removeItem("login");
    sessionStorage.removeItem("saldo");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("clientCode");

    $('#login_username').val('');
    $('#login_password').val('');
    window.location.href = "index.html"
  }

// Verifica se l'utente è loggato
  function isLogged() {
      if (sessionStorage.getItem("login") != undefined)
          return true;
      return false;
  }

//controllo sulla pagina da caricare nell'iframe
  function switchTabInIframe(whichOne) {
    var iframesource = "";
    if (whichOne == 1) {
        //selezione home
        var login = JSON.parse(sessionStorage.getItem("login"));
        iframesource = iframeAddress;
        $(".icon-left").css("display", "none");

      } else if (whichOne == 2) {
        //selezione conto
        if (isLogged()== true){
          getSaldoAfterGame();
          iframesource = "conto.html";
          $(".icon-left").css("display", "block");
        }else {
          $('#login-modal').modal('toggle');
          return
        }
      }
        $("#myFrame").attr("src", iframesource);

    }
