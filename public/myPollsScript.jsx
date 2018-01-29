import React from 'react';
import {render} from 'react-dom';
$(document).ready(function(){
  $.ajax({
    type : "GET",
    dataTyle : "JSON",
    url : "/api/getPollList",
    success : function(data){
      if (Object.keys(data[0]).length > 1) {
        document.getElementById("usernameBtn").innerHTML = data[0].username + "  <img src="+data[0].pic+" class='profilePic'></img>"
      }
      var count = 0
      class List extends React.Component {
        render() {
          return data[1].map(function(poll, index){
            if (poll.pollMaster === data[0].twtuser){
              count++;
              return <a className="text-center pollList" key={index} id={poll._id} href={"/polls/"+poll._id}>{poll.pollName}</a>
            }
          }) 
        }
      }
      render(<List />, document.getElementById("list"))
      if (count === 0) {
        class NoPolls extends React.Component {
          render() {
            return (
              <div>
                <h6 className="profilePageDescription">You haven't created any polls yet. Create you poll now. Otherwise, visit All Polls section to vote in an existing poll.</h6>
                <div className="btn add-poll">Create New Poll</div>
              </div>
            ) 
          }
        }
        render(<NoPolls />, document.getElementById("list"))
        class CreatePoll extends React.Component {
          render() {
            return (
              <div className="add-menu">
                <div className="background">
                </div>
                <div className="menu-box">
                  <form name="addPoll" id="createPoll" className="makePollForm" method="POST"  action="/submit">
                    <h3 className="text-center" id="formLabel">Make a new Poll</h3>
                    <br/>
                    <h6 id="formLabels">Poll Name:</h6>
                    <input className="makePollInput" type="text" name="pollName"/>
                    <br/>
                    <br/>
                    <h6 id="formLabels">Poll Options (seperated by line):</h6>
                    <textarea id="optionsField" className="makePollInput makePollInputOptions" type="text"></textarea>
                    <textarea className="makePollInput makePollInputOptions hiddenField" type="text" name="pollOptions"></textarea>
                    <br/>
                    <input className="makePollInputSubmit text-center" type="submit" value="Make" />
                  </form>
                </div>
              </div>
            )
          }
        }
        render(<CreatePoll />, document.getElementById("createPollReact"))  
        var addpolldown = false;
        document.forms["addPoll"]["pollOptions"].value = "";
        document.forms["addPoll"]["pollName"].value = "";
        document.getElementById("optionsField").value = "";
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
      
      
      
      }
    }
  });
})