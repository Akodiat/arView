const l = 1e-3, c = 1e-3, p = 1, h = 5, m = 5;
function g({ filterMinCF: e, filterBeta: i, filterDCutOff: n }) {
  if (e !== void 0 && (typeof e != "number" || e < 0))
    throw new Error("filterMinCF must be a non-negative number");
  if (i !== void 0 && (typeof i != "number" || i < 0))
    throw new Error("filterBeta must be a non-negative number");
  if (n !== void 0 && (typeof n != "number" || n < 0))
    throw new Error("filterDCutOff must be a non-negative number");
}
const o = `<div class="mindar-ui-overlay mindar-ui-loading">
  <div class="loader"/>
</div>
`, s = `<div class="mindar-ui-overlay mindar-ui-compatibility">
  <div class="content">
    <h1>Failed to launch :(</h1>
    <p>
      Looks like your device/browser is not compatible.
    </p>

    <br/>
    <br/>
    <p>
      Please try the following recommended browsers:
    </p>
    <p>
      For Android device - Chrome
    </p>
    <p>
      For iOS device - Safari
    </p>
  </div>
</div>
`, r = `<div class="mindar-ui-overlay mindar-ui-scanning">
  <div class="scanning">
    <div class="inner">
      <div class="scanline"/>
    </div>
  </div>
</div>
`, d = ".mindar-ui-overlay{display:flex;align-items:center;justify-content:center;position:absolute;left:0;right:0;top:0;bottom:0;background:transparent;z-index:2}.mindar-ui-overlay.hidden{display:none}.mindar-ui-loading .loader{border:16px solid #222;border-top:16px solid white;opacity:.8;border-radius:50%;width:120px;height:120px;animation:spin 2s linear infinite}@keyframes spin{0%{transform:rotate(0)}to{transform:rotate(360deg)}}.mindar-ui-compatibility .content{background:black;color:#fff;opacity:.8;text-align:center;margin:20px;padding:20px;min-height:50vh}@media (min-aspect-ratio: 1/1){.mindar-ui-scanning .scanning{width:50vh;height:50vh}}@media (max-aspect-ratio: 1/1){.mindar-ui-scanning .scanning{width:80vw;height:80vw}}.mindar-ui-scanning .scanning .inner{position:relative;width:100%;height:100%;opacity:.8;background:linear-gradient(to right,white 10px,transparent 10px) 0 0,linear-gradient(to right,white 10px,transparent 10px) 0 100%,linear-gradient(to left,white 10px,transparent 10px) 100% 0,linear-gradient(to left,white 10px,transparent 10px) 100% 100%,linear-gradient(to bottom,white 10px,transparent 10px) 0 0,linear-gradient(to bottom,white 10px,transparent 10px) 100% 0,linear-gradient(to top,white 10px,transparent 10px) 0 100%,linear-gradient(to top,white 10px,transparent 10px) 100% 100%;background-repeat:no-repeat;background-size:40px 40px}.mindar-ui-scanning .scanning .inner .scanline{position:absolute;width:100%;height:10px;background:white;animation:move 2s linear infinite}@keyframes move{0%,to{top:0%}50%{top:calc(100% - 10px)}}";
class u {
  constructor({ uiLoading: i, uiScanning: n, uiError: t }) {
    const a = document.createElement("style");
    a.innerText = d, document.head.appendChild(a), i === "yes" ? this.loadingModal = this._loadHTML(o) : i !== "no" && (this.loadingModal = document.querySelector(i)), t === "yes" ? this.compatibilityModal = this._loadHTML(s) : t !== "no" && (this.compatibilityModal = document.querySelector(t)), n === "yes" ? this.scanningMask = this._loadHTML(r) : n !== "no" && (this.scanningMask = document.querySelector(n)), this.hideLoading(), this.hideCompatibility(), this.hideScanning();
  }
  showLoading() {
    this.loadingModal && this.loadingModal.classList.remove("hidden");
  }
  hideLoading() {
    this.loadingModal && this.loadingModal.classList.add("hidden");
  }
  showCompatibility() {
    this.compatibilityModal && this.compatibilityModal.classList.remove("hidden");
  }
  hideCompatibility() {
    this.compatibilityModal && this.compatibilityModal.classList.add("hidden");
  }
  showScanning() {
    this.scanningMask && this.scanningMask.classList.remove("hidden");
  }
  hideScanning() {
    this.scanningMask && this.scanningMask.classList.add("hidden");
  }
  _loadHTML(i) {
    const n = document.createElement("template");
    n.innerHTML = i.trim();
    const t = n.content.firstChild;
    return document.getElementsByTagName("body")[0].appendChild(t), t;
  }
}
export {
  c as D,
  p as F,
  h as I,
  u as U,
  m as a,
  l as b,
  g as v
};
