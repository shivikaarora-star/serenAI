import "./Chat.css";
import React, { useContext, useState, useEffect } from "react";
import { MyContext } from "./MyContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

function Chat({ loading }) {
    const { newChat, prevChats, reply } = useContext(MyContext);
    const [latestReply, setLatestReply] = useState(null);

    useEffect(() => {
        if (reply === null) {
            setLatestReply(null); //prevchat load
            return;
        }

        if (!prevChats?.length) return;

        const content = reply.split(" "); //individual words

        let idx = 0;
        const interval = setInterval(() => {
            setLatestReply(content.slice(0, idx + 1).join(" "));

            idx++;
            if (idx >= content.length) clearInterval(interval);
        }, 40);

        return () => clearInterval(interval);

    }, [prevChats, reply])



    const Typewriter = ({ text, delay }) => {
        const [currentText, setCurrentText] = useState('');
        const [currentIndex, setCurrentIndex] = useState(0);

        useEffect(() => {
            if (currentIndex < text.length) {
                const timeout = setTimeout(() => {
                    setCurrentText(prevText => prevText + text[currentIndex]);
                    setCurrentIndex(prevIndex => prevIndex + 1);
                }, delay);

                return () => clearTimeout(timeout);
            }
        }, [currentIndex, delay, text]);

        return <span>{currentText}</span>;
    };

    return (
        <div className={`chats ${!prevChats.length && !latestReply ? 'empty' : ''}`}>
            {newChat && (!prevChats.length && !latestReply) && (
                <>
                    <div className="empty-title">SigmaGPT</div>
                    <div className="terminal-desc">
                        {"> "}
                        <Typewriter text="Initializing... Artificial Friendship Protocol Loaded. Ready to listen." delay={50} />
                        <span className="cursor"></span>
                    </div>
                </>
            )}
            {
                prevChats?.slice(0, -1).map((chat, idx) =>
                    <div className={chat.role === "user" ? "userDiv" : "gptDiv"} key={idx}>
                        {
                            chat.role === "user" ?
                                <p className="userMessage">{chat.content}</p> :
                                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{chat.content}</ReactMarkdown>
                        }
                    </div>
                )
            }

            {
                prevChats.length > 0 && (
                    <>
                        {
                            latestReply === null ? (
                                <div className="gptDiv" key={"non-typing"} >
                                    <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{prevChats[prevChats.length - 1].content}</ReactMarkdown>
                                </div>
                            ) : (
                                <div className="gptDiv" key={"typing"} >
                                    <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{latestReply}</ReactMarkdown>
                                </div>
                            )
                        }
                    </>
                )
            }

            {
                loading && (
                    <div className="gptDiv">
                        <div className="typing-indicator">
                            <span className="typing-dot"></span>
                            <span className="typing-dot"></span>
                            <span className="typing-dot"></span>
                        </div>
                    </div>
                )
            }
        </div >
    )
}

export default Chat;