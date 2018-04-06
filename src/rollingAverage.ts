// low pass filter https://stackoverflow.com/a/3760851

export default class RollingAverage {
  private smoothingFactor: number;
  private avg = null;

  constructor(smoothingFactor?: number) {
    this.smoothingFactor = smoothingFactor || 0.5;
  }
  
  add(newVal: any) {
    if (this.avg == null) {
      this.avg = newVal;
      return;
    }

    // WRONG: Getting jumbled results
    this.avg += ((this.smoothingFactor * newVal) + (1 - this.smoothingFactor) * this.avg);
  }

  get average() { return this.avg; }
}