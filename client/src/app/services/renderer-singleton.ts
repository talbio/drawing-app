import {Renderer2} from '@angular/core';

/**
 * @desc: singleton renderer provided for all the services,
 *        initialized after main view's components to prevent
 *        undefined renderer Error. (see drawing-view.component for initialization)
 */
export class RendererSingleton {
  private static renderer2: Renderer2;

  static instantiate(renderer: Renderer2) {
    if (!this.renderer2) {
      this.renderer2 = renderer;
    }
  }

  static get renderer(): Renderer2 {
    return this.renderer2;
  }

  static get canvas(): SVGElement {
    return this.renderer.selectRootElement('#canvas', true);
  }

  static get defs(): SVGElement {
    return this.renderer.selectRootElement('#definitions', true);
  }

  static get grid(): SVGElement {
    return this.renderer.selectRootElement('#backgroundGrid', true);
  }
}
