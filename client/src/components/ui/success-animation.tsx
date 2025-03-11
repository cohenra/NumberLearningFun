import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useEffect } from "react";

export function SuccessAnimation() {
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white p-8 rounded-lg text-center"
      >
        <h2 className="text-4xl font-bold mb-4">🎉 כל הכבוד! 🎉</h2>
        <p className="text-2xl">נהדר! המשך כך!</p>
      </motion.div>
    </motion.div>
  );
}
