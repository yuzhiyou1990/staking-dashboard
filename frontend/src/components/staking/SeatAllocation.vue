<template>
  <div>
    <div class="chart-container">
      <ChartBar
        :chartdata="chartdata"
        :options="options"
        style="height: 300px; width: 100%;"
      />
    </div>
  </div>
</template>

<script>
import ChartBar from "./PageValidatorCharts/components/ChartBar"
import { ones, zeroDecimals } from "../../scripts/num"

// function randomScalingFactor(min, number) {
//   return Math.round(Number(min) + Math.random() * (number || 100))
// }

export default {
  name: "SeatAllocationHistory",
  components: { ChartBar },
  props: ["data", "median", "networkInfo"],
  data: () => ({
    options: {
      responsive: true,
      plugins: {
        labels: false,
      },
      responsive: true,
      maintainAspectRatio: false,
      tooltips: {
        mode: "index",
        intersect: false,
        custom: function(tooltip) {
          if (!tooltip) return;
          tooltip.displayColors = false;
        },
        callbacks: {
          title: (data) => "",
          label: ({datasetIndex, xLabel, yLabel}) => {
            if (datasetIndex === 0) {
              return `${yLabel} seats elected out of`
            }
            return `${yLabel} total seats at ${xLabel}`
          }
        }
      },
      legend: {
        display: false
      },
      scales: {
        xAxes: [
          {
            display: true,
            gridLines: {
              display: false
            },
            stacked: true,
          }
        ],
        yAxes: [
          {
            display: true,
            gridLines: {
              display: true
            },
            ticks: {
              min: 0,
            }
          }
        ]
      }
    }
  }),
  computed: {
    chartdata() {

      console.log(this.data)
      
      const epochs = Object.keys(this.data)
      const shards = this.data.externalShards || []
      const elected = shards.map((s) => s.external)
      const total = shards.map((s) => s.total)

      const labels = [0, 1, 2, 3].map((s) => 'Shard ' + s)

      const colors = ['#00ADE844', '#00ADE844']
      
      return {
        labels,
        datasets: [
          {
            backgroundColor: colors[0],
            data: elected
          }, 
          {
            backgroundColor: colors[1],
            data: total
          }
        ]
      }
    }
  }
}
</script>

<style>
.chart-container {
  background: white;
  margin-bottom: var(--double);
}
</style>
