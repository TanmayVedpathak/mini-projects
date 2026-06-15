import type { SquareValue } from "../type";

interface SquareProps {
  value: SquareValue;
  winner: SquareValue | "Both";
  onClick: () => void;
}

const Square = ({ value, winner, onClick }: SquareProps) => {
  if (value) {
    return (
      <button style={{ border: "1px solid green", fontSize: "30px", textAlign: "center", color: value === "X" ? "red" : "blue" }} onClick={onClick} disabled>
        {value || ""}
      </button>
    );
  }

  return (
    <button style={{ border: "1px solid red", fontSize: "30px", textAlign: "center" }} onClick={onClick} disabled={Boolean(winner)}>
      {value || ""}
    </button>
  );
};

export default Square;
