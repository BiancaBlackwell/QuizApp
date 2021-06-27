import "./Pages.css";
import axios from "axios";
import { Redirect, useParams } from "react-router-dom";
import React, { useEffect, useState, useRef } from 'react';
import socket from "./socket";
import io from "socket.io-client";


const BACKEND_URL = "http://localhost:5000"

//const SOCKET_URL = "http://localhost:5000"
//let socket;




function Landing() {
  const [userRoomId, setUserRoomId] = useState({userId: undefined, roomId: undefined});
  const [redirectToLobby, setRedirectToLobby] = useState(false);
  const [buttonEnabled, setButtonEnabled] = useState(true);
  const [joinButtonEnabled, setJoinButtonEnabled] = useState(true);
  const [lobbyCode, setlobbyCode] = useState("");


  // this effect gets run whenever userRoomId gets updated (because it's in the array we provide as an argument) -- in this case, after we get it from the backend in createAndJoinRoom
  useEffect(() => {
    // make sure they're both set
    if(userRoomId.userId && userRoomId.roomId){
      axios.get(`${BACKEND_URL}/backend/joinRoom/${userRoomId.userId}=${userRoomId.roomId}`).then((res) => {
        // useEffect functions can't be async so we're using .then 
        setRedirectToLobby(true);
      }, (err) => {
        alert("failed to join lobby, sorry!");
      });
    }
  }, [userRoomId])

  // On Change
  const onChange = e => {
    setlobbyCode(e.target.value);
  };

  const checkEnter = (event) => {
    if (event.key === 'Enter') {
      joinRoom()
    }
  }

  async function joinRoom(){
    // disable the create button while we're loading
    setButtonEnabled(false);
    console.log('Creating User');
    let createUserResponse = await axios.get(`${BACKEND_URL}/backend/createUser`);
    console.log('Joining Room' + lobbyCode);

    // all we need to do here is set the state, the effect handles the join and redirect
    setUserRoomId({roomId: lobbyCode, userId: createUserResponse.data});
  };

  async function createAndJoinRoom(){
    // disable the create button while we're loading
    setButtonEnabled(false);
    console.log('Creating User');
    let createUserResponse = await axios.get(`${BACKEND_URL}/backend/createUser`);
    console.log('Creating Room');
    let createRoomResponse = await axios.get(`${BACKEND_URL}/backend/createRoom`);
    
    // all we need to do here is set the state, the effect handles the join and redirect
    setUserRoomId({roomId: createRoomResponse.data, userId: createUserResponse.data});
  }

  return (
    <div className="coontainer-fluid">
      <br/><br/><br/><br/>
      <div className="row text-center m-3">
        <h1 className="text-nowrap main-title">Quiz App</h1>
      </div>
      <br/><br/><br/>
      <div className="row align-items-center justify-content-center m-3">
        <div className="col-3">
          <div className="input-group">
          <input type="text" className="form-control text-nowrap" placeholder="Lobby Code" onChange={e => onChange(e)} onKeyPress={ checkEnter } />
            <div className="input-group-btn">
              <button type="submit" enabled = {buttonEnabled.toString()} className="btn btn-dark text-nowrap form-control" style={{width: "auto"}} onClick={ joinRoom } >Join</button>
              
              {redirectToLobby && <Redirect to={{
                pathname:`/game/${userRoomId.roomId}`, 
                state: { userId: userRoomId.userId } // this is accessed with props.location.state.userId in the lobby component. fine to pass as a prop b/c it won't change
                }} 
              />}

            </div>
          </div>
        </div>
      </div>
      <div className="row text-center">
        <div className="col">
          <button type="submit" enabled = {buttonEnabled.toString()} className="btn btn-dark text-nowrap" onClick={ createAndJoinRoom }>Create</button>

          {redirectToLobby && <Redirect to={{
              pathname:`/game/${userRoomId.roomId}`, 
              state: { userId: userRoomId.userId } // this is accessed with props.location.state.userId in the lobby component. fine to pass as a prop b/c it won't change
            }} 
          />}

        </div>
      </div>
    </div>
    )
}

