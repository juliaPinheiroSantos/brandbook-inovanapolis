class Component extends DCLogic {
  state = { copied: null };

  renderVals() {
    return {
      copied: this.state.copied,
      copy: (e) => {
        const val = e.currentTarget && e.currentTarget.dataset
          ? e.currentTarget.dataset.copy
          : null;
        if (!val) return;
        try { if (navigator.clipboard) navigator.clipboard.writeText(val); } catch (err) {}
        this.setState({ copied: val });
        clearTimeout(this._t);
        this._t = setTimeout(() => this.setState({ copied: null }), 1300);
      }
    };
  }
}
