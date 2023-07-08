import React, { useState, useEffect, useRef } from "react";
import "./Chat.css";
import Cookies from "js-cookie";
import io from "socket.io-client";
import Message from "../../Components/Messages/Message";
import SimpleCrypto from 'simple-crypto-js';
import FriendsList from "../../Components/FriendsList/Friends";
import emojiicon from "../../Assets/icons/emoji.svg";
import imageicon from "../../Assets/icons/image.svg";
import sendicon from "../../Assets/icons/send.svg";
import usericon from "../../Assets/icons/user.svg";
import callicon from "../../Assets/icons/call.svg";
import videocallicon from "../../Assets/icons/videocall.svg";
import menuicon from "../../Assets/icons/menu.svg";

export default function Chat() {
  const [active, setActive] = useState(null);
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState({});
  const [friendActive, setFriendActive] = useState(null);
  const [onlineFriends, setOnlineFriends] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const secretKey = process.env.REACT_APP_CRYPTO_SECRET;
  const crypto = new SimpleCrypto(secretKey);

  const currentUserRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const getcookies = Cookies.get('linkupdata');
    const temp = crypto.decrypt(getcookies);
    setCurrentUser({ ...temp });

    currentUserRef.current = { ...temp };

    const socket = io.connect("http://localhost:3001");
    socketRef.current = socket;

    socket.on('connect', () => {
      const socketID = socket.id;
      setCurrentUser(prevUser => ({ ...prevUser, socketID }));
      socket.emit("initialData", { ...temp, socketID });
    });

    socket.on("online-people", (onlinePeople) => {
      setOnlineFriends(onlinePeople);
    });

    socket.on("recieve-message", (messageData) => {
      const currentUser = currentUserRef.current;

      const friendEmail =
        messageData.sendto.email === currentUser?.email
          ? messageData.sendby.email
          : messageData.sendto.email;

      if (friendEmail) {
        setMessageList((prev) => ({
          ...prev,
          [friendEmail]: [...(prev[friendEmail] || []), messageData],
        }));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  function sendmessage() {
    const time = new Date();

    socketRef.current.emit("send-message", {
      sendby: currentUserRef.current,
      sendto: friendActive,
      message,
      time,
    });

    setMessage("");
  }

  function handleFriendsClick(friend, index) {
    setActive(index);
    setFriendActive(friend);

    const friendMessages = messageList[friend.email] || [];
    setMessageList((prev) => ({
      ...prev,
      [friend.email]: friendMessages,
    }));
  }

  return (
    <>
      <div className="outer">
        <FriendsList active={active} friendActive={friendActive} onlineFriends={onlineFriends} handleFriendsClick={handleFriendsClick} />
        <div className="chat-interface-outer">
          <div className="friend-active-details">
          <img src={usericon} className="friend-active-picture" alt="user icon"/>
          <div className="friend-active-nl">
            <div className="friend-active-name">{friendActive?.name}</div>
            <div className="friend-active-last-seen">3 Days ago</div>
          </div>
          <div className="friend-active-details-icon-cover" style={{marginLeft:"auto"}}>
            <img src={callicon} className="friend-active-details-icon" alt="friend-active-details-icon"/>
          </div>
          <div className="friend-active-details-icon-cover">
            <img src={videocallicon} className="friend-active-details-icon" alt="friend-active-details-icon"/>
          </div>
          <div className="friend-active-details-icon-cover">
            <img src={menuicon} className="friend-active-details-icon" height="25px" alt="friend-active-details-icon"/>
          </div>
          </div>
          <div className="chat-interface">
            <div className="chat-messages">
              {friendActive &&
                messageList[friendActive.email]?.map((messageData, key) => (
                  <Message
                    currentUser={currentUserRef.current?.name}
                    sendby={messageData.sendby}
                    time={messageData.time}
                    message={messageData.message}
                    key={key}
                  />
                ))}
            </div>
            <div className="message-input-outer">
              <input
                type="text"
                className="message-input"
                value={message}
                placeholder="Type your message..."
                onChange={(e) => {
                  setMessage(e.target.value);
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    sendmessage();
                  }
                }}
              />
              <img src={emojiicon} className="message-input-icons" alt="icons"/>
              <img src={imageicon} className="message-input-icons" alt="icons"/>
              <img src={sendicon} className="message-input-icons" alt="icons"/>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
