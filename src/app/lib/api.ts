declare module NodeJS {
  interface Global {
    myModule:any;
  }
}
global.myModule = (function() {
  let service:any = {};

  service.init = function() {
    console.log('I initialized');
  };

  return service;
})();