import "./Pages.css";
import axios from "axios";
import { Redirect, useParams } from "react-router-dom";
import React, { useEffect, useState, useRef } from 'react';
import {socket} from "./service/socket";

const BACKEND_URL = "http://localhost:5000"



function Landing() {
  const [userRoomId, setUserRoomId] = useState({userId: undefined, roomId: undefined});
  const [redirectToLobby, setRedirectToLobby] = useState(false);
  const [createButtonEnabled, setCreateButtonEnabled] = useState(true);

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

  async function createAndJoinRoom(){
    // disable the create button while we're loading
    setCreateButtonEnabled(false);
    let createUserResponse = await axios.get(`${BACKEND_URL}/backend/createUser`);
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
          <input type="text" className="form-control text-nowrap" placeholder="Lobby Code" />
            <div className="input-group-btn">
              <button type="submit" className="btn btn-dark text-nowrap form-control" style={{width: "auto"}}>Join</button>
            </div>
          </div>
        </div>
      </div>
      <div className="row text-center">
        <div className="col">
          <button type="submit" enabled = {createButtonEnabled.toString()} className="btn btn-dark text-nowrap" onClick={ createAndJoinRoom }>Create</button>

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

  // handle creating the userId if the person came here by clicking the link
  useEffect(() => {
    if(userId === undefined){
      axios.get(`${BACKEND_URL}/backend/createUser`).then((createUserResponse) => {
        if (createUserResponse.status === 200) {
          setUserId(createUserResponse.data);
        } else {
          alert("wasn't able to create your userId, sorry!");
        }
      });
    }
    // passing an empty array to useEffect makes it run once when the component is mounted
  }, []);


  return (
    <div>
      <div>{roomId}</div>
      {currentPage === "lobby" && <Lobby userId = {userId} roomId = {roomId} />}
      {currentPage === "trivia" && <Trivia userId = {userId} roomId = {roomId} />}
      {currentPage === "victory" && <Victory userId = {userId} roomId = {roomId} />}
    </div>
  )
}

// can use destructuring here to be more explict abt what we pass as props
function Lobby({userId, roomId}) {





  console.log("Lobby")


  const [messages, setMessages] = useState(["Hello And Welcome"]);
  const [message, setMessage] = useState("");
  const socketClientRef = useRef()


  useEffect(() => {

    socket.on("connected", msg => {
      console.log("connected")
      socket.emit("identify", roomId);
    });

    socket.on("update chat", msg => {
      setMessages([...messages, msg]);
    });
    socketClientRef.current = socket
    return () => {
      socket.removeAllListeners()
    }
  }, []);
/*
  useEffect(() => {
    getMessages();
  }, [messages.length]);

  socket.on("connected", msg => {
    console.log("connected")
    socket.emit("identify", roomId);
  });

  const getMessages = () => {
    socket.on("update chat", msg => {
      setMessages([...messages, msg]);
    });
  };*/

  // On Click
  const onClick = () => {
    console.log('click')
    if (message !== "") {
      socket.emit("message", ""+roomId+message);
      setMessage("");
    } else {
      alert("Please Add A Message");
    }
  };





  
  console.log(userId);
  
  return (

    <div className="coontainer-fluid">
      <div className="row">
        <PlayerSidebar />

        <div className="col-10">

          <br/>
          <h1 className="lobby-heading text-center text-middle">Main Lobby</h1>
          <p className="uid text-center" id="uid">1 </p>

          <br/><br/><br/>
          <div className="row">
  
            <div className="col-6 align-items-center justify-content-center">

              <div className="row message_holder" style={{textAlign: "left"}}>

                { messages.length == 0 && <h3 className="message_placeholder">No message yet..</h3> }

                {messages.length > 0 && messages.map(msg => (
                  <div>
                    <p>{msg}</p>
                  </div>
                ))}

              </div>

              <div className="input-group">
                <input type="text" className="text-nowrap form-control message" style={{fontSize: "18px", placeholder:"Message"}} value={message} name="message" onChange={e => setMessage(e.target.value)} />
                <button type="submit" className="btn btn-dark text-nowrap" onClick={() => onClick()}>Send</button>
              </div>

              <br/>
              <div style={{textAlign: "center"}}>
                <button type="submit" className="btn btn-dark text-nowrap w-25" onclick="location.href = '/trivia';">Ready</button>
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
                    <label className="form-check-label" for="flexSwitchCheckDefault">Animals</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" for="flexSwitchCheckChecked">Brain Teasers</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" for="flexSwitchCheckDefault">Celebrities</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" for="flexSwitchCheckChecked">Entertainment</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" for="flexSwitchCheckDefault">For Kids</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" for="flexSwitchCheckChecked">General</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" for="flexSwitchCheckDefault">Geography</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" for="flexSwitchCheckChecked">History</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" for="flexSwitchCheckDefault">Hobbies</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" for="flexSwitchCheckChecked">Humanities</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" for="flexSwitchCheckDefault">Literature</label>
                  </div>

                </div>

                <div className="col">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" for="flexSwitchCheckChecked">Movies</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" for="flexSwitchCheckDefault">Music</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" for="flexSwitchCheckChecked">Newest</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" for="flexSwitchCheckDefault">People</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" for="flexSwitchCheckChecked">Rated</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" for="flexSwitchCheckDefault">Religion/Faith</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" for="flexSwitchCheckChecked">Science/Technology</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" for="flexSwitchCheckDefault">Sports</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" for="flexSwitchCheckChecked">Television</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" for="flexSwitchCheckDefault">Video Games</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label" for="flexSwitchCheckChecked">World</label>
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
          <div className="player card mb-2" key = {ind}>
            <h5 className="card-title mb-0">{player.name}</h5>
            <p className="card-text">{player.score} pts.</p>
          </div>)

        } else {
          return (
          <div className="player card mb-2" key = {ind}>
            <h5 className="card-title mb-0">{player.name}</h5>
          </div>)
        }
      })
    }
  </div>;
}