function GameStateHandler(props) {

  // NOTE: this component is where we'll do all the fancy webhook stuff
  // and pass the results to the children

  // this gets the url roomId
  const { roomId } = useParams();
  // track what part of the game UI we want to display
  // this should be either lobby, game, or victory
  const [currentPage, setCurrentPage] = useState("lobby");
  const [messages, setMessages] = useState([]);
  const [players, setPlayers] = useState([]);
  const [amHost, setAmHost] = useState(false);
  const [start, setStart] = useState(false);
  const [question, setQuestion] = useState({});
  const [scores, setScores] = useState([]);

  // since anyone can click this link we cannot rely on the userId prop being filled here
  const [userId, setUserId] = useState(() => {
    // function args to useState are run once to get the intial value
    if(props.location.state){
      // this will be the userId that gets passed from the redirect of the Lobby component
      return props.location.state.userId;
    } else{
      return undefined;
    }
  });

/*

  //**************************************************
  //should trigger when page is closed but doesn't
  //**************************************************

  useEffect(() => {
    console.log('entering go**********');
    return  () => {
      window.addEventListener("beforeunload", function(e) {
        let confirmationMessage = "o/";
        (e || window.event).returnvalue = confirmationMessage;
  
        socket.emit("message", {"roomId":roomId, 'message':"outside ghs", "userId":userId});
        socket.emit("disconnectUser", {"roomId":roomId, "userId":userId});
        socket.removeAllListeners();
        socket.disconnect();

        return confirmationMessage;
      });
    }

    //or

    return  () => {
      socket.emit("message", {"roomId":roomId, 'message':"inside gsh", "userId":userId});
      socket.emit("disconnectUser", {"roomId":roomId, "userId":userId});
      socket.removeAllListeners();
      socket.disconnect();
    }

  });
  
  //**************************************************
  //should trigger when page is closed but doesn't
  //**************************************************  
  */

  // handle creating the userId if the person came here by clicking the link
  useEffect(() => {

    if(userId === undefined){
      axios.get(`${BACKEND_URL}/backend/createUser`).then((createUserResponse) => {
        if (createUserResponse.status !== 200) {
          alert("Wasn't able to create your userId, sorry!");
          return;
        }

        setUserId(createUserResponse.data);
      });
    }

    //socket = io.connect(`${SOCKET_URL}`);

    socket.on("message", msg => {
      console.log('Recieved message: [' + msg.message + '] from ' + msg.userId);
      let allMessages = messages;
      allMessages.push(msg);
      setMessages([...allMessages]);
    });

    socket.on("updatePlayers", players => {
      console.log('Updating Players');
      console.log(players);

      setPlayers(players);
    });

    socket.on("start", () => {
      console.log("starting");
      setStart(true);
      //socket.emit("startGame", {"roomId":roomId, "userId":userId});
    });
    socket.on("unstart", () => {
      console.log("unstart");
      setStart(false);
      //socket.emit("startGame", {"roomId":roomId, "userId":userId});
    });

    socket.on("newHost", host => {
      console.log("New Host is " + host.userId);
      if(userId === host.userId)
        setAmHost(true);
    });

    socket.on("trivia", () => {
      console.log("********************TRIVIA********************");
      setCurrentPage("trivia")
      //socket.emit("nextQuestion")
    });

    socket.on("getNextQuestion", () => {
      console.log("Next Question");
      socket.emit("nextQuestion",{"roomId":roomId});
    });

    socket.on("returnNextQuestion", question => {
      console.log("Recieved Question: " + question.question);
      setQuestion(question);
    });

    // socket.on("returnNextQuestion", question =>{
    //   #aaa make the question into question and answers and display
    // };

    socket.on("updateScores", scores => {
      console.log("Updating Scores");
      setScores(scores)
    });

    socket.on("recieved", () => {
      console.log("recieved");
    });




    socket.emit("identify", {"roomId": roomId, "userId":userId});



    /*

    //**************************************************
    //should trigger when page is closed but doesn't
    //**************************************************

    return  () => {
      window.addEventListener("beforeunload", function(e) {
        let confirmationMessage = "o/";
        (e || window.event).returnvalue = confirmationMessage;
  
        socket.emit("message", {"roomId":roomId, 'message':"inside gsh", "userId":userId});
        socket.emit("disconnectUser", {"roomId":roomId, "userId":userId});
        socket.removeAllListeners();
        socket.disconnect();
        return confirmationMessage;
      });
    }

    //or

    return  () => {
      socket.emit("message", {"roomId":roomId, 'message':"inside gsh", "userId":userId});
      socket.emit("disconnectUser", {"roomId":roomId, "userId":userId});
      socket.removeAllListeners();
      socket.disconnect();
    }

    //**************************************************
    //should trigger when page is closed but doesn't
    //**************************************************    


    // this also doesn't work
    window.addEventListener('beforeunload', alertUser)
    return () => {
      window.removeEventListener('beforeunload', alertUser)
    
    window.addEventListener('beforeunload',function(e) {

      socket.emit("message", {"roomId":roomId, 'message':"inside gsh", "userId":userId});

    });

*/
    // passing an empty array to useEffect makes it run once when the component is mounted
  }, []);

/*
  // this also doesn't work
  const alertUser = e => {

    socket.emit("message", {"roomId":roomId, 'message':"inside gsh", "userId":userId});
    socket.emit("disconnectUser", {"roomId":roomId, "userId":userId});

    e.preventDefault()
    e.returnValue = ''
  }

*/


  const toLobby = () => {
    setCurrentPage('lobby');
  }

  return (
    <div>
      <div>{roomId}</div>
      {currentPage === "lobby" && <Lobby userId = {userId} roomId = {roomId} messages={messages} players={players} amHost={amHost} start={start}/>}
      {currentPage === "trivia" && <Trivia userId = {userId} roomId = {roomId} players={players} question= { question }/>}
      {currentPage === "victory" && <Victory userId = {userId} roomId = {roomId} players={players} toLobby={toLobby}/>}
    </div>
  )
}



