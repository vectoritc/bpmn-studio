export interface IBpmnXmlSaveOptions {

  /**
   * Add the preamble to the outputted xml.
   *
   * Default: false
   *
   * Example:
   * <?xml version="1.0" encoding="UTF-8"?>
   */
  preamble?: boolean;

  /**
   * Format the xml before saving.
   *
   * Default: false
   */
  format?: boolean;
}
