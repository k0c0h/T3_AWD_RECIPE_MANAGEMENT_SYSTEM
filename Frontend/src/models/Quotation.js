class Quotation {
  constructor(data = {}) {
    this._id = data._id || null;
    this.quotationType = data.quotationType || "chef_quotation";
    this.status = data.status || "pending";
    this.clientInfo = data.clientInfo || {
      name: "",
      phone: "",
      email: "",
    };
    this.eventInfo = data.eventInfo || {
      eventType: "other",
      numberOfGuests: 0,
      eventDate: null,
      eventTime: "",
      location: {
        address: "",
        venueName: "",
      },
      specialRequirements: "",
      dietaryRestrictions: "",
      preferredCuisine: "",
      additionalNotes: "",
    };
    this.budgetRange = data.budgetRange || { min: 0, max: 0 };
    this.estimatedCost = data.estimatedCost || 0;
    this.recipes = Array.isArray(data.recipes) ? data.recipes : [];
    this.discount = data.discount || { type: "percentage", value: 0 };
    this.subtotal = data.subtotal || 0;
    this.discountAmount = data.discountAmount || 0;
    this.taxes = data.taxes || {
      ivaPercent: 0,
      servicePercent: 0,
      otherPercent: 0,
      ivaAmount: 0,
      serviceAmount: 0,
      otherAmount: 0,
      totalTaxes: 0,
    };
    this.totalAmount = data.totalAmount || 0;
    this.chefId = data.chefId || null;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  getFormattedTotal(currency = "$", decimals = 2) {
    return `${currency}${Number(this.totalAmount || 0).toFixed(decimals)}`;
  }

  getFormattedDate(locale = "es-ES") {
    if (!this.eventInfo?.eventDate) return "";
    const date = new Date(this.eventInfo.eventDate);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  toJSON() {
    return {
      _id: this._id,
      quotationType: this.quotationType,
      status: this.status,
      clientInfo: this.clientInfo,
      eventInfo: this.eventInfo,
      budgetRange: this.budgetRange,
      estimatedCost: this.estimatedCost,
      recipes: this.recipes,
      discount: this.discount,
      subtotal: this.subtotal,
      discountAmount: this.discountAmount,
      taxes: this.taxes,
      totalAmount: this.totalAmount,
      chefId: this.chefId,
      createdAt: this.createdAt?.toISOString?.() || this.createdAt,
      updatedAt: this.updatedAt?.toISOString?.() || this.updatedAt,
    };
  }

  static fromJSON(data) {
    return new Quotation(data);
  }

  static fromJSONArray(dataArray) {
    if (!Array.isArray(dataArray)) return [];
    return dataArray.map((item) => Quotation.fromJSON(item));
  }
}

export default Quotation;
