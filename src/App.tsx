import { useEffect, useRef, useState } from "react";
import "./App.css";

type PayloadType = {
  room: string;
  [k: string]: string;
};

type MessageType = {
  type: string;
  payload: PayloadType;
};

function App() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [room, setRoom] = useState<string | null>(null);
  const [myMessages, setMyMessages] = useState<string[]>([]);
  const [personMessages, setPersonMessages] = useState<string[]>([]);
  const messageRef = useRef<HTMLInputElement | null>(null);
  const roomRef = useRef<HTMLInputElement | null>(null);

  const joinRoom = () => {
    if (!roomRef?.current?.value) {
      return;
    }
    setRoom(roomRef?.current?.value);
  };

  const sendMessage = () => {
    if (!socket) {
      return;
    }
    if (messageRef.current?.value && room) {
      const ms: MessageType = {
        type: "chat",
        payload: {
          room: room,
          message: messageRef.current.value,
        },
      };

      socket?.send(JSON.stringify(ms));
      setMyMessages((prev) => [...prev, messageRef.current!.value]);
    }
  };

  useEffect(() => {
    const ws = new WebSocket("https://chat-app-week16.onrender.com");
    setSocket(ws);

    ws.onmessage = (ev) => {
      try {
        const ms: MessageType = JSON.parse(ev.data);
        if (ms.type === "chat" && ms.payload.message) {
          setPersonMessages((prev) => [...prev, ms.payload.message]);
        }
      } catch (error) {}
    };

    return () => ws.close();
  }, []);

  useEffect(() => {
    if (room) {
      const message: MessageType = {
        type: "join",
        payload: {
          room: room,
        },
      };
      socket?.send(JSON.stringify(message));
    }
    return () => {
      setMyMessages([]);
      setPersonMessages([]);
    };
  }, [room]);

  return (
    <>
      <div>
        <input type="text" ref={roomRef} />
        <button onClick={joinRoom}>Join</button>
      </div>
      <div>
        {!room ? (
          <h1>Join A Room</h1>
        ) : (
          <div>
            <h1>{room}</h1> <input type="text" ref={messageRef} />
            <button onClick={sendMessage}>send</button>
          </div>
        )}
      </div>
      <div>
        <h2>My Messages</h2>
        {myMessages?.map((ms, i) => {
          return <div key={i}>{ms}</div>;
        })}
      </div>
      <div>
        <h2>Persons Messages</h2>
        {personMessages?.map((ms, i) => {
          return <div key={i}>{ms}</div>;
        })}
      </div>
    </>
  );
}

export default App;