// can use destructuring here to be more explict abt what we pass as props
function Lobby({userId, roomId, messages, players, amHost, start}) {

  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);
  const [colors, setColor] = useState({"backgroundColor":"#464866"});

  // On Change
  const onChange = e => {
    setMessage(e.target.value);
  };

  // On Click
  const onClick = () => {
    if (message === "") {
      alert("Please Add A Message");
      return;
    }

    console.log('Sending message: [' + message + '] to room ' + roomId);
    socket.emit("sendMessage", {"roomId":roomId, "message":message, "userId":userId});
    setMessage("");
  };

  const toggleReady = () => {
    if(!amHost || (amHost && start)){
      let toggle = !ready;
      console.log('Toggling ready state to: ' + toggle);
      socket.emit(toggle?"readyUser":"unreadyUser", {"roomId":roomId, "message":message, "userId":userId});
      setColor(toggle?{"backgroundColor":"#25274d"}:{"backgroundColor":"#464866"});
      setReady(toggle);
    }
  };

  const checkEnter = (event) => {
    if (event.key === 'Enter') {
      onClick()
    }
  }

/*

  //**************************************************
  //should trigger when page is closed but doesn't
  //**************************************************

  useEffect(() => {
    console.log('entering lobby**********');
    return  () => {
      window.addEventListener("beforeunload", function(e) {
        let confirmationMessage = "o/";
        (e || window.event).returnvalue = confirmationMessage;
  
        socket.emit("message", {"roomId":roomId, 'message':"lobby", "userId":userId});
        socket.emit("disconnectUser", {"roomId":roomId, "userId":userId});
        socket.removeAllListeners();
        socket.disconnect();

        return confirmationMessage;
      });
    }

    //or

    return  () => {
      socket.emit("message", {"roomId":roomId, 'message':"inside gsh", "userId":userId});
      socket.emit("disconnectUser", {"roomId":roomId, "userId":userId});
      socket.removeAllListeners();
      socket.disconnect();
    }
  });

  //**************************************************
  //should trigger when page is closed but doesn't
  //**************************************************
 
  */  




  return (

    <div className="coontainer-fluid">
      <div className="row">
        <PlayerSidebar players={players}/>

        <div className="col-10">

          <br/>
          <h1 className="lobby-heading text-center text-middle">Main Lobby</h1>
          <p className="uid text-center" id="uid">{userId} {amHost?"*****":""} </p>

          <br/><br/><br/>


          
          <div className="row">
  
            <div className="col-6">

              <div className="row message_holder" style={{textAlign: "left"}}>
                <div>
                  { messages.length == 0 && <h3 className="message_placeholder">No message yet..</h3> }

                  {messages.length > 0 && messages.map( (msg, ind) => {
                    if(msg.userId === "server"){
                      return (
                        <div key={ind}>
                          <b>{msg.message}</b>
                      </div>
                      )
                    }
                    else{
                      return (
                        <div key={ind}>
                          {msg.userId}: {msg.message}
                        </div>
                      )
                     
                    }
                  
                  })
                }
                </div>
              </div>

              <div className="input-group">
                <input type="text" className="text-nowrap form-control message" style={{fontSize: "18px", placeholder:"Message"}} value={message} name="message" onChange={e => onChange(e)} onKeyPress={ checkEnter }  />
                <button type="submit" className="btn btn-dark text-nowrap" onClick={() => onClick()}>Send</button>
              </div>

              <br/>
              <div style={{textAlign: "center"}}>
                <button type="submit" className="btn btn-dark text-nowrap" onClick={() => toggleReady() } style={{backgroundColor:colors.backgroundColor}}>{amHost?'Start':'Ready'}</button>
              </div>

            </div>




            <div className="col-5" style={{marginLeft: "15px"}}>

              <div className="btn-group">
                <div className="input-group-prepend">
                  <span className="input-group-text h-100" style={{backgroundColor: "#85c3cf", border: "#25274d", color:"#212121"}}><b>Time per Question</b></span>
                </div>
                <button type="button" className="btn btn-dark">15s</button>
                <button type="button" className="btn btn-dark">20s</button>
                <button type="button" className="btn btn-dark">25s</button>
                <button type="button" className="btn btn-dark">30s</button>
                <button type="button" className="btn btn-dark">45s</button>
                <button type="button" className="btn btn-dark">60s</button>
                <button type="button" className="btn btn-dark" style={{fontSize: "20pt"}}>∞</button>
              </div>

              <div className="row mt-3">
                <div className="col">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Animals</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" htmlFor="flexSwitchCheckChecked">Brain Teasers</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Celebrities</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" htmlFor="flexSwitchCheckChecked">Entertainment</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" htmlFor="flexSwitchCheckDefault">For Kids</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" htmlFor="flexSwitchCheckChecked">General</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Geography</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" htmlFor="flexSwitchCheckChecked">History</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Hobbies</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" htmlFor="flexSwitchCheckChecked">Humanities</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Literature</label>
                  </div>

                </div>

                <div className="col">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" htmlFor="flexSwitchCheckChecked">Movies</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Music</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" htmlFor="flexSwitchCheckChecked">Newest</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" htmlFor="flexSwitchCheckDefault">People</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" htmlFor="flexSwitchCheckChecked">Rated</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Religion/Faith</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" htmlFor="flexSwitchCheckChecked">Science/Technology</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Sports</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" htmlFor="flexSwitchCheckChecked">Television</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Video Games</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" htmlFor="flexSwitchCheckChecked">World</label>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PlayerSidebar(props) {
  // let's have props.players be a array of objects, each with a name and optionally a score

  return <div className="col-2 sidebar text-center" style={{ height: "100vh" }}>
    <br />

    <h3 style={{ color: "#e8f9fc" }}>Players</h3>
    {
      props.players && props.players.map((player, ind) => {
        // we want this component to be able to be used on both the lobby and game screen
        // so we should not expect it to always have a score
        if(player.score){
          return (
          <div className="player card mb-2" key = {ind} style={{backgroundColor: (player.isReady?"#2ec949":"#85c3cf") }}>
            <h5 className="card-title mb-0">{player.name}</h5>
            <p className="card-text">{player.score} pts.</p>
          </div>)

        } else {
          return (
          <div className="player card mb-2" key = {ind} style={{backgroundColor: (player.isReady?"#2ec949":"#85c3cf") }}>
            <h5 className="card-title mb-0">{player.name}</h5>
          </div>)
        }
      })
    }
  </div>;
}

