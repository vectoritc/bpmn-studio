export interface IBpmnXmlSaveOptions {

  /**
   * Add the preamble to the outputted xml.
   *
   * Example:
   * <?xml version="1.0" encoding="UTF-8"?>
   */
  preamble?: boolean;

  /**
   * Format the xml before saving.
   */
  format?: boolean;

}
