import React from 'react';
import {render} from 'react-dom';
var google = window.google
$(document).ready(function(){
  var url = window.location.href.split("/")
  $.ajax({
    type : "GET",
    dataTyle : "JSON",
    url : "/api/getPoll/"+url[url.length-1],
    success : function(data){
      console.log(data)
      var logged = false
      var pollData = data[1][0].votes
      if (Object.keys(data[0]).length > 1) {
        document.getElementById("usernameBtn").innerHTML = data[0].username + "  <img src="+data[0].pic+" class='profilePic'></img>";
        logged = true;
      }
      class List extends React.Component {
        render() {
          return (
            <div className="reactPoll">
              <h2>{data[1][0].pollName}</h2>
              <div className="row">
                <div className="col-sm-5">
                  <form name="vote" id="voteForm" action="/vote" method="POST">
                    <p>I'd like to vote for ...</p>
                    <select name="choice" id="choice">
                      {data[1][0].pollOptions.map(function(option, index){
                        if (option === "Custom" && logged == true){
                          return <option key={option} value={option}>I'd like a custom option</option>
                        } else if (option === "Custom" && logged == false){
                        } else {
                        return <option key={option} value={option}>{option}</option>
                        }
                      })}
                    </select>
                    <p className="customInput">Vote with my own option:</p>
                    <input className="customInput" id="myOption" type="text" name="Custom" />
                    <button type="submit" id="submitVote" className="btn btn-primary">
                      <i className="fas fa-paper-plane"></i> Submit
                    </button>
                    <input type="text" name="jsonFormatted" id="jsonFormatted" value="" />
                  </form>
                  <a href={"https://twitter.com/intent/tweet?text="+"Vote in this poll %7C "+data[1][0].pollName+" %7C "+window.location.href}>
                    <button id="share" id="share" className="btn btn-primary">
                      <i className="fab fa-twitter"></i> Share on Twitter
                    </button>
                  </a>
                </div>
                <div className="col-sm-7"><div id="chart"></div></div>
                <a href={"/delete/"+data[1][0]._id} id="delete">
                  <button className="btn btn-danger">
                    Delete
                  </button>
                </a>
              </div>
            </div>)
        }
      }
      render(<List />, document.getElementById("specificPoll"))
      if (data[1][0].pollMaster !== data[0].twtuser){
        document.getElementById('delete').style.display = "none"
      }
      document.getElementById('choice').style.marginBottom = "5%"
      document.getElementById('myOption').style.marginBottom = "5%"
      document.getElementById('submitVote').style.display = "block"
      document.getElementById('submitVote').style.width = "70%"
      document.getElementById('submitVote').style.margin = "auto"
      $('.customInput').hide(); 
      $('#choice').change(function(){
          if($('#choice').val() === 'Custom') {
              $('.customInput').show(); 
          } else {
              $('.customInput').hide(); 
          } 
      });
      $("#voteForm").submit(function validateForm(){
        var index = document.getElementById("choice").selectedIndex
        var poll =  data[1][0]
        var users;
        var ip;
        var update = {
          id : poll._id,
          addUserName: false,
          addIp: false,
          addPollOption: false,
          update: false
        }
        if (Object.keys(data[0]).length > 1) {
          users = poll.voted.find(function (user){
            return user === data[0].twtuser
          })
        }
        ip = poll.voted.find(function (ip){
            return ip === data[0].ip
        })
        if (ip === undefined && users === undefined) {
          if (Object.keys(data[0]).length > 1) {
            update.addUserName = data[0].twtuser
            update.addIp = data[0].ip
          } else if (Object.keys(data[0]).length === 1) {
            update.addIp = data[0].ip
          }
          if ($('#choice').val() === "Custom" && logged === true){ 
            if (poll.pollOptions.indexOf(document.forms["vote"]["Custom"].value) === -1) {
              update.addPollOption = document.forms["vote"]["Custom"].value
            } else {
              update.update = document.forms["vote"]["Custom"].value
            }
          } else {
            update.update = $('#choice').val()
          }
          var voting = update.update||update.addPollOption
          document.forms["vote"]["jsonFormatted"].value = JSON.stringify(update)
          return  confirm('You are voting for '+voting)
        }
        alert("You can vote only once.")
        return false
      })
      google.charts.load('current', {'packages':['corechart']});
      google.charts.setOnLoadCallback(drawChart);
      function drawChart() {
        var list = []
        var l = Object.keys(pollData).length
        var keys = Object.keys(pollData)
        for (var i = 0; i<l ; i++) {
          list.push([keys[i], pollData[keys[i]]])
        }
        var data = google.visualization.arrayToDataTable(list);
        var options = {
          'height':500,
          'chartArea': {'width': '100%', 'height': '70%'},
          'legend': {'position': 'bottom'}
        };
        var chart = new google.visualization.PieChart(document.getElementById('chart'));
        chart.draw(data, options);
      }
      $(window).resize(function(){
        drawChart()
      });
    }
  });
})