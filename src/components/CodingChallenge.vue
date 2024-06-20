<template>
  <div class="p-4">
    <h1 class="text-2xl">Options Profit Calculator</h1>

    <div class="flex gap-4 items-center">
      <OptionsManager :options="options" @update-options="updateOptions" />

      <div class="flex-1">
        <p class="mt-4">
          Max Profit: {{ maxProfit }} / Max Loss: {{ maxLoss }} / Break Even
          Points:
          {{ breakEvenPoints.join(", ") ?? "None" }}
        </p>

        <div class="shadow-md border border-solid p-4 h-[500px] mt-4">
          <line-chart :data="chartData" :options="chartOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Line } from "vue-chartjs";
import { Chart, registerables } from "chart.js";

import {
  calculateProfitLoss,
  calculateMaxProfitLossEvenPoints,
  getReasonablePriceRange,
} from "@/utils/options";
import OptionsManager from "./OptionsManager.vue";

Chart.register(...registerables);

export default {
  name: "CodingChallenge",
  props: {
    optionsData: {
      type: Array,
      required: true,
    },
  },
  components: {
    LineChart: Line,
    OptionsManager,
  },
  data() {
    return {
      options: this.optionsData.map(
        ({ strike_price, type, bid, ask, long_short, expiration_date }) => ({
          type,
          bid,
          ask,
          strikePrice: strike_price,
          longShort: long_short,
          expirationDate: expiration_date,
        })
      ),
      labels: [],
      data: [],
      profitData: [],
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: "Underlying Price",
            },
          },
          y: {
            title: {
              display: true,
              text: "Profit/Loss",
            },
          },
        },
        elements: {
          point: {
            pointStyle: false,
          },
          line: {
            borderWidth: 2,
            borderDash: [5, 5],
            borderJoinStyle: "bevel",
          },
        },
      },
      maxProfit: 0,
      maxLoss: 0,
      breakEvenPoints: [],
    };
  },
  mounted() {
    this.calculateRiskReward();
  },
  computed: {
    chartData: function () {
      return {
        labels: this.labels,
        datasets: [
          ...this.options.map((_, index) => ({
            label: `Option ${index + 1}`,
            data: this.data[index],
          })),
          {
            label: "Profit/Loss",
            data: this.profitData,
            borderDash: [],
          },
        ],
      };
    },
  },
  methods: {
    updateOptions(newOptions) {
      this.options = newOptions;
      this.calculateRiskReward();
    },
    calculateRiskReward() {
      const priceRange = getReasonablePriceRange(this.options);
      const underlyingPrices = [];
      for (let i = priceRange.min; i < priceRange.max; i++)
        underlyingPrices.push(i);

      const profitLoss = this.options.map((option) =>
        underlyingPrices.map(
          (price) => calculateProfitLoss(option, price).offset
        )
      );

      this.labels = underlyingPrices.map((item) => item.toFixed(2));
      this.data = profitLoss;
      this.profitData = underlyingPrices.map((price, index) =>
        profitLoss.reduce((total, item) => total + item[index], 0)
      );

      const { maxProfit, maxLoss, breakEvenPoints } =
        calculateMaxProfitLossEvenPoints(this.options);

      this.maxProfit = maxProfit;
      this.maxLoss = maxLoss;
      this.breakEvenPoints = breakEvenPoints;
    },
  },
};
</script>

<style scoped></style>
