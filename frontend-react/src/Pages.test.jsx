import { render, screen } from '@testing-library/react';
import App from './App';
import { PlayerSidebar, Question } from "./Pages";

test('PlayerSidebar with no score', async () => {
  render(<PlayerSidebar players = {
    [{name:"john"}, {name:"cameron"}, {name:"austin"},{name:"bianca"},{name:"will"},{name:"jess"}]
  }/>);
  const playerElements = await screen.findAllByText(/(cameron)|(john)|(austin)|(bianca)|(will)|(jess)/)
  expect(playerElements.length).toBe(6);

  playerElements.forEach((element) => {
    expect(element).toBeInTheDocument();
  })
});

test('PlayerSidebar with score', async () => {
  render(<PlayerSidebar players = {
    [{name:"john", score: 69}, {name:"cameron", score: 69}, {name:"austin", score: 69},{name:"bianca", score: 69},{name:"will", score: 69},{name:"jess", score: 69}]
  }/>);
  const playerElements = await screen.findAllByText(/[0-9]+ pts./)
  expect(playerElements.length).toBe(6);

  playerElements.forEach((element) => {
    expect(element).toBeInTheDocument();
  })
});


test("Question", async () => {
  render(<Question question = "underwear?" answers = {["1", "2", "3", "4"]}/>)
  // screen.debug();

  const questionElement = await screen.findByText("underwear?");
  expect(questionElement).toBeInTheDocument();

  const answerElements = await screen.findAllByText(/^[0-9]$/);
  expect(answerElements.length).toBe(4);
})