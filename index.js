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
      console.error("Invalid input: must be a number "
                    + MIN_SIZE_ID + "-" + MAX_SIZE_ID
                    + " digits long.");
    } else {
      input = parseInt(input);

      // Send API POST request
      postAddAttendence(input);
    }
    
    event.preventDefault();
    event.cancelBubble = true;
  });
  
  function postAddAttendence(userID) {
    var url = "http://" + SERVER_URL
      + ":" + SERVER_PORT + "/" + "addAttendance";
    $.post(
      url,
      {
        user_ID: userID,
        eventKey: EVENT_KEY,
      },
      function(data, textStatus, jqXHR) {
        if (textStatus != "success") {
          console.error("Failed to POST request.");
        } else {
          console.log("Success!");
          console.log(data);
        }
      }
    );
  }
  
});