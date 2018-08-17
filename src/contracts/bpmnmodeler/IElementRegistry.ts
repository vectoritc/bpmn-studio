import {IShape} from './IShape';

export interface IElementRegistry {

  /**
   * Register a pair of (element, gfx, (secondaryGFX)).
   *
   * @param element element
   * @param gfx gfx
   * @param secondaryGfx optional other element to register, too
   */
  add(element: IShape, gfx: SVGElement, secondaryGfx?: SVGElement): void;

  /**
   * Removes an element from the registry.
   *
   * @param element Element that should be removed.
   */
  remove(element: IShape): void;

  /**
   * Update the id of an element.
   *
   * @param element Element
   * @param newId New ID of the element
   */
  updateId(element: IShape, newId: string): void;

  /**
   * Return the model element for a given id or graphics.
   *
   * @example
   *
   * elementRegistry.get('SomeElementId_1');
   * elementRegistry.get(gfx);
   *
   * @param filter Filter for selecting the element
   */
  get(filter: string | SVGElement): IShape;

  /**
   * Returns all elements that match a given filter function.
   *
   * @param filterMethod Filter function
   * @return The Elements that matches the fiter function.
   */
  filter(filterMethod: (element: IShape) => Boolean): Array<IShape>;

  /**
   * Returns all rendered model elements.
   *
   * @returns An array with all Elements of the ElementRegistry.
   */
  getAll(): Array<IShape>;

  /**
   * Iterate over all diagram elements.
   *
   * @param fn Function that should be executed for every diagram element.
   */
  forEach(fn: Function): void;

  /**
   * Return the graphical representation of an element or its id.
   *
   * @example
   * elementRegistry.getGraphics('SomeElementId_1');
   * elementRegistry.getGraphics(rootElement); // <g ...>
   *
   * elementRegistry.getGraphics(rootElement, true); // <svg ...>
   *
   *
   * @param filter ID or definition of the Element.
   * @param secondary whether to return the secondary connected element
   *
   * @return {SVGElement}
   */
 getGraphics(filter: string | IShape, secondary?: boolean): SVGElement;

  /**
   * Validate the suitability of the given id and signals a problem
   * with an exception.
   *
   * @param id ID of the Element, that should be validated.
   * @throws Error if the id is empty or already assigned.
   */
 _validateId(id: string): void;

}
