import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

import Input from "./Input";

export const CRUD = () => {
  const [formData, setFormData] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [crudData, setCrudData] = useState([]);

  const socketRef = useRef(null);

  const handleInput = (event) => {
    let { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    socketRef.current.emit("formData", formData);

    setFormData({
      name: "",
      age: "",
      phone: "",
    });
  };

  const handleEdit = () => {
    socketRef.current.emit("editData", formData);

    setIsEdit(false);
    setFormData({
      name: "",
      age: "",
      phone: "",
    });
  };

  const handleDelete = (data) => {
    socketRef.current.emit("deleteData", data);
  };

  useEffect(() => {
    socketRef.current = io("http://localhost:8080");

    socketRef.current.on("connect", () => {
      console.log("Connected:", socketRef.current.id);
    });

    socketRef.current.on("formData", (data) => {
      setCrudData(data);
    });

    return () => {
      socketRef.current.off("formData");
      socketRef.current.disconnect();
    };
  }, []);

  return (
    <div className="container">
      <h1>CRUD Operation</h1>

      <div className="form-fields">
        <Input name="name" placeholder="Enter your name" value={formData.name ?? ""} handleInput={handleInput} />
        <Input name="age" placeholder="Enter your age" value={formData.age ?? ""} handleInput={handleInput} />
        <Input name="phone" placeholder="Enter your phone" value={formData.phone ?? ""} handleInput={handleInput} />

        <button className="send-score" onClick={isEdit ? handleEdit : handleSubmit}>
          {isEdit ? "Edit" : "Add"} Data
        </button>
      </div>

      {crudData.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Phone</th>
              <th></th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {crudData?.map((data) => (
              <tr key={data.id}>
                <td>{data.name}</td>
                <td>{data.age}</td>
                <td>{data.phone}</td>
                <td>
                  <button
                    onClick={() => {
                      setFormData(data);
                      setIsEdit(true);
                    }}
                  >
                    Edit
                  </button>
                </td>
                <td>
                  <button onClick={() => handleDelete(data)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
