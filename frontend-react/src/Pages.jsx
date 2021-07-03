import "./Pages.css";
import axios from "axios";
import { Redirect, useParams } from "react-router-dom";
import React, { useEffect, useState, useRef } from 'react';
import {Tabs, Tab, ButtonGroup, Button, InputGroup, ButtonToolbar, DropdownButton, Dropdown, Row, Form, Col, FormControl, Accordion, Card} from 'react-bootstrap'
import socket from "./socket";

const BACKEND_URL = "http://localhost:5000"





function Landing() {

  const [userRoomId, setUserRoomId] = useState({userid: undefined, roomid: undefined});
  const [redirectToLobby, setRedirectToLobby] = useState(false);
  const [buttonEnabled, setButtonEnabled] = useState(true);
  const [lobbyCode, setlobbyCode] = useState("");


  // this effect gets run whenever userRoomId gets updated (because it's in the array we provide as an argument) -- in this case, after we get it from the backend in createAndJoinRoom
  useEffect(() => {
    // make sure they're both set
    if(userRoomId.userid && userRoomId.roomid){
      axios.get(`${BACKEND_URL}/backend/joinRoom/${userRoomId.userid}=${userRoomId.roomid}`).then((res) => {
        // useEffect functions can't be async so we're using .then 
        setRedirectToLobby(true);
      }, (err) => {
        alert("Failed to join lobby, sorry!");
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
    setUserRoomId({roomid: lobbyCode, userid: createUserResponse.data});
  };

  async function createAndJoinRoom(){
    // disable the create button while we're loading
    setButtonEnabled(false);
    console.log('Creating User');
    let createUserResponse = await axios.get(`${BACKEND_URL}/backend/createUser`);
    console.log('Creating Room');
    let createRoomResponse = await axios.get(`${BACKEND_URL}/backend/createRoom`);

    console.log({roomid: createRoomResponse.data, userid: createUserResponse.data})
    // all we need to do here is set the state, the effect handles the join and redirect
    setUserRoomId({roomid: createRoomResponse.data, userid: createUserResponse.data});
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
                pathname:`/game/${userRoomId.roomid}`, 
                state: { roomid: userRoomId.roomid, userid: userRoomId.userid } // this is accessed with props.location.state.userid in the lobby component. fine to pass as a prop b/c it won't change
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
              pathname:`/game/${userRoomId.roomid}`, 
              state: { roomid: userRoomId.roomid, userid: userRoomId.userid } // this is accessed with props.location.state.userid in the lobby component. fine to pass as a prop b/c it won't change
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

  // track what part of the game UI we want to display
  // this should be either lobby, game, or victory
  const [currentPage, setCurrentPage] = useState("lobby");
  const [messages, setMessages] = useState([]);
  const [players, setPlayers] = useState([]);
  const [amHost, setAmHost] = useState(false);
  const [canStart, setCanStart] = useState(false);
  const [question, setQuestion] = useState({});
  const [victoryStats, setVictoryStats] = useState([]);
  const [gameSettings, setGameSettings] = useState([]);

  const [roomid, setRoomId] = useState(() => {
    // function args to useState are run once to get the intial value
    if(props.location.state){
      // this will be the userid that gets passed from the redirect of the Lobby component
      return props.location.state.roomid;
    } else{
      return undefined;
    }
  });

  // since anyone can click this link we cannot rely on the userid prop being filled here
  const [userid, setUserId] = useState(() => {
    // function args to useState are run once to get the intial value
    if(props.location.state){
      // this will be the userid that gets passed from the redirect of the Lobby component
      return props.location.state.userid;
    } else{
      return undefined;
    }
  });

  // handle creating the userid if the person came here by clicking the link
  useEffect(() => {

    if(userid === undefined){
      axios.get(`${BACKEND_URL}/backend/createUser`).then((createUserResponse) => {
        if (createUserResponse.status !== 200) {
          alert("Wasn't able to create your userid, sorry!");
          return;
        }

        setUserId(createUserResponse.data);
      });
    }

    //-------------------------------------LOBBY HOOKS-------------------------------------
    socket.on("message", msg => {
      console.log('Recieved message: [' + msg.message + '] from ' + msg.userid);
      let allMessages = messages;
      allMessages.push(msg);
      setMessages([...allMessages]);
    });

    socket.on("updatePlayers", players => {
      console.log('Updating Players', players);
      setPlayers(players);
    });

    socket.on("yesStart", () => {
      console.log("Host can now start the game!");
      setCanStart(true);
    });

    socket.on("noStart", () => {
      console.log("Not enough players ready to start the game!");
      setCanStart(false);
    });

    socket.on("newHost", newHost => {
      console.log("New Host is " + newHost.userid);
      if(userid === newHost.userid)
        setAmHost(true);
    });

    socket.on("trivia", firstquestion => {
      console.log("Everyone is ready! Now starting the Trivia!", firstquestion);
      setQuestion(firstquestion);
      setCurrentPage("trivia");
    });

    socket.on("displayNextQuestion", nextquestion =>{
      console.log("Displaying the Next Question", nextquestion);
      setQuestion(nextquestion);
    });

    socket.on("outOfQuestions", victoryStats =>{
      console.log("End of Round! Displaying Victory Page!", victoryStats);
      setVictoryStats(victoryStats);
      setCurrentPage("victory");
    });

    socket.on("updateSettings", gameSettings => {
      console.log("Updating the settings!", gameSettings);
      setGameSettings(gameSettings);
    });


    socket.emit("identify", {"roomid": roomid, "userid":userid});
    // passing an empty array to useEffect makes it run once when the component is mounted
    }, []);

    
/*
******************************
ATTEMPTED DISSCONNECT STUFF
*******************************
ONLY WANTS TO TRIGGER SOMETIMES


  // this also doesn't work
  const onDisconnect = (e) => {

    //=======always triggers if used
    e.preventDefault();
    e.returnValue = ""
    //=======

    console.log("Disconnecting User");
    socket.emit("sendMessage", {'message':'Did it work??', "userid":userid, "roomid":roomid});
    //socket.emit("disconnectUser", {"roomid":roomid, "userid":userid});
    //socket.removeAllListeners();
    //socket.disconnect();
  }


  useEffect(() => {
    // this also doesn't work
    window.addEventListener('beforeunload', onDisconnect);
   return () => {
      window.removeEventListener('beforeunload', onDisconnect);
    }
  }, [onDisconnect]);
*/

  const toLobby = () => {
    console.log('Going back to Lobby!');
    socket.emit("clearScores", {"roomid": roomid});
    setCurrentPage('lobby');
  };

  return (
    <div>
      {currentPage === "lobby" && <Lobby  roomid = {roomid} userid = {userid} messages={messages} players={players} gameSettings={gameSettings} amHost={amHost} canStart={canStart} />}
      {currentPage === "trivia" && <Trivia roomid = {roomid} userid = {userid} players={players} question= { question }/>}
      {currentPage === "victory" && <Victory roomid = {roomid} userid = {userid} players={players} toLobby={toLobby} victoryStats={victoryStats}/>}
    </div>
  )
}





// can use destructuring here to be more explict abt what we pass as props
function Lobby({userid, roomid, messages, players, gameSettings, amHost, canStart}) {

  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);
  const [colors, setColor] = useState({"backgroundColor":"#464866"});
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages]);

  // On Change
  const onChange = e => {
    setMessage(e.target.value);
  };

  // On Click
  const onClick = () => {
    if (message === "") {
      return;
    }
    console.log('Sending message: [' + message + '] to room ' + roomid);
    socket.emit("sendMessage", {"roomid":roomid, "userid":userid, "message":message});
    setMessage("");
  };

  const toggleReady = () => {
    if(!amHost || (amHost && canStart)){
      let toggle = !ready;
      console.log('Toggling ready state to: ' + toggle);
      socket.emit(toggle?"readyUser":"unreadyUser", {"roomid":roomid, "userid":userid, "message":message});
      setColor(toggle?{"backgroundColor":"#25274d"}:{"backgroundColor":"#464866"});
      setReady(toggle);
    }
  };

  const checkEnter = (event) => {
    if (event.key === 'Enter') {
      onClick();
    }
  };

  return (
    <div className="coontainer-fluid">
      <div className="row">

        <PlayerSidebar players={players}/>

        <div className="col-10">
          <br/>
          <h1 className="lobby-heading text-center text-middle">Main Lobby</h1>
          <p className="uid text-center" id="uid">{amHost ? "★★★"+userid+"★★★" : userid} </p>
          <br/><br/><br/>

          <div className="row">
            <div className="col-6">
              <div className="row message_holder" style={{textAlign: "left"}}>
                <div>
                  { messages.length === 0 && <h3 className="message_placeholder">No message yet..</h3> }

                  {messages.length > 0 && messages.map( (msg, ind) => {
                      return (
                        <div key={ind}>
                          {msg.userid === "server"?<div><b>{msg.message}</b></div>:<div>{msg.userid}: {msg.message}</div>}
                        </div>
                      )
                    })
                  }
                  <div ref={messagesEndRef} />
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

            < GameSettings gameSettings={ gameSettings }/>   

          </div>
        </div>
      </div>
    </div>
  )
}





function GameSettings({gameSettings}) {

  const [curTime, setCurTime] = useState("10s");
  const [curNumQuestions, setCurNumQuestions] = useState("15");


  const selectGamemode = choice => {
    console.log('Submitting Gamemode: '+ choice);
  };

  const tmap = ["15s", "30s", "60s", "∞"];
  const handleTime=(e)=>{
    console.log('Changing Time Control to: ' + tmap[e]);
    setCurTime(tmap[e]);
  }

  const qmap = ["10", "15", "20", "∞"];
  const handleQuestions=(e)=>{
    console.log('Changing the Number of Questions to: ' + qmap[e]);
    setCurNumQuestions(qmap[e]);
  }


  const catagories = [{name: "Arts and Lit.", catagories:[]}, {name: "Arts and Lit.", catagories:[]}, {name: "Arts and Lit.", catagories:[]}, {name: "Arts and Lit.", catagories:[]}];

  return (
    <Col md={5}>
      <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example" className="tabs">

        <Tab eventKey="home" title="Quick Play" tabClassName="profile-tabitem">
          <Row className="mt-1">
            <GamemodeButton text="Classic" code={0} onClick={ selectGamemode }/>
            <GamemodeButton text="Speed Round" code={1} onClick={ selectGamemode }/>
            <GamemodeButton text="Endless" code={2} onClick={ selectGamemode }/>
          </Row>
       </Tab>

        <Tab eventKey="profile" title="Advanced" tabClassName="profile-tabitem">
          <Row >
            <Col className="mt-3">
              <InputGroup className="justify-content-center">
                <InputGroup.Prepend>
                  <InputGroup.Text id="btnGroupAddon" style={{backgroundColor: "#85c3cf", border: "#25274d", color:"#212121"}}>Time per Question</InputGroup.Text>
                </InputGroup.Prepend>
                <DropdownButton as={ButtonGroup} title={ curTime } id="bg-nested-dropdown" onSelect={ handleTime }>
                  <Dropdown.Item eventKey="0">15s</Dropdown.Item>
                  <Dropdown.Item eventKey="1">30s</Dropdown.Item>
                  <Dropdown.Item eventKey="2">60s</Dropdown.Item>
                  <Dropdown.Item eventKey="3">∞</Dropdown.Item>
                </DropdownButton>
              </InputGroup>
            </Col>
            <Col className="mt-3">
              <InputGroup className="justify-content-center">
                <InputGroup.Prepend>
                  <InputGroup.Text id="btnGroupAddon" style={{backgroundColor: "#85c3cf", border: "#25274d", color:"#212121"}}># of Questions</InputGroup.Text>
                </InputGroup.Prepend>
                <DropdownButton as={ButtonGroup} title={ curNumQuestions } id="bg-nested-dropdown" onSelect={ handleQuestions }>
                  <Dropdown.Item eventKey="0">10</Dropdown.Item>
                  <Dropdown.Item eventKey="1">15</Dropdown.Item>
                  <Dropdown.Item eventKey="2">20</Dropdown.Item>
                  <Dropdown.Item eventKey="3">∞</Dropdown.Item>
                </DropdownButton>
              </InputGroup>
            </Col>
          </Row>
          
          <Row className="mt-3">

            <Col>
            <Accordion defaultActiveKey="0">

              <Card className="catCard">
                <Accordion.Toggle as={Card.Header} eventKey="0" className="catHead">
                  <Form.Check type="checkbox" label="Arts and Lit." />
                </Accordion.Toggle>
                <Accordion.Collapse eventKey="0">
                  <Card.Body className="catBody">
                  <Form.Group controlId="formBasicCheckbox">
                    <Form.Check type="checkbox" label="History" />
                    <Form.Check type="checkbox" label="Humanities" />
                    <Form.Check type="checkbox" label="Literature" />
                    <Form.Check type="checkbox" label="Religion/Faith" />
                  </Form.Group>
                  </Card.Body>
                </Accordion.Collapse>
              </Card>

              <Card className="catCard">
                <Accordion.Toggle as={Card.Header} eventKey="1" className="catHead">
                  <Form.Check type="checkbox" label="Sports and Leisure"/>
                </Accordion.Toggle>
                <Accordion.Collapse eventKey="1">
                  <Card.Body className="catBody">
                    <Form.Group controlId="formBasicCheckbox">
                      <Form.Check type="checkbox" label="Hobbies" />
                      <Form.Check type="checkbox" label="Sports" />
                      <Form.Check type="checkbox" label="Science and Technology" />
                     <Form.Check type="checkbox" label="Video Games" />
                    </Form.Group>
                  </Card.Body>
                </Accordion.Collapse>
              </Card>

              <Card className="catCard">
                <Accordion.Toggle as={Card.Header} eventKey="2" className="catHead">
                  <Form.Check type="checkbox" label="Pop Culture"/>
                </Accordion.Toggle>
                <Accordion.Collapse eventKey="2">
                  <Card.Body className="catBody">
                    <Form.Group controlId="formBasicCheckbox">
                      <Form.Check type="checkbox" label="Celebrities" />
                      <Form.Check type="checkbox" label="Entertainment" />
                      <Form.Check type="checkbox" label="People" />
                    </Form.Group>
                  </Card.Body>
                </Accordion.Collapse>
              </Card>

              <Card className="catCard">
                <Accordion.Toggle as={Card.Header} eventKey="3" className="catHead">
                  <Form.Check type="checkbox" label="Media"/>
                </Accordion.Toggle>
                <Accordion.Collapse eventKey="3">
                  <Card.Body className="catBody">
                    <Form.Group controlId="formBasicCheckbox">
                      <Form.Check type="checkbox" label="Movies" />
                      <Form.Check type="checkbox" label="Music" />
                      <Form.Check type="checkbox" label="Television" />
                    </Form.Group>
                  </Card.Body>
                </Accordion.Collapse>
              </Card>

              <Card className="catCard">
                <Accordion.Toggle as={Card.Header} eventKey="4" className="catHead">
                  <Form.Check type="checkbox" label="Culture"/>
                </Accordion.Toggle>
                <Accordion.Collapse eventKey="4">
                  <Card.Body className="catBody">
                    <Form.Group controlId="formBasicCheckbox">
                      <Form.Check type="checkbox" label="Animals" />
                      <Form.Check type="checkbox" label="Geography" />
                      <Form.Check type="checkbox" label="World" />
                    </Form.Group>
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
            
              <Card className="catCard">
                <Accordion.Toggle as={Card.Header} eventKey="5" className="catHead">
                  <Form.Check type="checkbox" label="Misc"/>
                </Accordion.Toggle>
                <Accordion.Collapse eventKey="5">
                  <Card.Body className="catBody">
                    <Form.Group controlId="formBasicCheckbox">
                      <Form.Check type="checkbox" label="Brain Teasers" />
                      <Form.Check type="checkbox" label="For Kids" />
                      <Form.Check type="checkbox" label="General" />
                      <Form.Check type="checkbox" label="Newest" />
                      <Form.Check type="checkbox" label="Rated" />
                   </Form.Group>
                  </Card.Body>
                </Accordion.Collapse>
              </Card>

            </Accordion>
            </Col>

          </Row>
        </Tab>
      </Tabs>
    </Col>
  )
}





function GamemodeButton(props){

  const handleClick = () => {
    props.onClick( props.code );
  }

  return (
    <Button variant="dark" className="mt-2" onClick={ handleClick }>{props.text}</Button>
  )
}




function PlayerSidebar(props) {
  // let's have props.players be a array of objects, each with a name and optionally a score

  return <div className="col-2 sidebar text-center" style={{ height: "100vh" }}>
    <br />

    <h3 style={{ color: "#e8f9fc" }}>Players</h3>
    { props.players && props.players.map((player, ind) => {
        // we want this component to be able to be used on both the lobby and game screen
        // so we should not expect it to always have a score
        if(player.score >= 0){
          return (
          <div className="player card mb-2" key = {ind} style={{backgroundColor: player.backgroundColor }}>
            <h5 className="card-title mb-0">{player.name}</h5>
            <p className="card-text">{player.score} pts.</p>
          </div>)
        } else {
          return (
          <div className="player card mb-2" key = {ind} style={{backgroundColor: player.backgroundColor }}>
            <h5 className="card-title mb-0">{player.name}</h5>
          </div>)
        }
      })
    }
  </div>;
}





function Trivia({userid, roomid, players, question}) {
  return (
    <div className="coontainer-fluid">
      <div className="row">
        <PlayerSidebar  players={players}/>
        <Question userid={userid} roomid={roomid} question={question}/>
      </div>
    </div>
  )
}





function Question(props) {
  // props.question.name => string and props.question.answers => array of string answers

  const submitAnswer = choice => {
    console.log('Submitting Answer: '+choice);
    socket.emit("submitAnswer", {"roomid":props.roomid, "userid":props.userid, "answer":choice});
  };

  return (
    <div className="col-10 text-center">
      <br /><br />
      <h1 className="display-3" style={{color: "#212121"}}><strong>Question { props.question.number }</strong></h1>
      <div className="row">
        <div className="col-8 offset-2">
          <div className="jumbotron">
            <p className="lead" style={{fontSize: "25pt"}}> { props.question.question } </p>
          </div>
        </div>
      </div>
      <br />

      <div className="row">
        <div className="col"></div>
          { // we want two answers in this column and the other two in the other column
            props.question.answers.slice(0,2).map((answer, index) => {
              return <AnswerButton key={index} answer={answer} submitAnswer={submitAnswer} row={0} col={index}/>
            })
          }
        <div className="col"></div>
      </div>
      <br />
      <div className="row">
        <div className="col"></div>
          { // we want two answers in this column and the other two in the other column
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
  const handleClick = (e) => {
    e.currentTarget.blur();
    props.submitAnswer( map[props.row][props.col] );
  }

  return (
    <div className="col-3 same-height">
      <button className="btn btn-primary btn-lg answer w-100 h-100" onClick={(e) => handleClick(e) }> 
        { props.answer }
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
          return (
            <div className="card question mb-3 w-75" key={ind}>
              <div className="card-body">
                <h5 className="card-title mb-0">Question {question.number}</h5>
                <p className="card-text">{question.question}</p>
                <div className="row">
                  {
                    question.answers && question.answers.map((answer, ind) => {
                      return ( <div className="col" key={ind}> {(question.correct_answer === ind) ? <h6>{answer}</h6> : <h6 className="text-muted">{answer}</h6>} </div> )
                    })
                  }
                </div>
              </div>
            </div>
          )
        })
      }
    </div>
  )
}





function Victory({players, toLobby, victoryStats}) {

  const handleClick = () => {
    toLobby();
  }

  return (
    <div className="coontainer-fluid">
      <div className="row">

        <PlayerSidebar players={players}/>

        <div className="col-10 text-center"><br/>
          <h1 className="display-3" style={{color: "#212121"}}><strong>Final Scores</strong></h1>
          <div className="col-xs-12" style={{height: "20px"}}><br/>

            <VictoryPodium podium={ victoryStats.podium }/>
            
            <br/>
            <button type="submit" className="btn btn-dark text-nowrap w-75"onClick={ handleClick }>Return to Lobby</button>
            <div className="col-xs-12" style={{height: "20px"}}></div> 

            <VictoryQuestions questions = {victoryStats.questions}/>

          </div>
        </div>
      </div>  
    </div>  
  )
}





function VictoryPodium({podium}){
  return (
    <div className="row">
      <div className="row">
        { podium.topPlayers && podium.topPlayers.map((player, ind) => {
          return(
            <div div className={podium.topPlayers.length === 1?"row align-self-end":"col align-self-end"} key={ind}>
              {podium.topPlayers.length === 1 && <div className="col"></div>}
              <div className="col">
                <div className="card player">
                  <div className="col-xs-12" style={{ height: player.height+"px" }}></div>
                  <h5 className="card-title mb-0">{player.name}</h5>
                  <p className="card-text">{player.score} pts.</p>
                </div>
                <div className="col">
                  <h5>{ind+1}</h5>
                </div>
              </div>
              {podium.topPlayers.length === 1 && <div className="col"></div>}
            </div>
          )})
        }
      </div>
    </div>
  )
}


export { Landing, Trivia, Lobby, PlayerSidebar, Victory, Question, GameStateHandler, AnswerButton};