// Import built-in Node.js package path.
const path = require('path');

/**
 * Import the ServiceNowConnector class from local Node.js module connector.js
 *   and assign it to constant ServiceNowConnector.
 * When importing local modules, IAP requires an absolute file reference.
 * Built-in module path's join method constructs the absolute filename.
 */
const ServiceNowConnector = require(path.join(__dirname, '/connector.js'));

/**
 * Import built-in Node.js package events' EventEmitter class and
 * assign it to constant EventEmitter. We will create a child class
 * from this class.
 */
const EventEmitter = require('events').EventEmitter;

/**
 * The ServiceNowAdapter class.
 *
 * @summary ServiceNow Change Request Adapter
 * @description This class contains IAP adapter properties and methods that IAP
 *   brokers and products can execute. This class inherits the EventEmitter
 *   class.
 */
class ServiceNowAdapter extends EventEmitter {

  /**
   * Here we document the ServiceNowAdapter class' callback. It must follow IAP's
   *   data-first convention.
   * @callback ServiceNowAdapter~requestCallback
   * @param {(object|string)} responseData - The entire REST API response.
   * @param {error} [errorMessage] - An error thrown by REST API call.
   */

  /**
   * Here we document the adapter properties.
   * @typedef {object} ServiceNowAdapter~adapterProperties - Adapter
   *   instance's properties object.
   * @property {string} url - ServiceNow instance URL.
   * @property {object} auth - ServiceNow instance credentials.
   * @property {string} auth.username - Login username.
   * @property {string} auth.password - Login password.
   * @property {string} serviceNowTable - The change request table name.
   */

  /**
   * @memberof ServiceNowAdapter
   * @constructs
   *
   * @description Instantiates a new instance of the Itential ServiceNow Adapter.
   * @param {string} id - Adapter instance's ID.
   * @param {ServiceNowAdapter~adapterProperties} adapterProperties - Adapter instance's properties object.
   */
  constructor(id, adapterProperties) {
    // Call super or parent class' constructor.
    super();
    // Copy arguments' values to object properties.
    this.id = id;
    this.props = adapterProperties;
    // Instantiate an object from the connector.js module and assign it to an object property.
    this.connector = new ServiceNowConnector({
      url: this.props.url,
      username: this.props.auth.username,
      password: this.props.auth.password,
      serviceNowTable: this.props.serviceNowTable
    });
  }

  /**
   * @memberof ServiceNowAdapter
   * @method connect
   * @summary Connect to ServiceNow
   * @description Complete a single healthcheck and emit ONLINE or OFFLINE.
   *   IAP calls this method after instantiating an object from the class.
   *   There is no need for parameters because all connection details
   *   were passed to the object's constructor and assigned to object property this.props.
   */
  connect() {
    // As a best practice, Itential recommends isolating the health check action
    // in its own method.
    this.healthcheck();
  }

/**
    * @memberof ServiceNowAdapter
    * @method healthcheck
    * @summary Check ServiceNow Health
    * @description Verifies external system is available and healthy.
    *   Calls method emitOnline if external system is available.
    *
    * @param {ServiceNowAdapter~requestCallback} [callback] - The optional callback
    *   that handles the response.
    */
    healthcheck(callback) {
    this.getRecord((result, error) => {
        /**
            * For this lab, complete the if else conditional
            * statements that check if an error exists
            * or the instance was hibernating. You must write
            * the blocks for each branch.
            */
        if (error) {
            /**
            * Write this block.
            * If an error was returned, we need to emit OFFLINE.
            * Log the returned error using IAP's global log object
            * at an error severity. In the log message, record
            * this.id so an administrator will know which ServiceNow
            * adapter instance wrote the log message in case more
            * than one instance is configured.
            * If an optional IAP callback function was passed to
            * healthcheck(), execute it passing the error seen as an argument
            * for the callback's errorMessage parameter.
            */
            if(callback.length>0){
                callback(null,this.emitOnline());
            }
            else {
                this.emitOffline();
            }    
        } else {
            /**
            * Write this block.
            * If no runtime problems were detected, emit ONLINE.
            * Log an appropriate message using IAP's global log object
            * at a debug severity.
            * If an optional IAP callback function was passed to
            * healthcheck(), execute it passing this function's result
            * parameter as an argument for the callback function's
            * responseData parameter.
            */
            if(callback.length>0){
                callback(this.emitOnline(),null);
            }
            else{
                this.emitOnline();
            }
        }
    });
    }

  /**
   * @memberof ServiceNowAdapter
   * @method emitOffline
   * @summary Emit OFFLINE
   * @description Emits an OFFLINE event to IAP indicating the external
   *   system is not available.
   */
  emitOffline() {
    this.emitStatus('OFFLINE');
    log.error('ServiceNow: Instance is unavailable.');
  }

  /**
   * @memberof ServiceNowAdapter
   * @method emitOnline
   * @summary Emit ONLINE
   * @description Emits an ONLINE event to IAP indicating external
   *   system is available.
   */
  emitOnline() {
    this.emitStatus('ONLINE');
    log.debug('ServiceNow: Instance is available.');
  }

