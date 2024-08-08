import React, { useState, useEffect, useRef } from "react";
import { X, Menu, Mic, AlertCircle } from "lucide-react";
import { initializeApp } from "firebase/app";
import emptyStateIcon from "./assets/empty-state-illus.png";
import { useSpring, animated, config } from "react-spring";
import { useDrag } from "@use-gesture/react";
import "./sandbox.scss";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import Toast from "./components/Toast";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBibBf1rCwT_GPBkvYuBBRlT2a3-OWx1M8",
  authDomain: "simple-idea-ranker.firebaseapp.com",
  projectId: "simple-idea-ranker",
  storageBucket: "simple-idea-ranker.appspot.com",
  messagingSenderId: "487526503239",
  appId: "1:487526503239:web:4839a3e677f565b604b262",
  measurementId: "G-L5XGC7ZE3V",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

interface Idea {
  id?: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  rating: number;
  simplicity: number;
  practicality: number;
  appeal: number;
  gutfeeling: number;
}

interface StoredUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

const BottomSheetIdeaModal: React.FC<{
  onClose: () => void;
  onSubmit: (idea: Idea) => void;
}> = ({ onClose, onSubmit }) => {
  const [newIdea, setNewIdea] = useState<Idea>({
    title: "",
    shortDescription: "",
    fullDescription: "",
    rating: 0,
    simplicity: 0,
    practicality: 0,
    appeal: 0,
    gutfeeling: 0,
  });

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const ratingAttributes = [
    "Simplicity",
    "Practicality",
    "Appeal",
    "Gut feeling",
  ];


  // Bottom sheet animation
  const [{ y }, api] = useSpring(() => ({
    y: 0,
    config: config.stiff,
  }));

  // Drag binding
  const dragRef = useRef<HTMLDivElement>(null);
  const bind = useDrag(
    ({ down, movement: [, my], velocity: [, vy], event }) => {
      if (event.target === dragRef.current) {
        if (down && my > 0) {
          api.start({ y: my, immediate: true });
        } else {
          if (my > window.innerHeight * 0.2 || vy > 0.5) {
            api.start({ y: 100 });
            setTimeout(onClose, 300);
          } else {
            api.start({ y: 0 });
          }
        }
      }
    },
    {
      from: () => [0, y.get()],
      filterTaps: true,
      bounds: { top: 0 },
    }
  );

  const handleSubmit = () => {
    if (newIdea.title.trim() === "" || newIdea.shortDescription.trim() === "") {
      setToastMessage("Idea name and short description are required.");
      setShowToast(true);
      return;
    }

    const isFormUnchanged =
      newIdea.title === "" &&
      newIdea.shortDescription === "" &&
      newIdea.fullDescription === "" &&
      newIdea.simplicity === 0 &&
      newIdea.practicality === 0 &&
      newIdea.appeal === 0 &&
      newIdea.gutfeeling === 0;

    if (isFormUnchanged) {
      setToastMessage("You haven't written anything yet.");
      setShowToast(true);
      return;
    }

    const totalScore =
      newIdea.simplicity +
      newIdea.practicality +
      newIdea.appeal +
      newIdea.gutfeeling;
    const rating = (totalScore / 400) * 5;
    const roundedRating = Math.round(rating * 10) / 10;

    const ideaWithRating = { ...newIdea, rating: roundedRating };
    onSubmit(ideaWithRating);
    onClose();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewIdea((prev) => ({ ...prev, [name]: value }));
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewIdea((prev) => ({ ...prev, [name]: parseInt(value) }));
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slider = e.target;
    const value =
      (Number(slider.value) - Number(slider.min)) /
      (Number(slider.max) - Number(slider.min));
    let scale = (1 - value).toString();
    slider.style.setProperty("--slider-scale", scale);
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end modal}`}
    >
      <animated.div
        style={{
          y,
          touchAction: "none",
        }}
        className="bg-white rounded-t-2xl p-6 w-full max-h-[80vh] overflow-y-auto modal-inner bgr"
      >
        <div
          {...bind()}
          ref={dragRef}
          className="w-16 h-1 bg-gray-300 rounded-full mx-auto mb-4 cursor-grab"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        />
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 bg-gray-100 hover:bg-gray-200 rounded-full p-1"
          >
            <X className="text-black" size={24} />
          </button>
          <h2 className="text-2xl text-black font-bold mb-4">New Idea</h2>
          <div>
            <div className="mb-4">
              <label className="block text-black text-sm font-medium mb-1">
                Name of your idea
              </label>
              <input
                type="text"
                name="title"
                value={newIdea.title}
                onChange={handleInputChange}
                className="w-full p-2 text-black bg-gray-100 rounded-lg"
                placeholder="Idea ranker, email sender e.t.c"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-black text-sm font-medium mb-1">
                Short description
              </label>
              <input
                type="text"
                name="shortDescription"
                value={newIdea.shortDescription}
                onChange={handleInputChange}
                className="w-full p-2 text-black bg-gray-100 rounded-lg"
                placeholder="A short pitch to potential users"
                required
              />
            </div>
            <div className="mb-1">
              <label className="block text-black text-sm font-medium mb-1">
                Full description
              </label>
              <textarea
                name="fullDescription"
                value={newIdea.fullDescription}
                onChange={handleInputChange}
                className="w-full p-2 bg-gray-100 text-black rounded-lg"
                placeholder="Write notes about the details of your idea here...."
                rows={3}
                required
              />
            </div>
            <div className="mb-6 flex items-center">
              <Mic className="mr-1 text-black text-xs" />
              <span className="text-sm text-black">or record a voice note</span>
            </div>
            {ratingAttributes.map((label) => {
              const key = label.toLowerCase().replace(" ", "");
              return (
                <div key={key} className="mb-4">
                  <div className="flex justify-between items-center">
                    <label className="text text-black font-medium">
                      {label}
                    </label>
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="range"
                    name={key}
                    value={newIdea[key as keyof Idea] || 0}
                    onChange={handleRangeChange}
                    className="w-full gradient-slider"
                    min="0"
                    max="100"
                    onInput={handleInput}
                  />
                </div>
              );
            })}
            <button
              onClick={handleSubmit}
              className="button w-full bg-black text-white py-3 rounded-full font-semibold mt-4"
            >
              + Add new idea
            </button>
          </div>
        </div>
      </animated.div>
      {showToast && (
        <Toast
          variant="destructive"
          title="Error"
          description={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

const SandboxDashboard: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser: StoredUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchIdeas(parsedUser.uid);
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setLoading(true);
      if (currentUser) {
        const userData: StoredUser = {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL,
        };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        fetchIdeas(currentUser.uid);
      } else {
        setUser(null);
        localStorage.removeItem("user");
        setIdeas([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchIdeas = async (userId: string) => {
    try {
      const q = query(collection(db, "ideas"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const ideasList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Idea[];
      ideasList.sort((a, b) => b.rating - a.rating);
      setIdeas(ideasList);
    } catch (error) {
      console.error("Error fetching ideas:", error);
    }
  };

  const addNewIdea = async (newIdea: Idea) => {
    if (user) {
      const ideaWithUser = { ...newIdea, userId: user.uid };
      try {
        const docRef = await addDoc(collection(db, "ideas"), ideaWithUser);
        const newIdeas = [...ideas, { ...ideaWithUser, id: docRef.id }];
        newIdeas.sort((a, b) => b.rating - a.rating);
        setIdeas(newIdeas);
        setShowModal(false);
      } catch (error) {
        console.error("Error adding new idea:", error);
      }
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userData: StoredUser = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      };
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        localStorage.removeItem("user");
        setUser(null);
        setIdeas([]);
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
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
    <div className="flex font-SF flex-col h-screen bg-gray-100">
      <header className="bg-white p-4 flex justify-between items-center">
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

      <main className="flex-1 py-6 px-3 overflow-auto sm:p-6">
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
                  <div className="text-5xl font-medium text-gray-300 mr-4">
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

      <footer className="p-6">
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

      {showModal && (
        <BottomSheetIdeaModal
          onClose={() => setShowModal(false)}
          onSubmit={addNewIdea}
        />
      )}
    </div>
  );
};

export default SandboxDashboard;
