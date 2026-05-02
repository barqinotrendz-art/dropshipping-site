import React from 'react';
import logo from '../assets/logo.jpeg';
import { ChevronRight } from 'lucide-react';
import './collection.css'

const Collection: React.FC = () => {
    return (
        <div className='flex md:flex-row flex-col items-center justify-center py-7 md:py-9'>
            <div className='md:w-[50%] w-[100%] flex md:flex-row flex-col gap-4 justify-center items-center'>

                <div className='w-[90%] lg:w-[45%] lg:h-[400px] md:w-[35%] md:h-[350px] rounded-2xl
             overflow-hidden'>
                    <img src={logo} alt="" className='w-full h-full rounded-2xl transition-transform 
                duration-300 ease-in-out hover:scale-110 cursor-pointer' />
                </div>

                <div className='w-[90%] lg:w-[45%] lg:h-[400px] md:w-[35%] md:h-[350px] flex  
            rounded-2xl overflow-hidden'>
                    <img src={logo} alt="" className='w-full h-full rounded-2xl transition-transform 
                duration-300 ease-in-out hover:scale-110 cursor-pointer' />
                </div>

            </div>

            <div className='md:w-[50%] w-[100%] md:px-8 px-3 md:py-0 pt-8'>
                <p className='font-semibold text-gray-800 md:text-[18px] text-[16px] md:text-start text-center '>
                    Our Products
                </p>
                <h1 className='font-semibold md:text-[40px] text-[30px] mb-5 md:mb-6 text-gray-800 md:text-start text-center '>
                    Explore Collections
                </h1>

                <div className="category-list">

                <div className='flex flex-row justify-between items-center cursor-pointer my-3 pb-3 border-b border-b-gray-200 cart-item'>
                    <h3 className='font-normal text-[24px]  cat-title'>Car Accessories</h3>
                    <div className='chevron-liquid'>

                        <span className='chevron-circle relative overflow-hidden w-[50px] h-[50px] flex items-center justify-center border border-gray-200 rounded-full'>
                            <div className="chevron-fill"></div>

                            <ChevronRight className='icon w-[18px] h-[18px]  relative z-10 transition-colors duration-300' />
                        </span>

                    </div>

                </div>

                <div className='flex flex-row justify-between items-center cursor-pointer my-3 pb-3 border-b border-b-gray-200 cart-item'>
                    <h3 className='font-normal text-[24px]  cat-title'>Health & Beauty</h3>
                    <div className='chevron-liquid'>

                        <span className='chevron-circle relative overflow-hidden w-[50px] h-[50px] flex items-center justify-center border border-gray-200 rounded-full'>
                            <div className="chevron-fill"></div>

                            <ChevronRight className='icon w-[18px] h-[18px]  relative z-10 transition-colors duration-300' />
                        </span>

                    </div>

                </div>

                <div className='flex flex-row justify-between items-center cursor-pointer my-3 pb-3 border-b border-b-gray-200 cart-item'>
                    <h3 className='font-normal text-[24px]  cat-title'>Trending</h3>
                    <div className='chevron-liquid'>

                        <span className='chevron-circle relative overflow-hidden w-[50px] h-[50px] flex items-center justify-center border border-gray-200 rounded-full'>
                            <div className="chevron-fill"></div>

                            <ChevronRight className='icon w-[18px] h-[18px]  relative z-10 transition-colors duration-300' />
                        </span>

                    </div>

                </div>

                </div>




            </div>

        </div>
    );
};

export default Collection;