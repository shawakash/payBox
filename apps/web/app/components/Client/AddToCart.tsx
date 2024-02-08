"use client";
import React, { useState } from "react";

const AddToCart = () => {
  const [count, setCount] = useState<number>(0);
  return (
    <button
      onClick={() => {
        setCount((c) => c + 1);
      }}
    >
      Count: {count}
    </button>
  );
};

export default AddToCart;
