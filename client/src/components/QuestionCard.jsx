const QuestionCard = ({ question, handleAnswer, currentOption }) => {
  console.log("Rendering QuestionCard with:", { question, currentOption });

  const getButtonClasses = (index) =>
    `${
      index === currentOption
        ? "bg-gradient-to-r from-green-500 to-green-600"
        : "bg-gradient-to-r from-blue-500 to-indigo-500"
    } text-white font-semibold py-3 px-5 rounded-lg 
       hover:from-blue-600 hover:to-indigo-600 
       focus:ring-4 focus:ring-blue-300 
       transition-transform transform hover:scale-105 focus:outline-none`;

  return (
    <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {question.question}
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index)}
            className={getButtonClasses(index)}
            aria-label={`Option ${index + 1}: ${option}`}
            autoFocus={index === currentOption}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;
