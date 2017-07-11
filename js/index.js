const MIN_SIZE_ID = 4;
const MAX_SIZE_ID = 5;
const SERVER_URL = "127.0.0.1";
const SERVER_PORT = "2000";
const EVENT_KEY = "test1";
const KEY_TIMEOUT = 604800;
const ALGORITHM = {"alg":"SHA256withECDSA"};
const CURVE = "secp256r1";
const TEST_KEY = '{"prvKey":"eXGOv-pdSrM4ql9UiIucNnkVswkllalo302noHWmwNQ","pubKey":"BBzK7u11lfwluDvMfSrZt3RC8XFH4f4zqMGqM43wqTpLXU_JsbBjgu5FsbW61FOl0v0mcajX6YD6VZIFMYkPsBI","date":1499803884}';

$(function() {
  function saveKeys(keys) {
    localStorage.keys = JSON.stringify({
      "prvKey": hextob64u(keys.prvKeyObj.prvKeyHex),
      "pubKey": hextob64u(keys.pubKeyObj.pubKeyHex),
      "date": Math.floor(Date.now() / 1000)});
  }
  function generateKeys(doSave) {
    var newKeys = KEYUTIL.generateKeypair("EC", CURVE);
    if(doSave) saveKeys(newKeys);
    return newKeys;
  }
  function initKeys() {
    var keysLoaded = null;
    var storageKeys
    if(localStorage.keys) {
      storageKeys = JSON.parse(localStorage.keys);
      //client side check for old keys
      if(!storageKeys.date <= Math.floor(Date.now() / 1000) - KEY_TIMEOUT)
      {
        keysLoaded = new KJUR.crypto.ECDSA({'curve': CURVE});
        keysLoaded.setPublicKeyHex(b64utohex(storageKeys.pubKey));
        keysLoaded.setPrivateKeyHex(b64utohex(storageKeys.prvKey));
      } else {
        //keys too old to be used
      }
    }
    return keysLoaded
  }
  
  var keypair = initKeys();
  var generateNewKeys = false;
  if(keypair == null) {
    console.error("keys could not be loaded or keys too old.");
    //goto authenticatcation page
    localStorage.keys = TEST_KEY;
    keypair = initKeys();
  }
  
  $("#submit").on('vclick',function() {
    console.log("Submit ID ");

    // Validate input
    var input = $("#id-number").val();
    var regex = new RegExp("^\\d{" + MIN_SIZE_ID + ","
                           + MAX_SIZE_ID + "}$");

    if (!input.match(regex)) {
      var message = "Invalid input: must be a number "
                    + MIN_SIZE_ID + "-" + MAX_SIZE_ID
                    + " digits long.";
      console.error(message);
      alert(message);
      $("#id-number").val("");
    } else {
      input = parseInt(input);
      
      // add loading indicator
      $("#loading").removeClass("hide");
      
      // send API POST request
      postAddAttendence(input);
    }
    
    event.cancelBubble = true;
  });
  function verifyJSON(signedObject, pubKey) {
    var signedString = JSON.stringify(signedObject.data);
    var signitureVerify = new KJUR.crypto.Signature(ALGORITHM);
    signitureVerify.init(pubKey);
    signitureVerify.updateString(signedString);
    return signitureVerify.verify(b64utohex(signedObject.signiture));
  }
  function signJSON(object, verifySig) {
    var stringToSign = JSON.stringify(object);
    var sig = new KJUR.crypto.Signature(ALGORITHM);
    sig.init(keypair);
    sig.updateString(stringToSign);
    var signitureHex = sig.sign();
    var signedObject = {'data':object,'signiture':hextob64u(signitureHex)};
    if(verifySig){
      if(!verifyJSON(signedObject, new KJUR.crypto.ECDSA({"curve": CURVE, "pub": (keypair.pubKeyHex)}))) {
        throw "signiture does not match!\npubKey:\n" + keypair.pubKeyHex + "\nSignedObject:\n" + stringToSign;
      } else {
        console.log("signiture OK")
      }
    }
    return signedObject;
  }
  function postAddAttendence(userID) {
    var url = "http://" + SERVER_URL
      + ":" + SERVER_PORT + "/" + "addAttendance";
    var dataToPost;
    var newKeys
    if(generateNewKeys) {
      newKeys = generateKeys(false);
      dataToPost = {
          user_ID: userID.toString(),
          eventKey: EVENT_KEY.toString(),
          newKey: hextob64u(newKeys.pubKeyObj.pubKeyHex).toString()
        }
    } else {
      dataToPost = {
          user_ID: userID.toString(),
          eventKey: EVENT_KEY.toString(),
        }
    }
    var signedData = signJSON(dataToPost, true)
    console.log(JSON.stringify(signedData));
    $.ajax(
      url,
      {
        method: "POST",
        data: signedData,
        success: function(data, textStatus, jqXHR) {
          if (textStatus != "success") {
          // failure, not sure what happened
            $("#failure").removeClass("hide");
            $("#failmsg2").removeClass("hide");
          } else {
            $("#success").removeClass("hide");
            if(generateNewKeys) {
              saveKeys(newKeys);
              keypair = initKeys();
            }
            generateNewKeys = false/*server says to generate new key*/;
          }
        },
        error: function(xhr) {
          if (xhr.status != "404") {
          // failure, server may be down
            $("#failure").removeClass("hide");
            $("#failmsg1").removeClass("hide");
          } else if (xhr.status == "403") {
          // failure, not authenticated
            $("#failure").removeClass("hide");
            $("#failmsg3").removeClass("hide");
          } else {
          // failure, are you in the right room?
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

  $("#failmsg3").on("animationend", function(event) {
    $("#failmsg3").addClass("hide");
  });
});
