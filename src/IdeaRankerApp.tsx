import React, { useState, useEffect } from "react";
import { Menu } from "lucide-react";

import emptyStateIcon from "./assets/empty-state-illus.png";
import {
  signInWithGoogle,
  useAuthState,
  handleSignOut,
} from "./components/logic/auth/auth.tsx";
import { fetchIdeas, addNewIdea } from "./components/logic/idea-utils.tsx";

import Idea from "./components/logic/idea.tsx";
import BottomSheetIdeaModal from "./components/bottom-sheet-idea-modal.tsx";

import "./sandbox.scss";

const SandboxDashboard: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [user, loading, setUser] = useAuthState();

  const [isIdeaModalActive, setIdeaModalActive] = useState(false);

  useEffect(() => {
    if (showModal) {
      const timer = setTimeout(() => {
        setIdeaModalActive(true);
      }, 0);
      return () => clearTimeout(timer);
    } else {
      setIdeaModalActive(false);
    }
  }, [showModal]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      fetchIdeas(JSON.parse(storedUser).uid).then(setIdeas);
    }
  }, [setUser]);

  const addNewIdeaHandler = async (newIdea: Omit<Idea, "id">) => {
    if (user) {
      const newIdeas = await addNewIdea(newIdea, user);
      setIdeas(newIdeas);
      setShowModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <button
          onClick={signInWithGoogle}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="flex font-SF flex-col h-screen bg-gray-100 items-center">
      <header className="bg-white p-4 flex justify-between items-center w-full">
        <Menu className="w-6 h-6" />
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
            <img
              src={user.photoURL || ""}
              alt="User avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={handleSignOut}
            className="ml-4 bg-red-500 text-white px-4 py-2 rounded"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 py-6 px-3 overflow-auto max-w-2xl sm:p-6">
        <h2 className="text-gray-500 text-sm mb-2">HELLO!</h2>
        <h1 className="text-3xl text-black font-bold mb-6">
          {user.displayName?.split(" ")[0] || "User"},{" "}
          {ideas.length == 0
            ? "add your first idea to the sandbox"
            : ideas.length > 0 && "ready to add ideas to the sandbox?"}
        </h1>

        <div
          className={` ${
            ideas.length == 0 && `bg-none shadow-none`
          } bg-white rounded-2xl shadow-md p-6`}
        >
          {ideas.length > 0 ? (
            ideas.map((idea, index) => (
              <div key={idea.id} className="mb-4 last:mb-0">
                <div className="flex items-start">
                  <div className="text-5xl font-medium text-gray-300 mr-6 r-grad">
                    {index + 1 > 5 ? "-" : index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base text-black font-semibold">
                      {idea.title}{" "}
                      {idea.rating !== undefined &&
                      idea.rating >= 2 &&
                      index < 3 ? (
                        <span className="pl-1 text-orange-500 text-xs">
                          🔥 {idea.rating.toFixed(1)}
                        </span>
                      ) : idea.rating !== 0 ? (
                        <span className="pl-1 text-gray-400 text-xs">
                          {idea.rating.toFixed(1)}
                        </span>
                      ) : (
                        <span className="pl-1 text-gray-400 text-xs">
                          Not rated yet
                        </span>
                      )}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {idea.shortDescription}
                    </p>
                  </div>
                </div>
                {index < ideas.length - 1 && <hr className="my-4" />}
              </div>
            ))
          ) : ideas.length == 0 ? (
            <div className="w-full py-6 flex flex-col items-center">
              <img
                className="h-[120px] mb-4"
                src={emptyStateIcon}
                alt="Empty ideas list"
              />
              <p className="text-gray-500 text-center text-sm">
                Hey, you have no ideas here yet. <br />
                Put down your ideas, then take actions fast
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="button w-full mt-6 bg-black text-white py-3 rounded-full font-semibold flex items-center justify-center"
              >
                + Add new idea
              </button>
            </div>
          ) : (
            <p className="text-gray-500">Loading...</p>
          )}
        </div>
      </main>

      <footer className="p-6 max-w-2xl w-full">
        {ideas.length > 0 && (
          <button
            onClick={() => {
              setShowModal(true);
            }}
            className="button w-full bg-black text-white py-3 rounded-full font-semibold flex items-center justify-center"
          >
            + Add new idea
          </button>
        )}
      </footer>

      <BottomSheetIdeaModal
        isIdeaModalOpen={showModal}
        onClose={() => {
          setTimeout(() => {
            setIdeaModalActive(false);
            setShowModal(false);
          }, 400);
        }}
        onSubmit={addNewIdeaHandler}
        isActive={isIdeaModalActive}
      />
    </div>
  );
};

export default SandboxDashboard;
