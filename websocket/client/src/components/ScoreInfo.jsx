import { useEffect, useState } from "react";
import io from "socket.io-client";
import Input from "./Input";

export const ScoreInfo = () => {
  const [info, setInfo] = useState({});
  const [scoresList, setScoresList] = useState([]);

  const socket = io("localhost:8080");

  const handleInput = (event) => {
    let { name, value } = event.target;
    setInfo((prev) => ({ ...prev, [name]: value }));
  };

  const sendInfo = () => {
    socket.emit("score", info);

    socket.on("scores", (data) => {
      setScoresList(data);
    });
  };

  function connectSocket() {
    socket.on("connection", (socket) => {
      console.log(socket);
    });
  }

  useEffect(() => {
    connectSocket();
  }, []);

  return (
    <div className="container">
      <h1>React multiplayer dashboard</h1>

      <div className="form-fields">
        <Input name="name" placeholder="Enter your name" value={info.name ?? ""} handleInput={handleInput} />
        <Input name="score" placeholder="Enter your score" value={info.score ?? ""} handleInput={handleInput} />
        <button className="send-score" onClick={sendInfo}>
          Publish Button
        </button>
      </div>

      {scoresList.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Score</th>
            </tr>
          </thead>

          <tbody>
            {scoresList?.map((ele) => (
              <tr key={ele.id}>
                <td>{ele.name}</td>
                <td>{ele.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
