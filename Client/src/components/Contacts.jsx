import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Logo from "../assets/logo.svg";
import axios from "axios";
import { host } from "../utils/APIRoutes";

export default function Contacts({ contacts = [], changeChat }) {
  const [currentUserName, setCurrentUserName] = useState("");
  const [currentUserImage, setCurrentUserImage] = useState("");
  const [currentSelected, setCurrentSelected] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stored = localStorage.getItem(
          process.env.REACT_APP_LOCALHOST_KEY
        );
        if (!stored) return;

        const data = JSON.parse(stored);
        setCurrentUserName(data.username);
        setCurrentUserImage(data.avatarImage);

        const res = await axios.get(
          `${host}/api/messages/unread-counts/${data._id}`,
          { withCredentials: true }
        );

        const counts = {};
        if (Array.isArray(res.data)) {
          res.data.forEach((item) => {
            counts[item._id] = item.count;
          });
        }

        setUnreadCounts(counts);
      } catch (error) {
        console.error("Contacts fetch error:", error);
      }
    };

    fetchData();
  }, [contacts]);

  const changeCurrentChat = async (index, contact) => {
    try {
      setCurrentSelected(index);
      changeChat(contact);

      const stored = localStorage.getItem(
        process.env.REACT_APP_LOCALHOST_KEY
      );
      if (!stored) return;

      const data = JSON.parse(stored);

      await axios.post(
        `${host}/api/messages/mark-read`,
        {
          from: contact._id,
          to: data._id,
        },
        { withCredentials: true }
      );

      setUnreadCounts((prev) => ({
        ...prev,
        [contact._id]: 0,
      }));
    } catch (error) {
      console.error("Mark read error:", error);
    }
  };

  return (
    <>
      {currentUserImage && (
        <Container>
          <div className="brand">
            <img src={Logo} alt="logo" />
            <h3>snappy</h3>
          </div>

          <div className="contacts">
            {Array.isArray(contacts) &&
              contacts.map((contact, index) => (
                <div
                  key={contact._id}
                  className={`contact ${
                    index === currentSelected ? "selected" : ""
                  }`}
                  onClick={() => changeCurrentChat(index, contact)}
                >
                  <div className="avatar">
                    <img
                      src={`data:image/svg+xml;base64,${contact.avatarImage}`}
                      alt="avatar"
                    />
                  </div>

                  <div className="username">
                    <h3>{contact.username}</h3>
                    {unreadCounts[contact._id] > 0 && (
                      <span className="unread-badge">
                        {unreadCounts[contact._id]}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>

          <div className="current-user">
            <div className="avatar">
              <img
                src={`data:image/svg+xml;base64,${currentUserImage}`}
                alt="current user"
              />
            </div>
            <div className="username">
              <h2>{currentUserName}</h2>
            </div>
          </div>
        </Container>
      )}
    </>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 75% 15%;
  overflow: hidden;
  background-color: #080420;

  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;

    img {
      height: 2rem;
    }

    h3 {
      color: white;
      text-transform: uppercase;
    }
  }

  .contacts {
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    gap: 0.8rem;

    &::-webkit-scrollbar {
      width: 0.2rem;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #ffffff39;
      border-radius: 1rem;
    }

    .contact {
      background-color: #ffffff34;
      min-height: 5rem;
      cursor: pointer;
      width: 90%;
      border-radius: 0.2rem;
      padding: 0.4rem;
      display: flex;
      gap: 1rem;
      align-items: center;
      transition: 0.3s ease-in-out;
    }

    .selected {
      background-color: #9a86f3;
    }

    .username h3 {
      color: white;
    }
  }

  .current-user {
    background-color: #0d0d30;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;

    img {
      height: 4rem;
    }

    h2 {
      color: white;
    }
  }

  .unread-badge {
    background: #ff3b3b;
    color: white;
    border-radius: 50%;
    padding: 0.2rem 0.6rem;
    font-size: 0.9rem;
    margin-left: 0.5rem;
    font-weight: bold;
  }
`;
