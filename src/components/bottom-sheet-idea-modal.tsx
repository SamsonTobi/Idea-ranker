// import React, { useState, useRef } from 'react';
// import { X, Mic, AlertCircle } from 'lucide-react';
// import { useSpring, animated } from 'react-spring';
// import { useDrag } from '@use-gesture/react';
// import { Toast } from '/Toast.';

// const BottomSheetIdeaModal: React.FC<{
//   onClose: () => void;
//   onSubmit: (idea: Idea) => void;
// }> = ({ onClose, onSubmit }) => {
//   const [newIdea, setNewIdea] = useState<Idea>({
//     title: "",
//     shortDescription: "",
//     fullDescription: "",
//     rating: 0,
//     simplicity: 0,
//     practicality: 0,
//     appeal: 0,
//     gutfeeling: 0,
//   });

//   const [showToast, setShowToast] = useState(false);
//   const [toastMessage, setToastMessage] = useState("");
//   const ratingAttributes = [
//     "Simplicity",
//     "Practicality",
//     "Appeal",
//     "Gut feeling",
//   ];

//   // Bottom sheet animation
//   const [{ y }, api] = useSpring(() => ({ y: 0 }));
//   const open = { y: 0 };
//   const closed = { y: 100 };
  
//   // Drag binding
//   const bind = useDrag(
//     ({ down, movement: [, my], velocity }) => {
//       if (down && my > 0) {
//         api.start({ y: my, immediate: true });
//       } else {
//         if (my > window.innerHeight * 0.2 || velocity > 0.5) {
//           api.start(closed);
//           setTimeout(onClose, 300);
//         } else {
//           api.start(open);
//         }
//       }
//     },
//     { from: () => [0, y.get()], filterTaps: true, bounds: { top: 0 } }
//   );

//   const handleSubmit = () => {
//     if (newIdea.title.trim() === "" || newIdea.shortDescription.trim() === "") {
//       setToastMessage("Idea name and short description are required.");
//       setShowToast(true);
//       return;
//     }

//     const isFormUnchanged =
//       newIdea.title === "" &&
//       newIdea.shortDescription === "" &&
//       newIdea.fullDescription === "" &&
//       newIdea.simplicity === 0 &&
//       newIdea.practicality === 0 &&
//       newIdea.appeal === 0 &&
//       newIdea.gutfeeling === 0;

//     if (isFormUnchanged) {
//       setToastMessage("You haven't written anything yet.");
//       setShowToast(true);
//       return;
//     }

//     const totalScore =
//       newIdea.simplicity +
//       newIdea.practicality +
//       newIdea.appeal +
//       newIdea.gutfeeling;
//     const rating = (totalScore / 400) * 5;
//     const roundedRating = Math.round(rating * 10) / 10;

//     const ideaWithRating = { ...newIdea, rating: roundedRating };
//     onSubmit(ideaWithRating);
//     onClose();
//   };

//   const handleInputChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target;
//     setNewIdea((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setNewIdea((prev) => ({ ...prev, [name]: parseInt(value) }));
//   };

//   const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const slider = e.target;
//     const value = (Number(slider.value) - Number(slider.min)) / (Number(slider.max) - Number(slider.min));
//     let scale = (1 - value).toString();
//     slider.style.setProperty("--slider-scale", scale);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end">
//       <animated.div
//         {...bind()}
//         style={{
//           y,
//           touchAction: 'none',
//         }}
//         className="bg-white rounded-t-lg p-6 w-full max-h-[90vh] overflow-y-auto"
//       >
//         <div className="w-16 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
//         <div className="relative">
//           <button
//             onClick={onClose}
//             className="absolute top-2 right-2 bg-gray-100 hover:bg-gray-200 rounded-full p-1"
//           >
//             <X className="text-black" size={24} />
//           </button>
//           <h2 className="text-2xl text-black font-bold mb-4">New Idea</h2>
//           <div>
//             <div className="mb-4">
//               <label className="block text-black text-sm font-medium mb-1">
//                 Name of your idea
//               </label>
//               <input
//                 type="text"
//                 name="title"
//                 value={newIdea.title}
//                 onChange={handleInputChange}
//                 className="w-full p-2 text-black bg-gray-100 rounded-lg"
//                 placeholder="Idea ranker, email sender e.t.c"
//                 required
//               />
//             </div>
//             <div className="mb-4">
//               <label className="block text-black text-sm font-medium mb-1">
//                 Short description
//               </label>
//               <input
//                 type="text"
//                 name="shortDescription"
//                 value={newIdea.shortDescription}
//                 onChange={handleInputChange}
//                 className="w-full p-2 text-black bg-gray-100 rounded-lg"
//                 placeholder="A short pitch to potential users"
//                 required
//               />
//             </div>
//             <div className="mb-1">
//               <label className="block text-black text-sm font-medium mb-1">
//                 Full description
//               </label>
//               <textarea
//                 name="fullDescription"
//                 value={newIdea.fullDescription}
//                 onChange={handleInputChange}
//                 className="w-full p-2 bg-gray-100 text-black rounded-lg"
//                 placeholder="Write notes about the details of your idea here...."
//                 rows={3}
//                 required
//               />
//             </div>
//             <div className="mb-6 flex items-center">
//               <Mic className="mr-1 text-black text-xs" />
//               <span className="text-sm text-black">or record a voice note</span>
//             </div>
//             {ratingAttributes.map((label) => {
//               const key = label.toLowerCase().replace(" ", "");
//               return (
//                 <div key={key} className="mb-4">
//                   <div className="flex justify-between items-center">
//                     <label className="text text-black font-medium">{label}</label>
//                     <AlertCircle className="w-4 h-4 text-gray-400" />
//                   </div>
//                   <input
//                     type="range"
//                     name={key}
//                     value={newIdea[key as keyof Idea] || 0}
//                     onChange={handleRangeChange}
//                     className="w-full gradient-slider"
//                     min="0"
//                     max="100"
//                     onInput={handleInput}
//                   />
//                 </div>
//               );
//             })}
//             <button
//               onClick={handleSubmit}
//               className="button w-full bg-black text-white py-2 rounded-full font-semibold mt-4"
//             >
//               + Add new idea
//             </button>
//           </div>
//         </div>
//       </animated.div>
//       {showToast && (
//         <Toast
//           variant="destructive"
//           title="Error"
//           description={toastMessage}
//           onClose={() => setShowToast(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default BottomSheetIdeaModal;
