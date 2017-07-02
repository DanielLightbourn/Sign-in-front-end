const MIN_SIZE_ID = 4;
const MAX_SIZE_ID = 5;
const SERVER_URL = "54.227.46.147";
const SERVER_PORT = "3000";
const EVENT_KEY = "test1";

$(function() {
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
      
      // Add loading indicator
      $("#loading").removeClass("hide");
      
      // Send API POST request
      postAddAttendence(input);
    }
    
    //event.preventDefault();
    event.cancelBubble = true;
  });

  function postAddAttendence(userID) {
    var url = "http://" + SERVER_URL
      + ":" + SERVER_PORT + "/" + "addAttendance";
    $.ajax(
      url,
      {
        method: "POST",
        data: {
          user_ID: userID,
          eventKey: EVENT_KEY,
        },
        success: function(data, textStatus, jqXHR) {
          if (textStatus != "success") {
            console.error("Failed to POST request.");
	    $("#failure").removeClass("hide");
	    $("#failmsg").removeClass("hide");
          } else {
            console.log("Success!");
            $("#success").removeClass("hide");
          }
        },
	error: function(xhr) {
	    $("#failure").removeClass("hide");
	    $("#failmsg").removeClass("hide");
	},
        complete: function() {
          $("#loading").addClass("hide");
          $("#id-number").val("");
        }
      }
    );
  }
  
  $("#success").on("animationend", function(event) {
    $("#success").addClass("hide");
  });

  $("#failure").on("animationend", function(event) {
    $("#failure").addClass("hide");
  });

  $("#failmsg").on("animationend", function(event) {
    $("#failmsg").addClass("hide");
  });  
});
