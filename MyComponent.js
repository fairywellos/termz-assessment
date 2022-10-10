import React, { useState, useEffect, useCallback } from "react";

const getNumberFromAPI = () => Promise.resolve(Math.random());

const MyComponent = () => {
  const [number, setNumber] = useState();
  const [scroll, setScroll] = useState();

  const getData = useCallback(async () => {
    setNumber(await getNumberFromAPI());
  }, []);

  useEffect(() => {
    getData();
    const updateScroll = () => setScroll(window.scrollY);

    window.addEventListener("scroll", updateScroll);
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  return (
    <div>
      <div> Number: {number} </div>
      <div> Scroll: {scroll} </div>
    </div>
  );
};

export default MyComponent;

/*  we can fixed MyComponent by removing aysnc implementation fron useEffect, and 
    add into a callback, and add [] as an dependency array in useEffect so useEffect 
    just run after component get rendered
*/
