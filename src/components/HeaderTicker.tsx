// components/HeaderTicker.tsx
import React, { useEffect, useState } from "react";
import Ticker from "framer-motion-ticker";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

const HeaderTicker = () => {
  const [enabled, setEnabled] = useState(true);
  const [bgColor, setBgColor] = useState("#000000");
  const [texts, setTexts] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDoc(doc(db, "settings", "header"));
      if (snap.exists()) {
        const data = snap.data();
        setEnabled(data.enabled ?? true);
        setBgColor(data.bgColor ?? "#000000");
        setTexts(data.texts ?? []);
      }
    };

    fetchData();
  }, []);

  if (!enabled || texts.length === 0) return null;

  return (
    <div style={{ backgroundColor: bgColor }} className="py-2 overflow-hidden">
      <Ticker duration={20}>
        {texts.map((text, index) => (
          <div
            key={index}
            style={{
              margin: "0 30px",
              whiteSpace: "nowrap",
              color: "#fff",
              fontSize: "14px",
            }}
          >
            {text}
          </div>
        ))}
      </Ticker>
    </div>
  );
};

export default HeaderTicker;