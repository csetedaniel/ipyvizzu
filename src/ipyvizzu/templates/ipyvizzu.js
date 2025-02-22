if (!window.IpyVizzu) {
  class IpyVizzu {
    constructor() {
      IpyVizzu.inhibitScroll = false;
      IpyVizzu.nbconvert = false;
      document.addEventListener(
        "wheel",
        (evt) => {
          IpyVizzu.inhibitScroll = true;
        },
        true
      );
      document.addEventListener(
        "keydown",
        (evt) => {
          IpyVizzu.inhibitScroll = true;
        },
        true
      );
      document.addEventListener(
        "touchstart",
        (evt) => {
          IpyVizzu.inhibitScroll = true;
        },
        true
      );

      this.elements = {};
      this.charts = {};
      this.controls = {};

      this.storage = {};
      this.displays = {};

      this.events = {};
      this.loaded = {};
      this.libs = {};
    }

    static clearInhibitScroll(element) {
      if (IpyVizzu.nbconvert) IpyVizzu._hide(element);
      IpyVizzu.inhibitScroll = false;
    }

    createChart(element, chartId, vizzulib, divWidth, divHeight) {
      this.elements[chartId] = document.createElement("div");
      this.elements[
        chartId
      ].style.cssText = `width: ${divWidth}; height: ${divHeight};`;
      this.loaded[chartId] = import(vizzulib);
      this.charts[chartId] = this.loaded[chartId].then((Vizzu) => {
        this.libs[chartId] = Vizzu.default;
        const VizzuConstructor = Vizzu.default;
        return new VizzuConstructor(this.elements[chartId]).initializing;
      });
      this._moveHere(chartId, element);
    }

    animate(
      element,
      chartId,
      animId,
      displayTarget,
      scrollEnabled,
      getChartTarget,
      chartAnimOpts
    ) {
      if (IpyVizzu.nbconvert) IpyVizzu._hide(element);
      if (displayTarget === "end") this._moveHere(chartId, element);
      this.controls[chartId] = this.charts[chartId];
      this.charts[chartId] = this.charts[chartId].then((chart) => {
        if (displayTarget === "actual") this._moveHere(chartId, element);
        this._scroll(chartId, scrollEnabled);
        let chartTarget = getChartTarget(this.libs[chartId]);
        if (typeof chartTarget === "string") {
          chartTarget = this.storage[chartTarget];
        } else if (Array.isArray(chartTarget)) {
          for (let i = 0; i < chartTarget.length; i++) {
            const target = chartTarget[i].target;
            if (typeof target === "string") {
              chartTarget[i].target = this.storage[target];
            }
          }
        }
        chart = chart.animate(chartTarget, chartAnimOpts);
        this.controls[animId] = chart;
        return chart;
      });
    }

    store(element, chartId, id) {
      if (IpyVizzu.nbconvert) IpyVizzu._hide(element);
      this.charts[chartId] = this.charts[chartId].then((chart) => {
        this.storage[id] = chart.store();
        return chart;
      });
    }

    feature(element, chartId, name, enabled) {
      if (IpyVizzu.nbconvert) IpyVizzu._hide(element);
      this.charts[chartId] = this.charts[chartId].then((chart) => {
        chart.feature(name, enabled);
        return chart;
      });
    }

    setEvent(element, chartId, id, event, handler) {
      if (IpyVizzu.nbconvert) IpyVizzu._hide(element);
      this.charts[chartId] = this.charts[chartId].then((chart) => {
        this.events[id] = handler;
        chart.on(event, this.events[id]);
        return chart;
      });
    }

    clearEvent(element, chartId, id, event) {
      if (IpyVizzu.nbconvert) IpyVizzu._hide(element);
      this.charts[chartId] = this.charts[chartId].then((chart) => {
        chart.off(event, this.events[id]);
        return chart;
      });
    }

    log(element, chartId, chartProperty) {
      if (IpyVizzu.nbconvert) IpyVizzu._hide(element);
      this.charts[chartId] = this.charts[chartId].then((chart) => {
        console.log(chart[chartProperty]);
        return chart;
      });
    }

    control(element, method, prevId, lastId, ...params) {
      if (IpyVizzu.nbconvert) IpyVizzu._hide(element);
      this.controls[prevId].then(() => {
        this.controls[lastId].activated.then((control) => {
          if (method === "seek") {
            const value = params[0];
            control[method](value);
            return;
          }
          if (method === "store") {
            const id = params[0];
            this.storage[id] = control[method]();
            return;
          }
          control[method]();
        });
      });
    }

    _moveHere(chartId, element) {
      if (IpyVizzu.nbconvert)
        IpyVizzu._display(this.elements[chartId], element);
      element.append(this.elements[chartId]);
    }

    _scroll(chartId, enabled) {
      if (!IpyVizzu.inhibitScroll && enabled) {
        this.elements[chartId].scrollIntoView({
          behavior: "auto",
          block: "center",
        });
      }
    }

    static _hide(element) {
      document.getElementById(
        element.selector.substring(1)
      ).parentNode.style.display = "none";
    }

    static _display(prevElement, element) {
      if (prevElement.parentNode) {
        prevElement.parentNode.style.display = "none";
      }
      document.getElementById(
        element.selector.substring(1)
      ).parentNode.style.display = "flex";
      document.getElementById(
        element.selector.substring(1)
      ).parentNode.style.margin = "auto";
    }
  }

  window.IpyVizzu = IpyVizzu;
  window.ipyvizzu = new window.IpyVizzu();
}
