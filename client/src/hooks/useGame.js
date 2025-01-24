import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const useGame = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentOption, setCurrentOption] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState([]);

  const [forceUpdate, setForceUpdate] = useState(false);

  // Refs para estados actuales
  const currentOptionRef = useRef(currentOption);
  const currentQuestionRef = useRef(currentQuestion);

  useEffect(() => {
    currentOptionRef.current = currentOption;
  }, [currentOption]);

  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
  }, [currentQuestion]);

  const restartGame = () => {
    setQuestions([]);
    setCurrentQuestion(0);
    setCurrentOption(0);
    setScore(0);
    setGameOver(false);
    setCorrectAnswers([]);
  };

  // Handle answer selection
  const handleAnswer = useCallback(
    (selectedOption) => {
      if (selectedOption === questions[currentQuestionRef.current].correct) {
        setScore((prevScore) => prevScore + 1);
        setCorrectAnswers((prevAnswers) => [
          ...prevAnswers,
          questions[currentQuestionRef.current].correct,
        ]);
      }

      const nextQuestion = currentQuestionRef.current + 1;
      if (nextQuestion < questions.length) {
        setCurrentQuestion(nextQuestion);
        setCurrentOption(0); // Reset to the first option for the next question
      } else {
        setGameOver(true);
      }
    },
    [questions]
  );

  // Handle button press event from WebSocket message
  const handleButtonPress = useCallback(
    (buttonState) => {
      if (questions.length === 0 || gameOver) return;

      console.log("Raw Button state received:", buttonState);

      // Normalizar el valor de buttonState si es un objeto o string con formato diferente
      let normalizedState = buttonState.trim().toLowerCase();

      // Match the button state to a simpler format
      if (normalizedState.includes("up")) {
        normalizedState = "ArrowUp";
      } else if (normalizedState.includes("down")) {
        normalizedState = "ArrowDown";
      } else if (normalizedState.includes("x") || normalizedState.includes("pressed")) {
        normalizedState = "Enter";
      }

      console.log("Normalized Button state:", normalizedState);

      // setForceUpdate((prev) => !prev);

      switch (normalizedState) {
        case "ArrowUp":
          setCurrentOption((prevOption) => {
            const newOption = prevOption > 0 ? prevOption - 1 : prevOption;
            console.log("Updated currentOption (ArrowUp):", newOption);
            return newOption;
          });
          break;
        case "ArrowDown":
          setCurrentOption((prevOption) => {
            const newOption =
              prevOption <
              questions[currentQuestionRef.current].options.length - 1
                ? prevOption + 1
                : prevOption;
            console.log("Updated currentOption (ArrowDown):", newOption);
            return newOption;
          });
          break;
        case "Enter":
          console.log("Selecting answer:", currentOptionRef.current);
          handleAnswer(currentOptionRef.current);
          break;
        default:
          console.log("Unhandled button state:", buttonState);
          break;
      }
    },
    [questions, gameOver, handleAnswer]
  );

  // Set up WebSocket connection
  useEffect(() => {
    const socket = io(
      "wss://automatic-chainsaw-x4gq7qxq7vwh67xx-3001.app.github.dev/"
    );

    socket.on("connect", () => {
      console.log("WebSocket connected!");
    });

    socket.on("buttonState", (buttonState) => {
      console.log("Button received from WebSocket:", buttonState);
      handleButtonPress(buttonState);
    });

    socket.on("disconnect", () => {
      console.log("WebSocket disconnected.");
    });

    return () => {
      socket.disconnect();
    };
  }, [handleButtonPress]);

  // Fetch questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get("/api/questions");
        setQuestions(response.data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, []);

  return {
    questions,
    currentQuestion,
    currentOption,
    score,
    gameOver,
    correctAnswers,
    handleAnswer,
    restartGame,
  };
};

export default useGame;
