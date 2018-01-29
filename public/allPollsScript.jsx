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
      class List extends React.Component {
        render() {
          return data[1].map(function(poll, index){
            return <a className="text-center pollList" key={index} id={poll._id} href={"/polls/"+poll._id}>{poll.pollName}</a>
          }) 
        }
      }
      render(<List />, document.getElementById("list"))
    }
  });
})