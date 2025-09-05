import React from 'react';
import { Outlet } from 'react-router-dom';
import { GalleryVerticalEnd } from 'lucide-react';
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text';

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

      {/* Right Image Panel */}
      <div className="bg-muted relative hidden lg:block">
        <img
          loading="lazy"
          src="https://cdnb.artstation.com/p/assets/images/images/008/558/509/4k/mo-yan-jhin7-new8-final-final-layers-1.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.4] dark:contrast-100"
        />
      </div>
    </div>
  );
};

export default AuthLayout;
