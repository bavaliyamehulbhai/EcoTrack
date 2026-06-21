const calculateCarbon = ({
  transportKm,
  electricityUnits,
  foodType,
  plasticUsage,
  waterUsage
}) => {
  let transport = Number(transportKm || 0) * 0.192;
  let electricity = Number(electricityUnits || 0) * 0.82;
  let food = 0;

  if (foodType === "vegetarian") {
    food = 20;
  } else if (foodType === "mixed") {
    food = 35;
  } else if (foodType === "nonveg") {
    food = 50;
  }

  let waste = Number(plasticUsage || 0) * 0.5;
  let water = Number(waterUsage || 0) * 0.002;

  let totalCarbon = transport + electricity + food + waste + water;

  return {
    transport,
    electricity,
    food,
    waste,
    water,
    totalCarbon
  };
};

export default calculateCarbon;
