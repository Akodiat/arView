const f = (n, e) => {
  const t = 2 * Math.PI * e * n;
  return t / (t + 1);
}, l = (n, e, t) => n * e + (1 - n) * t;
class b {
  constructor({ minCutOff: e, beta: t, dCutOff: i = null }) {
    if (typeof e != "number" || e < 0)
      throw new Error("minCutOff must be a non-negative number");
    if (this.minCutOff = e, typeof t != "number" || t < 0)
      throw new Error("beta must be a non-negative number");
    this.beta = t;
    const s = i === null ? 1e-3 : i;
    if (typeof s != "number" || s < 0)
      throw new Error("dCutOff must be a non-negative number");
    this.dCutOff = s, this.xPrev = null, this.dxPrev = null, this.tPrev = null, this.initialized = !1;
  }
  reset() {
    this.initialized = !1, this.xPrev = null, this.dxPrev = null, this.tPrev = null;
  }
  updateParams({ minCutOff: e, beta: t, dCutOff: i }) {
    if (e !== void 0) {
      if (typeof e != "number" || e < 0)
        throw new Error("minCutOff must be a non-negative number");
      this.minCutOff = e;
    }
    if (t !== void 0) {
      if (typeof t != "number" || t < 0)
        throw new Error("beta must be a non-negative number");
      this.beta = t;
    }
    if (i !== void 0) {
      if (typeof i != "number" || i < 0)
        throw new Error("dCutOff must be a non-negative number");
      this.dCutOff = i;
    }
  }
  getParams() {
    return {
      minCutOff: this.minCutOff,
      beta: this.beta,
      dCutOff: this.dCutOff
    };
  }
  filter(e, t) {
    if (!Array.isArray(t) || t.length === 0)
      throw new Error("Input must be a non-empty array");
    if (typeof e != "number" || e < 0)
      throw new Error("Time must be a non-negative number");
    if (!this.initialized)
      return this.initialized = !0, this.xPrev = t.slice(), this.dxPrev = t.map(() => 0), this.tPrev = e, t.slice();
    const { xPrev: i, tPrev: s, dxPrev: m } = this;
    if (t.length !== i.length)
      return this.reset(), this.initialized = !0, this.xPrev = t.slice(), this.dxPrev = t.map(() => 0), this.tPrev = e, t.slice();
    const o = e - s;
    if (o <= 0)
      return i.slice();
    if (o > 1e3)
      return this.reset(), this.initialized = !0, this.xPrev = t.slice(), this.dxPrev = t.map(() => 0), this.tPrev = e, t.slice();
    const v = f(o, this.dCutOff), a = [], h = [], u = [];
    for (let r = 0; r < t.length; r++) {
      a[r] = (t[r] - i[r]) / o, h[r] = l(v, a[r], m[r]);
      const c = this.minCutOff + this.beta * Math.abs(h[r]), d = f(o, c);
      u[r] = l(d, t[r], i[r]);
    }
    return this.xPrev = u.slice(), this.dxPrev = h.slice(), this.tPrev = e, u;
  }
}
export {
  b as O
};
