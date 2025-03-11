import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold mb-4 text-primary">בואו נלמד מספרים!</h1>
        <p className="text-2xl text-gray-600">משחק כיף ללימוד מספרים בעברית</p>
      </motion.div>

      <div className="flex flex-col gap-4 w-full max-w-md">
        <Link href="/learn">
          <Button 
            className="w-full text-2xl py-8"
            size="lg"
          >
            למד מספרים
          </Button>
        </Link>
        
        <Link href="/practice">
          <Button 
            className="w-full text-2xl py-8"
            variant="secondary"
            size="lg"
          >
            תרגל מספרים
          </Button>
        </Link>
      </div>
    </div>
  );
}
