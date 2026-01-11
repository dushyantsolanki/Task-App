import React from 'react';
import { Outlet } from 'react-router-dom';
import { GalleryVerticalEnd } from 'lucide-react';
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const AuthLayout: React.FC = () => {
  return (
    <div className="bg-image relative grid min-h-svh overflow-hidden lg:grid-cols-2">
      <div className="relative z-10 flex flex-col gap-4 p-6 md:p-10">
        {/* Brand Logo */}
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <h2 className="text-2xl">
              <AnimatedShinyText className="inline-flex items-center justify-center transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
                <span>Task Mate.</span>
              </AnimatedShinyText>{' '}
            </h2>
          </a>
        </div>

        {/* Main Form Area */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </div>
      {/* Center vertical divider */}
      <div className="absolute left-1/2 top-1/2 hidden lg:block">
        <div className="-translate-x-1/2 -translate-y-1/2 h-80 w-1 rounded-4xl bg-muted-foreground/40"></div>
      </div>

      {/* Right Image Panel */}

      <div className="relative hidden lg:block">
        {/* <img
          loading="lazy"
          src="https://cdnb.artstation.com/p/assets/images/images/008/558/509/4k/mo-yan-jhin7-new8-final-final-layers-1.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.4] dark:contrast-100"
        /> */}

        {/* <DotLottieReact
          src="https://lottie.host/7e6cc677-5f9d-4489-95aa-2318a8fadcb7/kc8hYB1h4h.lottie"
          loop
          autoplay
        /> */}

        <DotLottieReact
          src="https://lottie.host/45b19de0-2d30-42b3-a3a2-c588f299c608/MKz1tzspew.lottie"
          loop
          autoplay
        />
      </div>
    </div>
  );
};

export default AuthLayout;