function Trivia() {
  return (
    <div className="coontainer-fluid">
      <div className="row">
        <PlayerSidebar />
        <Question />
      </div>
    </div>
  )
}

function Question(props) {
  // props.question => string and props.answers => array of string answers
  return (
    <div className="col-10 text-center">
      <br /><br />
      <h1 className="display-3" style={{color: "#212121"}}><strong>Question 1</strong></h1>
      <div className="row">
        <div className="col-8 offset-2">
          <div className="jumbotron">
            <p className="lead" style={{fontSize: "25pt"}}>{props.question}</p>
          </div>
        </div>
      </div>
      <br />
      <div className="row">
        <div className="col"></div>
        {
          // we want two answers in this column and the other two in the other column
          props.answers.slice(0,2).map((answer, index) => {
            return <div className="col-3 same-height" key = {index}>
              <button className="btn btn-primary btn-lg answer w-100 h-100">
                {answer}
              </button>
            </div>
          })
        }

        <div className="col"></div>
      </div>

      <br />
        {
          // we want two answers in this column and the other two in the other column
          props.answers.slice(2).map((answer, index) => {
            if(answer){
              return <div className="row">
                <div className="col"></div>
                  <div className="col-3 same-height" key={index}>
                    <button className="btn btn-primary btn-lg answer w-100 h-100">
                      {answer}
                    </button>
                  </div>
                <div className="col"></div>
              </div>
            }
          })
        }
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


function Victory() {
  return (
  <div className="coontainer-fluid">

    <div className="row">

      <PlayerSidebar/>

      <div className="col-10 text-center">

        <h1 className="display-3" style={{color: "#212121"}}><strong>Final Scores</strong></h1>

        <div className="col-xs-12" style={{height: "20px"}}>

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

          <br/>

          <button type="submit" className="btn btn-dark text-nowrap w-75"onclick="location.href = '/lobby';">Return to Lobby</button>
          <div className="col-xs-12" style={{height: "20px"}}></div> 

          <VictoryQuestions/>

        </div>
      </div>
    </div>  
  </div>  
)
}
export { Landing, Trivia, Lobby, PlayerSidebar, Victory, Question, GameStateHandler };