  /**
   * @memberof ServiceNowAdapter
   * @method emitStatus
   * @summary Emit an Event
   * @description Calls inherited emit method. IAP requires the event
   *   and an object identifying the adapter instance.
   *
   * @param {string} status - The event to emit.
   */
  emitStatus(status) {
    this.emit(status, { id: this.id });
  }

  /**
   * @memberof ServiceNowAdapter
   * @method getRecord
   * @summary Get ServiceNow Record
   * @description Retrieves a record from ServiceNow.
   *
   * @param {ServiceNowAdapter~requestCallback} callback - The callback that
   *   handles the response.
   */
  getRecord(callback) {
    /**
     * Write the body for this function.
     * The function is a wrapper for this.connector's get() method.
     * Note how the object was instantiated in the constructor().
     * get() takes a callback function.
     */
     this.connector.get((data, error) => {
        if (error) {
            console.error(`\nError returned from GET request:\n${JSON.stringify(error)}`);
        }
        else{
            console.log(`\nResponse returned from GET request:\n${JSON.stringify(data)}`);
            transfornResponse(data);
        }
           
    });
  }
  /**
   * @typedef {Object} changeRec
   * @property {string} change_ticket_number - unique number displayed for the changeRecord dispalyed publically as change_ticket_number
   * @property {boolean} active - boolean, true if the changeRecord is still active
   * @property {number} priority - integer between 0 and 5. The higher the number, the higher the pritickets ority.
   * @property {string} description - the description entered in the changeRequest.
   * @property {string} workStart - The date and time when work begins on the ticket in format: YYYY-MM-DD HH:MM TZ.
   * @property {string} workEnd - The date and time when work on the ticket completed in format: YYYY-MM-DD HH:MM TZ.
   * @property {string} change_ticket_key - The ticket record's unique key.
   */


  /**
   * @memberof ServiceNowAdapter
   * @method transformResponse
   * @summary Transform GetRecord response to standard/generic fields/names
   * @description GetRecord returns more data and the fields are not the generic
   * field names that the applivcation is ready for.  This method filters out the data wanted 
   * and maps it to generic/standard field names.  Fields mapped include: number to change_ticket_number,
   * active to active, priority to priority, description to description, work_start
   * to work_start, work_end to work_end, and sys_id to change_ticket_key.
   *
   * @param {object} inData - the successful response of a getRecords call.  The incoming data to be mapped into the generice response object.
   * @returns {Array.<Object>} - array of changeRec objects, each containing one change record returned by the getRecord call
   */
   transformResponse(inData) {
       let changeRecs = [];
       if(data.body){
           let respBody = JSON.parse(inData.body);
           respBody.result.forEach((chgRec) => {
               let formattedTicket = {
                   changeTicketNum: chgRec.number,
                   active: chgRec.active,
                   priority: chgRec.priority,
                   description: chgRec.description,
                   workStart: chgRec.work_start,
                   workEnd: chgRec.work_end,
                   chgTicketKey: chgRec.sys_id,
               };
               // let formattedTicket = formatChangeRequest(chgRec);
               changeRecs.push(formattedTicket);
           });
       }
        else {
                let errMsg = "no body tag found in Get response";
                callback(null,errMsg);
        }
       return changeRecs;
   }

  /**
   * @method formatChangeRequest
   * @summary common code to create a JSON object of the changeRequest record
   */
  formatChangeRequest(inChangeRec) {

      let formattedTicket = {
            change_ticket_number: inChangeRec.number,
            active: inChangeRec.active,
            priority: inChangeRec.priority,
            description: inChangeRec.description,
            workStart: inChangeRec.work_start,
            workEnd: inChangeRec.work_end,
            change_ticket_key: inChangeRec.sys_id,
        };
        return formattedTicket;
  }

  /**
   * @memberof ServiceNowAdapter
   * @method postRecord
   * @summary Create ServiceNow Record
   * @description Creates a record in ServiceNow.
   *
   * @param {ServiceNowAdapter~requestCallback} callback - The callback that
   *   handles the response.
   */
  postRecord(callback) {
    /**
     * Write the body for this function.
     * The function is a wrapper for this.connector's post() method.
     * Note how the object was instantiated in the constructor().
     * post() takes a callback function.
     */
     this.connector.post((data, error) => {
        if (error) {
            console.error(`\nError returned from POST request:\n${JSON.stringify(error)}`);
            callback(data,error);
        }
        else {
            console.log(`\nResponse returned from POST request:\n${JSON.stringify(data)}`);
            if(data.body) {
                let postRespBody = JSON.parse(data.body);
                let chgTckt = postRespBody.result;
                let changeRec = {
                    changeTicketNum: chgTckt.number,
                    active: chgTckt.active,
                    priority: chgTckt.priority,
                    description: chgTckt.description,
                    workStart: chgTckt.work_start,
                    workEnd: chgTckt.work_end,
                    chgTicketKey: chgTckt.sys_id,
                };
                //let changeRec = formatChangeRequest(chgTckt);
                callback(changeRec,error);
            }
            else {

                let errMsg = "no body tag found in Post response";
                callback(null,errMsg);
            }
        }        
    });
  }
}

module.exports = ServiceNowAdapter;



