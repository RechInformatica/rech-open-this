'use babel';

/**
 * Helper for manipulating the services
 */
export default class ServiceHelper {

  /**
   * Creates a new service helper
   *
   * @param {array} services
   */
  constructor(services) {
    this.services = services;
  }

  /**
   *
   *
   * @param {array} path
   * @return {array} modified path
   */
  providePath(path) {
      if (path == undefined || this.services == undefined) {
        return Promise.resolve([]);
      }
      let servicePromises = [];
      this.services.forEach((service) => {
        let value = undefined;
        // If the service is a function
        if (typeof(service) == "function") {
          value = service(path);
          if (Array.isArray(value)) {
            path = value;
          } else {
            servicePromises.push(Promise.resolve(value));
          }
        } else {
          // If the service is a ; delimited string
          if (typeof(service) == "string") {
            service = service.split(";");
          }
          path = path.concat(service);
        }
      });
      if (servicePromises.length <= 0) {
        return Promise.resolve(path);
      } else {
        return Promise.all(servicePromises).then((resolved) => {
          return resolved[0];
        });
      }
  }

}
