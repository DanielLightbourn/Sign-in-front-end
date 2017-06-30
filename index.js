const MIN_SIZE_ID = 4;
const MAX_SIZE_ID = 5;
const SERVER_URL = "54.227.46.147";
const SERVER_PORT = "3000";
const EVENT_KEY = "test1";

$(function() {
  
  $("#form").submit(function(event) {
    console.log("Submit ID");
    
    // Validate input
    var input = $("#userID").val();
    var regex = new RegExp("^\\d{" + MIN_SIZE_ID + ","
                           + MAX_SIZE_ID + "}$");
    if (!input.match(regex)) {
      var message = "Invalid input: must be a number "
                    + MIN_SIZE_ID + "-" + MAX_SIZE_ID
                    + " digits long.";
      console.error(message);
      alert(message);
      $("#userID").val("");
    } else {
      input = parseInt(input);
      
      // Add loading indicator
      $("#loading").removeClass("hide");
      
      // Send API POST request
      postAddAttendence(input);
    }
    
    event.preventDefault();
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
          } else {
            console.log("Success!");
            $("#success").removeClass("hide");
          }
        },
        complete: function() {
          $("#loading").addClass("hide");
          $("#userID").val("");
        }
      }
    );
  }
  
  $("#success").on("animationend", function(event) {
    $("#success").addClass("hide");
  });
  
});