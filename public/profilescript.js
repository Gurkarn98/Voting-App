$(document).ready(function(){
  var addpolldown = false;
  document.forms["addPoll"]["pollOptions"].value = "";
  document.forms["addPoll"]["pollName"].value = "";
  document.getElementById("optionsField").value = "";
  $.ajax({
    type : "GET",
    dataTyle : "JSON",
    url : "/api/getProfile",
    success : function(data){
      document.getElementById("usernameBtn").innerHTML = data.username + "  <img src="+data.pic+" class='profilePic'></img>"
      document.getElementById("profileUsername").innerHTML = "Welcome "+ data.username
    }
  })
  $(".add-menu").slideUp()
  $(".menu-box").fadeOut()
  $('.add-poll').on("click", function(){
    addpolldown = true
    $(".add-menu").slideDown(750)
    $(".menu-box").fadeIn(1250)
  })
  $(document).on("keydown", function(event){
    if (event.keyCode === 27 && addpolldown === true) {
      addpolldown = false;
      $(".add-menu").slideUp(750)
      $(".menu-box").fadeOut(250)
      document.forms["addPoll"]["pollOptions"].value = "";
      document.forms["addPoll"]["pollName"].value = "";
      document.getElementById("optionsField").value = "";
    }
  })
  $.ajax({
    type : "GET",
    dataTyle : "JSON",
    url : "/api/getPollList",
    success : function(data){
      $("#createPoll").submit(function(){
        var alertMessage = [];
        var valid = true;
        var temp = document.forms["addPoll"]["pollName"].value;
        var temp2 = document.getElementById("optionsField").value.split("\n");
        if (temp === "" || temp === " " && temp.length === 1 || temp.split(" ").length === temp.length && temp.length>1) {
          valid = false
          alertMessage.push("Enter a valid name for you poll. Poll names can't be empty space.")
        }
        var filtered = []
        temp2.forEach(function(option, index){
          if (option === "") {
          } else if (option.split(" ").length === option.length+1) {
          } else {filtered.push(option)}
        })
        if (filtered.length === 0) {
          valid = false
          alertMessage.push("Enter at least 1 options to select from.")
        }
        var pollData = {
          options : filtered,
          votes : {"Option": "Vote"}
        }
        filtered.forEach(function(option){
          pollData.votes[option] = 0
        })
        if (valid === true) {
          filtered.push("Custom")
          document.forms["addPoll"]["pollOptions"].value = JSON.stringify(pollData)
          return true
        } else {
          alert(alertMessage.join("\n")) 
          return false
        }
      })
    }
  })
})