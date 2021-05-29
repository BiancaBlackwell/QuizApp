import "./Pages.css";

function Landing() {
  return (
    <div className="container-fluid">
      <div className="row text-center m-3">
        <h1 className="text-nowrap">Quiz App</h1>
      </div>
      <div className="row align-items-center justify-content-center m-3">
        <div className="col-2">
          <div className="input-group">
            <input type="text" className="form-control text-nowrap" placeholder="Lobby Code" />
            <button type="submit" className="btn btn-dark text-nowrap">Join</button>
          </div>
        </div>
      </div>
      <div className="row text-center">
        <div className="col">
          <button type="submit" className="btn btn-dark text-nowrap" onclick="location.href = '/lobby';">Create</button>
        </div>
      </div>
    </div>
    )
}

function Lobby() {
  return (

    <div className="coontainer-fluid">
      <div className="row" style={{margin: "0px"}}>
        <div className="col-2 sidebar text-center" style={{height: "100vh"}}>
          <br />

          <h3 style={{color:"#e8f9fc"}}>Players</h3>

          <div className="player card mb-2">
            <h5 className="card-title mb-0">Abe Abbleton</h5>
          </div>

          <div className="player card mb-2">
            <h5 className="card-title mb-0">Bob Bobbington</h5>
          </div>

          <div className="player card mb-2">
            <h5 className="card-title mb-0">Carl Carlton</h5>
          </div>

        </div>


        <div className="col-9">

          <br />

          <h1 className="text-center text-middle">Main Lobby</h1>
          <p className="uid text-center" id="uid">1 </p>

          <br /><br /><br />

          <div className="row">

            <div className="col-6 message_holder" style={{textAlign: "left"}}>
              <h3 className="message_placeholder">No message yet..</h3>
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

          <div className="row">
            <div className="col-6 p-0" style={{padding: "0px", marginLeft: "15px"}}>
              <div className="input-group">
                <input type="text" className="text-nowrap form-control message" style={{fontSize: "18px", placeholder:"Message"}} />
                <button type="submit" className="btn btn-dark text-nowrap" onclick="sendMessage()">Send</button>
              </div>
            </div>
          </div>
          <br />
          <div className="col-1 offset-3">
            <button type="submit" className="btn btn-dark text-nowrap w-100" onclick="location.href = '/trivia';">Ready</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Trivia() {
  return (
    <div className="coontainer-fluid">
      <div className="row">
        <div className="col-2 text-center" style={{height: "100vh"}}>
          <br />
          <h3 style={{color:"#e8f9fc"}}>Players</h3>

          <div className="card player mb-2">
            <h5 className="card-title mb-0">Abe Abbleton</h5>
            <p className="card-text">57 pts.</p>
          </div>

          <div className="card player mb-2">
            <h5 className="card-title mb-0">Bob Bobbington</h5>
            <p className="card-text">89 pts.</p>
          </div>

          <div className="card player mb-2">
            <h5 className="card-title mb-0">Carl Carlton</h5>
            <p className="card-text">4 pts.</p>
          </div>

        </div>
        <div className="col-10 text-center">
          <br /><br />
          <h1 className="display-3" style={{color: "#212121"}}><strong>Question 1</strong></h1>
          <div className="row">
            <div className="col-8 offset-2">
              <div className="jumbotron">
                <p className="lead" style={{fontSize: "25pt"}}>Russian people often referred to Grigori Rasputin as which of the following?</p>
              </div>
            </div>
          </div>
          <br />
          <div className="row">
            <div className="col"></div>

            <div className="col-3 same-height">
              <button className="btn btn-primary btn-lg answer w-100 h-100">
                Saintly mystic
                  </button>
            </div>

            <div className="col-3 offset-1 same-height">
              <button className="btn btn-primary btn-lg answer w-100 h-100">
                All of these
                  </button>
            </div>

            <div className="col"></div>
          </div>

          <br />

          <div className="row">
            <div className="col"></div>

            <div className="col-3 same-height">
              <button className="btn btn-primary btn-lg answer w-100 h-100">
                Prophet
                    </button>
            </div>

            <div className="col-3 offset-1 same-height">
              <button className="btn btn-primary btn-lg answer w-100 h-100">
                Religious pilgrim
                    </button>
            </div>

            <div className="col"></div>
          </div>

        </div>
      </div>
    </div>
  )
}
export { Landing, Trivia, Lobby };