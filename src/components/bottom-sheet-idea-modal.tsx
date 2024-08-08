import { useSpring, animated, config } from "react-spring";
import { useDrag } from "@use-gesture/react";
import { X, Mic, AlertCircle } from "lucide-react";
import { Toast } from "./ui/toast.tsx";
import { useState, useRef, useEffect } from "react";
import Idea from "./logic/idea.tsx";

const BottomSheetIdeaModal: React.FC<{
  onClose: () => void;
  onSubmit: (idea: Idea) => void;
  isActive: boolean;
  isIdeaModalOpen: boolean;
}> = ({ onClose, onSubmit, isActive, isIdeaModalOpen }) => {
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

    // Form Validation
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
    document.querySelector(".inner-modal")?.classList.remove("active");
    onClose();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setShowInfo(null);
    const { name, value } = e.target;
    setNewIdea((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewIdea((prev: any) => ({ ...prev, [name]: parseInt(value) }));
  };

  // Code for slider popups
  const [showInfo, setShowInfo] = useState<string | null>(null);

  const handleClickOutside = (event: MouseEvent) => {
    const popupElement = document.getElementById("popup");
    if (popupElement && !popupElement.contains(event.target as Node)) {
      setShowInfo(null);
    }
  };

  useEffect(() => {
    const handleOutsideInteraction = (event: MouseEvent) => {
      handleClickOutside(event);
    };

    document.addEventListener("mousedown", handleOutsideInteraction);
    document.addEventListener("mouseup", handleOutsideInteraction);

    return () => {
      document.removeEventListener("mousedown", handleOutsideInteraction);
      document.removeEventListener("mouseup", handleOutsideInteraction);
    };
  }, []);

  const ratingDescriptions: { [key: string]: string } = {
    simplicity: "Can I build my idea?",
    practicality: "Can you make a business out of it?",
    appeal: "Will people want it?",
    gutfeeling: "How confident & excited I feel about it.",
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowInfo(null);
    const slider = e.target;
    const value =
      (Number(slider.value) - Number(slider.min)) /
      (Number(slider.max) - Number(slider.min));
    let scale = (1 - value).toString();
    slider.style.setProperty("--slider-scale", scale);
  };

  return (
    <>
      {isIdeaModalOpen && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end modal}`}
        >
          <animated.div
            style={{
              y,
              touchAction: "none",
            }}
            className="w-full overflow-y-auto"
          >
            <div
              className={` ${
                isActive && "active"
              } inner-modal bg-white rounded-t-2xl py-6 w-full max-h-[85vh] overflow-y-auto`}
            >
              <div
                {...bind()}
                ref={dragRef}
                className="w-16 h-1 bg-gray-300 rounded-full mx-auto mt-[-12px] mb-4 cursor-grab"
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              />
              <div className="flex flex-col relative mx-auto overflow-y-auto max-w-2xl">
                <div className="px-6 relative overflow-y-auto w-full">
                  <div className="flex">
                    <button
                      onClick={() => {
                        document
                          .querySelector(".inner-modal")
                          ?.classList.remove("active");
                        onClose();
                      }}
                      className="absolute top-2 right-5 bg-gray-100 hover:bg-gray-200 rounded-full p-1"
                    >
                      <X className="text-black" size={24} />
                    </button>
                    <h2 className="text-2xl text-black font-bold mb-5">
                      New Idea
                    </h2>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-[15px] font-medium mb-1">
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
                    <label className="block text-gray-700 text-[15px] font-medium mb-1">
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
                  <div className="mb-4">
                    <label className="block text-gray-700 text-[15px] font-medium mb-1">
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
                    <Mic className="mr-1 text-black text-sm " />
                    <span className="text-[15px] text-black font-medium border-b-2 border-dotted border-gray-600">
                      or record a voice note
                    </span>
                  </div>
                </div>
                <hr className="mb-6" />
                <div className="px-6 overflow-y-auto w-full">
                  {ratingAttributes.map((label) => {
                    const key = label.toLowerCase().replace(" ", "");
                    return (
                      <div key={key} className="mb-6 relative">
                        <div className="flex justify-between items-center">
                          <label className="text text-black font-medium">
                            {label}
                          </label>
                          <div
                            className="flex items-center"
                            onClick={() => setShowInfo(key)}
                          >
                            <AlertCircle className="w-4 h-4 mr-1 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              {showInfo === key && (
                                <div
                                  id="popup"
                                  className="absolute right-1 top-5 bg-gray-800 text-white p-3 rounded shadow-lg z-10 w-auto"
                                >
                                  {ratingDescriptions[key]}
                                </div>
                              )}
                              What is this?
                            </span>
                          </div>
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
      )}
    </>
  );
};

export default BottomSheetIdeaModal;
