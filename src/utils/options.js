import { LongShortType, OptionType } from "@/enum";

// Returns reasonable price range to display in the chart
export const getReasonablePriceRange = (options) => {
  const maxStrikePrice = Math.max(
    ...options.map((option) => option.strikePrice)
  );

  return {
    min: 0,
    max: Math.ceil(maxStrikePrice + (maxStrikePrice - 0) / 2),
  };
};

// returns profit/loss value for given price and option
// profit/loss = value * price + offset
export const calculateProfitLoss = (option, price) => {
  if (price === -Infinity) {
    return {
      value:
        option.type === OptionType.Call
          ? 0
          : option.longShort === LongShortType.Long
          ? 1
          : -1,
      offset:
        option.type === OptionType.Call
          ? option.longShort === LongShortType.Long
            ? -option.ask
            : option.bid
          : option.longShort === LongShortType.Long
          ? option.strikePrice - option.ask
          : option.bid - option.strikePrice,
    };
  }
  if (price === Infinity) {
    return {
      value:
        option.type === OptionType.Put
          ? 0
          : option.longShort === LongShortType.Long
          ? 1
          : -1,
      offset:
        option.type === OptionType.Call
          ? option.longShort === LongShortType.Long
            ? -option.strikePrice - option.ask
            : option.bid + option.strikePrice
          : option.longShort === LongShortType.Long
          ? -option.ask
          : option.bid,
    };
  }

  const intrinsicValue =
    option.type === OptionType.Call
      ? Math.max(0, price - option.strikePrice)
      : Math.max(0, option.strikePrice - price);

  const profitLoss =
    option.longShort === LongShortType.Long
      ? intrinsicValue - option.ask
      : option.bid - intrinsicValue;

  return { value: 0, offset: profitLoss };
};

// compare profit loss with certain value
const compareProfitLoss = (profitLoss, value) => {
  // if -Infinity
  if (profitLoss.value < 0) return -1;

  // if Infinity
  if (profitLoss.value > 0) return 1;

  return profitLoss.offset - value;
};

// get max profit loss from options
export const calculateMaxProfitLossEvenPoints = (options) => {
  const breakpoints = Array.from(
    new Set(
      [0, ...options.map((option) => option.strikePrice), Infinity].sort()
    )
  );

  const profitLossAtBreakpoints = breakpoints.map((breakpoint) =>
    options.reduce(
      (sum, option) => {
        const profitLoss = calculateProfitLoss(option, breakpoint);
        return {
          value: sum.value + profitLoss.value,
          offset: sum.offset + profitLoss.offset,
        };
      },
      {
        offset: 0,
        value: 0,
      }
    )
  );

  const maxProfit = profitLossAtBreakpoints.reduce((max, breakpoint) => {
    if (breakpoint.value > 0) return Infinity;
    if (breakpoint.value < 0) return max;
    return Math.max(max, breakpoint.offset);
  }, -Infinity);

  const maxLoss = profitLossAtBreakpoints.reduce((min, breakpoint) => {
    if (breakpoint.value < 0) return -Infinity;
    if (breakpoint.value > 0) return min;
    return Math.min(min, breakpoint.offset);
  }, Infinity);

  const breakEvenPoints = [];

  for (let i = 1; i < breakpoints.length; i++) {
    if (
      (compareProfitLoss(profitLossAtBreakpoints[i - 1], 0) < 0 &&
        compareProfitLoss(profitLossAtBreakpoints[i], 0) > 0) ||
      (compareProfitLoss(profitLossAtBreakpoints[i - 1], 0) > 0 &&
        compareProfitLoss(profitLossAtBreakpoints[i], 0) < 0)
    ) {
      if (profitLossAtBreakpoints[i - 1].value !== 0) {
        breakEvenPoints.push(
          -profitLossAtBreakpoints[i - 1].offset /
            profitLossAtBreakpoints[i - 1].value
        );
      } else if (profitLossAtBreakpoints[i].value != 0) {
        breakEvenPoints.push(
          -profitLossAtBreakpoints[i].offset / profitLossAtBreakpoints[i].value
        );
      } else {
        breakEvenPoints.push(
          breakpoints[i - 1] + Math.abs(profitLossAtBreakpoints[i - 1].offset)
        );
      }
    }
  }

  console.log({ breakpoints, breakEvenPoints, profitLossAtBreakpoints });

  return {
    maxProfit: maxProfit.toFixed(2),
    maxLoss: -maxLoss.toFixed(2),
    breakEvenPoints: breakEvenPoints.map((v) => v.toFixed(2)),
  };
};
