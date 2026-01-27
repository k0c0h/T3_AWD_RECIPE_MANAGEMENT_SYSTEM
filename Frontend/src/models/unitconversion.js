export class UnitConversion {
  constructor(data = {}) {
    this._id = data._id || null;
    this.value = data.value || 0;
    this.fromUnit = data.fromUnit || '';
    this.toUnit = data.toUnit || '';
    this.result = data.result || 0;
    this.densityUsed = data.densityUsed || 1;
    this.ingredientId = data.ingredientId || null;
    this.ingredientName = data.ingredientName || null;
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  static fromResponse(data) {
    return new UnitConversion(data);
  }

  toRequest() {
    return {
      value: this.value,
      fromUnit: this.fromUnit,
      toUnit: this.toUnit,
      density: this.densityUsed,
      ingredientId: this.ingredientId
    };
  }
}
