const request = require('request');

const validResponseRegex = /(2\d\d)/;


/**
 * The ServiceNowConnector class.
 *
 * @summary ServiceNow Change Request Connector
 * @description This class contains properties and methods to execute the
 *   ServiceNow Change Request product's APIs.
 */
class ServiceNowConnector {

  /**
   * @memberof ServiceNowConnector
   * @constructs
   * @description Copies the options parameter to a public property for use
   *   by class methods.
   *
   * @param {object} options - API instance options.
   * @param {string} options.url - Your ServiceNow Developer instance's URL.
   * @param {string} options.username - Username to your ServiceNow instance.
   * @param {string} options.password - Your ServiceNow user's password.
   * @param {string} options.serviceNowTable - The table target of the ServiceNow table API.
   */
  constructor(options) {
    this.options = options;
  }

  /**
   * @callback iapCallback
   * @description A [callback function]{@link https://developer.mozilla.org/en-US/docs/Glossary/Callback_function}
   *   is a function passed into another function as an argument, which is
   *   then invoked inside the outer function to complete some kind of
   *   routine or action.
   *
   * @param {*} responseData - When no errors are caught, return data as a
   *   single argument to callback function.
   * @param {error} [errorMessage] - If an error is caught, return error
   *   message in optional second argument to callback function.
   */

  /**
   * @memberof ServiceNowConnector
   * @method get
   * @summary Calls ServiceNow GET API
   * @description Call the ServiceNow GET API. Sets the API call's method and query,
   *   then calls this.sendRequest(). In a production environment, this method
   *   should have a parameter for passing limit, sort, and filter options.
   *   We are ignoring that for this course and hardcoding a limit of one.
   *
   * @param {iapCallback} callback - Callback a function.
   * @param {(object|string)} callback.data - The API's response. Will be an object if sunnyday path.
   *   Will be HTML text if hibernating instance.
   * @param {error} callback.error - The error property of callback.
   */
  get(callback) {
    console.error('start inside GET method');  
    let getCallOptions = { ...this.options };
    getCallOptions.method = 'GET';
    getCallOptions.query = 'sysparm_limit=1';
    console.error(' ** inside GET method - getCallOptions= ' + JSON.stringify(getCallOptions));
    this.sendRequest(getCallOptions, (results, error) => callback(results, error));
  }

  /**
   * @memberof ServiceNowConnector
   * @method constructUri
   * @summary Assembles the URI
   * @description Build and return the proper URI by appending an optionally passed
   *   [URL query string]{@link https://en.wikipedia.org/wiki/Query_string}. 
   *
   * @param {string} serviceNowTable - The table target of the ServiceNow table API.
   * @param {string} [query] - Optional URL query string.
   *  
   * @return {string} ServiceNow URL
   */

  //constructUri  () {
  //    console.error('entering constructUri');
  //}  
   