function Trivia({userId, roomId, players, question}) {

 /* useEffect(() => {
    return  () => {
      window.addEventListener("beforeunload", function(e) {
        let confirmationMessage = "o/";
        (e || window.event).returnvalue = confirmationMessage;
  
        socket.emit("disconnectUser", {"roomId":roomId, "userId":userId});
        socket.removeAllListeners();
        socket.disconnect();

        return confirmationMessage;
      });
    }
  });*/

  return (
    <div className="coontainer-fluid">
      <div className="row">
        <PlayerSidebar  players={players}/>
        <Question userId={userId} roomId={roomId} question={question}/>
      </div>
    </div>
  )
}

function Question(props) {
  // props.question.name => string and props.question.answers => array of string answers

  const submitAnswer = choice => {

    console.log('answer: '+answered+' | '+choice);
    socket.emit("submitAnswer", {"roomId":props.roomId, "userId":props.userId, "answer":choice});
  };

  return (
    <div className="col-10 text-center">
      <br /><br />
      <h1 className="display-3" style={{color: "#212121"}}><strong>Question 1</strong></h1>
      <div className="row">
        <div className="col-8 offset-2">
          <div className="jumbotron">
            <p className="lead" style={{fontSize: "25pt"}}>{props.question.question}</p>
          </div>
        </div>
      </div>
      <br />
      <div className="row">
        <div className="col"></div>
        {
          // we want two answers in this column and the other two in the other column
          props.question.answers.slice(0,2).map((answer, index) => {
            return <AnswerButton key={index} answer={answer} submitAnswer={submitAnswer} row={0} col={index}/>
          })
        }

        <div className="col"></div>
      </div>

      <br />
      <div className="row">
        <div className="col"></div>
            {
              // we want two answers in this column and the other two in the other column
              props.question.answers.slice(2).map((answer, index) => {
                return <AnswerButton key={index} answer={answer} submitAnswer={submitAnswer} row={1} col={index}/>
              })
            }
          <div className="col"></div>
      </div>
   </div>
  )
}


