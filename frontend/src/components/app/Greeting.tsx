import React from "react";

const getGreeting = () => {
    const currentHour = new Date().getHours();

    if (currentHour < 12) return "Good Morning ☀️";
    if (currentHour < 17) return "Good Afternoon 🌤️";
    return "Good Evening 🌙";
};


const Greeting: React.FC = () => {
    const [greeting, setGreeting] = React.useState(getGreeting());

    React.useEffect(() => {
        const interval = setInterval(() => {
            setGreeting(getGreeting());
        }, 60000); // update every 60 seconds

        return () => clearInterval(interval);
    }, []);

    return (

        <span className="truncate text-xs">{greeting}</span>
    );
}

export default Greeting;