  constructUri(inCallOptions, respUri) {
      console.error('entering constructUri');
      console.error('  **  in constructUri  the passed in inCallOptions = ' + JSON.stringify(inCallOptions));
      let uri = '/api/now/table/' + inCallOptions.serviceNowTable;
      let query = inCallOptions.query
      if(query) {
          uri = uri + '?' + query;
      }
      console.error('  ** ** in constructUri return uri value = ' + uri );
      return uri;
  }


/**
   * @memberof ServiceNowConnector
   * @method isHibernating
   * @summary boolean is returned indicating if the ServiceNow instance is hibernating 
   * @description Checks if request function responded with evidence of
   *   a hibernating ServiceNow instance. 
   *  
   * @return {boolean} Returns true if instance is hibernating. Otherwise returns false.
   */
   
isHibernating(inResponse) {
    console.error('entering isHibernating');
    if(inResponse.body.includes('Instance Hibernating page')) {
        console.error('RESPONSE CONTAINS HIBERNATING');
    } else {
        console.error('RESPONSE not HIBERNATING');
    }
    if(inResponse.body.includes('<html>')) {
        console.error('RESPONSE CONTAINS HTML tag');
    } else {
        console.error('RESPONSE no html tag');
    }
    if(inResponse.statusCode === 200) {
        console.error('RESPONSE CODE is 200');
    } else {
        console.error('RESPONSE code not 200');
    }
    console.error('+++++++++++  response parsed is :' + JSON.stringify(inResponse));
    return inResponse.body.includes('Instance Hibernating page')
        && inResponse.body.includes('<html>')
        && inResponse.statusCode === 200;
}


/**
 * @memberof ServiceNowConnector
 * @method processRequestResults
 * @description Inspect ServiceNow API response for an error, bad response code, or
 *   a hibernating instance. If any of those conditions are detected, return an error.
 *   Else return the API's response.
 *
 * @param {error} error - The error argument passed by the request function in its callback.
 * @param {object} response - The response argument passed by the request function in its callback.
 * @param {string} body - The HTML body argument passed by the request function in its callback.
 * @param {iapCallback} callback - Callback a function.
 * @param {(object|string)} callback.data - The API's response. Will be an object if sunnyday path.
 *   Will be HTML text if hibernating instance.
 * @param {error} callback.error - The error property of callback.
 */

 
//processRequestResults(callback) {
processRequestResults(error, response, body, callback) {  
    console.error('ENTERING processRequestResults method');
    console.error('  *****  processRequestResults method in error value = '+ JSON.stringify(error));
    console.error('  *****  processRequestResults method in response value = '+ JSON.stringify(response)); 
    console.error('  *****  processRequestResults method in body value = '+ JSON.stringify(body)); 
    console.error('  *****  processRequestResults method in callback value = '+ JSON.stringify(callback));
    if (error) {
      console.error('Error present.');
      callback.error = error;
    } else if (!validResponseRegex.test(response.statusCode)) {
      console.error('Bad response code.');
      callback.error = response;
    } else if (this.isHibernating(response)) {
      callback.error = 'Service Now instance is hibernating';
      console.error(callbackError);
    } else {
      callback.data = response;
    }
    return callback(callback.data, callback.error);
}


/**
 * @memberof ServiceNowConnector
 * @method sendRequest
 * @description Builds final options argument for request function
 *   from global const options and parameter callOptions.
 *   Executes request call, then verifies response.
 *
 * @param {object} callOptions - Passed call options.
 * @param {string} callOptions.query - URL query string.
 * @param {string} callOptions.serviceNowTable - The table target of the ServiceNow table API.
 * @param {string} callOptions.method - HTTP API request method.
 * @param {iapCallback} callback - Callback a function.
 * @param {(object|string)} callback.data - The API's response. Will be an object if sunnyday path.
 *   Will be HTML text if hibernating instance.
 * @param {error} callback.error - The error property of callback.
 */

 
sendRequest( inData, callback) {
    console.error('entering sendRequest method');
    console.error(' ** sendRequest method - inData = '+ JSON.stringify(inData));
    let uri;
    let getCallOptions = { ...this.options };
    console.error(' ** sendRequest method - getCallOptions = '+ JSON.stringify(getCallOptions));
    let tmp1 = inData.method;
    let tmp2 = inData.username;
    let tmp3 = inData.password;
    let tmp4 = inData.url;
    console.error('tmp1 = ' + tmp1);
    console.error('tmp2 = ' + tmp2);
    console.error('tmp3 = ' + tmp3);
    console.error('tmp4 = ' + tmp4);    

    const requestOptions = {
        method: inData.method,
        auth: {
            user: inData.username,
            pass: inData.password,
        },
        baseUrl: inData.url,
        uri: this.constructUri(inData)
        //uri: thisUri,
    };
    console.error(' ** sendRequest method - requestOptions = '+ JSON.stringify(requestOptions));


console.error('About to perform request');
    request(requestOptions, (error, response, body) => {
    this.processRequestResults(error, response, body, (processedResults, processedError) => callback(processedResults, processedError));
  });
}
}

module.exports = ServiceNowConnector;