function AnswerButton(props){

  const map = [[0,1],[2,3]];
  const handleClick = () => {
    props.submitAnswer(map[props.row][props.col]);
  }

  return (
    <div className="col-3 same-height">
      <button className="btn btn-primary btn-lg answer w-100 h-100" onClick={ handleClick }>
        {props.answer}
      </button>
    </div>
    )
}

function VictoryQuestions(props) {
  // const questions = [{ question: 'underwear?', correct_answer: 0, answers:["yes", "no"]}, { question: 'underwear?', correct_answer: 3, answers:["yes", "no", "hell no", "hell yeah"]}];

  // props.questions => a array of objects, each with a question, an array of answers, and an int corresponding to the correct answer
  return (          
    <div className="row d-flex justify-content-center">
      <h2 className="display-3" style={{color: "#212121"}}>Questions</h2>   

      {
        props.questions && props.questions.map((question, ind) => {
          if(question.answers.length === 2){
            return (<div className="card question mb-3 w-75">
              <div className="card-body">
                <h5 className="card-title mb-0">Question 1</h5>
                <p className="card-text">{question.question}</p>
                <div className="row">
                  <div className="col"> {(question.correct_answer === 0) ? <h6>{question.answers[0]}</h6> : <h6 className="text-muted">{question.answers[0]}</h6>} </div>
                  <div className="col"> {(question.correct_answer === 1) ? <h6>{question.answers[1]}</h6> : <h6 className="text-muted">{question.answers[1]}</h6>} </div>
                </div>
              </div>
            </div>)
          }
          else{
            return (<div className="card question mb-3 w-75">
              <div className="card-body">
                <h5 className="card-title mb-0">Question 1</h5>
                <p className="card-text">{question.question}</p>
                <div className="row">
                  <div className="col"> {(question.correct_answer === 0) ? <h6>{question.answers[0]}</h6> : <h6 className="text-muted">{question.answers[0]}</h6>} </div>
                  <div className="col"> {(question.correct_answer === 1) ? <h6>{question.answers[1]}</h6> : <h6 className="text-muted">{question.answers[1]}</h6>} </div>
                  <div className="col"> {(question.correct_answer === 2) ? <h6>{question.answers[2]}</h6> : <h6 className="text-muted">{question.answers[2]}</h6>} </div>
                  <div className="col"> {(question.correct_answer === 3) ? <h6>{question.answers[3]}</h6> : <h6 className="text-muted">{question.answers[3]}</h6>} </div>
                </div>
              </div>
            </div>)
          }
        })
      }
    </div>
  )
}


