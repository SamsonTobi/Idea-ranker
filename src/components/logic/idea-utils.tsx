import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "./auth/firebase";
import Idea from "./idea";

export const fetchIdeas = async (userId: string): Promise<Idea[]> => {
  try {
    const q = query(collection(db, "ideas"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const ideasList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Idea[];
    ideasList.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return ideasList;
  } catch (error) {
    console.error("Error fetching ideas:", error);
    return [];
  }
};

export const addNewIdea = async (
  newIdea: Omit<Idea, "id">,
  user: { uid: string }
): Promise<Idea[]> => {
  if (user) {
    const ideaWithUser = { ...newIdea, userId: user.uid };
    try {
      const docRef = await addDoc(collection(db, "ideas"), ideaWithUser);
      const existingIdeas = await fetchIdeas(user.uid);
      const updatedIdeas = [
        { ...ideaWithUser, id: docRef.id },
        ...existingIdeas,
      ];
      updatedIdeas.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      return updatedIdeas.map((idea, index) => ({
        ...idea,
        index: index + 1,
      }));
    } catch (error) {
      console.error("Error adding new idea:", error);
      throw error;
    }
  }
  return [];
};
