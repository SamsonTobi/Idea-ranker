import React, { useState, useEffect } from "react";
import { Menu, Mic, AlertCircle } from "lucide-react";
import { initializeApp } from "firebase/app";
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

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

interface Idea {
  id?: string; // Changed to string to accommodate Firestore document ID
  title: string;
  shortDescription: string;
  fullDescription: string;
  rating: number;
  simplicity: number;
  practicality: number;
  appeal: number;
  gutFeeling: number;
}

const NewIdeaModal: React.FC<{
  onClose: () => void;
  onSubmit: (idea: Idea) => void;
}> = ({ onClose, onSubmit }) => {
  const [newIdea, setNewIdea] = useState<Idea>({
    title: "",
    shortDescription: "",
    fullDescription: "",
    rating: 0,
    simplicity: 50,
    practicality: 50,
    appeal: 50,
    gutFeeling: 50,
  });

  const handleSubmit = () => {
    // Calculate the rating based on slider values
    const totalScore =
      newIdea.simplicity +
      newIdea.practicality +
      newIdea.appeal +
      newIdea.gutFeeling;
    const rating = (totalScore / 400) * 5; // Convert to a 0-5 scale
    const roundedRating = Math.round(rating * 10) / 10; // Round to one decimal place

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl text-black font-bold mb-4">New Idea</h2>
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Name of your idea
            </label>
            <input
              type="text"
              name="title"
              value={newIdea.title}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder="Idea ranker, email sender e.t.c"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Short description
            </label>
            <input
              type="text"
              name="shortDescription"
              value={newIdea.shortDescription}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder="A short pitch to potential users"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Full description
            </label>
            <textarea
              name="fullDescription"
              value={newIdea.fullDescription}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder="Write notes about the details of your idea here...."
              rows={3}
              required
            />
          </div>
          <div className="mb-4 flex items-center">
            <Mic className="mr-2" />
            <span className="text-sm">or record a voice note</span>
          </div>
          {["Simplicity", "Practicality", "Appeal", "Gut feeling"].map(
            (label) => (
              <div key={label} className="mb-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">{label}</label>
                  <AlertCircle className="w-4 h-4" />
                </div>
                <input
                  type="range"
                  name={label.toLowerCase().replace(" ", "")}
                  value={
                    newIdea[label.toLowerCase().replace(" ", "") as keyof Idea]
                  }
                  onChange={handleRangeChange}
                  className="w-full"
                  min="0"
                  max="100"
                />
              </div>
            )
          )}
          <button
            onClick={handleSubmit}
            className="w-full bg-black text-white py-2 rounded-full font-semibold mt-4"
          >
            + Add new idea
          </button>
        </div>
      </div>
    </div>
  );
};

const SandboxDashboard: React.FC = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(true);
      if (user) {
        // Check if user object exists in localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          // User was previously logged in, set user state from localStorage
          setUser(JSON.parse(storedUser));
        } else {
          // User is newly logged in, set user state from Firebase
          setUser(user);
        }
        fetchIdeas(user.uid).finally(() => setLoading(false));
      } else {
        setUser(null);
        setLoading(false);
      }
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
  
      // Store user information in localStorage
      localStorage.setItem('user', JSON.stringify(user));
  
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };
  

  const handleSignOut = () => {
    signOut(auth);
  };

  // Show a loading state while checking authentication
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
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white p-4 flex justify-between items-center">
        <Menu className="w-6 h-6" />
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
            <img
              src={user.photoURL}
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

      <main className="flex-1 p-6 overflow-auto">
        <h2 className="text-gray-500 text-sm mb-2">WELCOME BACK</h2>
        <h1 className="text-3xl text-black font-bold mb-6">
          {user.displayName}, ready to add ideas to the sandbox?
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          {ideas.map((idea, index) => (
            <div key={idea.id} className="mb-4 last:mb-0">
              <div className="flex items-start">
                <div className="text-5xl text-gray-300 mr-4">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg text-black font-semibold">
                    {idea.title}{" "}
                    <span className="text-orange-500">
                      🔥 {idea.rating.toFixed(1)}
                    </span>
                  </h3>
                  <p className="text-gray-600">{idea.shortDescription}</p>
                </div>
              </div>
              {index < ideas.length - 1 && <hr className="my-4" />}
            </div>
          ))}
        </div>
      </main>

      <footer className="p-6">
        <button
          onClick={() => setShowModal(true)}
          className="w-full bg-black text-white py-3 rounded-full font-semibold flex items-center justify-center"
        >
          + Add new idea
        </button>
      </footer>

      {showModal && (
        <NewIdeaModal
          onClose={() => setShowModal(false)}
          onSubmit={addNewIdea}
        />
      )}
    </div>
  );
};

export default SandboxDashboard;