function Victory({players, toLobby}) {

  const handleClick = () => {
    toLobby();
  }

  return (
  <div className="coontainer-fluid">

    <div className="row">

      <PlayerSidebar players={players}/>

      <div className="col-10 text-center">

        <h1 className="display-3" style={{color: "#212121"}}><strong>Final Scores</strong></h1>

        <div className="col-xs-12" style={{height: "20px"}}>
            <VictoryPodium maxScore={89} topPlayers={[{"name":"Abe Abbleton", "score":57}, {"name":"Bob Bobbington", "score":89}, {"name":"Bubbles", "score":50}]}/>
          
          
          {/*
          <div className="row">

            <div className="row">

              <div className="col align-self-end">
                <div className="card player">
                  <div className="col-xs-12" style={{height: "30px"}}></div>
                  <h5 className="card-title mb-0">Abe Abbleton</h5>
                  <p className="card-text">57 pts.</p>
                </div>
              </div>

              <div className="col align-self-end">
                <div className="card player">
                  <div className="col-xs-12" style={{height: "100px"}}></div>
                  <h5 className="card-title mb-0">Bob Bobbington</h5>
                  <p className="card-text">89 pts.</p>
                </div>
              </div>

              <div className="col align-self-end">
                <div className="card player">
                  <h5 className="card-title mb-0">Bubbles</h5>
                  <p className="card-text">50 pts.</p>
                </div>
              </div>

            </div>

            <div className = "row">

              <div className="col">
                <h5>2</h5>
              </div>

              <div className="col">
                <h5>1</h5>
              </div>

              <div className="col">
                <h5>3</h5>
              </div>                                         
            </div>
          </div>
          */}


          <br/>

          <button type="submit" className="btn btn-dark text-nowrap w-75"onClick={ handleClick }>Return to Lobby</button>
          <div className="col-xs-12" style={{height: "20px"}}></div> 

          <VictoryQuestions questions = {[{ question: 'underwear?', correct_answer: 0, answers:["yes", "no"]}, { question: 'underwear?', correct_answer: 3, answers:["yes", "no", "hell no", "hell yeah"]}]}/>

        </div>
      </div>
    </div>  
  </div>  
)
}

function VictoryPodium(props){

  console.log()

  return (
    <div className="row">

    <div className="row">
      { props.topPlayers && props.topPlayers.map((player, ind) => {
        return(
          <div className="col align-self-end" key={ind}>
          <div className="card player">
            <div className="col-xs-12" style={{height: Math.round(player.score / props.maxScore * 100)+"px"}}></div>
            <h5 className="card-title mb-0">{player.name}</h5>
            <p className="card-text">{player.score} pts.</p>
          </div>
        </div>
        )})
      }
    </div>

    <div className = "row">

      <div className="col">
        <h5>2</h5>
      </div>

      <div className="col">
        <h5>1</h5>
      </div>

      <div className="col">
        <h5>3</h5>
      </div>                                         
    </div>
  </div>
)

}



export { Landing, Trivia, Lobby, PlayerSidebar, Victory, Question, GameStateHandler, AnswerButton};
