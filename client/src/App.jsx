import React from "react";
import { useEffect } from "react";
import GameOver from "./components/GameOver";
import QuestionCard from "./components/QuestionCard";
import Score from "./components/Score";
import useGame from "./hooks/useGame";

const Loading = () => (
  <p className="text-white text-xl font-semibold">Loading questions...</p>
);

const App = () => {
  const {
    questions,
    currentQuestion,
    currentOption,
    score,
    gameOver,
    correctAnswers,
    handleAnswer,
    restartGame,
  } = useGame();

  const isLoading = questions.length === 0 && !gameOver;

  useEffect(() => {
    console.log("App state updated:", {
      currentQuestion,
      currentOption,
      score,
      gameOver,
    });
  }, [currentQuestion, currentOption, score, gameOver]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex flex-col items-center justify-center text-center p-5">
      <h1 className="text-4xl font-extrabold text-white mb-8 drop-shadow-lg">
        Questions Game
      </h1>
      {isLoading ? (
        <Loading />
      ) : (
        <React.Fragment>
          {gameOver ? (
            <GameOver
              score={score}
              correctAnswers={correctAnswers}
              restartGame={restartGame}
            />
          ) : (
            <>
              <Score score={score} total={questions.length} />
              <QuestionCard
                question={questions[currentQuestion]}
                handleAnswer={handleAnswer}
                currentOption={currentOption}
              />
            </>
          )}
        </React.Fragment>
      )}
    </div>
  );
};

export default App;
