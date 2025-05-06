import { motion } from "framer-motion";

export default function BusinessLoading() {
  return (
    <div className="absolute w-6/12 h-2/3 rounded-xl z-50 flex items-center justify-center bg-white/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex flex-col items-center"
      >
        <motion.div
          className="relative w-20 h-20 mb-6"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-300 border-b-blue-500 border-l-blue-300" />
          <div className="absolute inset-1 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-400 border-b-blue-600 border-l-blue-400" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-2xl font-medium text-gray-900 mb-2 text-center">
            Creating your business profile
          </h3>
          <p className="text-gray-500 text-center max-w-xs">
            Securely processing your information...
          </p>
        </motion.div>

        <motion.div
          className="mt-8 w-64 h-1 bg-gray-100 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
            }}
          />
        </motion.div>

        <motion.div
          className="mt-6 text-xs text-gray-400 flex items-center"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2" />
          Almost there
        </motion.div>
      </motion.div>
    </div>
  );
}
