import { useEffect, useState } from "react";
import { Presets, SplitFlap } from "react-split-flap";
import './splitflap.css'
import Reusablebtn from "../Reusablebtn";
import { Link } from "react-router-dom";

const phrases = [
  "SHOPNOW",
  "BARQINO",
  "50% OFF",
];

export default function SplitFlapComponent() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % phrases.length);
    }, 7000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="lg:py-8 md:my-5 my-4">
      <div className="bg-gray-50">

        <h1 className="lg:!text-[70px] md:!text-[45px] sm:!text-[35px] !text-[28px] text-center 
       font-semibold lg:py-7 md:py-5 py-3">
          Our Best Seller
        </h1>

        <SplitFlap
          value={phrases[index]}
          chars={Presets.ALPHANUM}
          length={7}
          align="left"
          animateOnMount={false}
          className="!text-[42px] sm:!text-[70px] md:!text-[90px] lg:!text-[140px]"
        />

      
      <p className="lg:!text-[20px] md:!text-[18px] sm:!text-[16px] !text-[14px] text-center 
      lg:py-7 md:py-5 py-6 font-semibold lg:px-0 md:px-6 sm:px-3 px-2">
        Everything you need, all in one place — from home & kitchen essentials to beauty, car, and tech accessories.
      </p>
      <Link to={'/products'} className="flex justify-center ">
        <div className="w-60 lg:pb-12 md:pb-8 sm:pb-5 pb-3">
          <Reusablebtn text="Shop Now" />
        </div>
      </Link>
      </div>
    </div>

  );
}