// components/HeaderTicker.tsx
import  { useEffect, useState } from "react";
import Ticker from "framer-motion-ticker";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

const ProductTicker = () => {
  const [enabled, setEnabled] = useState(true);
//   const [bgColor, setBgColor] = useState("#000000");
  const [texts, setTexts] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDoc(doc(db, "settings", "header"));
      if (snap.exists()) {
        const data = snap.data();
        setEnabled(data.enabled ?? true);
        // setBgColor(data.bgColor ?? "#000000");
        setTexts(data.texts ?? []);
      }
    };

    fetchData();
  }, []);

  if (!enabled || texts.length === 0) return null;

  return (
    <div style={{ backgroundColor: "" }} className="py-8 overflow-hidden bg-gray-50">
      <Ticker duration={20}>
        {texts.map((text, index) => (
          <div
            key={index}
            className="md:text-[28px] text-[18px] whitespace-nowrap text-[#244b42] font-semibold
            "
          >
            <span className="md:px-[150px] px-[50px]">*</span>
            {text}
          </div>
        ))}
      </Ticker>
    </div>
  );
};

export default ProductTicker;