const SERVER_URL = "127.0.0.1";
const SERVER_PORT = "3001";
const CURVE = "secp256r1";
const SIGNIN_LOCATION = "./index.html"

$(function() {
  function saveKeys(keys) {
    localStorage.keys = JSON.stringify({
      "prvKey": hextob64u(keys.prvKeyObj.prvKeyHex),
      "pubKey": hextob64u(keys.pubKeyObj.pubKeyHex),
      "date": Math.floor(Date.now() / 1000)});
  }
  function saveEventKey(eventKey) {
    localStorage.eventKey = eventKey;
  }
  function generateKeys(doSave) {
    var newKeys = KEYUTIL.generateKeypair("EC", CURVE);
    if(doSave) saveKeys(newKeys);
    return newKeys;
  }
  $("#submit").on('vclick',function() {
    console.log("Submit pin");
    var input = $("#pin-number").val();
    
    // add loading indicator
    $("#loading").removeClass("hide");
    
    // send API POST request
    postPin(input);
    
    event.cancelBubble = true;
  });
  function postPin(pin) {
    var url = "http://" + SERVER_URL
      + ":" + SERVER_PORT + "/" + "authenticate";
    var newKeys = generateKeys(false);
    $.ajax(
      url,
      {
        method: "POST",
        data: {
          'key': hextob64u(newKeys.pubKeyObj.pubKeyHex),
          'pin': pin
        },
        success: function(xhr) {
          console.log(xhr.key);
          if (xhr.key == undefined) {
          // failure, incorrect pin
            $("#failure").removeClass("hide");
            $("#failmsg2").removeClass("hide");
          } else {
            $("#success").removeClass("hide");
            saveKeys(newKeys);
            saveEventKey(xhr.key)
            window.location = SIGNIN_LOCATION;
          }
        },
        error: function(xhr) {
          if (xhr.status == "404") {
          // failure, server may be down
            $("#failure").removeClass("hide");
            $("#failmsg1").removeClass("hide");
          } else {
          // failure, incorrect pin
            $("#failure").removeClass("hide");
            $("#failmsg2").removeClass("hide");
          }
        },
        complete: function() {
        // hide loading indicator and clear out the input box
          $("#loading").addClass("hide");
          $("#id-number").val("");
        }
      });
  }
  
  $("#success").on("animationend", function(event) {
    $("#success").addClass("hide");
  });

  $("#failure").on("animationend", function(event) {
    $("#failure").addClass("hide");
  });

  $("#failmsg1").on("animationend", function(event) {
    $("#failmsg1").addClass("hide");
  });

  $("#failmsg2").on("animationend", function(event) {
    $("#failmsg2").addClass("hide");
  });
});
