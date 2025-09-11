import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import React from 'react';

const getGreeting = (companyName: string) => {
  const currentHour = new Date().getHours();
  console.log(companyName)
  if (currentHour < 12) return <div className='flex items-center justify-between'> <div className='flex flex-col'> <span className="truncate text-sm font-medium">{companyName}</span> <span className='text-xs'>Good Morning </span></div>  <DotLottieReact
    src="https://lottie.host/3c265bac-11ce-4d6a-a205-d852be4b2822/mGD7W6H32o.lottie"
    loop
    className='h-12  w-12'
    autoplay
  />  </div>;
  if (currentHour < 17) return <div className='flex items-center justify-between'> <div className='flex flex-col'> <span className="truncate text-sm font-medium">{companyName}</span> <span className='text-xs'>Good Afternoon </span></div>  <DotLottieReact
    src="https://lottie.host/ce892e62-ba1a-4a83-bd44-d8b8ca32635d/ZyQTfBXOkQ.lottie"
    loop
    className='h-12  w-12'
    autoplay
  />  </div>;
  return <div className='flex items-center justify-between'> <div className='flex flex-col'> <span className="truncate text-sm font-medium">{companyName}</span> <span className='text-xs'>Good Evening </span></div>  <DotLottieReact
    src="https://lottie.host/d047dca7-349f-4a9a-acde-cf3c0cf2e434/k1x5BHSA3z.lottie"
    loop
    className='h-12  w-12'
    autoplay
  />  </div>;
};

const Greeting = ({ companyName }: { companyName: string }) => {
  const [greeting, setGreeting] = React.useState(getGreeting(companyName));

  React.useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting(companyName));
    }, 60000); // update every 60 seconds

    return () => clearInterval(interval);
  }, []);

  return <span className="truncate text-xs">{greeting}</span>;
};

export default Greeting;
